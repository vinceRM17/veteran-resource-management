/**
 * Benefit interaction rule definitions.
 *
 * Each rule describes a known conflict between two or more Kentucky veteran
 * benefit programs. Rules are evaluated after eligibility screening completes
 * to warn veterans before they begin applying.
 *
 * Rules use json-rules-engine v7 syntax with the 'contains' operator to check
 * whether matchedProgramIds (an array fact) includes specific program IDs.
 */

import type { InteractionRule } from "./interaction-types";

// ============================================================================
// BENEFIT INTERACTION RULES
// ============================================================================

export const BENEFIT_INTERACTION_RULES: InteractionRule[] = [
	// -------------------------------------------------------------------------
	// Rule 1: SSI + SNAP Income Interaction (severity: medium)
	// -------------------------------------------------------------------------
	// SSI counts as income for SNAP. At mid-range incomes, SSI may push total
	// income over 130% FPL, reducing or ending SNAP benefits.
	{
		name: "ssi-snap-income-interaction",
		conditions: {
			all: [
				{ fact: "matchedProgramIds", operator: "contains", value: "ssi" },
				{ fact: "matchedProgramIds", operator: "contains", value: "snap-ky" },
				{
					fact: "householdIncome",
					operator: "in",
					value: ["15k-25k", "25k-40k"],
				},
			],
		},
		event: {
			type: "benefit-interaction",
			params: {
				type: "warning",
				programIds: ["ssi", "snap-ky"],
				title: "SSI May Affect Your SNAP Benefits",
				description:
					"SSI payments count as income for SNAP (food stamps) eligibility. If SSI pushes your total income above 130% of the federal poverty line, your SNAP benefits may decrease or end. SNAP typically decreases by about $1 for every $3 in additional income.",
				recommendation:
					"Before applying for SSI, contact your local DCBS office at 1-855-459-6328 or speak with a benefits counselor to understand the total impact on your household.",
				severity: "medium",
				learnMoreUrl: "https://www.ssa.gov/ssi/text-other-ussi.htm",
			},
		},
	},

	// -------------------------------------------------------------------------
	// Rule 2: SSI + Medicaid Eligibility Cliff (severity: high)
	// -------------------------------------------------------------------------
	// In Kentucky, SSI recipients automatically qualify for Medicaid. Losing SSI
	// due to income increases can simultaneously end Medicaid coverage.
	{
		name: "ssi-medicaid-eligibility-cliff",
		conditions: {
			all: [
				{ fact: "matchedProgramIds", operator: "contains", value: "ssi" },
				{
					fact: "matchedProgramIds",
					operator: "contains",
					value: "medicaid-ky",
				},
			],
		},
		event: {
			type: "benefit-interaction",
			params: {
				type: "warning",
				programIds: ["ssi", "medicaid-ky"],
				title: "SSI and Medicaid Are Linked in Kentucky",
				description:
					"In Kentucky, SSI recipients automatically qualify for Medicaid. However, if your income increases and you lose SSI eligibility, you may also lose Medicaid coverage. This is known as a 'benefits cliff' — a small income increase can result in losing healthcare coverage.",
				recommendation:
					"Talk to a benefits counselor about Section 1619(b) protections, which may let you keep Medicaid even if SSI payments stop due to earnings.",
				severity: "high",
				learnMoreUrl: "https://www.ssa.gov/disabilityresearch/wi/1619b.htm",
			},
		},
	},

	// -------------------------------------------------------------------------
	// Rule 3: VA Disability Compensation + SSI Offset (severity: medium)
	// -------------------------------------------------------------------------
	// VA disability compensation is counted dollar-for-dollar as unearned income
	// for SSI after the first $20/month general exclusion.
	{
		name: "va-disability-ssi-offset",
		conditions: {
			all: [
				{
					fact: "matchedProgramIds",
					operator: "contains",
					value: "va-disability-compensation",
				},
				{ fact: "matchedProgramIds", operator: "contains", value: "ssi" },
			],
		},
		event: {
			type: "benefit-interaction",
			params: {
				type: "warning",
				programIds: ["va-disability-compensation", "ssi"],
				title: "VA Disability Compensation Reduces SSI Payments",
				description:
					"VA disability compensation is counted as unearned income for SSI. Each dollar of VA compensation reduces your SSI payment dollar-for-dollar after the first $20/month exclusion. If your VA compensation is high enough, you may not qualify for SSI at all.",
				recommendation:
					"Calculate your expected SSI amount after the VA offset. A Veterans Service Organization can help you understand the combined benefit amount.",
				severity: "medium",
				learnMoreUrl: "https://www.ssa.gov/ssi/text-income-ussi.htm",
			},
		},
	},

	// -------------------------------------------------------------------------
	// Rule 4: VA Pension + SSI Interaction (severity: medium)
	// -------------------------------------------------------------------------
	// VA pension payments count as income for SSI. In most cases, receiving both
	// is not possible — one effectively eliminates or reduces the other.
	{
		name: "va-pension-ssi-interaction",
		conditions: {
			all: [
				{
					fact: "matchedProgramIds",
					operator: "contains",
					value: "va-pension",
				},
				{ fact: "matchedProgramIds", operator: "contains", value: "ssi" },
			],
		},
		event: {
			type: "benefit-interaction",
			params: {
				type: "warning",
				programIds: ["va-pension", "ssi"],
				title: "You Generally Cannot Receive Both VA Pension and SSI",
				description:
					"VA pension payments count as income for SSI purposes. In most cases, VA pension and SSI combined cannot exceed the SSI federal benefit rate. Receiving one typically reduces or eliminates the other. You may need to choose which program provides the higher total benefit.",
				recommendation:
					"Contact your local VA regional office or a Veterans Service Organization to calculate which program provides a higher benefit for your situation.",
				severity: "medium",
				learnMoreUrl: "https://www.va.gov/pension/",
			},
		},
	},

	// -------------------------------------------------------------------------
	// Rule 5: SNAP + Medicaid Income Cliff (severity: low)
	// -------------------------------------------------------------------------
	// SNAP and Medicaid have different income limits (130% FPL vs 138% FPL).
	// A small income increase at the higher income range can affect both.
	{
		name: "snap-medicaid-income-cliff",
		conditions: {
			all: [
				{ fact: "matchedProgramIds", operator: "contains", value: "snap-ky" },
				{
					fact: "matchedProgramIds",
					operator: "contains",
					value: "medicaid-ky",
				},
				{ fact: "householdIncome", operator: "in", value: ["25k-40k"] },
			],
		},
		event: {
			type: "benefit-interaction",
			params: {
				type: "info",
				programIds: ["snap-ky", "medicaid-ky"],
				title: "Monitor Income Thresholds for SNAP and Medicaid",
				description:
					"SNAP and Medicaid have different income limits. SNAP gross income limit is 130% of the federal poverty line, while Medicaid in Kentucky covers up to 138% FPL. A small income increase could push you over the SNAP limit first, then potentially the Medicaid limit.",
				recommendation:
					"Keep track of your total household income. If your income changes, contact your local DCBS office to understand how it affects both programs.",
				severity: "low",
			},
		},
	},
];
