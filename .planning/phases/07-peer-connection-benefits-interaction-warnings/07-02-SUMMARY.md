---
phase: 07-peer-connection-benefits-interaction-warnings
plan: 02
subsystem: ui
tags: [next-js, nuqs, shadcn, zod, supabase, server-components, react, peer-connection]

# Dependency graph
requires:
  - phase: 07-peer-connection-benefits-interaction-warnings
    provides: search_peer_connections RPC, peer-types.ts with PeerConnectionSearchResult and getVerificationSource(), searchPeerConnections() server query

provides:
  - PeerConnectionCard component with 4-tier verification badge (ShieldCheck/Shield/Building2 icons per tier)
  - PeerSearchForm client component with location/branch/era filters persisted in URL via nuqs, Zod validation on location
  - /peer-connection/support-groups Server Component search page with Suspense boundaries
  - /peer-connection/events Server Component search page with Suspense boundaries
  - /peer-connection/opportunities Server Component search page with Suspense boundaries
  - "Peer Connections" navigation link in site header between Tools and auth section

affects:
  - Any future peer connection detail pages or sub-features

# Tech tracking
tech-stack:
  added: []
  patterns:
    - PeerSearchForm wraps useQueryState (nuqs) in Suspense boundary — required by Next.js 16 for static prerendering
    - NuqsAdapter in layout.tsx enables nuqs URL state management across all child pages
    - Three-tier Suspense pattern: PeerSearchForm in its own Suspense, results in separate Suspense with loading spinner
    - Zod .refine() for multi-format validation: city name OR ZIP code patterns with inline error display
    - verification badge variant mapped from tier: primary="default", secondary="secondary", tertiary="outline"

key-files:
  created:
    - src/components/peer-connection/peer-connection-card.tsx
    - src/components/peer-connection/peer-search-form.tsx
    - src/app/peer-connection/support-groups/page.tsx
    - src/app/peer-connection/events/page.tsx
    - src/app/peer-connection/opportunities/page.tsx
  modified:
    - src/app/peer-connection/layout.tsx
    - src/components/layout/header.tsx

key-decisions:
  - "PeerSearchForm wrapped in its own Suspense boundary on each page — Next.js 16 requires useSearchParams (which nuqs uses internally) to be inside Suspense during static generation"
  - "NuqsAdapter added to peer-connection layout.tsx — was missing from Plan 01, causing nuqs adapter error on build"
  - "Zod validation on location field uses .refine() with two patterns: /^[A-Za-z\\s\\-]+$/ for city names and /^\\d{5}(-\\d{4})?$/ for ZIP/ZIP+4 — inline error below input"

patterns-established:
  - "Peer connection search pages: Server Component outer page + async Results function + Suspense boundaries for both SearchForm and Results sections"
  - "PeerConnectionCard follows OrgCard pattern: Link title to /directory/{id}, location in CardDescription, contact row at bottom"
  - "Badge variant selection from verification tier: tier='primary' -> 'default' (blue), tier='secondary' -> 'secondary', tier='tertiary' -> 'outline'"

# Metrics
duration: 5min
completed: 2026-02-18
---

# Phase 7 Plan 02: Peer Connection Search Pages Summary

**Three NTEE-filtered search pages (support-groups, events, opportunities) with 4-tier verification badges, location/branch/era URL filters via nuqs, and Peer Connections link in site header**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-19T01:37:36Z
- **Completed:** 2026-02-19T01:41:49Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Built PeerConnectionCard with 4-tier verification badge system (ShieldCheck for VA Accredited, Shield for Verified Nonprofit, Building2 for others) and contact info row following OrgCard pattern
- Built PeerSearchForm with location/branch/era URL filters via nuqs, 300ms debounce, and Zod validation for city names and ZIP codes (including ZIP+4)
- Created three Server Component search pages (/support-groups, /events, /opportunities) with Suspense boundaries, empty states, back links, and metadata exports
- Added "Peer Connections" navigation link to header between Tools and auth section
- Auto-fixed two blocking issues: missing NuqsAdapter in peer-connection layout and PeerSearchForm needing Suspense wrapper for Next.js 16 build

## Task Commits

Each task was committed atomically:

1. **Task 1: PeerConnectionCard and PeerSearchForm components** - `b4f04ae` (feat)
2. **Task 2: Three search pages + header navigation update** - `e2009b6` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/components/peer-connection/peer-connection-card.tsx` - Card component with 4-tier verification badge, services, NTEE description, and contact info
- `src/components/peer-connection/peer-search-form.tsx` - Client component with location/branch/era filters via nuqs, Zod validation, debounced location input
- `src/app/peer-connection/support-groups/page.tsx` - Server Component search page for veteran support groups and communities (100 lines)
- `src/app/peer-connection/events/page.tsx` - Server Component search page for veteran events and activities (100 lines)
- `src/app/peer-connection/opportunities/page.tsx` - Server Component search page for employment and training opportunities (103 lines)
- `src/app/peer-connection/layout.tsx` - Added NuqsAdapter (was missing in Plan 01)
- `src/components/layout/header.tsx` - Added "Peer Connections" nav link between Tools and auth section

## Decisions Made

- PeerSearchForm wrapped in its own Suspense boundary on each page — Next.js 16 requires `useSearchParams` (used internally by nuqs) to be inside a Suspense boundary during static generation. The directory page's SearchForm works because the directory layout uses NuqsAdapter differently.
- NuqsAdapter added to peer-connection layout.tsx — was missing from Plan 01, causing "nuqs requires an adapter" error on first build attempt.
- Zod validation uses `.refine()` with two regex patterns: `/^[A-Za-z\s\-]+$/` for city names and `/^\d{5}(-\d{4})?$/` for ZIP/ZIP+4 codes. Error message appears inline below the input field.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added NuqsAdapter to peer-connection layout.tsx**
- **Found during:** Task 2 (build verification)
- **Issue:** Build failed with "nuqs requires an adapter to work with your framework" — NuqsAdapter was missing from the peer-connection layout created in Plan 01
- **Fix:** Added `import { NuqsAdapter } from 'nuqs/adapters/next/app'` and wrapped children in `<NuqsAdapter>` in src/app/peer-connection/layout.tsx
- **Files modified:** src/app/peer-connection/layout.tsx
- **Verification:** npm run build passes with all three pages listed
- **Committed in:** e2009b6 (Task 2 commit)

**2. [Rule 3 - Blocking] Wrapped PeerSearchForm in Suspense boundary on all three pages**
- **Found during:** Task 2 (second build attempt after NuqsAdapter fix)
- **Issue:** Build failed with "useSearchParams() should be wrapped in a suspense boundary" — Next.js 16 requires client components using useSearchParams (nuqs uses this internally) to be inside Suspense during static prerendering
- **Fix:** Added `<Suspense fallback={<div className="h-40 bg-white rounded-lg border animate-pulse" />}>` wrapper around `<PeerSearchForm />` in all three pages
- **Files modified:** support-groups/page.tsx, events/page.tsx, opportunities/page.tsx
- **Verification:** npm run build passes cleanly
- **Committed in:** e2009b6 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - Blocking)
**Impact on plan:** Both auto-fixes were necessary for build to pass. No scope creep — added Suspense wrappers are the correct Next.js 16 pattern for client components using URL state. Layout fix corrects an omission from Plan 01.

## Issues Encountered

- Zod v4 uses `.issues` instead of `.errors` for accessing validation errors (Zod v3 pattern). TypeScript caught this immediately, fixed before first commit.

## User Setup Required

None — no external service configuration required. The search_peer_connections RPC (migration 00008) was already documented as a manual setup step in Plan 01.

## Next Phase Readiness

- All three peer connection search pages live and accessible
- Verification badges display on every listing card with source text
- Location/branch/era filters persist in URL (bookmarkable)
- "Peer Connections" link in site header for discoverability
- Phase 7 complete: peer connection sub-pages, benefit interaction warnings, and DB layer all done

---
*Phase: 07-peer-connection-benefits-interaction-warnings*
*Completed: 2026-02-18*

## Self-Check: PASSED

All files present and commits verified:
- peer-connection-card.tsx: FOUND
- peer-search-form.tsx: FOUND
- support-groups/page.tsx: FOUND
- events/page.tsx: FOUND
- opportunities/page.tsx: FOUND
- header.tsx: FOUND
- 07-02-SUMMARY.md: FOUND
- Commit b4f04ae: FOUND
- Commit e2009b6: FOUND
