/**
 * Benefit Interaction Detector
 *
 * Evaluates a list of matched programs against known interaction rules,
 * returning warnings that help veterans understand how applying for one
 * program might affect eligibility or benefit amounts for another.
 *
 * Runs after eligibility evaluation completes — not during screening.
 * Uses json-rules-engine v7 with the 'contains' operator on arrays.
 */

import type { TopLevelCondition } from "json-rules-engine";
import { Engine } from "json-rules-engine";
import type { ProgramMatch } from "@/lib/db/screening-types";
import type { BenefitInteraction, InteractionSeverity } from "./interaction-types";
import { BENEFIT_INTERACTION_RULES } from "./interaction-rules";

// ============================================================================
// SEVERITY ORDERING
// ============================================================================

const SEVERITY_ORDER: Record<InteractionSeverity, number> = {
	high: 0,
	medium: 1,
	low: 2,
};

const SEVERITY_PRIORITY: Record<InteractionSeverity, number> = {
	high: 10,
	medium: 5,
	low: 1,
};

// ============================================================================
// DETECTION ENGINE
// ============================================================================

/**
 * Evaluate matched programs for known benefit interactions.
 *
 * @param matches - Programs the veteran may qualify for (from eligibility engine)
 * @param answers - Raw screening answers (for income, household size, etc.)
 * @returns Sorted array of BenefitInteraction warnings (high severity first)
 */
export async function detectBenefitInteractions(
	matches: ProgramMatch[],
	answers: Record<string, unknown>,
): Promise<BenefitInteraction[]> {
	if (matches.length < 2) {
		// Need at least 2 programs to have an interaction
		return [];
	}

	try {
		const engine = new Engine([], { allowUndefinedFacts: true });

		// Add each interaction rule to the engine
		for (const rule of BENEFIT_INTERACTION_RULES) {
			const severity = rule.event.params.severity;

			engine.addRule({
				name: rule.name,
				// Cast from our schema type to json-rules-engine's discriminated union
				conditions: rule.conditions as unknown as TopLevelCondition,
				event: {
					type: "benefit-interaction",
					params: rule.event.params,
				},
				priority: SEVERITY_PRIORITY[severity],
			});
		}

		// Build facts from matched program IDs and screening answers
		const matchedProgramIds = matches.map((m) => m.programId);
		const facts = {
			matchedProgramIds,
			...answers,
		};

		// Run the engine against the facts
		const { events } = await engine.run(facts);

		// Map fired events to BenefitInteraction objects
		const interactions: BenefitInteraction[] = events.map((event) => {
			return event.params as BenefitInteraction;
		});

		// Sort by severity: high first, then medium, then low
		return interactions.sort(
			(a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
		);
	} catch (error) {
		console.error("Interaction detector error:", error);
		return [];
	}
}
