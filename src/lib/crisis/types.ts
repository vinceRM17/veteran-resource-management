/**
 * Crisis detection types
 */

export type CrisisKeyword = {
	phrase: string;
	severity: "high" | "medium";
	category: string;
};

export type CrisisDetectionResult = {
	detected: boolean;
	keywords: string[];
	severities: ("high" | "medium")[];
	maxSeverity: "high" | "medium";
	sourceTextHash: string;
};

export type CrisisLogEntry = {
	id: string;
	screening_session_id: string | null;
	detected_keywords: string[];
	keyword_severities: string[];
	max_severity: string;
	source_text_hash: string;
	detected_at: string;
	reviewed_by: string | null;
	reviewed_at: string | null;
	is_false_positive: boolean | null;
	review_notes: string | null;
};
