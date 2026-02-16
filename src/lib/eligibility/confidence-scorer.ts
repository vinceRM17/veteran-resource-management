/**
 * Confidence Scorer - Post-processing for eligibility results
 *
 * Ranks, deduplicates, and enriches program matches with
 * documentation checklist data from Phase 2 content.
 */

import type { DocumentationChecklist } from "@/content/documentation-checklists";
import type { ConfidenceLevel, ProgramMatch } from "@/lib/db/screening-types";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Numeric sort weight for confidence levels.
 * Lower number = higher priority (sorts first).
 */
const CONFIDENCE_SORT_ORDER: Record<ConfidenceLevel, number> = {
	high: 0,
	medium: 1,
	low: 2,
};

// ============================================================================
// RANKING
// ============================================================================

/**
 * Sort program matches by confidence level (high first) and then
 * alphabetically by program name within the same confidence tier.
 *
 * @param matches - Array of ProgramMatch to sort
 * @returns New sorted array (does not mutate input)
 */
export function rankMatches(matches: ProgramMatch[]): ProgramMatch[] {
	return [...matches].sort((a, b) => {
		// Primary sort: confidence level (high > medium > low)
		const confidenceDiff =
			CONFIDENCE_SORT_ORDER[a.confidence] - CONFIDENCE_SORT_ORDER[b.confidence];
		if (confidenceDiff !== 0) {
			return confidenceDiff;
		}

		// Secondary sort: alphabetical by program name
		return a.programName.localeCompare(b.programName);
	});
}

// ============================================================================
// DEDUPLICATION
// ============================================================================

/**
 * When the same program appears at multiple confidence levels
 * (e.g., va-disability-compensation at both "high" and "medium"),
 * keep only the highest confidence match.
 *
 * @param matches - Array of ProgramMatch (may contain duplicates)
 * @returns New array with one entry per programId (highest confidence kept)
 */
export function deduplicateMatches(matches: ProgramMatch[]): ProgramMatch[] {
	const bestByProgram = new Map<string, ProgramMatch>();

	for (const match of matches) {
		const existing = bestByProgram.get(match.programId);

		if (!existing) {
			bestByProgram.set(match.programId, match);
			continue;
		}

		// Keep whichever has the higher confidence (lower sort order number)
		const existingOrder = CONFIDENCE_SORT_ORDER[existing.confidence];
		const currentOrder = CONFIDENCE_SORT_ORDER[match.confidence];

		if (currentOrder < existingOrder) {
			bestByProgram.set(match.programId, match);
		}
	}

	return Array.from(bestByProgram.values());
}

// ============================================================================
// DOCUMENTATION ENRICHMENT
// ============================================================================

/**
 * Cross-reference ProgramMatch results with documentation checklists
 * to merge in detailed document preparation information.
 *
 * For each match, if a DocumentationChecklist exists with the same programId,
 * the match's requiredDocs is replaced with the full document names from
 * the checklist (providing richer detail than the rule's basic list).
 *
 * @param matches - Array of ProgramMatch to enrich
 * @param checklists - Documentation checklists from Phase 2 content
 * @returns New array with enriched documentation data
 */
export function enrichWithDocumentation(
	matches: ProgramMatch[],
	checklists: DocumentationChecklist[],
): ProgramMatch[] {
	// Build lookup map for O(1) access
	const checklistByProgram = new Map<string, DocumentationChecklist>();
	for (const checklist of checklists) {
		checklistByProgram.set(checklist.programId, checklist);
	}

	return matches.map((match) => {
		const checklist = checklistByProgram.get(match.programId);
		if (!checklist) {
			return match;
		}

		// Enrich with full document names from checklist
		const enrichedDocs = checklist.documents.map((doc) => doc.name);

		return {
			...match,
			requiredDocs: enrichedDocs,
		};
	});
}
