/**
 * Military Transition Checklist Content
 *
 * Milestone-based checklists sourced from:
 * - DoD Transition Assistance Program (TAP)
 * - VA transition resources
 * - Military OneSource transition guides
 *
 * All content written at 6th-8th grade reading level.
 */

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  resources: { label: string; url: string }[];
}

export interface TransitionMilestone {
  slug: string;
  name: string;
  timeframe: string;
  description: string;
  items: ChecklistItem[];
}

export const transitionChecklists: TransitionMilestone[] = [
  {
    slug: "180-days",
    name: "180 Days Before Separation",
    timeframe: "6 months out",
    description: "Start planning now. The earlier you begin, the smoother your transition will be. These are the most important tasks to complete 6 months before you separate.",
    items: [
      {
        id: "attend-tap",
        title: "Attend TAP Workshop",
        description: "The Transition Assistance Program (TAP) is a free workshop that covers benefits, job search, and life after military. You must attend before you can separate. Sign up early because classes fill up fast.",
        resources: [
          { label: "Find TAP workshops near you", url: "https://www.dodtap.mil" },
          { label: "What to expect at TAP", url: "https://www.va.gov/transition-assistance" }
        ]
      },
      {
        id: "dd214-review",
        title: "Request DD-214 Review",
        description: "Your DD-214 is your official proof of service. It shows your discharge status, awards, and time served. Request a review now to make sure all information is correct before you separate. Errors can delay benefits.",
        resources: [
          { label: "How to review your DD-214", url: "https://www.archives.gov/veterans/military-service-records" },
          { label: "Fix errors on your DD-214", url: "https://www.va.gov/records/correct-or-update-your-military-records" }
        ]
      },
      {
        id: "va-healthcare-enrollment",
        title: "Start VA Healthcare Enrollment",
        description: "VA healthcare covers medical care, mental health, and prescriptions. Apply now using VA Form 10-10EZ. You can apply online, by mail, or in person at any VA medical center. It's free for most veterans.",
        resources: [
          { label: "Apply for VA healthcare online", url: "https://www.va.gov/health-care/apply/application" },
          { label: "Check if you qualify", url: "https://www.va.gov/health-care/eligibility" }
        ]
      },
      {
        id: "disability-claim",
        title: "File Disability Claim If Applicable",
        description: "If you have any injuries, illnesses, or conditions caused or made worse by your military service, file a disability claim. Use VA Form 21-526EZ. File before you separate for faster processing. You'll need your medical records.",
        resources: [
          { label: "File a disability claim online", url: "https://www.va.gov/disability/file-disability-claim-form-21-526ez" },
          { label: "What conditions qualify", url: "https://www.va.gov/disability/eligibility/illnesses-within-one-year-of-discharge" }
        ]
      },
      {
        id: "resume-linkedin",
        title: "Start Resume and LinkedIn Profile",
        description: "Translate your military experience into civilian job language. Many TAP workshops offer help with this. Create a LinkedIn profile and connect with veterans in your field. Start networking now, not when you're already out.",
        resources: [
          { label: "Military skills translator", url: "https://www.careeronestop.org/Toolkit/Skills/military-skills-translator.aspx" },
          { label: "Veteran employment resources", url: "https://www.dol.gov/agencies/vets" }
        ]
      },
      {
        id: "gi-bill-research",
        title: "Research GI Bill Education Benefits",
        description: "The GI Bill pays for college, trade school, certifications, and more. Learn which GI Bill you qualify for (Post-9/11, Montgomery, etc.) and how much it covers. Apply at least 3 months before you plan to start school.",
        resources: [
          { label: "Compare GI Bill benefits", url: "https://www.va.gov/education/gi-bill-comparison-tool" },
          { label: "Apply for education benefits", url: "https://www.va.gov/education/apply-for-education-benefits/application/1990" }
        ]
      },
      {
        id: "medical-records",
        title: "Get Copies of Service Medical Records",
        description: "Request copies of your complete medical records now. You'll need them for VA disability claims, civilian doctors, and future care. It can take weeks or months to get them, so start early. Keep both paper and digital copies.",
        resources: [
          { label: "Request medical records", url: "https://www.tricare.mil/requestmedicalrecords" },
          { label: "Download My HealtheVet app", url: "https://www.myhealth.va.gov" }
        ]
      },
      {
        id: "personal-email",
        title: "Set Up Personal Email Address",
        description: "Get a professional personal email address (not your .mil address). You'll lose access to your military email soon after separation. Use this new email for job applications, VA benefits, and all transition tasks.",
        resources: [
          { label: "Gmail sign up", url: "https://mail.google.com" },
          { label: "Outlook sign up", url: "https://outlook.com" }
        ]
      }
    ]
  },
  {
    slug: "90-days",
    name: "90 Days Before Separation",
    timeframe: "3 months out",
    description: "You're getting closer. Now it's time to finalize benefits, set up accounts, and start job or school applications. Stay organized and keep copies of everything.",
    items: [
      {
        id: "finalize-va-healthcare",
        title: "Apply for VA Healthcare If Not Done",
        description: "If you didn't apply yet, do it now. Processing can take weeks. You want your healthcare in place the day you separate so you don't have a gap in coverage. You can use VA healthcare even if you have other insurance.",
        resources: [
          { label: "Apply for VA healthcare", url: "https://www.va.gov/health-care/apply/application" },
          { label: "Find your nearest VA facility", url: "https://www.va.gov/find-locations" }
        ]
      },
      {
        id: "register-va-accounts",
        title: "Register on VA.gov and Set Up ID.me",
        description: "Create accounts on VA.gov and set up ID.me verification. This gives you access to all VA online services: healthcare, benefits, records, and claims. ID.me is the login system the VA uses. You'll need a phone and ID.",
        resources: [
          { label: "Create VA.gov account", url: "https://www.va.gov/sign-in" },
          { label: "ID.me setup instructions", url: "https://www.id.me" }
        ]
      },
      {
        id: "state-benefits",
        title: "File for State Benefits If Needed",
        description: "Check what benefits your state offers to veterans: unemployment, Medicaid, property tax breaks, tuition assistance, and more. If you'll be unemployed after separation, apply for unemployment now. Each state has different programs.",
        resources: [
          { label: "Find benefits by state", url: "https://www.va.gov/statedva.htm" },
          { label: "Apply for unemployment", url: "https://www.careeronestop.org/LocalHelp/UnemploymentBenefits/find-unemployment-benefits.aspx" }
        ]
      },
      {
        id: "civilian-bank-account",
        title: "Open Civilian Bank Account",
        description: "If you use a military bank or credit union that doesn't have branches near where you're moving, open a civilian account now. Make sure your final paycheck and any benefits go to an account you can access easily.",
        resources: [
          { label: "Compare veteran-friendly banks", url: "https://www.military.com/money/banking/best-banks-for-veterans.html" },
          { label: "Navy Federal remains available after service", url: "https://www.navyfederal.org" }
        ]
      },
      {
        id: "job-school-applications",
        title: "Start Job Applications or School Enrollment",
        description: "Don't wait until after you separate to start looking. Apply for jobs now. If you're going to school, complete enrollment paperwork and apply for financial aid. The job market moves fast, and school deadlines are strict.",
        resources: [
          { label: "Veteran job search", url: "https://www.hireheroesusa.org" },
          { label: "FAFSA for financial aid", url: "https://studentaid.gov/h/apply-for-aid/fafsa" }
        ]
      },
      {
        id: "final-medical-exams",
        title: "Schedule Final Medical Exams",
        description: "Get a complete medical exam before you separate. Document any injuries or health issues in your military medical records now. This makes it easier to file VA disability claims later. If you have ongoing care, ask for referrals to VA or civilian providers.",
        resources: [
          { label: "Separation health assessment", url: "https://www.health.mil/Military-Health-Topics/Health-Readiness/IDES" },
          { label: "What to document for disability claims", url: "https://www.va.gov/disability/how-to-file-claim" }
        ]
      },
      {
        id: "housing-move",
        title: "Notify Housing Office and Plan Move",
        description: "If you live in military housing, notify your housing office of your move-out date. Start planning your move: hire movers, pack, and arrange travel. If the military is paying for your move, understand the rules and deadlines.",
        resources: [
          { label: "Military moving benefits", url: "https://www.move.mil" },
          { label: "Plan your move checklist", url: "https://www.militaryonesource.mil/moving-pcs" }
        ]
      },
      {
        id: "find-vso",
        title: "Research Veteran Service Organizations",
        description: "Find a local Veteran Service Organization (VSO) in your area. VSOs help with benefits, claims, job search, and community. Groups like VFW, American Legion, DAV, and Team Rubicon offer free help and support. Connect now so you have support after you separate.",
        resources: [
          { label: "Find accredited VSO representatives", url: "https://www.va.gov/ogc/apps/accreditation/index.asp" },
          { label: "List of veteran organizations", url: "https://www.va.gov/vso" }
        ]
      }
    ]
  },
  {
    slug: "30-days",
    name: "30 Days Before Separation",
    timeframe: "1 month out",
    description: "Final checks and last-minute tasks. Make sure everything is in order before your separation date. You're almost there.",
    items: [
      {
        id: "verify-dd214",
        title: "Verify DD-214 Is Correct",
        description: "This is your last chance to fix errors on your DD-214 before you separate. Check your name, Social Security number, discharge status, dates of service, and awards. If anything is wrong, get it corrected now. After you separate, corrections take much longer.",
        resources: [
          { label: "Review DD-214 checklist", url: "https://www.dd214.us/reference/ComponentCodes.pdf" },
          { label: "Request corrections", url: "https://www.va.gov/records" }
        ]
      },
      {
        id: "final-medical-copies",
        title: "Get Final Copies of All Medical Records",
        description: "Get the final, complete version of your medical records. Make sure all recent appointments and exams are included. Keep both paper and digital copies in a safe place. You'll need these for the VA, civilian doctors, and any future disability claims.",
        resources: [
          { label: "Download records from TRICARE", url: "https://www.tricare.mil/requestmedicalrecords" },
          { label: "Access records on My HealtheVet", url: "https://www.myhealth.va.gov" }
        ]
      },
      {
        id: "mail-forwarding",
        title: "Set Up Mail Forwarding",
        description: "Set up mail forwarding with USPS from your current address to your new address. This makes sure you don't miss important documents, checks, or benefits information. Also update your address with VA, banks, and any other important accounts.",
        resources: [
          { label: "USPS mail forwarding", url: "https://www.usps.com/manage/forward.htm" },
          { label: "Update address with VA", url: "https://www.va.gov/change-address" }
        ]
      },
      {
        id: "sgli-to-vgli",
        title: "Convert SGLI to VGLI Life Insurance",
        description: "Your military life insurance (SGLI) ends when you separate. You can convert it to Veterans' Group Life Insurance (VGLI) without a medical exam. You must apply within 1 year and 120 days, but it's easier to do it now. Coverage can be expensive, so compare it to civilian life insurance.",
        resources: [
          { label: "Apply for VGLI", url: "https://www.va.gov/life-insurance/options-eligibility/vgli" },
          { label: "VGLI calculator", url: "https://www.benefits.va.gov/insurance/vgli_rates_new.asp" }
        ]
      },
      {
        id: "confirm-va-enrollment",
        title: "Confirm VA Healthcare Enrollment Status",
        description: "Call or visit your local VA medical center to confirm your enrollment is complete and active. Schedule your first appointment if you can. Ask about mental health services, prescriptions, and any ongoing care you need. Don't assume it's done—verify it.",
        resources: [
          { label: "Check enrollment status", url: "https://www.va.gov/health-care/eligibility" },
          { label: "Find your VA facility", url: "https://www.va.gov/find-locations" }
        ]
      },
      {
        id: "voter-registration",
        title: "Register to Vote at New Address",
        description: "Update your voter registration with your new civilian address. You can register online in most states. Make sure you're registered so you can vote in local, state, and federal elections.",
        resources: [
          { label: "Register to vote", url: "https://vote.gov" },
          { label: "Check registration status", url: "https://www.nass.org/can-I-vote" }
        ]
      },
      {
        id: "connect-vso",
        title: "Connect With Local VSO for Ongoing Support",
        description: "Attend a local VSO meeting or contact a representative before you separate. Introduce yourself and let them know you're transitioning. They can help you navigate benefits, find jobs, and connect with other veterans in your area. You don't have to do this alone.",
        resources: [
          { label: "Find local VSO", url: "https://www.va.gov/vso" },
          { label: "Accredited representatives", url: "https://www.va.gov/ogc/apps/accreditation/index.asp" }
        ]
      }
    ]
  }
];
