/**
 * Rules Loader - Loads active eligibility rules from Supabase
 *
 * Queries eligibility_rules table filtered by jurisdiction and date,
 * with request-scoped caching to prevent duplicate queries.
 */

import type { EligibilityRule } from "@/lib/db/screening-types";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// REQUEST-SCOPED CACHE
// ============================================================================

/**
 * In-memory cache to prevent duplicate database queries when
 * evaluateEligibility is called multiple times in the same request.
 * Must be cleared between requests in server actions.
 */
const cachedRules: Map<string, EligibilityRule[]> = new Map();

/**
 * Clear the rules cache. Call this between requests to ensure
 * fresh data on subsequent evaluations.
 */
export function clearRulesCache(): void {
	cachedRules.clear();
}

// ============================================================================
// RULES LOADER
// ============================================================================

/**
 * Load active eligibility rules from Supabase for a given jurisdiction.
 *
 * Filters by:
 * - jurisdiction (default: 'kentucky')
 * - is_active = true
 * - effective_date <= current date
 * - expires_date is null OR expires_date > current date
 *
 * Results are ordered by program_id and confidence_level for
 * deterministic processing.
 *
 * @param jurisdiction - The jurisdiction to load rules for (default: 'kentucky')
 * @returns Array of active EligibilityRule objects
 * @throws Error if the database query fails
 */
export async function loadActiveRules(
	jurisdiction = "kentucky",
): Promise<EligibilityRule[]> {
	// Check cache first
	const cacheKey = jurisdiction;
	const cached = cachedRules.get(cacheKey);
	if (cached) {
		return cached;
	}

	const supabase = await createClient();
	const now = new Date().toISOString();

	const { data, error } = await supabase
		.from("eligibility_rules")
		.select("*")
		.eq("jurisdiction", jurisdiction)
		.eq("is_active", true)
		.lte("effective_date", now)
		.or(`expires_date.is.null,expires_date.gt.${now}`)
		.order("program_id")
		.order("confidence_level");

	if (error) {
		throw new Error(
			`Failed to load eligibility rules for ${jurisdiction}: ${error.message}`,
		);
	}

	const rules = (data ?? []) as EligibilityRule[];

	// Cache for subsequent calls in the same request
	cachedRules.set(cacheKey, rules);

	return rules;
}
