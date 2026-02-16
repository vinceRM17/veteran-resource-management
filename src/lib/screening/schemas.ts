/**
 * Per-step Zod validation schemas for the screening flow.
 * Each step validates independently so users get immediate feedback.
 *
 * Uses Zod 4 API (z.object, z.enum, z.array, .refine for conditional logic).
 */

import { z } from "zod";

// ============================================================================
// STEP 1: Role Selection
// ============================================================================

export const step1Schema = z.object({
	role: z.enum(["veteran", "caregiver"], {
		message: "Please tell us who you are.",
	}),
});

export type Step1Data = z.infer<typeof step1Schema>;

// ============================================================================
// STEP 2: Location & Demographics
// ============================================================================

const step2Base = z.object({
	state: z.string().min(1, "Please pick your state."),
	ageRange: z.enum(["18-34", "35-49", "50-64", "65+"], {
		message: "Please pick your age range.",
	}),
	serviceEra: z.enum(["vietnam", "gulf-war", "post-911", "other"]).optional(),
	isCaregiver: z.enum(["yes", "no"]).optional(),
});

export const step2Schema = step2Base;

export type Step2Data = z.infer<typeof step2Base>;

/** Step 2 schema for veterans -- requires serviceEra */
const step2VeteranSchema = z.object({
	state: z.string().min(1, "Please pick your state."),
	ageRange: z.enum(["18-34", "35-49", "50-64", "65+"], {
		message: "Please pick your age range.",
	}),
	serviceEra: z.enum(["vietnam", "gulf-war", "post-911", "other"], {
		message: "Please tell us when you served.",
	}),
	isCaregiver: z.enum(["yes", "no"]).optional(),
});

/** Step 2 schema for caregivers -- requires isCaregiver */
const step2CaregiverSchema = z.object({
	state: z.string().min(1, "Please pick your state."),
	ageRange: z.enum(["18-34", "35-49", "50-64", "65+"], {
		message: "Please pick your age range.",
	}),
	serviceEra: z.enum(["vietnam", "gulf-war", "post-911", "other"]).optional(),
	isCaregiver: z.enum(["yes", "no"], {
		message: "Please answer this question.",
	}),
});

/**
 * Creates a step 2 schema that is role-aware.
 * Call this with the current role to get conditional validation.
 */
export function getStep2Schema(role: string | undefined) {
	if (role === "veteran") {
		return step2VeteranSchema;
	}
	if (role === "caregiver") {
		return step2CaregiverSchema;
	}
	return step2Base;
}

// ============================================================================
// STEP 3: Needs Assessment
// ============================================================================

const step3Base = z.object({
	hasServiceConnectedDisability: z.enum(["yes", "no", "not-sure"]).optional(),
	disabilityRating: z
		.enum(["0", "10-30", "40-60", "70-100", "not-rated", "dont-know"])
		.optional(),
	employmentStatus: z.enum(
		["full-time", "part-time", "no-seeking", "no-not-seeking", "retired"],
		{
			message: "Please tell us your work status.",
		},
	),
	householdIncome: z.enum(
		["under-15k", "15k-25k", "25k-40k", "40k-60k", "over-60k", "prefer-not"],
		{
			message: "Please pick an income range.",
		},
	),
});

export const step3Schema = step3Base;

export type Step3Data = z.infer<typeof step3Base>;

/** Step 3 for veterans -- requires hasServiceConnectedDisability */
const step3VeteranSchema = z.object({
	hasServiceConnectedDisability: z.enum(["yes", "no", "not-sure"], {
		message: "Please answer this question.",
	}),
	disabilityRating: z
		.enum(["0", "10-30", "40-60", "70-100", "not-rated", "dont-know"])
		.optional(),
	employmentStatus: z.enum(
		["full-time", "part-time", "no-seeking", "no-not-seeking", "retired"],
		{
			message: "Please tell us your work status.",
		},
	),
	householdIncome: z.enum(
		["under-15k", "15k-25k", "25k-40k", "40k-60k", "over-60k", "prefer-not"],
		{
			message: "Please pick an income range.",
		},
	),
});

/** Step 3 for veterans with disability -- also requires disabilityRating */
const step3VeteranWithDisabilitySchema = z.object({
	hasServiceConnectedDisability: z.enum(["yes", "no", "not-sure"], {
		message: "Please answer this question.",
	}),
	disabilityRating: z.enum(
		["0", "10-30", "40-60", "70-100", "not-rated", "dont-know"],
		{
			message: "Please pick your disability rating.",
		},
	),
	employmentStatus: z.enum(
		["full-time", "part-time", "no-seeking", "no-not-seeking", "retired"],
		{
			message: "Please tell us your work status.",
		},
	),
	householdIncome: z.enum(
		["under-15k", "15k-25k", "25k-40k", "40k-60k", "over-60k", "prefer-not"],
		{
			message: "Please pick an income range.",
		},
	),
});

/**
 * Creates a step 3 schema that accounts for conditional fields.
 * Role and previous answers determine which fields are required.
 */
export function getStep3Schema(
	role: string | undefined,
	hasDisability: string | undefined,
) {
	if (role === "veteran" && hasDisability === "yes") {
		return step3VeteranWithDisabilitySchema;
	}
	if (role === "veteran") {
		return step3VeteranSchema;
	}
	return step3Base;
}

// ============================================================================
// STEP 4: Benefits & Priorities
// ============================================================================

export const step4Schema = z.object({
	areasOfNeed: z
		.array(z.string())
		.min(1, "Please pick at least one area where you need help."),
	currentBenefits: z.array(z.string()).default([]),
});

export type Step4Data = z.infer<typeof step4Schema>;

// ============================================================================
// STEP SCHEMAS ARRAY (indexed by step number, 1-based)
// Step 5 is review with no validation needed, so it uses a passthrough schema.
// ============================================================================

/**
 * Static schemas for simple per-step validation.
 * For conditional validation, use getStep2Schema() and getStep3Schema().
 */
export const stepSchemas = [
	undefined, // index 0 unused (steps are 1-based)
	step1Schema,
	step2Base,
	step3Base,
	step4Schema,
	z.object({}), // step 5: review, no fields to validate
];
