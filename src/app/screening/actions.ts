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
): Promise<{ sessionId?: string; error?: string }> {
	try {
		// Validate required fields
		if (!answers.role) {
			return { error: "Please select whether you are a veteran or caregiver." };
		}
		if (!answers.state) {
			return { error: "Please select your state." };
		}

		const supabase = await createClient();

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

		return { sessionId: session.id };
	} catch (error) {
		console.error("Screening submission error:", error);
		return { error: "Unable to process your screening. Please try again." };
	}
}
