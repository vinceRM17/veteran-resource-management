---
phase: 05-user-accounts-dashboard
plan: 01
subsystem: database, auth
tags: [supabase, rls, bookmarks, action-items, session-claiming, server-actions]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "profiles table with role column, screening_sessions table"
  - phase: 04-smart-crisis-detection
    provides: "crisis_detection_logs table with permissive RLS to tighten"
provides:
  - "bookmarks table with user-scoped RLS"
  - "action_items table with auto-update trigger and RLS"
  - "Admin-only crisis log RLS via profiles.role check"
  - "is_admin() helper function for role checks"
  - "Session claiming UPDATE policy on screening_sessions"
  - "claimGuestSession and createActionItemsFromResults server actions"
  - "Auth flow support for post-signup redirect with session context"
  - "TypeScript types: Bookmark, ActionItem, ScreeningHistoryEntry"
affects: [05-02, 05-03, 05-04, dashboard, admin]

# Tech tracking
tech-stack:
  added: []
  patterns: [admin-role-rls-check, session-claiming-pattern, action-items-from-next-steps]

key-files:
  created:
    - supabase/migrations/00007_user_accounts_dashboard.sql
    - src/lib/db/dashboard-types.ts
  modified:
    - src/app/screening/actions.ts
    - src/components/auth/SignupForm.tsx
    - src/app/(auth)/signup/page.tsx

key-decisions:
  - "Admin RLS uses EXISTS subquery on profiles.role rather than is_admin() function for explicit policy clarity"
  - "Session claiming uses double-check pattern: SELECT to validate then UPDATE with IS NULL guard against race conditions"
  - "Action items created from next_steps array in screening_results, one action item per step"

patterns-established:
  - "Admin-only RLS pattern: EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')"
  - "Session claiming pattern: USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id)"
  - "Server action pattern: validate auth -> validate input -> perform operation -> return typed result"

# Metrics
duration: 4min
completed: 2026-02-16
---

# Phase 5 Plan 1: Database Foundation Summary

**Bookmarks and action_items tables with RLS, admin-only crisis log policies, session-claiming logic, and auth flow updates for guest-to-user conversion**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-16T19:31:23Z
- **Completed:** 2026-02-16T19:35:23Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created bookmarks table with unique constraint on (user_id, resource_type, resource_id) and full CRUD RLS
- Created action_items table with auto-update trigger for updated_at and user-scoped RLS
- Tightened crisis_detection_logs RLS from any-authenticated to admin-only via profiles.role check
- Added is_admin() SECURITY DEFINER helper function for future admin checks
- Added screening_sessions UPDATE policy enabling guest session claiming
- Implemented claimGuestSession server action with race-condition guard
- Implemented createActionItemsFromResults to convert screening next_steps into trackable items
- Updated SignupForm to support redirectTo and sessionId props for post-signup flow
- Updated signup page to read and pass URL search params through to SignupForm

## Task Commits

Each task was committed atomically:

1. **Task 1: Database migration and TypeScript types** - `e650c39` (feat)
2. **Task 2: Session claiming and auth flow updates** - `331a703` (feat)

## Files Created/Modified
- `supabase/migrations/00007_user_accounts_dashboard.sql` - Migration with bookmarks, action_items tables, admin RLS, is_admin(), session claiming policy
- `src/lib/db/dashboard-types.ts` - TypeScript types for Bookmark, ActionItem, ScreeningHistoryEntry
- `src/app/screening/actions.ts` - Added claimGuestSession and createActionItemsFromResults server actions
- `src/components/auth/SignupForm.tsx` - Added redirectTo and sessionId props, updated emailRedirectTo
- `src/app/(auth)/signup/page.tsx` - Reads next and sessionId from searchParams, passes to SignupForm

## Decisions Made
- Admin RLS uses explicit EXISTS subquery rather than calling is_admin() function, keeping policies self-contained and transparent
- Session claiming uses a two-step approach: first SELECT to validate, then UPDATE with .is("user_id", null) as a race condition guard
- Action items are created one-per-step from screening_results.next_steps, with sort_order for maintaining display order

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Migration 00007 must be applied manually** via Supabase Dashboard SQL Editor before bookmarks, action items, or session claiming will work. Copy the contents of `supabase/migrations/00007_user_accounts_dashboard.sql` and execute in the SQL Editor.

## Next Phase Readiness
- Database schema ready for dashboard UI (05-02) and bookmark/action-item features (05-03)
- Session claiming server action ready for integration into post-signup flow
- TypeScript types available for all dashboard components
- Auth callback already supports next redirect parameter, no further changes needed

## Self-Check: PASSED

All 6 files verified present. Both task commits (e650c39, 331a703) verified in git log.

---
*Phase: 05-user-accounts-dashboard*
*Completed: 2026-02-16*
