/**
 * Audit trail logging for crisis detection events
 */

import { createClient } from "@/lib/supabase/server";
import type { CrisisDetectionResult } from "./types";

/**
 * Logs crisis detection event to database
 * Returns the inserted log entry ID, or null on error
 * Never throws - crisis logging failure must not block user flow
 */
export async function logCrisisDetection(params: {
	sessionId?: string;
	result: CrisisDetectionResult;
}): Promise<string | null> {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from("crisis_detection_logs")
			.insert({
				screening_session_id: params.sessionId ?? null,
				detected_keywords: params.result.keywords,
				keyword_severities: params.result.severities,
				max_severity: params.result.maxSeverity,
				source_text_hash: params.result.sourceTextHash,
			})
			.select("id")
			.single();

		if (error) {
			console.error("Failed to log crisis detection:", error);
			return null;
		}

		return data?.id ?? null;
	} catch (error) {
		console.error("Exception while logging crisis detection:", error);
		return null;
	}
}
