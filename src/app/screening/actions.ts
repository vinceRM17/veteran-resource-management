"use server";

/**
 * Server action for submitting screening answers and evaluating eligibility.
 *
 * Orchestrates: validate answers -> load rules -> evaluate eligibility ->
 * rank/deduplicate -> enrich with documentation -> save session + results to DB.
 */

import {
	type DocumentationChecklist,
	documentationChecklists,
} from "@/content/documentation-checklists";
import { detectCrisis, extractTextFromAnswers } from "@/lib/crisis/detector";
import { logCrisisDetection } from "@/lib/crisis/logger";
import type { ProgramMatch } from "@/lib/db/screening-types";
import {
	deduplicateMatches,
	enrichWithDocumentation,
	rankMatches,
} from "@/lib/eligibility/confidence-scorer";
import { evaluateEligibility } from "@/lib/eligibility/engine";
import {
	clearRulesCache,
	loadActiveRules,
} from "@/lib/eligibility/rules-loader";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// SUBMIT SCREENING
// ============================================================================

export async function submitScreening(
	answers: Record<string, unknown>,
): Promise<{
	sessionId?: string;
	error?: string;
	crisisDetected?: boolean;
	crisisLogId?: string | null;
}> {
	try {
		// Validate required fields
		if (!answers.role) {
			return { error: "Please select whether you are a veteran or caregiver." };
		}
		if (!answers.state) {
			return { error: "Please select your state." };
		}

		const supabase = await createClient();

		// CRISIS DETECTION — runs before eligibility evaluation
		const textContent = extractTextFromAnswers(answers);
		const crisisResult = await detectCrisis(textContent);

		let crisisLogId: string | null = null;
		if (crisisResult) {
			crisisLogId = await logCrisisDetection({ result: crisisResult });
		}

		// Determine jurisdiction from state
		const jurisdiction = answers.state === "KY" ? "kentucky" : "kentucky"; // Default to Kentucky for now

		// Load active eligibility rules for this jurisdiction
		clearRulesCache();
		const rules = await loadActiveRules(jurisdiction);

		// Evaluate eligibility
		const rawMatches = await evaluateEligibility(answers, rules);

		// Rank, deduplicate, and enrich with documentation
		const ranked = rankMatches(rawMatches);
		const deduplicated = deduplicateMatches(ranked);
		const matches = enrichWithDocumentation(
			deduplicated,
			documentationChecklists as DocumentationChecklist[],
		);

		// Get current user (may be null for guest)
		const {
			data: { user },
		} = await supabase.auth.getUser();

		// Insert screening session
		const { data: session, error: sessionError } = await supabase
			.from("screening_sessions")
			.insert({
				user_id: user?.id || null,
				answers,
				role: answers.role as string,
				status: "completed",
			})
			.select("id")
			.single();

		if (sessionError || !session) {
			console.error("Failed to save screening session:", sessionError);
			return {
				error: "Unable to save your screening results. Please try again.",
			};
		}

		// Link crisis log to screening session if crisis was detected
		if (crisisResult && crisisLogId) {
			await supabase
				.from("crisis_detection_logs")
				.update({ screening_session_id: session.id })
				.eq("id", crisisLogId);
		}

		// Insert screening results (one row per matched program)
		if (matches.length > 0) {
			const { error: resultsError } = await supabase
				.from("screening_results")
				.insert(
					matches.map((m: ProgramMatch) => ({
						session_id: session.id,
						program_id: m.programId,
						program_name: m.programName,
						confidence: m.confidence,
						confidence_label: m.confidenceLabel,
						required_docs: m.requiredDocs,
						next_steps: m.nextSteps,
						rule_version: 1,
					})),
				);

			if (resultsError) {
				console.error("Failed to save screening results:", resultsError);
				// Session was created, results failed - still redirect to results page
				// The page will show the session but may have incomplete data
			}
		}

		return {
			sessionId: session.id,
			crisisDetected: crisisResult !== null,
			crisisLogId,
		};
	} catch (error) {
		console.error("Screening submission error:", error);
		return { error: "Unable to process your screening. Please try again." };
	}
}

// ============================================================================
// CLAIM GUEST SESSION
// ============================================================================

/**
 * Claims a guest screening session (user_id IS NULL) for the current user.
 * Used after a guest completes screening and then creates an account.
 */
export async function claimGuestSession(
	sessionId: string,
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return {
			success: false,
			error: "You must be logged in to save screening results.",
		};
	}

	// Verify session exists and check ownership
	const { data: session } = await supabase
		.from("screening_sessions")
		.select("id, user_id")
		.eq("id", sessionId)
		.single();

	if (!session) {
		return { success: false, error: "Screening session not found." };
	}

	if (session.user_id !== null) {
		// Already claimed -- could be by this user or another
		if (session.user_id === user.id) {
			return { success: true }; // Already theirs
		}
		return {
			success: false,
			error: "This screening session has already been saved to an account.",
		};
	}

	// Claim the session by setting user_id
	const { error: updateError } = await supabase
		.from("screening_sessions")
		.update({ user_id: user.id })
		.eq("id", sessionId)
		.is("user_id", null); // Double-check still unclaimed (race condition guard)

	if (updateError) {
		console.error("Failed to claim session:", updateError);
		return {
			success: false,
			error: "Unable to save screening results. Please try again.",
		};
	}

	return { success: true };
}

// ============================================================================
// CREATE ACTION ITEMS FROM SCREENING RESULTS
// ============================================================================

/**
 * Creates action items from screening results' next_steps for the current user.
 * Each next_step becomes an individual action item the user can track.
 */
export async function createActionItemsFromResults(
	sessionId: string,
): Promise<{ success: boolean; count: number; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { success: false, count: 0, error: "You must be logged in." };
	}

	// Fetch results for this session
	const { data: results } = await supabase
		.from("screening_results")
		.select("program_id, program_name, next_steps")
		.eq("session_id", sessionId);

	if (!results || results.length === 0) {
		return { success: true, count: 0 };
	}

	// Build action items from next_steps
	const actionItems: {
		user_id: string;
		session_id: string;
		program_id: string;
		program_name: string;
		title: string;
		sort_order: number;
	}[] = [];
	let sortOrder = 0;

	for (const result of results) {
		for (const step of result.next_steps || []) {
			actionItems.push({
				user_id: user.id,
				session_id: sessionId,
				program_id: result.program_id,
				program_name: result.program_name,
				title: step,
				sort_order: sortOrder++,
			});
		}
	}

	if (actionItems.length === 0) {
		return { success: true, count: 0 };
	}

	const { error: insertError } = await supabase
		.from("action_items")
		.insert(actionItems);

	if (insertError) {
		console.error("Failed to create action items:", insertError);
		return {
			success: false,
			count: 0,
			error: "Unable to create action items.",
		};
	}

	return { success: true, count: actionItems.length };
}
