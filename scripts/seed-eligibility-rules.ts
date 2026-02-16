#!/usr/bin/env tsx

/**
 * Seed eligibility rules into Supabase for Kentucky programs.
 * Uses json-rules-engine format for rule definitions.
 *
 * Usage: npm run seed:rules
 *
 * This script is idempotent: it deletes existing Kentucky rules
 * and re-inserts them fresh on each run.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load .env.local (same pattern as ETL scripts)
config({ path: ".env.local" });

// ============================================================================
// SUPABASE SERVICE CLIENT
// ============================================================================

function createServiceClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		throw new Error(
			"Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
		);
	}

	return createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}

// ============================================================================
// RULE DEFINITIONS
// ============================================================================

interface SeedRule {
	program_id: string;
	program_name: string;
	jurisdiction: string;
	confidence_level: "high" | "medium" | "low";
	required_role: "veteran" | "caregiver" | null;
	description: string;
	required_docs: string[];
	next_steps: string[];
	rule_definition: {
		conditions: {
			all?: Array<{ fact: string; operator: string; value: unknown }>;
			any?: Array<{ fact: string; operator: string; value: unknown }>;
		};
		event: {
			type: string;
			params: {
				programId: string;
				confidence: string;
			};
		};
	};
}

const kentuckyRules: SeedRule[] = [
	// -----------------------------------------------------------------------
	// 1. VA Disability Compensation - HIGH
	// -----------------------------------------------------------------------
	{
		program_id: "va-disability-compensation",
		program_name: "VA Disability Compensation",
		jurisdiction: "kentucky",
		confidence_level: "high",
		required_role: "veteran",
		description:
			"Monthly tax-free payment for injuries or illnesses caused or made worse by your military service.",
		required_docs: [
			"DD Form 214",
			"VA Form 21-526EZ",
			"Medical records",
			"Service treatment records",
		],
		next_steps: [
			"File VA Form 21-526EZ online at VA.gov",
			"Gather your medical records",
			"Contact a VSO for free help with your claim",
		],
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
	},

	// -----------------------------------------------------------------------
	// 2. VA Disability Compensation - MEDIUM (not sure about disability)
	// -----------------------------------------------------------------------
	{
		program_id: "va-disability-compensation",
		program_name: "VA Disability Compensation",
		jurisdiction: "kentucky",
		confidence_level: "medium",
		required_role: "veteran",
		description:
			"Monthly tax-free payment for injuries or illnesses caused or made worse by your military service.",
		required_docs: ["DD Form 214", "VA Form 21-526EZ", "Medical records"],
		next_steps: [
			"Talk to your doctor about possible service-connected conditions",
			"Contact a VSO to see if your conditions may qualify",
			"File online at VA.gov or call 1-800-827-1000",
		],
		rule_definition: {
			conditions: {
				all: [
					{ fact: "role", operator: "equal", value: "veteran" },
					{
						fact: "hasServiceConnectedDisability",
						operator: "equal",
						value: "not-sure",
					},
				],
			},
			event: {
				type: "eligible",
				params: {
					programId: "va-disability-compensation",
					confidence: "medium",
				},
			},
		},
	},

	// -----------------------------------------------------------------------
	// 3. VA Healthcare - HIGH
	// -----------------------------------------------------------------------
	{
		program_id: "va-healthcare",
		program_name: "VA Healthcare",
		jurisdiction: "kentucky",
		confidence_level: "high",
		required_role: "veteran",
		description:
			"Full healthcare coverage through the VA system, including doctor visits, prescriptions, and mental health care.",
		required_docs: ["DD Form 214", "VA Form 10-10EZ", "Proof of income"],
		next_steps: [
			"Apply online at VA.gov/health-care",
			"Find your nearest VA medical center",
			"Bring your DD-214 to your first appointment",
		],
		rule_definition: {
			conditions: {
				all: [{ fact: "role", operator: "equal", value: "veteran" }],
			},
			event: {
				type: "eligible",
				params: { programId: "va-healthcare", confidence: "high" },
			},
		},
	},

	// -----------------------------------------------------------------------
	// 4. Kentucky Medicaid - HIGH (low income)
	// -----------------------------------------------------------------------
	{
		program_id: "medicaid-ky",
		program_name: "Medicaid (Kentucky)",
		jurisdiction: "kentucky",
		confidence_level: "high",
		required_role: null,
		description:
			"Health coverage for people with low income in Kentucky. Covers doctor visits, hospital stays, and prescriptions.",
		required_docs: [
			"Proof of identity",
			"Proof of income",
			"Proof of Kentucky residency",
			"Social Security card",
		],
		next_steps: [
			"Apply at kynect.ky.gov",
			"Call 1-855-459-6328 for help",
			"Visit your local DCBS office",
		],
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
	},

	// -----------------------------------------------------------------------
	// 5. Kentucky Medicaid - MEDIUM (moderate income)
	// -----------------------------------------------------------------------
	{
		program_id: "medicaid-ky",
		program_name: "Medicaid (Kentucky)",
		jurisdiction: "kentucky",
		confidence_level: "medium",
		required_role: null,
		description:
			"Health coverage for people with low income in Kentucky. Covers doctor visits, hospital stays, and prescriptions.",
		required_docs: [
			"Proof of identity",
			"Proof of income",
			"Proof of Kentucky residency",
			"Social Security card",
		],
		next_steps: [
			"Apply at kynect.ky.gov to see if you qualify",
			"Your income is near the limit, so applying is worth a try",
		],
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
	},

	// -----------------------------------------------------------------------
	// 6. SNAP Kentucky - HIGH (low income)
	// -----------------------------------------------------------------------
	{
		program_id: "snap-ky",
		program_name: "SNAP (Food Stamps, Kentucky)",
		jurisdiction: "kentucky",
		confidence_level: "high",
		required_role: null,
		description:
			"Monthly help to buy food at grocery stores using an EBT card.",
		required_docs: [
			"Proof of identity",
			"Proof of income",
			"Proof of Kentucky residency",
			"Social Security numbers for household",
			"Bank statements",
		],
		next_steps: [
			"Apply at kynect.ky.gov",
			"Visit your local DCBS office",
			"Gather proof of income for the last 30 days",
		],
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
	},

	// -----------------------------------------------------------------------
	// 7. SNAP Kentucky - MEDIUM (moderate income)
	// -----------------------------------------------------------------------
	{
		program_id: "snap-ky",
		program_name: "SNAP (Food Stamps, Kentucky)",
		jurisdiction: "kentucky",
		confidence_level: "medium",
		required_role: null,
		description:
			"Monthly help to buy food at grocery stores using an EBT card.",
		required_docs: [
			"Proof of identity",
			"Proof of income",
			"Proof of Kentucky residency",
			"Social Security numbers for household",
		],
		next_steps: [
			"Apply at kynect.ky.gov to check if you qualify",
			"Your income is near the limit. Household size matters, so it is worth applying.",
		],
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
				params: { programId: "snap-ky", confidence: "medium" },
			},
		},
	},

	// -----------------------------------------------------------------------
	// 8. SSI - HIGH (disabled, very low income, not working)
	// -----------------------------------------------------------------------
	{
		program_id: "ssi",
		program_name: "SSI (Supplemental Security Income)",
		jurisdiction: "kentucky",
		confidence_level: "high",
		required_role: null,
		description:
			"Monthly payments for people with disabilities or age 65+ who have very limited income.",
		required_docs: [
			"Social Security card",
			"Birth certificate",
			"Medical records",
			"Work history",
			"Bank account information",
		],
		next_steps: [
			"Apply at ssa.gov/benefits/ssi",
			"Call 1-800-772-1213",
			"Gather medical records from your doctors",
		],
		rule_definition: {
			conditions: {
				all: [
					{
						fact: "hasServiceConnectedDisability",
						operator: "in",
						value: ["yes", "not-sure"],
					},
					{
						fact: "householdIncome",
						operator: "equal",
						value: "under-15k",
					},
					{
						fact: "employmentStatus",
						operator: "in",
						value: ["no-seeking", "no-not-seeking", "retired"],
					},
				],
			},
			event: {
				type: "eligible",
				params: { programId: "ssi", confidence: "high" },
			},
		},
	},

	// -----------------------------------------------------------------------
	// 9. SSI - MEDIUM (disabled, low income)
	// -----------------------------------------------------------------------
	{
		program_id: "ssi",
		program_name: "SSI (Supplemental Security Income)",
		jurisdiction: "kentucky",
		confidence_level: "medium",
		required_role: null,
		description:
			"Monthly payments for people with disabilities or age 65+ who have very limited income.",
		required_docs: [
			"Social Security card",
			"Medical records",
			"Proof of income",
		],
		next_steps: [
			"Apply at ssa.gov/benefits/ssi to check if you qualify",
			"Income limits depend on your living situation",
		],
		rule_definition: {
			conditions: {
				all: [
					{
						fact: "hasServiceConnectedDisability",
						operator: "in",
						value: ["yes", "not-sure"],
					},
					{
						fact: "householdIncome",
						operator: "in",
						value: ["under-15k", "15k-25k"],
					},
				],
			},
			event: {
				type: "eligible",
				params: { programId: "ssi", confidence: "medium" },
			},
		},
	},

	// -----------------------------------------------------------------------
	// 10. SSDI - HIGH (disabled, has work history)
	// -----------------------------------------------------------------------
	{
		program_id: "ssdi",
		program_name: "SSDI (Social Security Disability Insurance)",
		jurisdiction: "kentucky",
		confidence_level: "high",
		required_role: null,
		description:
			"Monthly benefits for workers who can no longer work because of a disability.",
		required_docs: [
			"Social Security card",
			"Medical records",
			"Work history and earnings",
		],
		next_steps: [
			"Apply at ssa.gov/benefits/disability",
			"Call 1-800-772-1213",
			"Veterans may get faster processing",
		],
		rule_definition: {
			conditions: {
				all: [
					{
						fact: "hasServiceConnectedDisability",
						operator: "equal",
						value: "yes",
					},
					{
						fact: "employmentStatus",
						operator: "in",
						value: ["no-seeking", "no-not-seeking", "retired"],
					},
				],
			},
			event: {
				type: "eligible",
				params: { programId: "ssdi", confidence: "high" },
			},
		},
	},

	// -----------------------------------------------------------------------
	// 11. SSDI - MEDIUM (might have disability, unsure employment)
	// -----------------------------------------------------------------------
	{
		program_id: "ssdi",
		program_name: "SSDI (Social Security Disability Insurance)",
		jurisdiction: "kentucky",
		confidence_level: "medium",
		required_role: null,
		description:
			"Monthly benefits for workers who can no longer work because of a disability.",
		required_docs: ["Social Security card", "Medical records", "Work history"],
		next_steps: [
			"Talk to your doctor about whether your condition qualifies",
			"Apply at ssa.gov/benefits/disability",
			"You need work credits from past jobs to qualify",
		],
		rule_definition: {
			conditions: {
				all: [
					{
						fact: "hasServiceConnectedDisability",
						operator: "equal",
						value: "not-sure",
					},
				],
			},
			event: {
				type: "eligible",
				params: { programId: "ssdi", confidence: "medium" },
			},
		},
	},

	// -----------------------------------------------------------------------
	// 12. KY HCB Waiver - HIGH (elderly in KY needing healthcare)
	// -----------------------------------------------------------------------
	{
		program_id: "ky-hcb-waiver",
		program_name: "Kentucky HCB Waiver (Home and Community Based Services)",
		jurisdiction: "kentucky",
		confidence_level: "high",
		required_role: null,
		description:
			"Home-based care services in Kentucky so you can stay in your home instead of a nursing facility.",
		required_docs: [
			"Medicaid eligibility documentation",
			"Level of care assessment",
			"Physician documentation",
			"Proof of Kentucky residency",
		],
		next_steps: [
			"Apply for Medicaid at kynect.ky.gov (required first)",
			"Contact your local Area Development District",
			"Ask your doctor for a level of care assessment",
		],
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
	},

	// -----------------------------------------------------------------------
	// 13. KY HCB Waiver - MEDIUM (disabled in KY)
	// -----------------------------------------------------------------------
	{
		program_id: "ky-hcb-waiver",
		program_name: "Kentucky HCB Waiver (Home and Community Based Services)",
		jurisdiction: "kentucky",
		confidence_level: "medium",
		required_role: null,
		description:
			"Home-based care services in Kentucky so you can stay in your home instead of a nursing facility.",
		required_docs: [
			"Medicaid eligibility documentation",
			"Physician documentation",
			"Proof of Kentucky residency",
		],
		next_steps: [
			"Talk to your doctor about whether you qualify",
			"Apply for Medicaid first at kynect.ky.gov",
			"Contact your local Area Development District for information",
		],
		rule_definition: {
			conditions: {
				all: [
					{ fact: "state", operator: "equal", value: "KY" },
					{
						fact: "hasServiceConnectedDisability",
						operator: "in",
						value: ["yes", "not-sure"],
					},
				],
			},
			event: {
				type: "eligible",
				params: { programId: "ky-hcb-waiver", confidence: "medium" },
			},
		},
	},

	// -----------------------------------------------------------------------
	// 14. VA Pension - HIGH (elderly veteran, low income)
	// -----------------------------------------------------------------------
	{
		program_id: "va-pension",
		program_name: "Veterans Pension (Aid and Attendance)",
		jurisdiction: "kentucky",
		confidence_level: "high",
		required_role: "veteran",
		description:
			"Tax-free monthly payment for wartime veterans age 65 or older with low income.",
		required_docs: [
			"DD Form 214",
			"VA Form 21P-527EZ",
			"Income documentation",
			"Net worth statement",
		],
		next_steps: [
			"Apply at VA.gov/pension",
			"Gather income and asset documents",
			"Contact a VSO for free help",
		],
		rule_definition: {
			conditions: {
				all: [
					{ fact: "role", operator: "equal", value: "veteran" },
					{ fact: "ageRange", operator: "equal", value: "65+" },
					{
						fact: "householdIncome",
						operator: "in",
						value: ["under-15k", "15k-25k"],
					},
				],
			},
			event: {
				type: "eligible",
				params: { programId: "va-pension", confidence: "high" },
			},
		},
	},

	// -----------------------------------------------------------------------
	// 15. VA Pension - MEDIUM (veteran, moderate income)
	// -----------------------------------------------------------------------
	{
		program_id: "va-pension",
		program_name: "Veterans Pension (Aid and Attendance)",
		jurisdiction: "kentucky",
		confidence_level: "medium",
		required_role: "veteran",
		description:
			"Tax-free monthly payment for wartime veterans age 65 or older with low income.",
		required_docs: ["DD Form 214", "VA Form 21P-527EZ", "Income documentation"],
		next_steps: [
			"Check if your income is below the limit at VA.gov/pension",
			"Medical expenses can reduce your countable income",
			"Contact a VSO for free help with your claim",
		],
		rule_definition: {
			conditions: {
				all: [
					{ fact: "role", operator: "equal", value: "veteran" },
					{
						fact: "householdIncome",
						operator: "in",
						value: ["under-15k", "15k-25k", "25k-40k"],
					},
				],
			},
			event: {
				type: "eligible",
				params: { programId: "va-pension", confidence: "medium" },
			},
		},
	},
];

// ============================================================================
// SEED EXECUTION
// ============================================================================

async function seedRules() {
	console.log("Connecting to Supabase...");
	const supabase = createServiceClient();

	// Delete existing Kentucky rules (idempotent)
	console.log("Clearing existing Kentucky rules...");
	const { error: deleteError } = await supabase
		.from("eligibility_rules")
		.delete()
		.eq("jurisdiction", "kentucky");

	if (deleteError) {
		console.error("Error clearing rules:", deleteError.message);
		process.exit(1);
	}

	// Insert all rules
	console.log(`Inserting ${kentuckyRules.length} rules...`);
	const { data, error: insertError } = await supabase
		.from("eligibility_rules")
		.insert(kentuckyRules)
		.select("id, program_id, confidence_level");

	if (insertError) {
		console.error("Error inserting rules:", insertError.message);
		process.exit(1);
	}

	// Summary
	console.log(`\nSeeded ${data.length} rules for Kentucky programs:\n`);

	const summary = new Map<string, string[]>();
	for (const rule of data) {
		const key = rule.program_id;
		const existing = summary.get(key) || [];
		existing.push(rule.confidence_level);
		summary.set(key, existing);
	}

	for (const [programId, levels] of summary) {
		console.log(`  ${programId}: ${levels.join(", ")}`);
	}

	console.log("\nDone.");
}

seedRules().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
