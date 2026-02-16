# Project State: Veteran Resource Management

**Last Updated:** 2026-02-16
**Current Phase:** 04-smart-crisis-detection
**Current Plan:** 01 (Plan 1 of 3 complete)
**Status:** Phase 4 In Progress

## Project Reference

**Core Value:**
A veteran in crisis or need can put in their information and immediately feel connected — to programs they qualify for, to people who can help, and to peers who understand what they're going through. Isolation is the enemy; connection is the mission.

**Current Focus:**
Phase 4 - Smart Crisis Detection

---

## Current Position

**Active Phase:** 04-smart-crisis-detection

**Active Plan:** 04-01 (complete)

**Status:** IN PROGRESS

**Progress:**
[█████████░] 85%
Phase 1: Foundation + Crisis Safety         [████] 4/4 plans complete (100%) ✓
Phase 2: Resource Directory + Data Pipeline [████] 4/4 plans complete (100%) ✓
Phase 3: Core Screening + Eligibility       [████] 4/4 plans complete (100%) — needs migration + testing
Phase 4: Smart Crisis Detection             [█░░░] 1/3 plans complete (33%)
Phase 5: User Accounts + Dashboard          [ Not Started ]
Phase 6: Self-Service Tools                 [ Not Started ]
Phase 7: Peer Connection + Benefits Warnings [ Not Started ]

Overall: 2/7 phases complete (29%), Phase 3 code complete pending verification
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
| 03 | 01 | 6 min | 2 | 8 | Complete | 2026-02-16 |
| 03 | 02 | 6 min | 2 | 15 | Complete | 2026-02-16 |
| 03 | 03 | 6 min | 2 | 4 | Complete | 2026-02-16 |
| 03 | 04 | 8 min | 4 | 8 | Complete | 2026-02-16 |
| 04 | 01 | 2 min | 2 | 5 | Complete | 2026-02-16 |

**Velocity:** 11 plans completed

**Plan Success Rate:** 100% (11/11)

**Blocker Rate:** 0% (0 blockers encountered)

**Average Plan Duration:** 6.2 minutes

---
| Phase 04 P01 | 2 | 2 tasks | 5 files |

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
| 2026-02-16 | Separate Zod schemas per conditional variant | Zod 4 .extend() causes type inference issues when overriding optional with required | Cleaner type safety, no runtime schema mutation |
| 2026-02-16 | Pure functions for conditional logic (no React deps) | Enables easy unit testing without component rendering | shouldShowField() and clearDependentFields() fully testable |
| 2026-02-16 | 15 rules with dual high/medium confidence tiers | Binary yes/no matching is too rigid for benefits screening | Nuanced "Likely Eligible" vs "Possibly Eligible" recommendations |
| 2026-02-16 | json-rules-engine v7 with built-in TypeScript types | No separate @types package needed; rules stored as JSON in database | Non-developers can update eligibility criteria without code changes |
| 2026-02-16 | Cast DB conditions type to json-rules-engine TopLevelCondition | DB schema has both all/any optional; engine expects discriminated union with exactly one | Safe cast bridges two valid representations of same data |
| 2026-02-16 | allowUndefinedFacts: true on eligibility engine | Incomplete screening answers should not crash evaluation | Missing facts simply don't match rules, returning no results for those rules |
| 2026-02-16 | Confidence labels: Likely/Possibly/Worth Exploring | Clear language matching 6th-grade reading level target | Users understand what confidence levels mean without jargon |
| 2026-02-16 | Local form state synced to Zustand store on Next click | Avoids re-rendering entire store on every keystroke | Better form performance, cleaner separation of local vs persisted state |
| 2026-02-16 | Intra-step conditionals use local state instead of ConditionalField | ConditionalField reads from store which doesn't have values until Next click | Disability rating field shows immediately when disability answer changes |
| 2026-02-16 | Semantic fieldset elements instead of div role=group | Biome a11y linter enforces semantic HTML over ARIA roles on generic elements | Proper accessibility with native HTML semantics |
| 2026-02-16 | Phrase matching for crisis keywords (not word matching) | Prevents false positives like "kill time" triggering "kill myself" detection | More accurate crisis detection with fewer false alarms |
| 2026-02-16 | Store SHA-256 hash instead of raw text in crisis logs | Avoid storing PHI, maintain HIPAA compliance | Cannot review original text, but preserves privacy |
| 2026-02-16 | Allow anonymous crisis log insertion | Crisis events must be captured even from anonymous users; logs contain no PHI | Any connection can insert crisis logs for safety |

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
Phase 4 in progress (1/3 plans done). Crisis detection foundation complete: database schema, keyword list, detector function, audit logger. Next: integrate crisis detection into screening flow (Plan 04-02).

**What's next:**
1. Plan 04-02: Add optional free-text field to screening and run crisis detection on submission
2. Plan 04-03: Build monitoring dashboard for admin review of detected crisis events
3. Mark Phase 4 complete

**Critical context:**
- Crisis safety is non-negotiable (always-visible resources in Phase 1, smart detection in Phase 4)
- Data quality is success/failure point (verification systems BEFORE import in Phase 2)
- Screening is core value (Phase 3 is most complex, benefits from Phases 1-2 complete)
- Research identified 4 pitfalls to avoid: data quality death spiral, crisis detection theater, false promise overmatching, black hole referral
- **Migration must be applied manually** before data import can run (see scripts/README.md)
- Eligibility engine ready: evaluateEligibility() takes answers + rules, returns ranked ProgramMatch[]
- **End-to-end flow wired:** form submission → eligibility evaluation → results display → PDF download
- **Migrations 00004 + 00005 must be applied** before screening works end-to-end
- **Run `npm run seed:rules`** after migrations to populate eligibility rules
- **Crisis detection foundation ready:** 27 ASQ-derived keywords, phrase-matching detector, audit logger
- **Migration 00006 must be applied** before crisis detection can log to database

---

*State initialized: 2026-02-15*
*Last plan completed: 04-01 (Crisis Detection Foundation) on 2026-02-16*
*Next action: Execute Plan 04-02 (integrate crisis detection into screening flow)*
