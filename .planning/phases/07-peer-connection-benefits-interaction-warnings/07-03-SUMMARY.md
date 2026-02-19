---
phase: 07-peer-connection-benefits-interaction-warnings
plan: 03
subsystem: eligibility
tags: [benefit-interactions, json-rules-engine, tdd, warnings, screening-results]
dependency_graph:
  requires:
    - 03-03: evaluateEligibility() and ProgramMatch types
    - 03-04: screening results page and actions
  provides:
    - detectBenefitInteractions() for post-eligibility conflict detection
    - InteractionWarningBanner component for results page
  affects:
    - screening results page (new warning section)
tech_stack:
  added: []
  patterns:
    - json-rules-engine v7 contains operator on array facts
    - TDD RED/GREEN/REFACTOR cycle
    - Server Component async interaction computation
key_files:
  created:
    - src/lib/eligibility/interaction-types.ts
    - src/lib/eligibility/interaction-rules.ts
    - src/lib/eligibility/interaction-detector.ts
    - src/lib/eligibility/__tests__/interaction-detector.test.ts
    - src/components/screening/interaction-warning.tsx
  modified:
    - src/app/screening/results/[sessionId]/page.tsx
decisions:
  - Re-computation approach for interactions (no new DB migration)
  - matchedProgramIds array fact with contains operator (same pattern as areasOfNeed)
  - Server-side interaction detection on results page load
metrics:
  duration: 3 min
  completed_date: 2026-02-18
  tasks: 2
  files: 6
---

# Phase 7 Plan 3: Benefit Interaction Detection + Warnings Summary

## One-liner

Benefit interaction detection using json-rules-engine with 5 conflict rules, unit-tested with TDD, rendered as amber/red warning banners on the screening results page.

## What Was Built

### Task 1: Types, Rules, and Detection Engine (TDD)

**RED phase:** Created 238-line test file with 11 tests covering all 5 interaction types, required-field validation, severity ordering, and edge cases. Tests failed immediately (module not found).

**GREEN phase:** Implemented three files:

- `src/lib/eligibility/interaction-types.ts` — `BenefitInteraction`, `InteractionSeverity`, and `InteractionRule` types
- `src/lib/eligibility/interaction-rules.ts` — `BENEFIT_INTERACTION_RULES` array with 5 rules:
  1. SSI + SNAP Income Interaction (medium severity) — income range 15k-40k
  2. SSI + Medicaid Eligibility Cliff (high severity) — automatic Medicaid linkage in KY
  3. VA Disability Compensation + SSI Offset (medium severity) — dollar-for-dollar reduction
  4. VA Pension + SSI Interaction (medium severity) — combined exceeds SSI benefit rate
  5. SNAP + Medicaid Income Cliff (low severity) — different FPL thresholds
- `src/lib/eligibility/interaction-detector.ts` — `detectBenefitInteractions(matches, answers)`:
  - Uses json-rules-engine v7 with `allowUndefinedFacts: true`
  - Builds `matchedProgramIds` array fact from ProgramMatch list
  - Uses `contains` operator (same pattern as areasOfNeed in eligibility engine)
  - Returns interactions sorted by severity (high → medium → low)

All 11 tests pass after GREEN phase.

### Task 2: Warning UI and Results Page Integration

**`src/components/screening/interaction-warning.tsx`:**
- `InteractionWarningCard` — renders single warning with:
  - Red border + icon for high severity; amber for medium/low
  - Plain-language description in muted text
  - Highlighted recommendation box with severity-appropriate background
  - Program name badges (human-readable: SSI, SNAP, Medicaid, etc.)
  - "Learn more" link with external icon when `learnMoreUrl` exists
- `InteractionWarningBanner` — wraps multiple cards:
  - Returns `null` when interactions array is empty
  - `role="alert"` and `aria-label` for accessibility
  - Amber border/background container
  - DCBS phone number footer note

**Results page update (`src/app/screening/results/[sessionId]/page.tsx`):**
- Imports `detectBenefitInteractions` and `InteractionWarningBanner`
- Converts `ScreeningResult[]` to `ProgramMatch[]` for detection
- Calls `detectBenefitInteractions(programMatches, answers)` server-side
- Renders `InteractionWarningBanner` between program results sections and "Organizations Near You"
- Uses re-computation approach — no new DB migration required

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Re-computation approach (no new DB column) | interactions are fast in-memory; avoids migration for MVP |
| `matchedProgramIds` array fact + `contains` operator | Same pattern already proven with `areasOfNeed` in eligibility engine |
| Server Component async computation | Results page is already a Server Component; no client-side state needed |
| Warnings placed between results and local orgs | Veterans see eligible programs first, then warnings to inform apply decisions |

## Verification

- `npx vitest run src/lib/eligibility/__tests__/interaction-detector.test.ts` — 11/11 pass
- `npx vitest run` — 36/36 total tests pass
- `npm run build` — passes with no errors
- All 5 interaction rules defined with all required BenefitInteraction fields
- InteractionWarningBanner returns null when interactions array is empty
- Warning section has `role="alert"` and `aria-label` on container

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

### Files exist
- FOUND: src/lib/eligibility/interaction-types.ts
- FOUND: src/lib/eligibility/interaction-rules.ts
- FOUND: src/lib/eligibility/interaction-detector.ts
- FOUND: src/lib/eligibility/__tests__/interaction-detector.test.ts
- FOUND: src/components/screening/interaction-warning.tsx
- FOUND: src/app/screening/results/[sessionId]/page.tsx (modified)

### Commits exist
- FOUND: e3b78fe (test RED phase)
- FOUND: 1bc0d65 (feat GREEN phase)
- FOUND: e82e23f (feat UI + results integration)
