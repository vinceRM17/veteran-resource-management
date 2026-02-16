/**
 * Documentation checklists for benefit program applications
 * Kentucky-focused programs matching Phase 3 screening
 */

export interface DocumentationChecklist {
	programId: string;
	programName: string;
	description: string;
	documents: {
		name: string;
		description: string;
		required: boolean; // true = required, false = recommended
		howToObtain: string;
	}[];
	tips: string[];
}

export const documentationChecklists: DocumentationChecklist[] = [
	{
		programId: "va-disability-compensation",
		programName: "VA Disability Compensation",
		description:
			"Monthly tax-free payment for disabilities connected to your military service.",
		documents: [
			{
				name: "DD Form 214",
				description: "Certificate of Release or Discharge from Active Duty",
				required: true,
				howToObtain:
					"Request from the National Archives: https://www.archives.gov/veterans/military-service-records",
			},
			{
				name: "VA Form 21-526EZ",
				description: "Application for Disability Compensation",
				required: true,
				howToObtain:
					"Download from VA.gov or file online at https://www.va.gov/disability/how-to-file-claim/",
			},
			{
				name: "Medical records",
				description:
					"Records documenting your condition and its connection to service",
				required: true,
				howToObtain:
					"Request from your healthcare providers (VA or private). For VA records: https://www.myhealth.va.gov/",
			},
			{
				name: "Buddy statements",
				description:
					"Statements from fellow service members who witnessed your injury or condition",
				required: false,
				howToObtain:
					"Ask fellow veterans to write a statement describing what they witnessed. Include their contact information.",
			},
			{
				name: "Service treatment records",
				description: "Medical records from your time in service",
				required: false,
				howToObtain:
					"Request from the National Archives if not already in your possession.",
			},
		],
		tips: [
			"File your claim as soon as possible. Benefits are effective from the date you file, not when you're approved.",
			"A Higher disability rating means higher monthly payments (0-100% in 10% increments).",
			"You can file for multiple conditions in one claim.",
			"Consider working with an accredited VA representative or VSO (Veterans Service Organization) to help with your claim.",
			"Keep copies of everything you submit.",
		],
	},
	{
		programId: "va-healthcare",
		programName: "VA Healthcare (VA Medical Benefits)",
		description:
			"Comprehensive healthcare coverage through the VA healthcare system.",
		documents: [
			{
				name: "DD Form 214",
				description: "Certificate of Release or Discharge from Active Duty",
				required: true,
				howToObtain:
					"Request from the National Archives: https://www.archives.gov/veterans/military-service-records",
			},
			{
				name: "VA Form 10-10EZ",
				description: "Application for Health Benefits",
				required: true,
				howToObtain:
					"Download from VA.gov or apply online at https://www.va.gov/health-care/apply/application/",
			},
			{
				name: "Proof of income",
				description:
					"Tax returns, W-2s, or Social Security statements for household income",
				required: true,
				howToObtain:
					"From IRS (tax returns), employer (W-2s), or Social Security Administration.",
			},
			{
				name: "Insurance information",
				description:
					"Details of any current health insurance coverage (Medicare, Medicaid, private)",
				required: false,
				howToObtain: "Insurance card or policy documents from your insurer.",
			},
		],
		tips: [
			"VA healthcare is free for service-connected disabilities.",
			"Priority Groups determine your cost-sharing (copays). Lower income veterans often have no copays.",
			"Enroll even if you have other insurance - VA can serve as secondary coverage.",
			"You can choose between VA medical centers and community care providers in some cases.",
		],
	},
	{
		programId: "medicaid-ky",
		programName: "Medicaid (Kentucky)",
		description:
			"Health coverage for low-income individuals and families in Kentucky.",
		documents: [
			{
				name: "Proof of identity",
				description: "Driver's license, state ID, or passport",
				required: true,
				howToObtain:
					"Kentucky DMV for driver's license/ID: https://drive.ky.gov/",
			},
			{
				name: "Proof of income",
				description:
					"Recent pay stubs, tax returns, Social Security award letter, or unemployment documents",
				required: true,
				howToObtain: "From employer, IRS, Social Security, or state unemployment.",
			},
			{
				name: "Proof of Kentucky residency",
				description: "Utility bill, lease agreement, or mortgage statement",
				required: true,
				howToObtain: "From utility company, landlord, or mortgage lender.",
			},
			{
				name: "Social Security card",
				description: "Social Security card for all household members applying",
				required: true,
				howToObtain:
					"Request replacement at https://www.ssa.gov/number-card/ if lost.",
			},
			{
				name: "Immigration documents",
				description: "If not a U.S. citizen, proof of legal immigration status",
				required: false,
				howToObtain: "From USCIS or kept from immigration process.",
			},
		],
		tips: [
			"Kentucky Medicaid (kynect) has different programs based on age, disability, and family status.",
			"Veterans with VA healthcare may still qualify and benefit from dual coverage.",
			"You must renew your Medicaid eligibility annually.",
			"Apply online at https://kynect.ky.gov/ or call 1-855-459-6328.",
			"Eligibility is generally up to 138% of Federal Poverty Level for adults (about $20,783/year for individual in 2024).",
		],
	},
	{
		programId: "snap-ky",
		programName: "SNAP (Food Stamps, Kentucky)",
		description:
			"Supplemental Nutrition Assistance Program providing monthly benefits for food purchases.",
		documents: [
			{
				name: "Proof of identity",
				description: "Driver's license, state ID, or passport",
				required: true,
				howToObtain:
					"Kentucky DMV for driver's license/ID: https://drive.ky.gov/",
			},
			{
				name: "Proof of income",
				description:
					"Recent pay stubs (last 30 days), tax returns, or Social Security statements",
				required: true,
				howToObtain: "From employer, IRS, or Social Security Administration.",
			},
			{
				name: "Proof of Kentucky residency",
				description: "Utility bill, lease agreement, or mortgage statement",
				required: true,
				howToObtain: "From utility company, landlord, or mortgage lender.",
			},
			{
				name: "Social Security numbers",
				description: "For all household members applying",
				required: true,
				howToObtain:
					"Request replacement at https://www.ssa.gov/number-card/ if lost.",
			},
			{
				name: "Bank statements",
				description: "Recent statements for all bank accounts",
				required: true,
				howToObtain: "From your bank (online or request at branch).",
			},
			{
				name: "Rent/mortgage statement",
				description: "Proof of monthly housing costs",
				required: false,
				howToObtain: "From landlord or mortgage lender.",
			},
			{
				name: "Utility bills",
				description: "Recent utility bills to claim utility allowance",
				required: false,
				howToObtain: "From utility companies.",
			},
		],
		tips: [
			"Benefits loaded monthly on Kentucky EBT card (like a debit card).",
			"Gross income must be at or below 130% of poverty level (about $32,630/year for family of 3 in 2024).",
			"Veterans receiving SSI or SNAP are often automatically eligible.",
			"Apply online at https://kynect.ky.gov/ or at your local DCBS office.",
			"SNAP benefits can be used at most grocery stores and farmers markets.",
			"Recertification required every 6-12 months depending on circumstances.",
		],
	},
	{
		programId: "ssi",
		programName: "SSI (Supplemental Security Income)",
		description:
			"Monthly payments for disabled, blind, or age 65+ individuals with limited income and resources.",
		documents: [
			{
				name: "Social Security card",
				description: "Your Social Security card or number",
				required: true,
				howToObtain:
					"Request replacement at https://www.ssa.gov/number-card/ if lost.",
			},
			{
				name: "Birth certificate or proof of age",
				description: "Official birth certificate or other age documentation",
				required: true,
				howToObtain:
					"Request from vital records office in state where you were born.",
			},
			{
				name: "Medical records",
				description:
					"Documentation of your disability or medical condition from doctors",
				required: true,
				howToObtain:
					"Request from all healthcare providers who have treated your condition.",
			},
			{
				name: "Work history",
				description: "Names and addresses of employers for last 15 years",
				required: true,
				howToObtain: "Compile from W-2s, tax returns, or personal records.",
			},
			{
				name: "Bank account information",
				description: "Account numbers and balances for all accounts",
				required: true,
				howToObtain: "From your bank statements.",
			},
			{
				name: "Proof of living arrangements",
				description: "Information about where you live and household expenses",
				required: false,
				howToObtain: "Lease, mortgage statement, or letter from person you live with.",
			},
		],
		tips: [
			"SSI is need-based - you must have limited income (under $943/month individual in 2024) and resources (under $2,000 individual).",
			"SSI is different from SSDI - you don't need work credits for SSI.",
			"Veterans can receive VA benefits and SSI simultaneously, but VA benefits may reduce SSI payment.",
			"Apply online at https://www.ssa.gov/benefits/ssi/ or call 1-800-772-1213.",
			"The application process can take 3-6 months. Apply as soon as you believe you qualify.",
			"Most SSI recipients automatically qualify for Medicaid.",
		],
	},
	{
		programId: "ssdi",
		programName: "SSDI (Social Security Disability Insurance)",
		description:
			"Monthly benefits for workers who can no longer work due to disability.",
		documents: [
			{
				name: "Social Security card",
				description: "Your Social Security card or number",
				required: true,
				howToObtain:
					"Request replacement at https://www.ssa.gov/number-card/ if lost.",
			},
			{
				name: "Medical records",
				description:
					"Comprehensive medical documentation of your disabling condition",
				required: true,
				howToObtain:
					"Request from all doctors, hospitals, and clinics that treated you.",
			},
			{
				name: "Work history and earnings",
				description: "Detailed work history for the last 15 years",
				required: true,
				howToObtain: "Compile from W-2s, tax returns, or SSA earnings record.",
			},
			{
				name: "DD Form 214",
				description: "If claiming service-connected disability",
				required: false,
				howToObtain:
					"Request from the National Archives: https://www.archives.gov/veterans/military-service-records",
			},
			{
				name: "Tax returns",
				description: "Recent tax returns if self-employed",
				required: false,
				howToObtain: "From IRS or your tax preparer.",
			},
			{
				name: "Workers compensation documentation",
				description: "If you received workers comp or other disability benefits",
				required: false,
				howToObtain: "From workers compensation insurer or employer.",
			},
		],
		tips: [
			"SSDI requires work credits - generally you need 40 credits (10 years of work), with 20 earned in last 10 years.",
			"Veterans with service-connected disabilities may qualify for expedited processing.",
			"SSDI has a 5-month waiting period after you become disabled.",
			"After 24 months on SSDI, you automatically qualify for Medicare.",
			"Apply online at https://www.ssa.gov/benefits/disability/ or call 1-800-772-1213.",
			"Approval rates are higher with legal representation or help from a disability advocate.",
		],
	},
	{
		programId: "ky-hcb-waiver",
		programName: "Kentucky HCB Waiver (Home and Community Based Services)",
		description:
			"Medicaid waiver providing home and community-based services as an alternative to institutional care.",
		documents: [
			{
				name: "Medicaid eligibility documentation",
				description: "Must be enrolled in Kentucky Medicaid or apply simultaneously",
				required: true,
				howToObtain: "Apply at https://kynect.ky.gov/ or through DCBS office.",
			},
			{
				name: "Level of Care assessment",
				description:
					"Medical assessment showing need for nursing facility level of care",
				required: true,
				howToObtain:
					"Scheduled by Kentucky Department for Medicaid Services after application.",
			},
			{
				name: "Physician documentation",
				description:
					"Doctor's statement supporting need for long-term care services",
				required: true,
				howToObtain: "Request from your primary care physician or specialist.",
			},
			{
				name: "Proof of Kentucky residency",
				description: "Documentation showing you live in Kentucky",
				required: true,
				howToObtain: "Utility bill, lease agreement, or state ID.",
			},
			{
				name: "Functional assessment",
				description: "Evaluation of your ability to perform daily living activities",
				required: false,
				howToObtain:
					"Conducted by case manager after initial application approval.",
			},
		],
		tips: [
			"Kentucky has several HCB waivers: Acquired Brain Injury, Supports for Community Living, Michelle P, Model II, and Home & Community Based.",
			"Waitlists exist for most waivers - apply as early as possible even if you don't need services immediately.",
			"Services can include personal care, home modifications, respite care, and adult day care.",
			"You must meet nursing facility level of care to qualify.",
			"Contact your local Area Development District (ADD) for waiver information and application assistance.",
			"Veterans may be able to combine VA benefits with waiver services for comprehensive support.",
		],
	},
	{
		programId: "va-pension",
		programName: "Veterans Pension (Aid and Attendance)",
		description:
			"Tax-free monthly benefit for wartime veterans age 65+ or permanently disabled with limited income.",
		documents: [
			{
				name: "DD Form 214",
				description: "Certificate of Release or Discharge from Active Duty",
				required: true,
				howToObtain:
					"Request from the National Archives: https://www.archives.gov/veterans/military-service-records",
			},
			{
				name: "VA Form 21P-527EZ",
				description: "Application for Veterans Pension",
				required: true,
				howToObtain:
					"Download from VA.gov or apply online at https://www.va.gov/pension/",
			},
			{
				name: "Income documentation",
				description:
					"Proof of all household income (Social Security, pensions, employment)",
				required: true,
				howToObtain: "Tax returns, Social Security statements, pension statements.",
			},
			{
				name: "Net worth statement",
				description: "Documentation of assets (bank accounts, property, investments)",
				required: true,
				howToObtain: "Bank statements, property deeds, investment statements.",
			},
			{
				name: "Medical records",
				description:
					"If claiming Aid and Attendance, doctor's statement of need for assistance",
				required: false,
				howToObtain:
					"Request from your physician. VA Form 21-2680 (Examination for Housebound Status or Permanent Need for Regular Aid and Attendance).",
			},
			{
				name: "Marriage certificate",
				description: "If applying for surviving spouse benefits",
				required: false,
				howToObtain: "From vital records office in state where married.",
			},
		],
		tips: [
			"You must have served at least 90 days of active duty with at least one day during a wartime period.",
			"Income limits for 2024: $16,037/year single veteran, $21,063/year married veteran.",
			"Aid and Attendance adds extra monthly payment if you need help with daily activities.",
			"Unreimbursed medical expenses can reduce your countable income, potentially qualifying you.",
			"Net worth limit is approximately $150,823 (2024) excluding your primary residence.",
			"This is a needs-based program - higher disability rating from VA Disability Compensation may be more beneficial if you qualify.",
		],
	},
];
