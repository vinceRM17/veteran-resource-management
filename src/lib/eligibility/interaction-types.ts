/**
 * TypeScript types for benefit interaction detection.
 *
 * These types represent warnings shown to veterans when two or more programs
 * they may qualify for have known interactions that could reduce or eliminate
 * benefits from one or both programs.
 */

// ============================================================================
// SEVERITY
// ============================================================================

/**
 * Severity of a benefit interaction warning.
 * - high: May result in complete loss of a benefit (eligibility cliff)
 * - medium: Will reduce benefit amounts in a calculable way
 * - low: Threshold monitoring needed; impact depends on income changes
 */
export type InteractionSeverity = "high" | "medium" | "low";

// ============================================================================
// BENEFIT INTERACTION
// ============================================================================

/**
 * A detected interaction between two or more benefit programs.
 * Shown to the veteran after eligibility evaluation completes.
 */
export interface BenefitInteraction {
	/** Category of interaction */
	type: "warning" | "conflict" | "info";

	/** Program IDs involved in this interaction */
	programIds: string[];

	/** Short, plain-language title for the warning */
	title: string;

	/** Full explanation of how the programs interact */
	description: string;

	/** Specific recommended action for the veteran */
	recommendation: string;

	/** Severity level for visual treatment and sort ordering */
	severity: InteractionSeverity;

	/** Optional link to official SSA, VA, or other documentation */
	learnMoreUrl?: string;
}

// ============================================================================
// INTERACTION RULE
// ============================================================================

/**
 * A json-rules-engine rule definition for detecting a specific interaction.
 *
 * Conditions evaluate facts derived from matched program IDs and screening
 * answers. When conditions pass, the event params carry the BenefitInteraction
 * data to display to the user.
 */
export interface InteractionRule {
	name: string;
	conditions: {
		all?: Array<{ fact: string; operator: string; value: unknown }>;
		any?: Array<{ fact: string; operator: string; value: unknown }>;
	};
	event: {
		type: string;
		params: BenefitInteraction;
	};
}
