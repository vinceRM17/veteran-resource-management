# Project State: Veteran Resource Management

**Last Updated:** 2026-02-16
**Current Phase:** 02-resource-directory-data-pipeline
**Current Plan:** 03 (Plan 3 of 4 complete)
**Status:** Executing Phase 2

## Project Reference

**Core Value:**
A veteran in crisis or need can put in their information and immediately feel connected — to programs they qualify for, to people who can help, and to peers who understand what they're going through. Isolation is the enemy; connection is the mission.

**Current Focus:**
Phase 2 - Resource Directory + Data Pipeline

---

## Current Position

**Active Phase:** 03-core-screening-eligibility (Not yet planned)

**Active Plan:** None

**Status:** PHASE_COMPLETE

**Progress:**
```
Phase 1: Foundation + Crisis Safety         [████] 4/4 plans complete (100%) ✓
Phase 2: Resource Directory + Data Pipeline [████] 4/4 plans complete (100%) ✓
Phase 3: Core Screening + Eligibility       [ Not Started ]
Phase 4: Smart Crisis Detection             [ Not Started ]
Phase 5: User Accounts + Dashboard          [ Not Started ]
Phase 6: Self-Service Tools                 [ Not Started ]
Phase 7: Peer Connection + Benefits Warnings [ Not Started ]

Overall: 2/7 phases complete (29%)
```

---

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files | Status | Date |
|-------|------|----------|-------|-------|--------|------|
| 01 | 01 | 6 min | 2 | 15 | Complete | 2026-02-16 |
| 01 | 02 | 7 min | 3 | 14 | Complete | 2026-02-16 |
| 02 | 01 | 8 min | 2 | 9 | Complete | 2026-02-16 |
| 02 | 02 | 6 min | 1 | 7 | Complete | 2026-02-16 |
| 02 | 03 | 5 min | 2 | 17 | Complete | 2026-02-16 |
| 02 | 04 | 8 min | 2 | 11 | Complete | 2026-02-16 |

**Velocity:** 6 plans completed

**Plan Success Rate:** 100% (6/6)

**Blocker Rate:** 0% (0 blockers encountered)

**Average Plan Duration:** 6.7 minutes

---

## Accumulated Context

### Key Decisions

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| 2026-02-15 | 7-phase roadmap structure derived from requirements | Requirements naturally cluster into foundation (1), data (2), core value (3-4), engagement (5-6), advanced (7) | Phases deliver incrementally verifiable capabilities |
| 2026-02-15 | Crisis resources in Phase 1, smart detection in Phase 4 | Always-visible crisis banner is safety requirement; smart detection requires screening flow to monitor | Non-negotiable safety baseline, then enhanced detection |
| 2026-02-15 | Directory before screening | Screening results link to directory; need populated data for end-to-end testing | Phase 2 must complete before Phase 3 |
| 2026-02-15 | Accounts deferred to Phase 5 | Guest mode screening is core value; accounts are retention feature | No forced account creation at launch |
| 2026-02-16 | Tailwind CSS 4 requires @tailwindcss/postcss plugin | Tailwind v4 separated PostCSS plugin from core package | Updated PostCSS config and CSS syntax (@import instead of @tailwind) |
| 2026-02-16 | CrisisBanner uses <aside> instead of div with role="banner" | Biome linter enforces semantic HTML over ARIA roles on generic elements | Improved accessibility with proper semantic elements |
| 2026-02-16 | System fonts only (no external font loading) | Minimize initial bundle size and improve Core Web Vitals | Faster page loads, better performance baseline |
| 2026-02-16 | Three Supabase client variants (browser, server, middleware) | @supabase/ssr pattern required for Next.js 15 App Router | Proper SSR support with session refresh on every request |
| 2026-02-16 | Middleware uses getUser() instead of getSession() | getUser() validates with Supabase auth server; getSession() only reads cookies (can be tampered) | More secure session validation |
| 2026-02-16 | RLS policies use auth.uid() not auth.jwt() | auth.uid() is standard Supabase pattern, more secure and simpler | Consistent with Supabase best practices |
| 2026-02-16 | Guest mode screening with NULL user_id | Core value: screening without account creation | Screening sessions table allows anonymous users |
| 2026-02-16 | Manual migration application via Supabase SQL Editor | Supabase CLI not installed; Management API requires additional auth; manual is documented best practice | One-time manual step with clear instructions in scripts/README.md |
| 2026-02-16 | Service role client for ETL bypasses RLS | Bulk import needs to bypass Row Level Security for performance | ETL scripts use SUPABASE_SERVICE_ROLE_KEY instead of anon key |
| 2026-02-16 | 10% error rate threshold for CSV import | CSV data has expected quality variations; 10% balances normal issues vs systemic problems | Import fails if > 10% validation errors, indicating data quality issue |
| 2026-02-16 | Use better-sqlite3 for synchronous SQLite reading | Simple iteration pattern for 5,567 rows, no streaming complexity needed | Cleaner code than async SQLite libraries, entire dataset read into memory |
| 2026-02-16 | Batch size of 500 for business imports | Smaller dataset than organizations (5.5K vs 85K) | Faster import, better progress logging granularity |
| 2026-02-16 | Use dotenv for .env.local loading in scripts | tsx doesn't auto-load Next.js env files | Scripts work standalone without Next.js environment |
| 2026-02-16 | nuqs for URL state management | Bookmarkable search URLs are core requirement; nuqs provides type-safe URL state with Next.js App Router support | All search filters (query, state, category, VA, page) persist in URL and work with browser back/forward |
| 2026-02-16 | 300ms debounce for search input | Balance between immediate feedback and reducing unnecessary server requests | Smooth typing experience, less database load |
| 2026-02-16 | Server Components for directory pages | Fetch data server-side for better SEO and initial page load performance | Search results pre-rendered, faster perceived performance |

### Active TODOs

None yet (awaiting phase planning).

### Known Blockers

None yet (awaiting phase planning).

### Research Flags

From research/SUMMARY.md, these phases need deeper research during planning:

- **Phase 2:** ETL pipeline for 85K+ records (batch processing, validation, error handling)
- **Phase 3:** Kentucky benefits programs (eligibility rules, income thresholds, documentation requirements)
- **Phase 4:** Crisis detection patterns (clinical validation, false positive/negative rates, partnership with 988/VA)
- **Phase 7:** Kentucky benefits interaction rules (SNAP + Medicaid, SSI + SSDI conflicts)

Phases 1, 5, 6 use standard patterns (skip research-phase).

---

## Session Continuity

**What we're building:**
Veteran resource platform connecting veterans/caregivers to 90K+ organizations, with benefits screening questionnaire that matches users to programs they qualify for.

**Where we are:**
Phase 2 complete (4/4 plans). Phase 1 complete (4/4 plans). Full resource directory operational: 85K+ organizations and 5.5K+ businesses searchable with FTS, state/category/location filters, detail pages, freshness badges, and documentation checklists for 8 benefit programs.

**What's next:**
Plan and execute Phase 3: Core Screening + Eligibility Engine. This is the core value — veterans answer screening questions and get matched to programs they qualify for.

**Critical context:**
- Crisis safety is non-negotiable (always-visible resources in Phase 1, smart detection in Phase 4)
- Data quality is success/failure point (verification systems BEFORE import in Phase 2)
- Screening is core value (Phase 3 is most complex, benefits from Phases 1-2 complete)
- Research identified 4 pitfalls to avoid: data quality death spiral, crisis detection theater, false promise overmatching, black hole referral
- **Migration must be applied manually** before data import can run (see scripts/README.md)

---

*State initialized: 2026-02-15*
*Last plan completed: 02-04 (Business Search UI + Documentation Checklists) on 2026-02-16*
*Next action: /gsd:plan-phase 3 (Core Screening + Eligibility Engine)*
