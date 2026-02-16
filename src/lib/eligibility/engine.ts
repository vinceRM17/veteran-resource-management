/**
 * Eligibility Engine - Evaluates screening answers against eligibility rules
 *
 * Uses json-rules-engine to evaluate veteran/caregiver screening answers
 * against database-stored eligibility rules, returning program matches
 * with confidence scores.
 */

import type { TopLevelCondition } from "json-rules-engine";
import { Engine } from "json-rules-engine";
import type {
	ConfidenceLevel,
	EligibilityRule,
	ProgramMatch,
} from "@/lib/db/screening-types";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Priority mapping for json-rules-engine: higher priority evaluates first.
 * High confidence rules get priority 10, medium 5, low 1.
 */
const CONFIDENCE_PRIORITY: Record<ConfidenceLevel, number> = {
	high: 10,
	medium: 5,
	low: 1,
};

/**
 * Human-readable labels for confidence levels shown to users.
 */
const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
	high: "Likely Eligible",
	medium: "Possibly Eligible",
	low: "Worth Exploring",
};

// ============================================================================
// DERIVED FACTS
// ============================================================================

/**
 * Compute derived boolean facts from raw screening answers.
 * These simplify rule conditions (e.g., "isVeteran" instead of "role === 'veteran'").
 */
function computeDerivedFacts(
	answers: Record<string, unknown>,
): Record<string, unknown> {
	const derived: Record<string, unknown> = {};

	// Role-based derived facts
	derived.isVeteran = answers.role === "veteran";
	derived.isCaregiver = answers.role === "caregiver";

	// Disability derived fact
	derived.hasDisability = answers.hasServiceConnectedDisability === "yes";

	// Income threshold derived facts
	const income = answers.householdIncome as string | undefined;
	derived.incomeBelow15K = income === "under-15k";
	derived.incomeBelow25K = income === "under-15k" || income === "15k-25k";
	derived.incomeBelow40K =
		income === "under-15k" || income === "15k-25k" || income === "25k-40k";

	// Age derived fact
	derived.isOver65 = answers.ageRange === "65+";

	// Employment derived fact
	const employment = answers.employmentStatus as string | undefined;
	derived.isEmployed =
		typeof employment === "string" && employment.startsWith("employed");

	// Areas of need derived facts (dynamic)
	const areas = answers.areasOfNeed;
	if (Array.isArray(areas)) {
		for (const area of areas) {
			if (typeof area === "string") {
				// Create needsHealthcare, needsHousing, etc.
				const capitalized = area.charAt(0).toUpperCase() + area.slice(1);
				derived[`needs${capitalized}`] = true;
			}
		}
	}

	return derived;
}

// ============================================================================
// ENGINE
// ============================================================================

/**
 * Evaluate screening answers against eligibility rules using json-rules-engine.
 *
 * @param answers - Raw screening answers from the form (Record<string, any>)
 * @param rules - Active eligibility rules loaded from the database
 * @returns Array of ProgramMatch results (may contain duplicates across confidence levels)
 */
export async function evaluateEligibility(
	answers: Record<string, unknown>,
	rules: EligibilityRule[],
): Promise<ProgramMatch[]> {
	if (rules.length === 0) {
		return [];
	}

	try {
		const engine = new Engine([], { allowUndefinedFacts: true });

		// Transform each EligibilityRule into json-rules-engine format and add to engine
		for (const rule of rules) {
			const confidence = rule.confidence_level;

			engine.addRule({
				// Cast from our DB schema type (both all/any optional) to
				// json-rules-engine's discriminated union (exactly one present)
				conditions: rule.rule_definition
					.conditions as unknown as TopLevelCondition,
				event: {
					type: "eligible",
					params: {
						programId: rule.program_id,
						programName: rule.program_name,
						confidence,
						confidenceLabel: CONFIDENCE_LABELS[confidence],
						requiredDocs: rule.required_docs,
						nextSteps: rule.next_steps,
						description: rule.description,
					},
				},
				priority: CONFIDENCE_PRIORITY[confidence],
			});
		}

		// Combine raw answers with derived facts
		const derivedFacts = computeDerivedFacts(answers);
		const facts = { ...answers, ...derivedFacts };

		// Run the engine
		const { events } = await engine.run(facts);

		// Map fired events to ProgramMatch objects
		const matches: ProgramMatch[] = events.map((event) => {
			const params = event.params as Record<string, unknown>;
			return {
				programId: params.programId as string,
				programName: params.programName as string,
				confidence: params.confidence as ConfidenceLevel,
				confidenceLabel: params.confidenceLabel as string,
				requiredDocs: params.requiredDocs as string[],
				nextSteps: params.nextSteps as string[],
				description: params.description as string,
			};
		});

		return matches;
	} catch (error) {
		console.error("Eligibility engine error:", error);
		return [];
	}
}
