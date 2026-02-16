---
phase: 02-resource-directory-data-pipeline
plan: 04
subsystem: business-directory-ui
tags: [frontend, search, business-directory, documentation-checklists, navigation]
dependency_graph:
  requires: [02-01-SUMMARY, 02-02-SUMMARY, 02-03-SUMMARY]
  provides: [business-search-ui, business-detail-page, documentation-checklists, site-navigation]
  affects: [future-screening-results, phase-3-document-tracking]
tech_stack:
  added: ["@radix-ui/react-accordion"]
  patterns: [server-components, url-state-management, accordion-ui]
key_files:
  created:
    - src/app/directory/businesses/page.tsx
    - src/app/directory/businesses/[id]/page.tsx
    - src/app/resources/documents/page.tsx
    - src/components/directory/business-search-form.tsx
    - src/components/ui/accordion.tsx
    - src/content/documentation-checklists.ts
    - supabase/migrations/00003_location_search.sql
  modified:
    - src/components/layout/Header.tsx
    - src/lib/db/queries.ts
    - src/components/directory/search-form.tsx
decisions:
  - decision: Single location input for city or zip code
    rationale: Users search by where they are, not just state; single field handles both city prefix match and zip prefix match
    impact: More precise location filtering across both org and business directories
  - decision: Accordion UI for documentation checklists
    rationale: 8 programs with detailed document lists need progressive disclosure to avoid overwhelming users
    impact: Clean UI, users expand only programs they care about
  - decision: Visual-only checkboxes on document checklists
    rationale: Functional tracking deferred to Phase 5 (user accounts); visual checkboxes help users mentally track progress
    impact: No state management needed yet, clean upgrade path in Phase 5
metrics:
  duration: 8 min
  tasks_completed: 2
  files_created: 7
  files_modified: 4
  completed_date: 2026-02-16
---

# Phase 02 Plan 04: Business Search UI and Documentation Checklists Summary

**One-liner:** Business directory search with FTS/filters, documentation checklists for 8 benefit programs, location search for both directories, and updated site navigation

## Objective Achievement

Completed the user-facing features of Phase 2:
1. Business search page with full-text search, state filter, business type filter, and location filter
2. Business detail page with contact info, industry classification, and registration details
3. Documentation checklists page with 8 core Kentucky benefit programs
4. Updated site header with Directory, Businesses, and Documents navigation links
5. Added city/zip code location filtering to both organization and business search

## Tasks Completed

### Task 1: Build business search and detail pages with documentation checklists

**Files:**
- `src/app/directory/businesses/page.tsx` — Business search page (Server Component)
- `src/app/directory/businesses/[id]/page.tsx` — Business detail page
- `src/components/directory/business-search-form.tsx` — Business search form with filters
- `src/content/documentation-checklists.ts` — Static content for 8 program document requirements
- `src/app/resources/documents/page.tsx` — Documentation checklists page with accordion UI
- `src/components/ui/accordion.tsx` — shadcn accordion component
- `src/components/layout/Header.tsx` — Updated with directory navigation links

**Deliverables:**
- Business search with FTS, state filter, business type filter (VOSB, SDVOSB)
- Business detail page with full contact, industry, registration, and freshness info
- 8 documentation checklists: VA Disability, VA Healthcare, Medicaid, SNAP, SSI, SSDI, HCB Waiver, Veterans Pension
- Each checklist includes required/recommended documents, how to obtain, and application tips
- Header navigation: Directory, Businesses, Documents links with active state styling

**Commit:** c020f23

### Task 2: Add location (city/zip code) search to both directories

**Files:**
- `supabase/migrations/00003_location_search.sql` — Updated RPC functions with filter_location parameter
- `src/lib/db/queries.ts` — Added location parameter to search functions
- `src/components/directory/search-form.tsx` — Added location input to org search
- `src/components/directory/business-search-form.tsx` — Added location input to business search
- `src/app/directory/page.tsx` — Pass location param to search
- `src/app/directory/businesses/page.tsx` — Pass location param to search

**Deliverables:**
- Database RPC functions updated to accept filter_location (city ILIKE prefix OR zip_code prefix)
- Both search forms have "City or Zip Code" input with debounced URL state
- Location filter persists in URL and works with clear filters button

## Verification Status

**Build Verification:** PASSED
- `npm run build` succeeds with no errors
- All routes compile: /directory, /directory/[id], /directory/businesses, /directory/businesses/[id], /resources/documents

**Human Verification:** APPROVED
- User confirmed directory experience looks good
- User requested location search — implemented and verified

## Impact

**Immediate:**
- Veterans can search 5,500+ veteran-owned businesses by name, industry, state, type, and location
- Veterans can prepare for benefit applications with documentation checklists
- Both directories support city/zip code location filtering
- Site navigation provides clear access to all directory features

**Downstream:**
- Phase 3 screening results will reference documentation checklists
- Phase 5 will add functional document tracking (checkbox state persistence)
- Documentation checklists content reusable for PDF export in screening results

## Conclusion

Phase 2 Plan 04 complete. All directory UI features delivered: organization search, business search, detail pages, documentation checklists, location filtering, and site navigation. Phase 2 is fully complete with 85K+ organizations and 5.5K+ businesses searchable with full-text search, filters, and location-based discovery.
