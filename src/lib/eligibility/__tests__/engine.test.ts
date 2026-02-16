/**
 * Unit tests for the eligibility engine, confidence scorer, and
 * documentation enrichment. Uses real json-rules-engine evaluation
 * with mock rule definitions (no database mocking needed).
 */

import { describe, expect, it } from "vitest";
import type { DocumentationChecklist } from "@/content/documentation-checklists";
import type {
	ConfidenceLevel,
	EligibilityRule,
	ProgramMatch,
} from "@/lib/db/screening-types";
import {
	deduplicateMatches,
	enrichWithDocumentation,
	rankMatches,
} from "../confidence-scorer";
import { evaluateEligibility } from "../engine";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Create a mock EligibilityRule with sensible defaults.
 * Only override what each test needs.
 */
function createMockRule(
	overrides: Partial<EligibilityRule> & {
		program_id: string;
		program_name: string;
		confidence_level: ConfidenceLevel;
		rule_definition: EligibilityRule["rule_definition"];
	},
): EligibilityRule {
	return {
		id: `mock-${overrides.program_id}-${overrides.confidence_level}`,
		jurisdiction: "kentucky",
		required_role: null,
		required_docs: [],
		next_steps: [],
		description: `${overrides.program_name} program`,
		effective_date: "2024-01-01",
		expires_date: null,
		version: 1,
		is_active: true,
		created_at: "2024-01-01T00:00:00Z",
		updated_at: "2024-01-01T00:00:00Z",
		...overrides,
	};
}

/**
 * Create a mock ProgramMatch for scorer tests.
 */
function createMockMatch(
	overrides: Partial<ProgramMatch> & {
		programId: string;
		programName: string;
		confidence: ConfidenceLevel;
	},
): ProgramMatch {
	return {
		confidenceLabel:
			overrides.confidence === "high"
				? "Likely Eligible"
				: overrides.confidence === "medium"
					? "Possibly Eligible"
					: "Worth Exploring",
		requiredDocs: [],
		nextSteps: [],
		description: `${overrides.programName} program`,
		...overrides,
	};
}

// ============================================================================
// EVALUATE ELIGIBILITY TESTS
// ============================================================================

describe("evaluateEligibility", () => {
	it("returns VA disability match for veteran with service-connected disability", async () => {
		const rules = [
			createMockRule({
				program_id: "va-disability-compensation",
				program_name: "VA Disability Compensation",
				confidence_level: "high",
				required_role: "veteran",
				required_docs: ["DD Form 214", "VA Form 21-526EZ"],
				next_steps: ["File VA Form 21-526EZ online"],
				description: "Monthly tax-free payment for service-connected injuries",
				rule_definition: {
					conditions: {
						all: [
							{ fact: "role", operator: "equal", value: "veteran" },
							{
								fact: "hasServiceConnectedDisability",
								operator: "equal",
								value: "yes",
							},
						],
					},
					event: {
						type: "eligible",
						params: {
							programId: "va-disability-compensation",
							confidence: "high",
						},
					},
				},
			}),
		];

		const answers = {
			role: "veteran",
			hasServiceConnectedDisability: "yes",
		};

		const results = await evaluateEligibility(answers, rules);

		expect(results).toHaveLength(1);
		expect(results[0].programId).toBe("va-disability-compensation");
		expect(results[0].confidence).toBe("high");
		expect(results[0].confidenceLabel).toBe("Likely Eligible");
		expect(results[0].requiredDocs).toEqual([
			"DD Form 214",
			"VA Form 21-526EZ",
		]);
	});

	it("returns VA healthcare match for all veterans", async () => {
		const rules = [
			createMockRule({
				program_id: "va-healthcare",
				program_name: "VA Healthcare",
				confidence_level: "high",
				rule_definition: {
					conditions: {
						all: [{ fact: "role", operator: "equal", value: "veteran" }],
					},
					event: {
						type: "eligible",
						params: { programId: "va-healthcare", confidence: "high" },
					},
				},
			}),
		];

		const answers = { role: "veteran" };
		const results = await evaluateEligibility(answers, rules);

		expect(results).toHaveLength(1);
		expect(results[0].programId).toBe("va-healthcare");
		expect(results[0].confidence).toBe("high");
	});

	it("returns Medicaid for Kentucky residents with low income", async () => {
		const rules = [
			createMockRule({
				program_id: "medicaid-ky",
				program_name: "Medicaid (Kentucky)",
				confidence_level: "high",
				rule_definition: {
					conditions: {
						all: [
							{ fact: "state", operator: "equal", value: "KY" },
							{
								fact: "householdIncome",
								operator: "in",
								value: ["under-15k", "15k-25k"],
							},
						],
					},
					event: {
						type: "eligible",
						params: { programId: "medicaid-ky", confidence: "high" },
					},
				},
			}),
			createMockRule({
				program_id: "medicaid-ky",
				program_name: "Medicaid (Kentucky)",
				confidence_level: "medium",
				rule_definition: {
					conditions: {
						all: [
							{ fact: "state", operator: "equal", value: "KY" },
							{
								fact: "householdIncome",
								operator: "equal",
								value: "25k-40k",
							},
						],
					},
					event: {
						type: "eligible",
						params: { programId: "medicaid-ky", confidence: "medium" },
					},
				},
			}),
		];

		const answers = { state: "KY", householdIncome: "under-15k" };
		const results = await evaluateEligibility(answers, rules);

		// Should match only the high-confidence rule
		expect(results).toHaveLength(1);
		expect(results[0].programId).toBe("medicaid-ky");
		expect(results[0].confidence).toBe("high");
	});

	it("does not return veteran-specific programs for caregivers", async () => {
		const rules = [
			createMockRule({
				program_id: "va-disability-compensation",
				program_name: "VA Disability Compensation",
				confidence_level: "high",
				required_role: "veteran",
				rule_definition: {
					conditions: {
						all: [
							{ fact: "role", operator: "equal", value: "veteran" },
							{
								fact: "hasServiceConnectedDisability",
								operator: "equal",
								value: "yes",
							},
						],
					},
					event: {
						type: "eligible",
						params: {
							programId: "va-disability-compensation",
							confidence: "high",
						},
					},
				},
			}),
		];

		const answers = { role: "caregiver" };
		const results = await evaluateEligibility(answers, rules);

		expect(results).toHaveLength(0);
	});

	it("returns empty array when no rules match", async () => {
		const rules = [
			createMockRule({
				program_id: "medicaid-ky",
				program_name: "Medicaid (Kentucky)",
				confidence_level: "high",
				rule_definition: {
					conditions: {
						all: [
							{ fact: "state", operator: "equal", value: "KY" },
							{
								fact: "householdIncome",
								operator: "in",
								value: ["under-15k"],
							},
						],
					},
					event: {
						type: "eligible",
						params: { programId: "medicaid-ky", confidence: "high" },
					},
				},
			}),
		];

		// California resident -- Kentucky rules should not match
		const answers = { state: "CA", householdIncome: "under-15k" };
		const results = await evaluateEligibility(answers, rules);

		expect(results).toHaveLength(0);
	});

	it("returns empty array when rules array is empty", async () => {
		const results = await evaluateEligibility({ role: "veteran" }, []);
		expect(results).toEqual([]);
	});

	it("handles engine errors gracefully and returns empty array", async () => {
		// Pass a rule with null conditions to trigger an engine error
		const badRule = createMockRule({
			program_id: "bad-rule",
			program_name: "Bad Rule",
			confidence_level: "high",
			rule_definition: {
				conditions:
					null as unknown as EligibilityRule["rule_definition"]["conditions"],
				event: {
					type: "eligible",
					params: { programId: "bad", confidence: "high" },
				},
			},
		});

		const results = await evaluateEligibility({ role: "veteran" }, [badRule]);
		expect(results).toEqual([]);
	});

	it("evaluates rules with contains operator for areasOfNeed", async () => {
		const rules = [
			createMockRule({
				program_id: "ky-hcb-waiver",
				program_name: "Kentucky HCB Waiver",
				confidence_level: "high",
				rule_definition: {
					conditions: {
						all: [
							{ fact: "state", operator: "equal", value: "KY" },
							{ fact: "ageRange", operator: "equal", value: "65+" },
							{
								fact: "areasOfNeed",
								operator: "contains",
								value: "healthcare",
							},
						],
					},
					event: {
						type: "eligible",
						params: { programId: "ky-hcb-waiver", confidence: "high" },
					},
				},
			}),
		];

		const answers = {
			state: "KY",
			ageRange: "65+",
			areasOfNeed: ["healthcare", "housing"],
		};

		const results = await evaluateEligibility(answers, rules);

		expect(results).toHaveLength(1);
		expect(results[0].programId).toBe("ky-hcb-waiver");
	});

	it("evaluates multiple rules and returns all matches", async () => {
		const rules = [
			createMockRule({
				program_id: "va-healthcare",
				program_name: "VA Healthcare",
				confidence_level: "high",
				rule_definition: {
					conditions: {
						all: [{ fact: "role", operator: "equal", value: "veteran" }],
					},
					event: {
						type: "eligible",
						params: { programId: "va-healthcare", confidence: "high" },
					},
				},
			}),
			createMockRule({
				program_id: "va-disability-compensation",
				program_name: "VA Disability Compensation",
				confidence_level: "high",
				rule_definition: {
					conditions: {
						all: [
							{ fact: "role", operator: "equal", value: "veteran" },
							{
								fact: "hasServiceConnectedDisability",
								operator: "equal",
								value: "yes",
							},
						],
					},
					event: {
						type: "eligible",
						params: {
							programId: "va-disability-compensation",
							confidence: "high",
						},
					},
				},
			}),
			createMockRule({
				program_id: "snap-ky",
				program_name: "SNAP (Food Stamps, Kentucky)",
				confidence_level: "high",
				rule_definition: {
					conditions: {
						all: [
							{ fact: "state", operator: "equal", value: "KY" },
							{
								fact: "householdIncome",
								operator: "in",
								value: ["under-15k", "15k-25k"],
							},
						],
					},
					event: {
						type: "eligible",
						params: { programId: "snap-ky", confidence: "high" },
					},
				},
			}),
		];

		const answers = {
			role: "veteran",
			hasServiceConnectedDisability: "yes",
			state: "KY",
			householdIncome: "under-15k",
		};

		const results = await evaluateEligibility(answers, rules);

		// Should match all three programs
		expect(results).toHaveLength(3);
		const programIds = results.map((r) => r.programId);
		expect(programIds).toContain("va-healthcare");
		expect(programIds).toContain("va-disability-compensation");
		expect(programIds).toContain("snap-ky");
	});

	it("sets correct confidence labels for each level", async () => {
		const rules = [
			createMockRule({
				program_id: "test-high",
				program_name: "Test High",
				confidence_level: "high",
				rule_definition: {
					conditions: {
						all: [{ fact: "flag", operator: "equal", value: true }],
					},
					event: {
						type: "eligible",
						params: { programId: "test-high", confidence: "high" },
					},
				},
			}),
			createMockRule({
				program_id: "test-medium",
				program_name: "Test Medium",
				confidence_level: "medium",
				rule_definition: {
					conditions: {
						all: [{ fact: "flag", operator: "equal", value: true }],
					},
					event: {
						type: "eligible",
						params: { programId: "test-medium", confidence: "medium" },
					},
				},
			}),
			createMockRule({
				program_id: "test-low",
				program_name: "Test Low",
				confidence_level: "low",
				rule_definition: {
					conditions: {
						all: [{ fact: "flag", operator: "equal", value: true }],
					},
					event: {
						type: "eligible",
						params: { programId: "test-low", confidence: "low" },
					},
				},
			}),
		];

		const results = await evaluateEligibility({ flag: true }, rules);

		const byId = new Map(results.map((r) => [r.programId, r]));
		expect(byId.get("test-high")?.confidenceLabel).toBe("Likely Eligible");
		expect(byId.get("test-medium")?.confidenceLabel).toBe("Possibly Eligible");
		expect(byId.get("test-low")?.confidenceLabel).toBe("Worth Exploring");
	});

	it("handles undefined facts gracefully with allowUndefinedFacts", async () => {
		const rules = [
			createMockRule({
				program_id: "va-healthcare",
				program_name: "VA Healthcare",
				confidence_level: "high",
				rule_definition: {
					conditions: {
						all: [{ fact: "role", operator: "equal", value: "veteran" }],
					},
					event: {
						type: "eligible",
						params: { programId: "va-healthcare", confidence: "high" },
					},
				},
			}),
		];

		// Answers don't include 'role' at all
		const results = await evaluateEligibility({}, rules);
		expect(results).toHaveLength(0);
	});
});

// ============================================================================
// RANK MATCHES TESTS
// ============================================================================

describe("rankMatches", () => {
	it("sorts high confidence before medium before low", () => {
		const matches = [
			createMockMatch({
				programId: "program-m",
				programName: "Program M",
				confidence: "medium",
			}),
			createMockMatch({
				programId: "program-l",
				programName: "Program L",
				confidence: "low",
			}),
			createMockMatch({
				programId: "program-h",
				programName: "Program H",
				confidence: "high",
			}),
		];

		const ranked = rankMatches(matches);

		expect(ranked[0].confidence).toBe("high");
		expect(ranked[1].confidence).toBe("medium");
		expect(ranked[2].confidence).toBe("low");
	});

	it("sorts alphabetically within same confidence level", () => {
		const matches = [
			createMockMatch({
				programId: "z-program",
				programName: "Zebra Program",
				confidence: "high",
			}),
			createMockMatch({
				programId: "a-program",
				programName: "Alpha Program",
				confidence: "high",
			}),
			createMockMatch({
				programId: "m-program",
				programName: "Middle Program",
				confidence: "high",
			}),
		];

		const ranked = rankMatches(matches);

		expect(ranked[0].programName).toBe("Alpha Program");
		expect(ranked[1].programName).toBe("Middle Program");
		expect(ranked[2].programName).toBe("Zebra Program");
	});

	it("does not mutate the original array", () => {
		const matches = [
			createMockMatch({
				programId: "b",
				programName: "B",
				confidence: "low",
			}),
			createMockMatch({
				programId: "a",
				programName: "A",
				confidence: "high",
			}),
		];

		const ranked = rankMatches(matches);

		expect(ranked).not.toBe(matches);
		expect(matches[0].programId).toBe("b"); // Original unchanged
	});

	it("returns empty array for empty input", () => {
		expect(rankMatches([])).toEqual([]);
	});
});

// ============================================================================
// DEDUPLICATE MATCHES TESTS
// ============================================================================

describe("deduplicateMatches", () => {
	it("keeps highest confidence when program appears at multiple levels", () => {
		const matches = [
			createMockMatch({
				programId: "va-disability-compensation",
				programName: "VA Disability Compensation",
				confidence: "high",
			}),
			createMockMatch({
				programId: "va-disability-compensation",
				programName: "VA Disability Compensation",
				confidence: "medium",
			}),
		];

		const deduped = deduplicateMatches(matches);

		expect(deduped).toHaveLength(1);
		expect(deduped[0].programId).toBe("va-disability-compensation");
		expect(deduped[0].confidence).toBe("high");
	});

	it("keeps all matches when programs are different", () => {
		const matches = [
			createMockMatch({
				programId: "va-disability-compensation",
				programName: "VA Disability Compensation",
				confidence: "high",
			}),
			createMockMatch({
				programId: "medicaid-ky",
				programName: "Medicaid (Kentucky)",
				confidence: "medium",
			}),
		];

		const deduped = deduplicateMatches(matches);

		expect(deduped).toHaveLength(2);
	});

	it("handles medium appearing before high in input order", () => {
		const matches = [
			createMockMatch({
				programId: "ssi",
				programName: "SSI",
				confidence: "medium",
			}),
			createMockMatch({
				programId: "ssi",
				programName: "SSI",
				confidence: "high",
			}),
		];

		const deduped = deduplicateMatches(matches);

		expect(deduped).toHaveLength(1);
		expect(deduped[0].confidence).toBe("high");
	});

	it("handles three confidence levels for the same program", () => {
		const matches = [
			createMockMatch({
				programId: "test",
				programName: "Test",
				confidence: "low",
			}),
			createMockMatch({
				programId: "test",
				programName: "Test",
				confidence: "medium",
			}),
			createMockMatch({
				programId: "test",
				programName: "Test",
				confidence: "high",
			}),
		];

		const deduped = deduplicateMatches(matches);

		expect(deduped).toHaveLength(1);
		expect(deduped[0].confidence).toBe("high");
	});

	it("returns empty array for empty input", () => {
		expect(deduplicateMatches([])).toEqual([]);
	});
});

// ============================================================================
// ENRICH WITH DOCUMENTATION TESTS
// ============================================================================

describe("enrichWithDocumentation", () => {
	const mockChecklists: DocumentationChecklist[] = [
		{
			programId: "va-disability-compensation",
			programName: "VA Disability Compensation",
			description: "Monthly tax-free payment.",
			documents: [
				{
					name: "DD Form 214",
					description: "Certificate of Release",
					required: true,
					howToObtain: "Request from National Archives",
				},
				{
					name: "VA Form 21-526EZ",
					description: "Application for Disability",
					required: true,
					howToObtain: "Download from VA.gov",
				},
				{
					name: "Medical records",
					description: "Records documenting your condition",
					required: true,
					howToObtain: "Request from healthcare providers",
				},
			],
			tips: ["File as soon as possible"],
		},
	];

	it("enriches matches with documentation checklist data", () => {
		const matches = [
			createMockMatch({
				programId: "va-disability-compensation",
				programName: "VA Disability Compensation",
				confidence: "high",
				requiredDocs: ["DD Form 214", "VA Form 21-526EZ"],
			}),
		];

		const enriched = enrichWithDocumentation(matches, mockChecklists);

		expect(enriched).toHaveLength(1);
		expect(enriched[0].requiredDocs).toEqual([
			"DD Form 214",
			"VA Form 21-526EZ",
			"Medical records",
		]);
	});

	it("leaves matches unchanged when no checklist exists for the program", () => {
		const matches = [
			createMockMatch({
				programId: "unknown-program",
				programName: "Unknown Program",
				confidence: "medium",
				requiredDocs: ["Original Doc"],
			}),
		];

		const enriched = enrichWithDocumentation(matches, mockChecklists);

		expect(enriched[0].requiredDocs).toEqual(["Original Doc"]);
	});

	it("does not mutate the original matches array", () => {
		const matches = [
			createMockMatch({
				programId: "va-disability-compensation",
				programName: "VA Disability Compensation",
				confidence: "high",
				requiredDocs: ["DD Form 214"],
			}),
		];

		const enriched = enrichWithDocumentation(matches, mockChecklists);

		expect(enriched).not.toBe(matches);
		expect(matches[0].requiredDocs).toEqual(["DD Form 214"]);
	});

	it("handles empty matches array", () => {
		expect(enrichWithDocumentation([], mockChecklists)).toEqual([]);
	});

	it("handles empty checklists array", () => {
		const matches = [
			createMockMatch({
				programId: "va-disability-compensation",
				programName: "VA Disability Compensation",
				confidence: "high",
				requiredDocs: ["DD Form 214"],
			}),
		];

		const enriched = enrichWithDocumentation(matches, []);

		expect(enriched[0].requiredDocs).toEqual(["DD Form 214"]);
	});
});
