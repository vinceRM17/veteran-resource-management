---
phase: 07-peer-connection-benefits-interaction-warnings
plan: 01
subsystem: database
tags: [supabase, rpc, ntee-codes, postgres, next-js, server-components]

# Dependency graph
requires:
  - phase: 02-resource-directory-data-pipeline
    provides: organizations table with ntee_code, city, state, zip_code, va_accredited, ein, tax_exempt_status, confidence_score columns
  - phase: 03-core-screening-eligibility
    provides: createClient pattern from @/lib/supabase/server used in peer-queries.ts

provides:
  - search_peer_connections RPC function filtering organizations by NTEE code patterns and location
  - peer-types.ts: PeerConnectionType, NTEE_CODE_MAP, PeerConnectionSearchResult, getVerificationSource()
  - peer-queries.ts: searchPeerConnections() server function with NTEE code mapping
  - /peer-connection landing page with three category cards linking to sub-pages

affects:
  - 07-02 (support groups search page will import searchPeerConnections)
  - 07-03 (opportunities/events pages use same data layer)
  - Future peer connection sub-pages

# Tech tracking
tech-stack:
  added: []
  patterns:
    - NTEE code wildcard pattern mapping (PeerConnectionType -> string[] for LIKE filtering)
    - 4-tier verification badge system (VA accredited > 501c3 > EIN > directory listing)
    - RPC function with array parameter (filter_ntee_codes TEXT[]) + unnest() for multi-pattern LIKE matching

key-files:
  created:
    - supabase/migrations/00008_peer_connection_search.sql
    - src/lib/db/peer-types.ts
    - src/lib/db/peer-queries.ts
    - src/app/peer-connection/layout.tsx
    - src/app/peer-connection/page.tsx
  modified: []

key-decisions:
  - "NTEE code wildcard patterns stored as TEXT[] in RPC function, matched via unnest() + LIKE ANY pattern for flexible category filtering"
  - "filter_branch and filter_era included in RPC signature as pass-through for API stability (organizations table has no branch/era columns yet)"
  - "4-tier verification badge hierarchy: VA Accredited > Verified Nonprofit (501c3+EIN) > Registered Organization (EIN only) > Listed Organization"
  - "ORDER BY va_accredited DESC, confidence_score DESC NULLS LAST, org_name ASC puts most trustworthy results first"

patterns-established:
  - "NTEE code mapping pattern: NTEE_CODE_MAP constant maps PeerConnectionType to string[] of wildcard patterns"
  - "Peer query follows searchOrganizations() pattern: RPC call, cast to typed array, compute totalCount from first result's total_count"

# Metrics
duration: 2min
completed: 2026-02-18
---

# Phase 7 Plan 01: Peer Connection DB Layer + Landing Page Summary

**NTEE-filtered PostgreSQL RPC function + typed server queries + /peer-connection landing page with 4-tier verification badge system**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T01:31:54Z
- **Completed:** 2026-02-19T01:34:11Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created `search_peer_connections` RPC function that filters organizations by NTEE code wildcard patterns (e.g., 'W30%', 'P20%') using unnest() + LIKE for multi-pattern matching
- Built `peer-types.ts` with complete type system: PeerConnectionType union, NTEE_CODE_MAP, PeerConnectionSearchResult interface, and 4-tier getVerificationSource() classifier
- Created `searchPeerConnections()` server function following existing searchOrganizations() pattern, with /peer-connection landing page showing three category cards

## Task Commits

Each task was committed atomically:

1. **Task 1: Database migration + TypeScript types** - `53fa263` (feat)
2. **Task 2: Server query function + peer connection landing page** - `1bc0d65` (feat, included in 07-03 commit)

## Files Created/Modified

- `supabase/migrations/00008_peer_connection_search.sql` - RPC function with NTEE code array filtering, location search, pagination, and verification-ordered results
- `src/lib/db/peer-types.ts` - PeerConnectionType, NTEE_CODE_MAP, PeerConnectionSearchResult, PeerConnectionSearchParams, VerificationSource, getVerificationSource(), PEER_CONNECTION_LABELS, PEER_CONNECTION_DESCRIPTIONS
- `src/lib/db/peer-queries.ts` - searchPeerConnections() server function with "use server" directive
- `src/app/peer-connection/layout.tsx` - Layout wrapper with metadata export
- `src/app/peer-connection/page.tsx` - Landing page with three category cards and verification notice

## Decisions Made

- Used `unnest(filter_ntee_codes)` + `EXISTS` subquery for NTEE code matching — allows passing multiple wildcard patterns like `['W30%', 'P20%']` to a single RPC call rather than multiple queries
- Reserved `filter_branch` and `filter_era` parameters as pass-through (organizations table has no such columns) for API stability — future enhancement can add columns without changing function signature
- 4-tier verification badge hierarchy ensures veterans see the most trustworthy organizations first: VA Accredited > 501(c)(3) Nonprofit > IRS-registered > Directory listing

## Deviations from Plan

None - plan executed exactly as written.

Note: Task 2 files (peer-queries.ts, layout.tsx, page.tsx) were found already committed in the 07-03 commit (`1bc0d65`) from a previous plan execution that ran out of order. Files matched the plan spec exactly — content verified by diff. No rework needed.

## Issues Encountered

Pre-existing TypeScript errors in `src/lib/eligibility/__tests__/interaction-detector.test.ts` reference `../interaction-detector` which is created in plan 07-03. These errors existed before this plan and are not caused by changes here. TypeScript check for peer files passes cleanly.

## User Setup Required

**Migration must be applied manually before search_peer_connections RPC is available:**
1. Open Supabase Dashboard -> SQL Editor
2. Copy contents of `supabase/migrations/00008_peer_connection_search.sql`
3. Execute in SQL Editor
4. Verify: `SELECT routine_name FROM information_schema.routines WHERE routine_name = 'search_peer_connections';`

## Next Phase Readiness

- Data layer complete: searchPeerConnections() ready for use in sub-pages
- /peer-connection landing page live with correct links to /peer-connection/support-groups, /peer-connection/events, /peer-connection/opportunities
- Sub-pages need to be created (07-02 and beyond)
- Migration 00008 must be applied before peer connection search returns real data

---
*Phase: 07-peer-connection-benefits-interaction-warnings*
*Completed: 2026-02-18*
