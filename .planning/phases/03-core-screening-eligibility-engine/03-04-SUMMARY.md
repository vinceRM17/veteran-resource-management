---
phase: 03-core-screening-eligibility-engine
plan: 04
subsystem: screening-wiring, results, pdf-export
tags: [server-action, results-page, react-pdf, rls-policies, readability]

# Dependency graph
requires:
  - phase: 03-01
    provides: "Eligibility database schema, screening types, screening questions"
  - phase: 03-02
    provides: "Zustand store, 5-step form UI, review page"
  - phase: 03-03
    provides: "evaluateEligibility(), loadActiveRules(), rankMatches(), deduplicateMatches(), enrichWithDocumentation()"
  - phase: 02-resource-directory-data-pipeline
    provides: "documentation-checklists.ts with 8 program checklists"
provides:
  - "submitScreening() server action orchestrating full eligibility pipeline"
  - "Results page displaying programs grouped by confidence with expandable docs"
  - "PDF download via @react-pdf/renderer with professional layout"
  - "RLS policy migration for guest screening access"
  - "Readability validation script (npm run check:readability)"
affects: [04-smart-crisis-detection, 05-user-accounts]

# Tech tracking
tech-stack:
  added: ["@react-pdf/renderer"]
  patterns: [server-action-orchestration, dynamic-pdf-import, guest-rls-policies, confidence-grouped-display]

key-files:
  created:
    - src/app/screening/actions.ts
    - src/app/screening/results/[sessionId]/page.tsx
    - src/app/screening/results/[sessionId]/pdf-download.tsx
    - src/lib/pdf/screening-results.tsx
    - supabase/migrations/00005_screening_rls_update.sql
    - scripts/check-readability.ts
  modified:
    - src/app/screening/intake/review/page.tsx
    - package.json

key-decisions:
  - "Server action with anon client for insert (RLS policies allow anonymous inserts)"
  - "Dynamic import for @react-pdf/renderer to avoid SSR issues"
  - "PDF generation using pdf().toBlob() instead of PDFDownloadLink for better control"
  - "Guest sessions readable when user_id IS NULL via RLS policy"
  - "Built-in Flesch-Kincaid calculator instead of external text-readability dependency"

patterns-established:
  - "Server action orchestration: validate → load rules → evaluate → rank → deduplicate → enrich → save → redirect"
  - "Confidence-grouped display: high (green) → medium (yellow) → low (gray) visual hierarchy"
  - "Dynamic PDF import pattern: useEffect + Promise.all for lazy loading @react-pdf/renderer"
  - "Guest RLS pattern: user_id IS NULL rows publicly readable, authenticated rows owner-only"

# Metrics
duration: 8min
completed: 2026-02-16
---

# Phase 3 Plan 4: Results Page + API Wiring Summary

**End-to-end screening flow wired: submit answers → evaluate eligibility → view results → download PDF, with guest access and readability validation**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-16T06:25:00Z
- **Completed:** 2026-02-16T06:33:00Z
- **Tasks:** 4 (server action, results page, PDF export, RLS + readability)
- **Files modified:** 8

## Accomplishments
- Created submitScreening() server action orchestrating full eligibility pipeline: validate → load rules → evaluate → rank/deduplicate → enrich → save session + results to database
- Built results page displaying matched programs grouped by confidence level (Likely Eligible/Possibly Eligible/Worth Exploring) with expandable document checklists and numbered next steps
- Implemented PDF download using @react-pdf/renderer with dynamic import pattern to avoid SSR issues, professional layout with confidence sections
- Created RLS policy migration (00005) enabling guest screening: anonymous users can insert sessions and read results
- Wired review page to submit via server action with loading state, error handling, and redirect to results
- Built readability check script with built-in Flesch-Kincaid calculator (screening content at 3.4 grade level - well within target)

## Task Commits

1. **All tasks** - `50a2ac1` (feat: wire screening submission, results page, PDF export)

## Files Created/Modified
- `src/app/screening/actions.ts` - submitScreening() server action with full eligibility pipeline
- `src/app/screening/results/[sessionId]/page.tsx` - Server Component displaying grouped program matches with expandable docs
- `src/app/screening/results/[sessionId]/pdf-download.tsx` - Client component with dynamic @react-pdf/renderer import
- `src/lib/pdf/screening-results.tsx` - React PDF document component with professional layout
- `supabase/migrations/00005_screening_rls_update.sql` - RLS policies for guest screening access
- `scripts/check-readability.ts` - Flesch-Kincaid readability validation script
- `src/app/screening/intake/review/page.tsx` - Updated with submitScreening() integration, loading state, error display
- `package.json` - Added check:readability npm script, @react-pdf/renderer dependency

## Decisions Made
- **Anon client for inserts:** Used the standard Supabase anon client (not service role) for inserting sessions and results. RLS policies explicitly allow anonymous inserts since guest mode is a core requirement.
- **Built-in readability calculator:** Implemented Flesch-Kincaid formulas directly instead of adding text-readability dependency, reducing bundle bloat.
- **pdf().toBlob() pattern:** Used programmatic PDF generation instead of PDFDownloadLink component for better control over the download trigger and loading state.
- **Confidence visual hierarchy:** Green (high/likely), Yellow (medium/possibly), Gray (low/exploring) provides clear visual cue matching the text labels.

## Deviations from Plan

None - implementation followed plan specification closely.

## User Setup Required

Before testing the complete screening flow, the user must:
1. Apply migration `00004_screening_eligibility.sql` to Supabase SQL Editor
2. Apply migration `00005_screening_rls_update.sql` to Supabase SQL Editor
3. Run `npm run seed:rules` to populate 15 Kentucky eligibility rules

## Verification Status

- [x] `npm run build` passes
- [x] All 25 existing tests pass
- [x] Readability check runs (screening at 3.4 grade, docs at 10.6 grade)
- [ ] End-to-end flow requires migrations + seed data (human verification checkpoint)

## Next Phase Readiness
- Complete end-to-end screening flow ready for human verification
- Phase 3 code complete pending migration application and manual testing
- Results page and PDF export ready for user review

## Self-Check: PASSED

All 6 created files verified present. Commit 50a2ac1 verified in git log. Build passes, tests pass.

---
*Phase: 03-core-screening-eligibility-engine*
*Completed: 2026-02-16*
