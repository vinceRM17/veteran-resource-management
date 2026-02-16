/**
 * Server-side query functions for the user dashboard.
 * Fetches screening history, bookmark counts, and action item progress.
 */

import type {
	ScreeningHistoryEntry,
	ScreeningHistoryResult,
} from "@/lib/db/dashboard-types";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// SCREENING HISTORY
// ============================================================================

/**
 * Fetches the user's completed screening sessions with their results.
 * Returns up to 20 most recent completed sessions, each enriched with
 * the matched program names and confidence levels.
 */
export async function getScreeningHistory(
	userId: string,
): Promise<ScreeningHistoryEntry[]> {
	const supabase = await createClient();

	// Fetch completed sessions for this user
	const { data: sessions } = await supabase
		.from("screening_sessions")
		.select("id, answers, role, status, created_at")
		.eq("user_id", userId)
		.eq("status", "completed")
		.order("created_at", { ascending: false })
		.limit(20);

	if (!sessions || sessions.length === 0) return [];

	// Fetch results for all sessions in one query
	const sessionIds = sessions.map((s) => s.id);
	const { data: allResults } = await supabase
		.from("screening_results")
		.select("session_id, program_name, confidence, confidence_label")
		.in("session_id", sessionIds);

	// Group results by session
	const resultsBySession = new Map<string, ScreeningHistoryResult[]>();
	for (const r of allResults || []) {
		const existing = resultsBySession.get(r.session_id) || [];
		existing.push({
			program_name: r.program_name,
			confidence: r.confidence as ScreeningHistoryResult["confidence"],
			confidence_label: r.confidence_label,
		});
		resultsBySession.set(r.session_id, existing);
	}

	return sessions.map((session) => ({
		id: session.id,
		answers: session.answers as Record<string, unknown>,
		role: session.role,
		status: session.status,
		created_at: session.created_at,
		results: resultsBySession.get(session.id) || [],
	}));
}

// ============================================================================
// BOOKMARK COUNT
// ============================================================================

/**
 * Returns the total number of bookmarks for a user.
 */
export async function getUserBookmarkCount(userId: string): Promise<number> {
	const supabase = await createClient();
	const { count } = await supabase
		.from("bookmarks")
		.select("*", { count: "exact", head: true })
		.eq("user_id", userId);
	return count || 0;
}

// ============================================================================
// ACTION ITEM PROGRESS
// ============================================================================

/**
 * Returns the total and completed action item counts for a user.
 */
export async function getActionItemProgress(
	userId: string,
): Promise<{ total: number; completed: number }> {
	const supabase = await createClient();

	const { data } = await supabase
		.from("action_items")
		.select("is_completed")
		.eq("user_id", userId);

	if (!data) return { total: 0, completed: 0 };

	return {
		total: data.length,
		completed: data.filter((item) => item.is_completed).length,
	};
}
