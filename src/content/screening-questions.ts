/**
 * Screening question definitions for the 5-step eligibility flow.
 * All labels and help text are written at 6th-8th grade reading level.
 * Short sentences (under 15 words), common words, direct address.
 */

// ============================================================================
// TYPES
// ============================================================================

export type QuestionType =
	| "radio"
	| "select"
	| "checkbox-group"
	| "multi-select"
	| "textarea";

export interface QuestionOption {
	value: string;
	label: string;
	group?: string;
}

export interface ConditionalRule {
	fieldId: string;
	value: string | string[];
	operator?: "equals" | "includes" | "notEquals";
}

export interface QuestionDefinition {
	id: string;
	label: string;
	type: QuestionType;
	options: QuestionOption[];
	required: boolean;
	helpText?: string;
	conditionalOn?: ConditionalRule;
}

export interface StepDefinition {
	step: number;
	title: string;
	description: string;
	questions: QuestionDefinition[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const TOTAL_STEPS = 5;

// ============================================================================
// STEP DEFINITIONS
// ============================================================================

const step1: StepDefinition = {
	step: 1,
	title: "About You",
	description: "Tell us who you are so we can find the right help.",
	questions: [
		{
			id: "role",
			label: "Who are you?",
			type: "radio",
			options: [
				{ value: "veteran", label: "I am a veteran" },
				{
					value: "caregiver",
					label: "I am helping a veteran (family, caregiver, or friend)",
				},
			],
			required: true,
			helpText:
				"This helps us show you the right programs. Pick the one that fits you best.",
		},
	],
};

const step2: StepDefinition = {
	step: 2,
	title: "Where You Live",
	description: "We need a few details to match you with local programs.",
	questions: [
		{
			id: "state",
			label: "What state do you live in?",
			type: "select",
			options: [
				{ value: "KY", label: "Kentucky" },
				{ value: "OH", label: "Ohio" },
				{ value: "IN", label: "Indiana" },
				{ value: "TN", label: "Tennessee" },
				{ value: "WV", label: "West Virginia" },
				{ value: "VA", label: "Virginia" },
				{ value: "OTHER", label: "Other state" },
			],
			required: true,
			helpText: "Many programs are only for people in certain states.",
		},
		{
			id: "ageRange",
			label: "What is your age range?",
			type: "radio",
			options: [
				{ value: "18-34", label: "18 to 34" },
				{ value: "35-49", label: "35 to 49" },
				{ value: "50-64", label: "50 to 64" },
				{ value: "65+", label: "65 or older" },
			],
			required: true,
		},
		{
			id: "serviceEra",
			label: "When did you serve?",
			type: "radio",
			options: [
				{ value: "vietnam", label: "Vietnam era (1964-1975)" },
				{ value: "gulf-war", label: "Gulf War (1990-2001)" },
				{ value: "post-911", label: "After September 11, 2001" },
				{ value: "other", label: "Other time period" },
			],
			required: true,
			helpText: "Some VA programs depend on when you served.",
			conditionalOn: {
				fieldId: "role",
				value: "veteran",
				operator: "equals",
			},
		},
		{
			id: "isCaregiver",
			label: "Are you a caregiver for a veteran?",
			type: "radio",
			options: [
				{ value: "yes", label: "Yes" },
				{ value: "no", label: "No" },
			],
			required: true,
			helpText: "Caregivers may qualify for support programs too.",
			conditionalOn: {
				fieldId: "role",
				value: "caregiver",
				operator: "equals",
			},
		},
	],
};

const step3: StepDefinition = {
	step: 3,
	title: "Your Situation",
	description: "These questions help us find programs that fit your needs.",
	questions: [
		{
			id: "hasServiceConnectedDisability",
			label: "Do you have a disability from your military service?",
			type: "radio",
			options: [
				{ value: "yes", label: "Yes" },
				{ value: "no", label: "No" },
				{ value: "not-sure", label: "I am not sure" },
			],
			required: true,
			helpText:
				"A service-connected disability is an injury or illness caused or made worse by your service.",
			conditionalOn: {
				fieldId: "role",
				value: "veteran",
				operator: "equals",
			},
		},
		{
			id: "disabilityRating",
			label: "What is your VA disability rating?",
			type: "radio",
			options: [
				{ value: "0", label: "0%" },
				{ value: "10-30", label: "10% to 30%" },
				{ value: "40-60", label: "40% to 60%" },
				{ value: "70-100", label: "70% to 100%" },
				{ value: "not-rated", label: "I have not been rated" },
				{ value: "dont-know", label: "I do not know" },
			],
			required: true,
			helpText:
				"Your rating affects which benefits you can get. It is okay if you do not know.",
			conditionalOn: {
				fieldId: "hasServiceConnectedDisability",
				value: "yes",
				operator: "equals",
			},
		},
		{
			id: "employmentStatus",
			label: "Are you working right now?",
			type: "radio",
			options: [
				{ value: "full-time", label: "Yes, full time" },
				{ value: "part-time", label: "Yes, part time" },
				{ value: "no-seeking", label: "No, but I am looking for work" },
				{
					value: "no-not-seeking",
					label: "No, and I am not looking for work",
				},
				{ value: "retired", label: "I am retired" },
			],
			required: true,
		},
		{
			id: "householdIncome",
			label: "What is your household income per year (before taxes)?",
			type: "radio",
			options: [
				{ value: "under-15k", label: "Under $15,000" },
				{ value: "15k-25k", label: "$15,000 to $25,000" },
				{ value: "25k-40k", label: "$25,000 to $40,000" },
				{ value: "40k-60k", label: "$40,000 to $60,000" },
				{ value: "over-60k", label: "Over $60,000" },
				{ value: "prefer-not", label: "I prefer not to say" },
			],
			required: true,
			helpText:
				"We only use this to check program limits. We do not store exact amounts.",
		},
	],
};

const step4: StepDefinition = {
	step: 4,
	title: "What You Need",
	description: "Tell us what kind of help you are looking for.",
	questions: [
		{
			id: "areasOfNeed",
			label: "Which areas do you need help with? (Pick all that apply)",
			type: "checkbox-group",
			options: [
				{ value: "healthcare", label: "Healthcare", group: "Benefits & Basics" },
				{ value: "disability-compensation", label: "Disability compensation", group: "Benefits & Basics" },
				{ value: "food-assistance", label: "Food assistance", group: "Benefits & Basics" },
				{ value: "housing", label: "Housing", group: "Benefits & Basics" },
				{ value: "employment", label: "Employment", group: "Work & Education" },
				{ value: "education", label: "Education or training", group: "Work & Education" },
				{ value: "networking", label: "Networking and career connections", group: "Work & Education" },
				{ value: "mental-health", label: "Mental health", group: "Wellness & Community" },
				{ value: "community", label: "Community and camaraderie", group: "Wellness & Community" },
				{ value: "fitness", label: "Physical activity or fitness", group: "Wellness & Community" },
				{ value: "family-support", label: "Family support", group: "Wellness & Community" },
				{ value: "caregiver-support", label: "Caregiver support", group: "Wellness & Community" },
				{ value: "legal", label: "Legal help", group: "Other Support" },
				{ value: "financial-planning", label: "Financial planning", group: "Other Support" },
			],
			required: true,
			helpText: "You can pick more than one.",
		},
		{
			id: "currentBenefits",
			label: "Do you already get any of these benefits?",
			type: "checkbox-group",
			options: [
				{ value: "va-healthcare", label: "VA healthcare" },
				{ value: "va-disability", label: "VA disability" },
				{ value: "medicaid", label: "Medicaid" },
				{ value: "snap", label: "SNAP (food stamps)" },
				{ value: "ssi", label: "SSI" },
				{ value: "ssdi", label: "SSDI" },
				{ value: "none", label: "None of these" },
			],
			required: false,
			helpText: "This helps us avoid showing programs you already have.",
		},
		{
			id: "additionalInfo",
			label: "Is there anything else you want us to know?",
			type: "textarea",
			options: [],
			required: false,
			helpText:
				"This is optional. You can share anything that might help us find the right resources for you.",
		},
	],
};

const step5: StepDefinition = {
	step: 5,
	title: "Review Your Answers",
	description:
		"Please check your answers below. You can go back to change anything.",
	questions: [], // Review step has no input questions
};

// ============================================================================
// EXPORTS
// ============================================================================

export const screeningQuestions: StepDefinition[] = [
	step1,
	step2,
	step3,
	step4,
	step5,
];
