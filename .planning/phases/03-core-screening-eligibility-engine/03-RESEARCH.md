# Phase 3: Core Screening + Eligibility Engine - Research

**Researched:** 2026-02-16
**Domain:** Multi-step screening forms, eligibility rules engines, PDF generation
**Confidence:** MEDIUM-HIGH

## Summary

Phase 3 requires building a guest-accessible multi-step screening questionnaire with conditional logic, session persistence, eligibility evaluation, and PDF export. The modern stack for this combines Next.js 16 Server Actions with React 19's progressive enhancement features, Zustand for client-side state persistence, Zod for per-step validation, json-rules-engine for JSON-based eligibility rules, and @react-pdf/renderer for PDF generation.

The architecture follows a client-side state management pattern where Zustand's persist middleware handles localStorage-based session persistence, allowing users to resume screening after browser close. Server Actions handle final submission and eligibility evaluation using a JSON rules engine that evaluates answers against program criteria stored in the database. The rules-as-data approach means adding new programs or modifying eligibility criteria requires only database updates, not code changes.

Critical considerations include: (1) Supabase RLS policies must check the `is_anonymous` JWT claim to distinguish guest users from authenticated users, (2) Per-step Zod validation prevents users from advancing until current step is valid, (3) Conditional field visibility uses React state derived from form values to show/hide questions, (4) Readability scoring with text-readability package ensures content meets 6th-8th grade reading level, and (5) Confidence scoring algorithm ranks programs based on how many eligibility criteria are met versus total criteria.

**Primary recommendation:** Use Zustand + React Hook Form + Zod for multi-step form state, json-rules-engine (v6.5.0) for eligibility evaluation, @react-pdf/renderer (v4.1.0+) for PDF generation, and text-readability for plain language validation. Structure screening as client components with server actions for submission, storing rules as JSON in database with program_id foreign keys.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.11 (installed) | Client state management across steps | 40% adoption in 2026, lightweight (3kb), persist middleware for localStorage |
| zod | 4.3.6 (installed) | Per-step schema validation | De facto TypeScript validation, seamless React Hook Form integration |
| @react-pdf/renderer | ^4.1.0+ | PDF generation | 15.9k stars, 860k weekly downloads, React 19 compatible since v4.1.0 |
| json-rules-engine | ^6.5.0 | Eligibility rules evaluation | 3k stars, 1.4k dependents, JSON-based rules allow business logic changes without code |
| text-readability | latest | Flesch-Kincaid readability scoring | Standard npm package for plain language compliance testing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/json-rules-engine | latest | TypeScript definitions | For type-safe rule definitions |
| nuqs | 2.8.8 (installed) | URL state management for step tracking | Optional - keep step number in URL for shareable progress |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| json-rules-engine | Custom if/else logic | Rules engine allows non-developers to update rules, avoids code changes for policy updates |
| @react-pdf/renderer | jsPDF | jsPDF is lower-level, @react-pdf/renderer uses React components (familiar API) |
| Zustand persist | Cookies only | localStorage has 5MB limit vs 4KB cookies, but cookies work server-side |
| text-readability | Manual Flesch-Kincaid | Manual calculation error-prone, text-readability provides multiple readability formulas |

**Installation:**
```bash
npm install zustand @react-pdf/renderer json-rules-engine text-readability
npm install --save-dev @types/json-rules-engine
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── screening/
│       ├── page.tsx                    # Landing page
│       ├── intake/
│       │   ├── layout.tsx              # Multi-step layout with step indicator
│       │   ├── step-1/page.tsx         # Role selection
│       │   ├── step-2/page.tsx         # Demographics + conditional logic
│       │   ├── step-3/page.tsx         # Benefits + needs
│       │   └── review/page.tsx         # Review answers before submit
│       └── results/
│           └── [sessionId]/page.tsx    # Results with ranked programs
├── components/
│   └── screening/
│       ├── StepIndicator.tsx           # Progress UI
│       ├── QuestionCard.tsx            # Reusable question component
│       └── ConditionalField.tsx        # Show/hide based on answers
├── lib/
│   ├── screening/
│   │   ├── store.ts                    # Zustand store with persist
│   │   ├── schemas.ts                  # Zod schemas per step
│   │   └── conditional-logic.ts        # Visibility rules for fields
│   ├── eligibility/
│   │   ├── engine.ts                   # json-rules-engine wrapper
│   │   ├── rules-loader.ts             # Load rules from database
│   │   └── confidence-scorer.ts        # Rank programs by confidence
│   ├── pdf/
│   │   └── screening-results.tsx       # @react-pdf/renderer components
│   └── readability/
│       └── validator.ts                # text-readability wrapper
└── content/
    └── screening-questions.ts          # Question definitions
```

### Pattern 1: Multi-Step Form with Zustand + Zod
**What:** Client-side state management with localStorage persistence, per-step Zod validation, and React Hook Form integration.

**When to use:** Multi-step forms where users need to resume progress after closing browser.

**Example:**
```typescript
// lib/screening/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ScreeningState {
  sessionId: string | null
  currentStep: number
  answers: Record<string, any>
  role: 'veteran' | 'caregiver' | null
  setAnswer: (key: string, value: any) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

export const useScreeningStore = create<ScreeningState>()(
  persist(
    (set) => ({
      sessionId: null,
      currentStep: 1,
      answers: {},
      role: null,
      setAnswer: (key, value) =>
        set((state) => ({
          answers: { ...state.answers, [key]: value }
        })),
      nextStep: () =>
        set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () =>
        set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
      reset: () =>
        set({ currentStep: 1, answers: {}, role: null })
    }),
    {
      name: 'screening-session', // localStorage key
      partialize: (state) => ({
        sessionId: state.sessionId,
        currentStep: state.currentStep,
        answers: state.answers,
        role: state.role
      })
    }
  )
)
```

```typescript
// lib/screening/schemas.ts
import { z } from 'zod'

export const step1Schema = z.object({
  role: z.enum(['veteran', 'caregiver'], {
    required_error: 'Please select your role'
  })
})

export const step2Schema = z.object({
  age: z.number().min(18, 'Must be 18 or older'),
  location: z.string().min(1, 'Location is required'),
  isCaregiver: z.boolean().optional(),
  caregiverRelationship: z.string().optional()
}).refine(
  (data) => {
    // If caregiver selected, relationship is required
    if (data.role === 'caregiver' && !data.caregiverRelationship) {
      return false
    }
    return true
  },
  {
    message: 'Please specify your relationship to the veteran',
    path: ['caregiverRelationship']
  }
)

export const stepSchemas = [step1Schema, step2Schema, /* ... */]
```

```typescript
// app/screening/intake/step-1/page.tsx
'use client'

import { useScreeningStore } from '@/lib/screening/store'
import { step1Schema } from '@/lib/screening/schemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

export default function Step1Page() {
  const router = useRouter()
  const { setAnswer, nextStep } = useScreeningStore()

  const form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: useScreeningStore((state) => state.answers)
  })

  const onSubmit = (data: any) => {
    Object.entries(data).forEach(([key, value]) => setAnswer(key, value))
    nextStep()
    router.push('/screening/intake/step-2')
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### Pattern 2: Conditional Field Visibility
**What:** Show/hide form fields based on previous answers using derived state.

**When to use:** Screening questions where follow-up questions depend on initial answers (e.g., "Are you a caregiver?" → show caregiver-specific questions).

**Example:**
```typescript
// lib/screening/conditional-logic.ts
export const shouldShowField = (
  fieldId: string,
  answers: Record<string, any>
): boolean => {
  const rules: Record<string, (answers: Record<string, any>) => boolean> = {
    caregiverRelationship: (a) => a.role === 'caregiver',
    caregiverHoursPerWeek: (a) => a.role === 'caregiver',
    veteranDisabilityRating: (a) => a.hasVADisability === true,
    medicaidInterest: (a) => a.location === 'Kentucky',
    // Add more rules as needed
  }

  return rules[fieldId] ? rules[fieldId](answers) : true
}
```

```typescript
// components/screening/ConditionalField.tsx
'use client'

import { useScreeningStore } from '@/lib/screening/store'
import { shouldShowField } from '@/lib/screening/conditional-logic'
import { ReactNode } from 'react'

interface ConditionalFieldProps {
  fieldId: string
  children: ReactNode
}

export function ConditionalField({ fieldId, children }: ConditionalFieldProps) {
  const answers = useScreeningStore((state) => state.answers)
  const isVisible = shouldShowField(fieldId, answers)

  if (!isVisible) return null

  return <>{children}</>
}
```

### Pattern 3: JSON Rules Engine for Eligibility
**What:** Store eligibility rules as JSON documents in database, evaluate with json-rules-engine, return confidence scores.

**When to use:** When eligibility criteria change frequently, need to support multiple jurisdictions, or want non-developers to manage rules.

**Example:**
```typescript
// lib/eligibility/engine.ts
import { Engine } from 'json-rules-engine'

export interface EligibilityRule {
  programId: string
  conditions: {
    all?: Array<{ fact: string; operator: string; value: any }>
    any?: Array<{ fact: string; operator: string; value: any }>
  }
  event: {
    type: 'eligible' | 'possibly-eligible' | 'not-eligible'
    params: {
      confidence: 'high' | 'medium' | 'low'
      requiredDocs?: string[]
      nextSteps?: string[]
    }
  }
}

export async function evaluateEligibility(
  answers: Record<string, any>,
  rules: EligibilityRule[]
) {
  const engine = new Engine()

  // Add all rules to engine
  rules.forEach((rule) => engine.addRule(rule))

  // Run engine with user answers as facts
  const { events } = await engine.run(answers)

  // Return matched programs with confidence
  return events.map((event) => ({
    programId: event.params.programId,
    confidence: event.params.confidence,
    requiredDocs: event.params.requiredDocs || [],
    nextSteps: event.params.nextSteps || []
  }))
}
```

```typescript
// Example rule stored in database as JSONB
const vaDisabilityRule: EligibilityRule = {
  programId: 'va-disability-compensation',
  conditions: {
    all: [
      { fact: 'isVeteran', operator: 'equal', value: true },
      { fact: 'hasServiceConnectedCondition', operator: 'equal', value: true }
    ]
  },
  event: {
    type: 'eligible',
    params: {
      confidence: 'high',
      requiredDocs: ['DD-214', 'Medical-Records'],
      nextSteps: ['File VA Form 21-526EZ']
    }
  }
}
```

### Pattern 4: Server Action for Screening Submission
**What:** Use Next.js Server Actions to submit screening, evaluate eligibility, save to database, and return session ID.

**When to use:** Final step of screening questionnaire when all answers collected.

**Example:**
```typescript
// app/screening/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { evaluateEligibility } from '@/lib/eligibility/engine'
import { loadRulesFromDatabase } from '@/lib/eligibility/rules-loader'
import { z } from 'zod'

const screeningSchema = z.object({
  role: z.enum(['veteran', 'caregiver']),
  answers: z.record(z.any())
})

export async function submitScreening(formData: FormData) {
  const supabase = await createClient()

  // Extract and validate data
  const rawData = Object.fromEntries(formData)
  const validated = screeningSchema.safeParse(rawData)

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors }
  }

  const { role, answers } = validated.data

  // Load eligibility rules for Kentucky (jurisdiction filtering)
  const rules = await loadRulesFromDatabase('kentucky')

  // Evaluate eligibility
  const matches = await evaluateEligibility(answers, rules)

  // Save screening session
  const { data: session, error } = await supabase
    .from('screening_sessions')
    .insert({
      answers,
      status: 'completed',
      // user_id is NULL for guest sessions (anonymous)
    })
    .select('id')
    .single()

  if (error) return { error: 'Failed to save screening' }

  // Save eligibility matches
  await supabase.from('screening_results').insert(
    matches.map((m) => ({
      session_id: session.id,
      program_id: m.programId,
      confidence: m.confidence,
      required_docs: m.requiredDocs,
      next_steps: m.nextSteps
    }))
  )

  return { sessionId: session.id, matches }
}
```

### Pattern 5: PDF Export with @react-pdf/renderer
**What:** Generate PDF using React components that render server-side or client-side, downloadable via blob URL.

**When to use:** When users need printable screening results.

**Example:**
```typescript
// lib/pdf/screening-results.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { fontSize: 20, marginBottom: 20 },
  programCard: { marginBottom: 15, padding: 10, border: '1pt solid #ccc' },
  programName: { fontSize: 14, fontWeight: 'bold' },
  confidence: { fontSize: 12, color: '#666', marginTop: 5 }
})

interface ScreeningResultsPDFProps {
  sessionId: string
  role: string
  matches: Array<{
    programName: string
    confidence: string
    requiredDocs: string[]
    nextSteps: string[]
  }>
}

export function ScreeningResultsPDF({
  sessionId,
  role,
  matches
}: ScreeningResultsPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>Your Screening Results</Text>
          <Text style={{ fontSize: 10 }}>Session ID: {sessionId}</Text>
        </View>

        {matches.map((match, i) => (
          <View key={i} style={styles.programCard}>
            <Text style={styles.programName}>{match.programName}</Text>
            <Text style={styles.confidence}>
              Confidence: {match.confidence}
            </Text>
            <Text style={{ fontSize: 10, marginTop: 5 }}>
              Required Documents:
            </Text>
            {match.requiredDocs.map((doc, j) => (
              <Text key={j} style={{ fontSize: 9, marginLeft: 10 }}>
                • {doc}
              </Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  )
}
```

```typescript
// app/screening/results/[sessionId]/page.tsx
'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { ScreeningResultsPDF } from '@/lib/pdf/screening-results'

export default function ResultsPage({ params, searchParams }) {
  const { sessionId } = params
  const results = // ... fetch from server

  return (
    <div>
      {/* Display results in HTML */}

      <PDFDownloadLink
        document={
          <ScreeningResultsPDF
            sessionId={sessionId}
            role={results.role}
            matches={results.matches}
          />
        }
        fileName={`screening-results-${sessionId}.pdf`}
      >
        {({ loading }) =>
          loading ? 'Generating PDF...' : 'Download Results (PDF)'
        }
      </PDFDownloadLink>
    </div>
  )
}
```

### Pattern 6: Readability Validation
**What:** Test screening content against target reading level (6th-8th grade) using Flesch-Kincaid Grade Level.

**When to use:** During content authoring or as automated test to ensure plain language compliance.

**Example:**
```typescript
// lib/readability/validator.ts
import {
  fleschKincaidGrade,
  fleschReadingEase,
  textStandard
} from 'text-readability'

export interface ReadabilityScore {
  gradeLevel: number
  readingEase: number
  targetMet: boolean
  recommendation: string
}

export function validateReadability(text: string): ReadabilityScore {
  const gradeLevel = fleschKincaidGrade(text)
  const readingEase = fleschReadingEase(text)

  // Target: 6th-8th grade (6.0-8.0)
  const targetMet = gradeLevel >= 6.0 && gradeLevel <= 8.0

  let recommendation = ''
  if (gradeLevel < 6.0) {
    recommendation = 'Text may be too simple. Consider adding detail.'
  } else if (gradeLevel > 8.0) {
    recommendation = 'Text is too complex. Simplify sentences and use shorter words.'
  } else {
    recommendation = 'Reading level is appropriate.'
  }

  return {
    gradeLevel: Math.round(gradeLevel * 10) / 10,
    readingEase: Math.round(readingEase),
    targetMet,
    recommendation
  }
}

// Usage in tests or CLI tool
const questionText = `Are you currently receiving VA disability compensation
for a service-connected condition?`

const score = validateReadability(questionText)
console.log(`Grade Level: ${score.gradeLevel}`) // Should be 6.0-8.0
console.log(`Meets target: ${score.targetMet}`)
```

### Anti-Patterns to Avoid
- **Hardcoding eligibility rules in code:** Use json-rules-engine with database-stored rules so policy updates don't require deployments.
- **Not persisting step progress:** Users expect to resume where they left off. Always use Zustand persist or cookies.
- **Validating all steps on submit:** Validate per-step as user advances to provide immediate feedback.
- **Complex nested conditional logic in components:** Extract to conditional-logic.ts file for testability and maintainability.
- **Generating PDFs synchronously in route handlers:** Use @react-pdf/renderer client-side with blob URLs to avoid blocking requests.
- **Assuming anonymous users can't access database:** Supabase anonymous auth provides JWT with `is_anonymous: true` claim - use in RLS policies.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rules engine from scratch | Custom if/else trees for each program | json-rules-engine | Handles boolean logic nesting, operator precedence, async facts, and allows non-technical updates |
| PDF generation | Canvas API + manual layout | @react-pdf/renderer | Cross-browser compatibility, font handling, page breaks, multi-page layouts are extremely complex |
| Readability scoring | Manual syllable counting + Flesch formula | text-readability package | Syllable detection is error-prone, package includes multiple readability formulas |
| Form state persistence | Custom localStorage wrapper | Zustand persist middleware | Handles serialization, hydration timing, SSR compatibility automatically |
| Session cookies | Manual cookie parsing/setting | Next.js cookies() function | Secure flags, SameSite, HttpOnly handled correctly, async-first API |
| Conditional form validation | Manual validation logic | Zod .refine() and .superRefine() | Type-safe, composable, handles cross-field validation and async validation |

**Key insight:** Eligibility rules engines are deceptively complex. Simple if/else logic becomes unmaintainable as programs grow. The 18F eligibility-rules-service research found that hardcoded rules create "opportunities for implementation errors and significant duplicated effort" across jurisdictions. JSON-based rules allow business analysts to update criteria without developer involvement, reducing deployment risk and iteration time.

## Common Pitfalls

### Pitfall 1: RLS Policies Block Anonymous Guest Sessions
**What goes wrong:** Default Supabase RLS policies check `auth.uid() = user_id`, but anonymous sessions have `user_id IS NULL`, causing permission denied errors.

**Why it happens:** Anonymous users in Supabase use the `authenticated` role (not `anon` key), but their JWT has `is_anonymous: true` claim. Policies must explicitly allow NULL user_id or check is_anonymous claim.

**How to avoid:**
```sql
-- Allow anonymous users to create screening sessions
CREATE POLICY "Anonymous users can create sessions"
  ON screening_sessions FOR INSERT
  WITH CHECK (user_id IS NULL);

-- Allow anonymous users to read their session by ID (passed via URL)
-- This relies on session ID being unguessable (UUID)
CREATE POLICY "Anyone can read sessions by ID"
  ON screening_sessions FOR SELECT
  USING (true); -- Session ID secrecy provides access control

-- Better: Check is_anonymous claim
CREATE POLICY "Anonymous users can access own sessions"
  ON screening_sessions FOR SELECT
  USING (
    (auth.uid() = user_id) OR
    (user_id IS NULL AND (auth.jwt() ->> 'is_anonymous')::boolean = true)
  );
```

**Warning signs:** "permission denied for table screening_sessions" errors when guest users submit screening, even though policy exists.

**Source:** [Supabase Anonymous Sign-Ins Documentation](https://supabase.com/docs/guides/auth/auth-anonymous), [Supabase RLS Guide 2026](https://designrevision.com/blog/supabase-row-level-security)

### Pitfall 2: Conditional Logic Creates Orphaned Form State
**What goes wrong:** User selects "Yes" to "Are you a caregiver?" → fills caregiver-specific fields → changes answer to "No" → conditional fields hide but values remain in state → form submits with invalid/confusing data.

**Why it happens:** Hiding fields doesn't clear their values. When user changes conditional trigger answer, dependent field values persist in form state.

**How to avoid:**
```typescript
// In Zustand store or form component
const setAnswer = (key: string, value: any) => {
  set((state) => {
    const newAnswers = { ...state.answers, [key]: value }

    // When role changes, clear role-specific answers
    if (key === 'role') {
      // Clear caregiver-specific fields
      delete newAnswers.caregiverRelationship
      delete newAnswers.caregiverHoursPerWeek
      delete newAnswers.respiteCareNeeded
    }

    return { answers: newAnswers }
  })
}
```

Or use React Hook Form's `watch` and `setValue`:
```typescript
const role = watch('role')

useEffect(() => {
  if (role !== 'caregiver') {
    setValue('caregiverRelationship', undefined)
    setValue('caregiverHoursPerWeek', undefined)
  }
}, [role, setValue])
```

**Warning signs:** Backend receives unexpected field combinations, validation errors on hidden fields, stale data in screening results.

### Pitfall 3: Multi-Step Validation Timing Issues
**What goes wrong:** User advances to Step 3 without completing Step 2, or validation runs on all steps when only current step should be validated.

**Why it happens:** React Hook Form validates entire schema by default. In multi-step forms, this validates fields that don't exist yet or aren't visible.

**How to avoid:**
```typescript
// Per-step schema approach
const stepSchemas = [step1Schema, step2Schema, step3Schema]

const form = useForm({
  resolver: zodResolver(stepSchemas[currentStep - 1]),
  mode: 'onBlur', // Validate on blur, not onChange (better UX)
  defaultValues: answers
})

// Or use criteriaMode for partial validation
const form = useForm({
  resolver: zodResolver(fullSchema),
  criteriaMode: 'all', // Get all errors, not just first
  context: { currentStep }, // Pass to schema for conditional rules
})

// In schema
const fullSchema = z.object({
  role: z.string(),
  age: z.number(),
  // ...
}).superRefine((data, ctx) => {
  const step = ctx.context?.currentStep || 1

  // Only validate fields for current step
  if (step === 1 && !data.role) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['role'],
      message: 'Role is required'
    })
  }
})
```

**Warning signs:** Validation errors appear for questions user hasn't seen yet, "Next" button disabled on Step 1 due to Step 3 validation failures.

### Pitfall 4: Rules Engine Performance with Large Rule Sets
**What goes wrong:** Evaluating 50+ programs with complex rules causes 2-3 second delays on results page, poor user experience.

**Why it happens:** json-rules-engine evaluates rules synchronously by default. With nested conditions and async facts (database lookups), this can block.

**How to avoid:**
- **Cache rules in memory:** Load rules once on server startup, not per request.
- **Filter rules by jurisdiction:** Only evaluate Kentucky programs for Kentucky residents.
- **Use rule priority:** json-rules-engine supports priority - run high-priority rules first, skip low-priority if time budget exceeded.
- **Parallel evaluation:** Split rules into chunks and evaluate in parallel.

```typescript
// Load and cache rules
let cachedRules: Map<string, EligibilityRule[]> | null = null

async function loadRulesFromDatabase(jurisdiction: string) {
  if (!cachedRules) {
    const { data } = await supabase
      .from('eligibility_rules')
      .select('*')

    // Group by jurisdiction
    cachedRules = new Map()
    data.forEach((rule) => {
      const rules = cachedRules.get(rule.jurisdiction) || []
      rules.push(rule)
      cachedRules.set(rule.jurisdiction, rules)
    })
  }

  return cachedRules.get(jurisdiction) || []
}

// Filter rules before evaluation
const relevantRules = allRules.filter((rule) => {
  // Only evaluate rules for user's role
  if (rule.requiredRole && rule.requiredRole !== answers.role) {
    return false
  }
  return true
})
```

**Warning signs:** Slow results page load, timeout errors, high CPU usage during eligibility evaluation.

**Source:** [json-rules-engine GitHub](https://github.com/CacheControl/json-rules-engine) - performance best practices

### Pitfall 5: Session Persistence Hydration Mismatch
**What goes wrong:** React hydration errors "Text content did not match" because server renders default state but client has persisted state from localStorage.

**Why it happens:** Zustand persist loads from localStorage on client mount, but server doesn't have access to localStorage. First render shows default state, second render shows persisted state, causing mismatch.

**How to avoid:**
```typescript
// Use hasHydrated pattern
export const useScreeningStore = create<ScreeningState>()(
  persist(
    (set) => ({
      // ... state
      hasHydrated: false,
      setHasHydrated: (state) => set({ hasHydrated: state })
    }),
    {
      name: 'screening-session',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)

// In component
const hasHydrated = useScreeningStore((s) => s.hasHydrated)

if (!hasHydrated) {
  return <LoadingSpinner /> // Avoid hydration mismatch
}

// Or use useEffect
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) {
  return null // Render nothing on server
}
```

**Warning signs:** Console errors about text content mismatch, duplicate form fields, flash of default state before persisted state loads.

**Source:** [Zustand persist middleware documentation](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)

### Pitfall 6: PDF Generation Blocks Server Rendering
**What goes wrong:** Route handler that generates PDF synchronously blocks for 1-2 seconds, times out under load, causes 502 errors.

**Why it happens:** @react-pdf/renderer's `renderToStream()` is CPU-intensive. Running in serverless functions (Vercel, Netlify) with limited execution time causes timeouts.

**How to avoid:**
```typescript
// Use client-side PDF generation with PDFDownloadLink
import { PDFDownloadLink } from '@react-pdf/renderer'

// This runs in browser, not server
<PDFDownloadLink
  document={<MyPDFDocument />}
  fileName="results.pdf"
>
  {({ loading }) => loading ? 'Loading...' : 'Download PDF'}
</PDFDownloadLink>

// Or if server-side is required, use streaming response
export async function GET(request: Request) {
  const stream = await renderToStream(<MyPDFDocument />)

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="results.pdf"'
    }
  })
}
```

**Warning signs:** 504 Gateway Timeout errors on PDF download, serverless function max execution time warnings.

**Source:** [React-PDF Documentation](https://react-pdf.org/), [Building PDF Generation Service with Next.js](https://03balogun.medium.com/building-a-pdf-generation-service-using-nextjs-and-react-pdf-78d5931a13c7)

### Pitfall 7: Eligibility Rules Don't Account for Policy Updates
**What goes wrong:** Income limits or program criteria change (e.g., SSI income limit increases from $943 to $965/month), but old rules remain in database. Users get incorrect eligibility results.

**Why it happens:** Rules are data, not code. No migration system or versioning for rule updates.

**How to avoid:**
- **Version rules:** Add `effective_date` and `expires_date` columns to `eligibility_rules` table.
- **Rule migration system:** Create script to update rules when policy changes, track in version control.
- **Audit trail:** Log which rule version was used for each screening session.

```sql
-- Add versioning to rules
ALTER TABLE eligibility_rules
ADD COLUMN effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN expires_date DATE,
ADD COLUMN version INT NOT NULL DEFAULT 1;

-- Query for current active rules
SELECT * FROM eligibility_rules
WHERE jurisdiction = 'kentucky'
  AND effective_date <= CURRENT_DATE
  AND (expires_date IS NULL OR expires_date > CURRENT_DATE);
```

```typescript
// Rules loader with versioning
async function loadActiveRules(jurisdiction: string, asOfDate?: Date) {
  const date = asOfDate || new Date()

  const { data } = await supabase
    .from('eligibility_rules')
    .select('*')
    .eq('jurisdiction', jurisdiction)
    .lte('effective_date', date.toISOString())
    .or(`expires_date.is.null,expires_date.gt.${date.toISOString()}`)

  return data
}
```

**Warning signs:** Users report incorrect eligibility after policy changes, no clear audit trail of which rules were applied to historical screenings.

**Source:** [18F Eligibility Rules Service Research](https://18f.gsa.gov/2018/10/16/exploring-a-new-way-to-make-eligibility-rules-easier-to-implement/) - discusses versioning and transparency challenges

## Code Examples

Verified patterns from official sources:

### Next.js 16 Server Action with Zod Validation
```typescript
// Source: https://nextjs.org/docs/app/guides/forms (verified 2026-02-11)
'use server'

import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  role: z.enum(['veteran', 'caregiver'])
})

export async function createScreening(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    role: formData.get('role')
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Mutate data
  const { email, role } = validatedFields.data
  // ... save to database

  return { success: true }
}
```

### React 19 useActionState for Form Errors
```typescript
// Source: https://nextjs.org/docs/app/guides/forms (verified 2026-02-11)
'use client'

import { useActionState } from 'react'
import { createScreening } from './actions'

const initialState = { message: '' }

export function ScreeningForm() {
  const [state, formAction, pending] = useActionState(
    createScreening,
    initialState
  )

  return (
    <form action={formAction}>
      <input type="email" name="email" required />
      <p aria-live="polite">{state?.message}</p>
      <button disabled={pending}>
        {pending ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

### json-rules-engine Basic Rule Structure
```javascript
// Source: https://github.com/CacheControl/json-rules-engine (v6.5.0)
{
  conditions: {
    all: [
      {
        fact: 'age',
        operator: 'greaterThanInclusive',
        value: 65
      },
      {
        fact: 'isVeteran',
        operator: 'equal',
        value: true
      }
    ]
  },
  event: {
    type: 'eligible',
    params: {
      programId: 'va-pension',
      confidence: 'high',
      message: 'Likely eligible for VA Pension'
    }
  }
}
```

### Flesch-Kincaid Grade Level Check
```typescript
// Source: https://www.npmjs.com/package/text-readability
import { fleschKincaidGrade } from 'text-readability'

const questionText = `Are you currently receiving disability compensation
from the Department of Veterans Affairs?`

const gradeLevel = fleschKincaidGrade(questionText)
// Returns: 7.2 (acceptable for 6th-8th grade target)

// Target: 6.0-8.0 for plain language
if (gradeLevel > 8.0) {
  console.warn(`Reading level too high: ${gradeLevel}`)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Hook Form only | Zustand + React Hook Form | 2024-2025 | Zustand handles cross-component state, RHF handles form validation. Separation of concerns. |
| Pages Router forms | App Router Server Actions | Next.js 13+ | Progressive enhancement, no client JS required, simpler mutation API |
| Custom rules evaluation | json-rules-engine | Stable since 2016, but adoption growing | Rules as data means non-developers can update logic, faster iteration |
| jsPDF manual layout | @react-pdf/renderer components | React 19 support added v4.1.0 (2025) | Component-based API familiar to React devs, handles complex layouts |
| Client-side cookies only | Server-side cookie management | Next.js 13+ (App Router) | Secure cookies with HttpOnly, SameSite flags. Better security. |
| Manual middleware | proxy.ts pattern | Next.js 16 (Feb 2026) | Clearer naming, Node.js runtime for session management |
| useFormState | useActionState | React 19 (Dec 2024) | Renamed for clarity, same functionality |

**Deprecated/outdated:**
- **middleware.ts:** Replaced by proxy.ts in Next.js 16 for request interception. middleware.ts still works but deprecated.
- **getServerSideProps:** Use Server Components and Server Actions instead in App Router.
- **Manual FormData parsing:** Use Object.fromEntries(formData) for multi-field forms.

## Open Questions

1. **How to handle screening session timeout/expiration?**
   - What we know: Zustand persist stores indefinitely in localStorage.
   - What's unclear: Should sessions expire after 30 days? 90 days? How to clean up?
   - Recommendation: Add `expiresAt` timestamp to screening session, check on page load, clear if expired. For database sessions, run periodic cleanup job for sessions older than 90 days with status 'abandoned'.

2. **Should we use React Hook Form or just native forms with Server Actions?**
   - What we know: React 19 Server Actions support progressive enhancement without client JS. React Hook Form adds client-side validation and better UX.
   - What's unclear: Does RHF add unnecessary complexity for simple screening forms?
   - Recommendation: Use native forms + Server Actions for single-page forms. Use Zustand + basic controlled inputs (not RHF) for multi-step to keep it simple. Add RHF only if complex validation patterns emerge.

3. **How to version rules when policies have retroactive vs. prospective application?**
   - What we know: Some policy changes apply retroactively (all active recipients affected), others only to new applicants.
   - What's unclear: How to model this in rules schema? Do we need separate "new applicant" vs "renewal" rule sets?
   - Recommendation: Start simple with single rule set and `effective_date`. If retroactive issues arise, add `applies_to` enum ('new'|'renewal'|'all') to rules.

4. **Should PDF generation be client-side or server-side?**
   - What we know: Client-side works in browser, avoids server timeout. Server-side required for email attachments, background jobs.
   - What's unclear: Does Phase 3 need server-side PDF generation?
   - Recommendation: Start with client-side PDFDownloadLink (simpler, no timeout risk). Add server-side generation in Phase 4 if referral emails need PDF attachments.

5. **How to handle confidence scoring when rules partially match?**
   - What we know: json-rules-engine returns binary match (rule fires or doesn't). No built-in partial matching.
   - What's unclear: If user meets 3 of 5 criteria, how to score as "possibly eligible"?
   - Recommendation: Create multiple rules per program with different confidence levels. Example: SSI has 5 criteria → create 3 rules: (all 5 met = high confidence), (4 met = medium), (3 met = low). Or calculate confidence score post-evaluation by counting matched criteria.

## Sources

### Primary (HIGH confidence)
- **Next.js Forms Guide:** https://nextjs.org/docs/app/guides/forms (verified 2026-02-11) - Server Actions, useActionState, Zod validation
- **React 19 Form Documentation:** https://react.dev/reference/react-dom/components/form - Progressive enhancement, Server Functions
- **json-rules-engine GitHub:** https://github.com/CacheControl/json-rules-engine - v6.5.0, rule structure, TypeScript support
- **@react-pdf/renderer:** https://react-pdf.org/ - Component API, Next.js integration, React 19 support
- **Supabase Anonymous Auth:** https://supabase.com/docs/guides/auth/auth-anonymous - is_anonymous JWT claim
- **Supabase RLS Guide:** https://supabase.com/docs/guides/database/postgres/row-level-security - Policy patterns
- **text-readability npm:** https://www.npmjs.com/package/text-readability - Flesch-Kincaid API

### Secondary (MEDIUM confidence)
- **Next.js 16 Release:** https://nextjs.org/blog/next-16 - proxy.ts migration, updateTag() API
- **React 19 Features:** https://react.dev/blog/2024/12/05/react-19 - useActionState, useOptimistic, async transitions
- **MakerKit Multi-Step Forms:** https://makerkit.dev/blog/tutorials/multi-step-forms-reactjs - Zustand + Zod pattern
- **Build with Matija Multi-Step Tutorial:** https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps - React Hook Form + Zustand + Zod
- **18F Eligibility Rules Service:** https://18f.gsa.gov/2018/10/16/exploring-a-new-way-to-make-eligibility-rules-easier-to-implement/ - Common pitfalls, versioning challenges
- **Supabase RLS Complete Guide 2026:** https://designrevision.com/blog/supabase-row-level-security - Anonymous user patterns
- **Next.js Cookie Management:** https://nextjs.org/docs/app/api-reference/functions/cookies - Async cookies API
- **State Management in 2026:** https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns - Zustand adoption stats

### Tertiary (LOW confidence - verify before using)
- **Confidence Scoring Systems 2026:** https://www.extend.ai/resources/best-confidence-scoring-systems-document-processing - Document processing patterns, may apply to eligibility scoring
- **NYC Benefits Platform Screening API:** https://screeningapidocs.cityofnewyork.us/eligibility-guidelines - Real-world eligibility API examples
- **Digital Government Hub Benefits Implementation:** https://digitalgovernmenthub.org/publications/implementing-benefits-eligibility-enrollment-systems-key-context/ - Policy challenges, vendor constraints

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM-HIGH - Zustand, Zod, @react-pdf/renderer verified with official docs and current npm stats. json-rules-engine has strong community but niche use case.
- Architecture: MEDIUM-HIGH - Multi-step form patterns verified across multiple sources (MakerKit, Build with Matija, official Next.js docs). Rules engine architecture based on 18F research and json-rules-engine docs.
- Pitfalls: MEDIUM - RLS anonymous user issue verified in Supabase docs. Hydration mismatch is known Zustand pattern. Other pitfalls based on common patterns but not project-specific testing.

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (30 days - React/Next.js ecosystem is stable, rules engine patterns are mature)

**Notes:**
- No CONTEXT.md exists for this phase, so all implementation decisions are at Claude's discretion.
- Stack already includes Zustand (5.0.11) and Zod (4.3.6), reducing new dependencies.
- Existing screening_sessions table supports guest mode (user_id nullable), but RLS policies need updates per Pitfall 1.
- Existing documentation-checklists.ts content maps well to "required documents" in eligibility results.
- Phase depends on Phase 2 resource directory being populated, but eligibility engine is independent of directory data.
