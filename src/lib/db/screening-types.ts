/**
 * TypeScript types for screening and eligibility system
 * Mirrors the Supabase schema defined in 00004_screening_eligibility.sql
 */

// ============================================================================
// CONFIDENCE LEVELS
// ============================================================================

export type ConfidenceLevel = "high" | "medium" | "low";

// ============================================================================
// SCREENING ANSWERS (JSONB shape stored in screening_sessions.answers)
// ============================================================================

export type ScreeningAnswers = Record<
	string,
	string | number | boolean | string[]
>;

// ============================================================================
// ELIGIBILITY RULES TABLE
// ============================================================================

export interface EligibilityRule {
	id: string;
	program_id: string;
	program_name: string;
	jurisdiction: string;
	rule_definition: {
		conditions: {
			all?: RuleCondition[];
			any?: RuleCondition[];
		};
		event: {
			type: string;
			params: Record<string, unknown>;
		};
	};
	confidence_level: ConfidenceLevel;
	required_role: "veteran" | "caregiver" | null;
	required_docs: string[];
	next_steps: string[];
	description: string;
	effective_date: string;
	expires_date: string | null;
	version: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

/**
 * A single condition in a json-rules-engine rule
 */
export interface RuleCondition {
	fact: string;
	operator: string;
	value: unknown;
}

// ============================================================================
// SCREENING RESULTS TABLE
// ============================================================================

export interface ScreeningResult {
	id: string;
	session_id: string;
	program_id: string;
	program_name: string;
	confidence: ConfidenceLevel;
	confidence_label: string;
	required_docs: string[];
	next_steps: string[];
	rule_version: number;
	created_at: string;
}

// ============================================================================
// SCREENING SESSION (extends base from 00001 with role)
// ============================================================================

export interface ScreeningSession {
	id: string;
	user_id: string | null;
	answers: ScreeningAnswers;
	role: "veteran" | "caregiver" | null;
	status: "in_progress" | "completed" | "abandoned";
	created_at: string;
	updated_at: string;
}

// ============================================================================
// PROGRAM MATCH (returned by eligibility engine)
// ============================================================================

export interface ProgramMatch {
	programId: string;
	programName: string;
	confidence: ConfidenceLevel;
	confidenceLabel: string;
	requiredDocs: string[];
	nextSteps: string[];
	description: string;
}
