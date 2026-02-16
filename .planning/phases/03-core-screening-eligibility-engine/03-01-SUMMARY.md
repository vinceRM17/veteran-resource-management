---
phase: 03-core-screening-eligibility-engine
plan: 01
subsystem: database, screening, eligibility
tags: [supabase, zod, json-rules-engine, eligibility, screening, postgresql, typescript]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "screening_sessions table, Supabase client, RLS policies"
  - phase: 02-resource-directory-data-pipeline
    provides: "documentation-checklists.ts with 8 program IDs"
provides:
  - "eligibility_rules and screening_results database tables with RLS"
  - "TypeScript types: EligibilityRule, ScreeningResult, ScreeningSession, ProgramMatch"
  - "5-step screening question definitions with conditional visibility"
  - "Per-step Zod validation schemas with role-aware conditional validators"
  - "Conditional logic: shouldShowField() and clearDependentFields() pure functions"
  - "15 Kentucky eligibility rules in json-rules-engine format ready for seeding"
affects: [03-02 screening-form-ui, 03-03 eligibility-engine, 03-04 results-page]

# Tech tracking
tech-stack:
  added: [json-rules-engine]
  patterns: [per-step-zod-validation, role-aware-conditional-schemas, json-rules-engine-format, pure-function-conditional-logic]

key-files:
  created:
    - supabase/migrations/00004_screening_eligibility.sql
    - src/lib/db/screening-types.ts
    - src/content/screening-questions.ts
    - src/lib/screening/schemas.ts
    - src/lib/screening/conditional-logic.ts
    - scripts/seed-eligibility-rules.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Separate Zod schemas per conditional variant instead of using .extend() to avoid Zod 4 type inference issues"
  - "Pure functions for conditional logic (no React dependencies) to enable easy testing"
  - "15 rules across 8 programs with high/medium confidence tiers for nuanced matching"
  - "json-rules-engine v7.3.1 installed (has built-in TypeScript types, no @types package needed)"

patterns-established:
  - "Role-aware schema pattern: getStep2Schema(role) and getStep3Schema(role, hasDisability) return context-specific Zod schemas"
  - "Conditional logic pattern: shouldShowField() for visibility, clearDependentFields() for orphan cleanup"
  - "Seed script pattern: idempotent scripts that delete-then-insert for safe re-runs"

# Metrics
duration: 6min
completed: 2026-02-16
---

# Phase 3 Plan 1: Eligibility Schema & Screening Data Summary

**Eligibility database schema with 2 new tables, TypeScript types for screening/eligibility, 5-step screening questions at 6th-grade reading level, per-step Zod schemas with conditional validation, and 15 Kentucky eligibility rules in json-rules-engine format**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-16T06:05:47Z
- **Completed:** 2026-02-16T06:12:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created migration 00004 with eligibility_rules table (versioned, jurisdiction-aware) and screening_results table (session-scoped) with RLS policies and indexes
- Defined 5-step screening flow: Role Selection, Location & Demographics, Needs Assessment, Benefits & Priorities, Review
- Built per-step Zod validation with role-aware conditional schemas (veteran vs caregiver paths)
- Created pure-function conditional logic for field visibility and orphaned value cleanup
- Seeded 15 eligibility rules for 8 Kentucky programs (VA disability, VA healthcare, Medicaid, SNAP, SSI, SSDI, HCB waiver, VA pension) with high/medium confidence tiers

## Task Commits

Each task was committed atomically:

1. **Task 1: Create eligibility database schema and TypeScript types** - `3ac37f8` (feat)
2. **Task 2: Create screening questions, Zod schemas, conditional logic, and seed data** - `7462d64` (feat)

## Files Created/Modified
- `supabase/migrations/00004_screening_eligibility.sql` - Migration with eligibility_rules and screening_results tables, RLS, indexes, triggers
- `src/lib/db/screening-types.ts` - TypeScript types: EligibilityRule, ScreeningResult, ScreeningSession, ProgramMatch, ScreeningAnswers, ConfidenceLevel
- `src/content/screening-questions.ts` - 5-step screening question definitions with conditional visibility rules, plain language content
- `src/lib/screening/schemas.ts` - Per-step Zod schemas with getStep2Schema() and getStep3Schema() for conditional validation
- `src/lib/screening/conditional-logic.ts` - shouldShowField(), clearDependentFields(), shouldShowCaregiverSupport() pure functions
- `scripts/seed-eligibility-rules.ts` - Idempotent seed script for 15 Kentucky eligibility rules
- `package.json` - Added json-rules-engine dependency and seed:rules npm script

## Decisions Made
- **Separate Zod schemas per variant:** Zod 4's `.extend()` caused type inference issues when overriding optional with required fields. Created distinct schema objects (step3VeteranSchema, step3VeteranWithDisabilitySchema) instead of runtime mutation.
- **Built-in types preferred:** json-rules-engine v7.3.1 includes TypeScript types natively; no @types package needed.
- **15 rules with dual confidence tiers:** Each program has a "high" confidence rule (strong match) and "medium" confidence rule (possible match). This avoids binary yes/no matching and provides nuanced recommendations.
- **Pure conditional logic functions:** shouldShowField() and clearDependentFields() have zero React dependencies, making them testable without component rendering.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod 4 type inference with .extend()**
- **Found during:** Task 2 (Zod schema creation)
- **Issue:** Using `.extend()` to override optional fields with required fields caused TypeScript errors in Zod 4 because the resulting type was incompatible with the base type
- **Fix:** Created separate complete schema objects for each conditional variant instead of dynamically extending the base schema
- **Files modified:** src/lib/screening/schemas.ts
- **Verification:** npm run build passes, runtime schema validation works correctly
- **Committed in:** 7462d64

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minimal -- different code structure to achieve same validation behavior. No scope creep.

## Issues Encountered
None beyond the Zod 4 type inference issue documented above.

## User Setup Required

**Migration must be applied manually** before the seed script can run:
1. Copy the contents of `supabase/migrations/00004_screening_eligibility.sql`
2. Open Supabase Dashboard -> SQL Editor
3. Paste and execute the migration
4. Then run `npm run seed:rules` to populate eligibility rules

## Next Phase Readiness
- Database schema ready for eligibility rules and screening results
- TypeScript types ready for import across the application
- Screening questions ready for form UI rendering (Plan 03-02)
- Zod schemas ready for form validation integration
- Conditional logic ready for ConditionalField component
- Seed script ready to populate rules after migration is applied
- json-rules-engine installed and ready for eligibility engine (Plan 03-03)

## Self-Check: PASSED

All 7 created files verified present. Both task commits (3ac37f8, 7462d64) verified in git log.

---
*Phase: 03-core-screening-eligibility-engine*
*Completed: 2026-02-16*
