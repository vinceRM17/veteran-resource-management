/**
 * Conditional field visibility and orphaned value cleanup.
 * Pure functions with no React dependencies -- easy to test.
 *
 * These rules determine which screening questions are shown or hidden
 * based on the user's previous answers.
 */

// ============================================================================
// FIELD VISIBILITY RULES
// ============================================================================

/**
 * Visibility rules map: fieldId -> function that returns true if field should show.
 * Fields not listed here are always visible.
 */
const visibilityRules: Record<
	string,
	(answers: Record<string, unknown>) => boolean
> = {
	// Step 2 conditionals
	serviceYears: (a) => a.role === "veteran",
	isCaregiver: (a) => a.role === "caregiver",

	// Step 3 conditionals
	hasServiceConnectedDisability: (a) => a.role === "veteran",
	disabilityRating: (a) => a.hasServiceConnectedDisability === "yes",
};

/**
 * Determines if a field should be visible based on current answers.
 * Returns true if the field should be shown, false if hidden.
 *
 * Fields without explicit rules are always visible.
 */
export function shouldShowField(
	fieldId: string,
	answers: Record<string, unknown>,
): boolean {
	const rule = visibilityRules[fieldId];
	if (!rule) {
		return true;
	}
	return rule(answers);
}

/**
 * Checks if the "caregiver-support" option should be available
 * in the areasOfNeed checkbox group.
 */
export function shouldShowCaregiverSupport(
	answers: Record<string, unknown>,
): boolean {
	return answers.role === "caregiver" || answers.isCaregiver === "yes";
}

// ============================================================================
// DEPENDENT FIELD CLEANUP
// ============================================================================

/**
 * Dependency map: when a trigger field changes, these dependent fields
 * should be cleared to prevent orphaned values.
 *
 * Key: the field that changed
 * Value: list of fields to clear, with optional condition
 */
interface DependencyRule {
	clear: string[];
	when?: (newValue: unknown) => boolean;
}

const dependencyMap: Record<string, DependencyRule[]> = {
	role: [
		{
			// When role changes TO caregiver, clear veteran-specific fields
			clear: [
				"serviceStartYear",
				"serviceEndYear",
				"hasServiceConnectedDisability",
				"disabilityRating",
			],
			when: (v) => v === "caregiver",
		},
		{
			// When role changes TO veteran, clear caregiver-specific fields
			clear: ["isCaregiver"],
			when: (v) => v === "veteran",
		},
	],
	hasServiceConnectedDisability: [
		{
			// When disability answer is not "yes", clear rating
			clear: ["disabilityRating"],
			when: (v) => v !== "yes",
		},
	],
};

/**
 * Clears dependent field values when a trigger field changes.
 * Returns a new answers object with orphaned values removed.
 *
 * This prevents stale data from hidden fields being submitted
 * (e.g., user selects veteran, fills in service era, then changes to caregiver).
 */
export function clearDependentFields(
	changedField: string,
	newValue: unknown,
	answers: Record<string, unknown>,
): Record<string, unknown> {
	const rules = dependencyMap[changedField];
	if (!rules) {
		return answers;
	}

	const updated = { ...answers };

	for (const rule of rules) {
		// If there is a condition, only clear when it matches
		if (rule.when && !rule.when(newValue)) {
			continue;
		}

		for (const field of rule.clear) {
			delete updated[field];
		}
	}

	return updated;
}
