# Project Research Summary

**Project:** Veteran Resource Management Platform (Active Heroes)
**Domain:** Veteran Services & Social Services Platform
**Researched:** 2026-02-15
**Confidence:** MEDIUM-HIGH

## Executive Summary

Active Heroes is a veteran resource management platform that connects veterans, caregivers, and service organizations to benefits and resources. Research shows the standard approach for this domain combines benefits screening tools (NYC Benefits Platform pattern), resource directories (211 platform model), and crisis intervention (VA crisis detection patterns). The recommended architecture uses Next.js 16 + Supabase (PostgreSQL) with a JSON-based eligibility rules engine, full-text search for 85K+ organizations, and row-level security for sensitive veteran data.

The recommended approach prioritizes screening functionality as the core value proposition, with resource directory serving matched results. Critical insight: 65% of referrals fail without closed-loop tracking, and data quality death spirals are the top reason veteran platforms lose trust within 6-12 months. Build verification systems before importing organization data, never after. Crisis detection must include 24/7 human monitoring, not just automated keyword matching, as this is life-or-death functionality.

Key risks center on three areas: (1) data quality degradation making the platform unusable as organization information becomes stale, (2) crisis detection failures with catastrophic consequences, and (3) false-positive eligibility matches that waste veterans' time and erode trust. Mitigation requires automated verification pipelines for organization data, partnering with crisis intervention experts for detection logic + human oversight, and conservative eligibility matching with confidence scoring from day one.

## Key Findings

### Recommended Stack

**Full-stack framework:** Next.js 16 + React 19 + TypeScript 5.8 provides production-ready server components, built-in routing, and type safety critical for complex eligibility rules. Next.js 16 includes Turbopack (5x faster builds) and improved hydration error handling. Vercel deployment offers zero-config hosting with automatic preview deployments and edge functions.

**Backend & database:** Supabase (managed PostgreSQL 15+) eliminates infrastructure complexity while providing enterprise features: built-in authentication, Row-Level Security (RLS) for database-level authorization, real-time subscriptions, and pgvector for semantic search. Drizzle ORM is recommended over Prisma for app queries (smaller bundle, better serverless performance), with Prisma reserved for ETL pipelines importing 85K+ organizations.

**Core technologies:**
- **Next.js 16 + React Server Components** — SSR/SSG for SEO-friendly veteran resources, server actions for eligibility evaluation, API routes for search endpoints
- **Supabase (PostgreSQL + Auth + Storage)** — Managed backend with RLS for HIPAA-grade data isolation, pgvector for semantic "find similar programs," built-in OAuth providers
- **Zustand + TanStack Query** — Client state for multi-step screening questionnaire (1KB bundle), server state management with automatic caching for resource directory
- **shadcn/ui + Tailwind CSS 4** — Accessible components (WCAG 2.2 AA out-of-box), zero runtime overhead, Lightning CSS engine (5x faster builds)
- **Zod + React Hook Form** — Type-safe validation for screening answers and eligibility rules, reusable across client/server, automatic TypeScript inference
- **Vitest + Playwright + @axe-core/playwright** — Unit testing (Vite-native), E2E testing with built-in accessibility scans for WCAG 2.1 AA compliance

**Critical version notes:** React 19 is minimum for Next.js 15+. Node.js 22 LTS is default on Vercel. Biome 2.3+ replaces ESLint + Prettier (50x faster, 97% compatible). TanStack Query v5 renamed isLoading to isPending.

### Expected Features

Research across VA.gov, 211 platforms, Military OneSource, and social services case management systems reveals clear feature expectations.

**Must have (table stakes):**
- **Benefits screening tool** — Multi-step questionnaire with 5-7 questions for quick results, optional deep-dive for specificity, mobile-optimized with progress indicators
- **Crisis resources always visible** — Sticky header/footer with Veterans Crisis Line (988), text/chat options, non-intrusive but always accessible
- **Resource directory with search** — Filter by benefit type, user type (veteran/family/caregiver), state/location; Kentucky focus initially, national expansion later
- **Guest mode screening** — No account required for immediate access (barrier removal), optional account to save results for engagement
- **Printable results PDF** — Export screening results, matched programs, next steps for sharing with VSOs and family
- **Documentation checklists** — Program-specific document lists with explanations, bridges "you qualify" to "you applied"
- **Caregiver-specific pathway** — Separate screening questions and resources for underserved caregiver segment

**Should have (competitive advantage):**
- **Smart crisis detection** — NLP keyword detection + sentiment analysis on screening responses, immediate intervention vs. reactive access (2026 trend: prevention over crisis response)
- **Warm handoff technology** — Real-time connection to case managers/peer mentors (2x higher treatment acceptance vs. cold referrals), requires scheduling integration and availability management
- **Benefits interaction warnings** — Rules engine flags when applying for Program A might disqualify from Program B, prevents users from losing benefits
- **Personalized dashboard** — User accounts with saved searches, favorited resources, progress tracking on action steps
- **Veteran-owned business directory** — SBA certification verification, searchable by industry/location, connects veterans to veteran economy

**Defer to v2+:**
- **Peer connection matching** — Requires vetting, safety protocols, moderation infrastructure (HIGH complexity, defer until community management capacity exists)
- **Offline mode/PWA** — Valuable for rural users but HIGH complexity (defer unless rural users are primary audience)
- **VA system integration** — Requires accreditation, complex legal requirements (defer until partnership agreements in place)

**Anti-features to avoid:**
- **Comprehensive application submission** — Each agency has own systems; building integrations means maintaining 50+ systems with high failure rates
- **Real-time benefits calculation** — Rules too complex (dependents, bilateral factors, state variations); high error rate damages trust
- **AI chatbot for benefits questions** — AI hallucinates on complex benefits rules; users want human expertise for high-stakes decisions
- **Forum/community for all users** — Moderation burden is massive, liability for crisis situations and misinformation

### Architecture Approach

Standard architecture follows NYC Benefits Platform pattern: JSON-based eligibility rules stored in PostgreSQL, evaluated server-side against screening answers. Three-tier system with Next.js presentation layer, server actions/API routes for business logic (eligibility engine, search service, crisis detector, referral workflow), and Supabase data layer with RLS policies for multi-tenant isolation.

**Major components:**
1. **Screening Intake** — Multi-step form with conditional logic, role toggle (veteran/caregiver), session persistence via Zustand + LocalStorage, React Hook Form + Zod for per-step validation
2. **Eligibility Engine** — JSON rule definitions queried from PostgreSQL, evaluated server-side with confidence scoring, ranks results by relevance, generates action plan
3. **Crisis Detector** — Keyword + pattern matching with NLP sentiment analysis, monitors every text input field (not just final results), interrupts flow with full-page intervention if detected, requires 24/7 human monitoring
4. **Resource Directory** — PostgreSQL full-text search with GIN indexes for 85K+ organizations, paginated API endpoints, faceted filters (benefit type, state, veteran-focused), hybrid search combining full-text + pgvector semantic similarity
5. **Referral Workflow** — State machine (pending → sent → accepted → contacted → completed), server actions with email/webhook notifications to partners, automated SMS check-ins to veterans at 3 and 7 days, escalation if no contact after 7 days
6. **User Accounts** — Supabase Auth with email/password + social login (Google), RLS policies using auth.uid() for user-specific data isolation, separate roles (veteran, caregiver, admin) with RLS enforcement

**Key architectural patterns:**
- **JSON-based rule engine** — Store eligibility rules as data, not code; allows program managers to update via admin UI, version history in database, easier to audit
- **Crisis detection with UI intercept** — Server-side detection on every answer submission, returns {isCrisis: true, resources}, UI renders full-page CrisisIntercept component with immediate 988 access
- **Warm handoff state machine** — Track referral states, send notifications to partners, require outcome reporting, measure completion rates by organization
- **Row Level Security** — Database-level authorization survives application bugs, prevents data leaks even with SQL injection, critical for HIPAA-grade compliance

**Build order implications from architecture:**
1. **Phase 1: Foundation** — Supabase schema + RLS policies + auth flows + crisis banner (everything depends on these)
2. **Phase 2: Resource Directory** — Import 90K+ records, build search UI/API (screening results point to directory, need it populated for testing)
3. **Phase 3: Screening & Eligibility** — Multi-step intake, JSON rule engine, program rules for 10-15 core programs (most complex, benefits from directory already built)
4. **Phase 4: Crisis Detection** — Keyword matching, intercept UI, logging/escalation (overlays on screening, easier after screening works)
5. **Phase 5: Warm Handoff** — Referral workflow, partner notifications, tracking UI (requires external coordination, can launch without and add incrementally)

### Critical Pitfalls

Top pitfalls from documented VA system failures (2025-2026), 211 platform implementations, and benefits screening tool post-mortems:

1. **Data Quality Death Spiral** — 85K+ organization database becomes unusable within 6-12 months due to stale contact info, dead links, closed orgs. Veterans call disconnected numbers, lose trust in entire platform. This is #1 reason veteran platforms fail. **Avoid:** Build automated verification (phone checks, website crawling) BEFORE importing data; human verification workflow for systematic monthly audits; database schema with last_verified_date and confidence_score from day one. Warning signs: user feedback about "wrong phone number," verification timestamps >6 months old for >20% of records.

2. **Crisis Detection Theater** — System appears to detect crisis in demos but fails in production when it matters. Veterans express suicidal ideation, alerts go to unmanned inboxes or delay 24-72 hours. VA's AI tools criticized for lacking safety oversight. **Avoid:** Partner with crisis intervention experts (988 Lifeline, VA crisis line) during design; always-visible crisis resources on EVERY page; 24/7 human monitoring for AI-detected flags (cannot ship without this); test with real anonymized crisis language; backup SMS/call to crisis line if handoff fails. Recovery cost: CATASTROPHIC — one preventable death destroys organization credibility.

3. **False Promise Overmatching** — Screening tool says "You qualify for 8 programs!" but veteran denied for 6 after applying. Benefits rules far more complex than simplified logic captures (15+ sub-definitions of "disabled veteran," income thresholds, asset tests, state variations). **Avoid:** Conservative matching with confidence scoring (>80% = "Likely Eligible," otherwise "Possibly Eligible - requires verification"); partner with benefits counselors to audit logic before launch; never present screening as definitive determination; show WHY each match was made; track referral outcomes to tighten rules.

4. **Black Hole Referral** — Platform sends referral to organization, no mechanism to confirm veteran received services. Research shows 65% of traditional referrals fail. Veteran calls number, gets voicemail, never calls back. Platform shows "referral sent ✓" suggesting success, but no actual help delivered. **Avoid:** Minimum 3 statuses (Sent, Contact Attempted, Services Delivered); only list orgs that agree to report outcomes; automated SMS check-ins to veterans at 3 and 7 days; escalate if no contact after 7 days; track completion rate by org, deprioritize those <30%.

5. **HIPAA Scope Creep** — Team either over-engineers privacy (assumes all data is HIPAA) or under-engineers (assumes none is). Reality: some data (service history, demographics) isn't HIPAA; some data (disability details, mental health responses) likely is if connected to healthcare referrals. **Avoid:** Legal consultation to determine actual HIPAA status before architecture decisions; data minimization (don't collect health details unless required for matching); encrypt sensitive fields regardless of HIPAA status; role-based access controls; de-identified analytics. Recovery cost: HIGH — HIPAA violations carry $100-$50K per record fines, requires breach notification.

6. **Accessibility Theater** — Automated checker passes, but real veterans with disabilities cannot use platform. Research shows automated tools only catch ~30% of accessibility issues; remaining 70% require manual testing. Government sites average 307 violations per page, 51% fail keyboard navigation. **Avoid:** WCAG 2.1 AA compliance from day one (federal requirement by 2026); manual testing with screen readers (NVDA/JAWS) every sprint; include disabled veterans in user testing; every form field has label + logical tab order + screen reader announcements; plain language <8th grade reading level. Recovery cost: MEDIUM — ADA violation liability, reputational damage.

7. **State Rules Hardcoded** — "Kentucky only" hardcoded in 47 files. Six months later, Tennessee expansion requires rewriting 30% of codebase. **Avoid:** Configuration-driven eligibility engine from day one (rules in JSON/database); state as first-class entity in data model; program descriptions in CMS not hardcoded strings; write tests as data not hardcoded assertions. Recovery cost: HIGH — requires re-architecting rules engine, database migrations.

8. **Mobile Bandwidth Blindness** — Platform unusable for rural veterans on limited mobile data. 22.3% of rural Americans lack reliable broadband, Appalachian Kentucky has spotty mobile with data caps. **Avoid:** Performance budget <500KB initial load; compress images, lazy load, WebP format; test on Slow 3G every PR; core functionality works without JavaScript; offline-first for screening with intermittent connectivity. Warning signs: Lighthouse score <80, JavaScript bundle >1MB.

## Implications for Roadmap

Based on research findings, recommended phase structure follows architecture dependencies and pitfall mitigation priorities.

### Phase 1: Foundation + Crisis Infrastructure

**Rationale:** Everything depends on database schema, authentication, and RLS being locked in. Crisis resources are non-negotiable safety requirement that cannot be deferred. This phase establishes security foundation (RLS policies, encryption) to avoid HIPAA scope creep pitfall and accessibility foundation (WCAG 2.1 AA) to avoid accessibility theater.

**Delivers:**
- Supabase project with database schema (organizations, programs, users, screening_sessions)
- Row-Level Security policies for multi-tenant data isolation
- Authentication flows (Supabase Auth with email/password + Google OAuth)
- Basic layout components (header, footer, MainLayout)
- Always-visible crisis banner with Veterans Crisis Line (988)
- WCAG 2.1 AA compliant component library (shadcn/ui setup)

**Addresses features:**
- Crisis resources always visible (table stakes)
- Secure authentication (table stakes)
- Accessibility foundation for all subsequent phases

**Avoids pitfalls:**
- HIPAA Scope Creep: Legal review + encryption + RLS from day one
- Accessibility Theater: WCAG compliance built-in, not retrofitted
- Crisis Detection Theater: Always-visible baseline before adding smart detection

**Stack elements:** Next.js 16 + Supabase + shadcn/ui + Tailwind CSS 4

**Research flags:** Standard patterns, well-documented (skip research-phase)

---

### Phase 2: Resource Directory + ETL Pipeline

**Rationale:** Screening results point to directory, so need it populated before end-to-end screening works. Building directory first (simpler than screening) provides working feature to show stakeholders while complex eligibility engine is built. Critically, this phase MUST include data verification systems before importing 85K+ records to avoid data quality death spiral.

**Delivers:**
- ETL pipeline to import organization data (vet_org_directory, veteran-business-db)
- Data verification system (automated phone checks, website crawling, email validation)
- Database schema with freshness tracking (last_verified_date, verification_method, confidence_score)
- Search UI with filters (benefit type, user type, state, veteran-focused)
- PostgreSQL full-text search with GIN indexes
- Organization detail pages
- Directory admin UI for manual verification workflow

**Addresses features:**
- Resource directory with search & filters (table stakes)
- State-specific resources (Kentucky focus) (table stakes)
- Organization directory 85K+ orgs (differentiator)
- Veteran-owned business directory (differentiator)

**Avoids pitfalls:**
- Data Quality Death Spiral: Automated verification BEFORE import, not after
- State Rules Hardcoded: State as first-class entity in data model

**Stack elements:** Prisma for ETL (batch operations), Drizzle for app queries, PostgreSQL full-text search with ts_vector/ts_rank, csv-parse for streaming large files

**Research flags:**
- **Needs research:** ETL pipeline for 85K+ records (batch processing, progress tracking, error handling)
- Standard patterns: PostgreSQL full-text search, Next.js API routes

---

### Phase 3: Core Screening MVP

**Rationale:** Most complex feature with highest value. Benefits from directory already populated for testing end-to-end flow. Multi-step intake with conditional logic is well-documented pattern (React Hook Form + Zod + Zustand). JSON-based eligibility engine is proven pattern from NYC Benefits Platform.

**Delivers:**
- Multi-step screening intake (step-1, step-2, step-3, review)
- Role toggle (veteran vs. caregiver) with separate question flows
- Conditional question logic (show/hide based on previous answers)
- Session persistence (Zustand + LocalStorage)
- JSON-based eligibility rules engine
- Program rules for 10-15 core Kentucky programs
- Results page with matched programs (linked to directory)
- Confidence scoring ("Likely Eligible" vs. "Possibly Eligible")
- Documentation checklists per program
- Printable results PDF export
- Guest mode (no account required)

**Addresses features:**
- Benefits screening tool mobile-optimized (table stakes)
- Guest mode screening (table stakes)
- Documentation checklists (table stakes)
- Printable results PDF (table stakes)
- Caregiver-specific pathway (table stakes)
- Plain language content <8th grade level (table stakes)

**Avoids pitfalls:**
- False Promise Overmatching: Confidence scoring from day one, conservative matching
- Trauma-Uninformed UX: Calm language, easy undo, save progress, no forced completion
- Mobile Bandwidth Blindness: Performance budget, test on Slow 3G

**Stack elements:** React Hook Form + Zod for validation, Zustand for multi-step state, TanStack Query for fetching rules, date-fns for date calculations

**Research flags:**
- **Needs research:** Kentucky benefits programs (eligibility rules, income thresholds, documentation requirements)
- Standard patterns: Multi-step forms, conditional logic, session persistence

---

### Phase 4: Smart Crisis Detection

**Rationale:** Overlays on screening flow, easier to add after screening works. Cannot be deferred past MVP but builds on Phase 3 foundation. Requires partnership with crisis intervention experts (988 Lifeline, VA crisis line) for pattern validation.

**Delivers:**
- Server-side crisis detection (keyword + pattern matching)
- NLP sentiment analysis on free-text responses
- CrisisIntercept UI component (full-page intervention)
- Real-time monitoring dashboard for 24/7 human oversight
- Crisis event logging and audit trail
- Escalation workflow (automated SMS/call to crisis line if handoff fails)
- Partnership agreements with crisis intervention experts

**Addresses features:**
- Smart crisis detection during screening (differentiator)
- Enhances always-visible crisis resources from Phase 1

**Avoids pitfalls:**
- Crisis Detection Theater: 24/7 human monitoring, tested with real crisis language, backup escalation

**Stack elements:** Server actions for detection, Supabase real-time for monitoring dashboard, Resend for escalation notifications

**Research flags:**
- **Needs research:** Crisis detection patterns (clinical validation, false positive/negative rates, escalation protocols)
- **Partnership required:** 988 Lifeline or VA crisis line for pattern validation and warm handoff

---

### Phase 5: User Accounts + Personalized Dashboard

**Rationale:** Once users find value in screening, they'll want to save results. Trigger: 30%+ users return to site within 30 days. Unlocks engagement features (saved resources, progress tracking, reminders).

**Delivers:**
- User account creation (optional, post-screening)
- Personalized dashboard (screening history, saved resources, action plan progress)
- Saved resources (bookmark organizations and programs)
- Progress tracking (checkboxes for action steps)
- Email/SMS reminders for next steps
- Account settings (contact preferences, notification opt-in/out)

**Addresses features:**
- User accounts & saved resources (differentiator)
- Personalized dashboard with saved resources (differentiator)
- Progress tracking & reminders (differentiator)

**Avoids pitfalls:**
- Trauma-Uninformed UX: Opt-in sharing, privacy defaults, no forced account creation

**Stack elements:** Supabase Auth (already set up in Phase 1), RLS policies for user data, TanStack Query for dashboard data

**Research flags:** Standard patterns (skip research-phase)

---

### Phase 6: Warm Handoff + Referral Tracking

**Rationale:** Requires coordination with external partners, so deferrable while partnerships are established. Research shows 2x higher engagement vs. cold referrals, critical for closing the loop. Cannot ship referrals without basic tracking to avoid black hole pitfall.

**Delivers:**
- Referral state machine (pending → sent → accepted → contacted → completed)
- Partner notification system (email + webhooks)
- Veteran SMS check-ins at 3 and 7 days
- Referral tracking UI (for veterans and staff)
- Partner onboarding workflow (agreements to report outcomes)
- Referral analytics dashboard (completion rate by org)
- Escalation when no contact after 7 days
- Warm introduction email template

**Addresses features:**
- Warm handoff technology (differentiator)
- Closes the loop on referrals

**Avoids pitfalls:**
- Black Hole Referral: Closed-loop tracking with minimum 3 statuses, automated follow-up, outcome reporting requirements

**Stack elements:** Supabase for referral state storage, Resend for email notifications, server actions for state transitions

**Research flags:**
- **Needs research:** Partner integration patterns (webhook specs, consent flows, outcome reporting standards)
- **Partnership required:** Onboard 5-10 community organizations with tracking agreements before launch

---

### Phase 7: Benefits Interaction Warnings + Predictive Eligibility

**Rationale:** Requires deep domain expertise to build rules engine for program interactions. High liability if wrong, so defer until subject matter expert capacity available. Predictive eligibility requires sufficient screening data (5000+ screenings) to identify patterns.

**Delivers:**
- Rules engine for benefit interactions (Program A disqualifies from Program B)
- Income threshold conflict detection
- Timing warnings (apply for X before Y)
- "You may also qualify for..." suggestions based on patterns
- Machine learning model for predictive eligibility (trained on 5000+ screenings)

**Addresses features:**
- Benefits interaction warnings (differentiator)
- Predictive eligibility suggestions (differentiator)

**Avoids pitfalls:**
- False Promise Overmatching: Conservative warnings, clear disclaimers, requires SME validation

**Stack elements:** Zod for interaction rule schemas, potentially pgvector for similarity matching

**Research flags:**
- **Needs research:** Kentucky benefits interaction rules (SNAP + Medicaid, SSI + SSDI, state-specific conflicts)
- **SME required:** Benefits counselor to audit interaction logic before launch

---

### Phase Ordering Rationale

**Why this order:**
1. **Foundation first (Phase 1)** — Database schema and RLS cannot be changed easily later; crisis resources are safety requirement
2. **Directory before screening (Phase 2)** — Screening results link to directory, need it populated; simpler to build than eligibility engine
3. **Screening after directory (Phase 3)** — Most complex feature, benefits from directory already working for end-to-end testing
4. **Crisis detection after screening (Phase 4)** — Overlays on screening flow, cannot be MVP but builds on Phase 3
5. **Accounts after validation (Phase 5)** — Only add when users return (30%+ within 30 days); don't force account creation upfront
6. **Referrals require partnerships (Phase 6)** — External coordination takes time; can launch without and add incrementally
7. **Advanced features last (Phase 7)** — Requires domain expertise + data; defer until SME capacity and sufficient screening volume

**How this avoids pitfalls:**
- Phase 1 encryption + RLS avoids HIPAA Scope Creep
- Phase 2 verification systems avoid Data Quality Death Spiral
- Phase 3 confidence scoring avoids False Promise Overmatching
- Phase 4 human monitoring avoids Crisis Detection Theater
- Phase 6 closed-loop tracking avoids Black Hole Referral
- All phases: WCAG compliance avoids Accessibility Theater
- All phases: Configuration-driven avoids State Rules Hardcoded

**How this groups features:**
- Phases 1-3 = MVP (can serve one veteran with immediate needs)
- Phases 4-5 = Engagement (convert one-time users to returning users)
- Phases 6-7 = Advanced (force multipliers, requires partnerships/SMEs)

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 2 (Resource Directory):** ETL pipeline for 85K+ records — batch processing, incremental load, progress tracking, error handling, data validation with Zod
- **Phase 3 (Core Screening):** Kentucky benefits programs — eligibility rules, income thresholds, categorical requirements, documentation lists, state-specific variations
- **Phase 4 (Crisis Detection):** Crisis detection patterns — clinical validation, false positive/negative rates, escalation protocols, partnership requirements with 988/VA
- **Phase 6 (Warm Handoff):** Partner integration — webhook specs, consent flows, outcome reporting standards, onboarding agreements
- **Phase 7 (Benefit Interactions):** Kentucky benefits interaction rules — SNAP + Medicaid conflicts, SSI + SSDI coordination, state-specific program interactions

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Next.js + Supabase setup, RLS policies, authentication flows — official documentation is comprehensive
- **Phase 5 (User Accounts):** User dashboard, saved resources — standard CRUD operations with existing auth from Phase 1

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations verified via official docs (Next.js, Supabase, shadcn/ui). Version compatibility confirmed. No experimental dependencies. Biome and Vitest are 2026 standard per web search. |
| Features | MEDIUM | Table stakes confirmed across VA.gov, 211 platforms, Military OneSource. Differentiators based on 2026 trends (warm handoff 2x effectiveness, smart crisis detection). Anti-features validated via documented failures. Some features (peer matching, offline PWA) marked LOW complexity in FEATURES.md but HIGH in practice. |
| Architecture | MEDIUM-HIGH | JSON-based rule engine verified via NYC Benefits Platform case study. Crisis detection patterns verified via Nature Digital Medicine study (97.5% accuracy). Warm handoff verified via AHRQ guidelines and PMC effectiveness study (2x improvement). Next.js + Supabase patterns verified via official docs. Scaling considerations based on documented thresholds (PostgreSQL full-text search struggles >100K rows). |
| Pitfalls | MEDIUM | Critical pitfalls sourced from documented VA system failures (2025-2026 EHR errors, AI safety oversight gaps), 211 platform data quality issues, and benefits screening false positive rates. Recovery costs estimated based on HIPAA violation penalties ($100-$50K per record), ADA compliance requirements (2026 federal mandate), and breach notification requirements. Some solutions (automated verification, closed-loop tracking) are best practices, not proven in this exact context. |

**Overall confidence:** MEDIUM-HIGH

**Why not HIGH:** Features research relies heavily on web search (not official docs), some complexity estimates may be optimistic, Kentucky-specific benefits rules need validation with local SMEs, crisis detection partnerships assumed but not confirmed, warm handoff effectiveness based on healthcare studies (may not translate exactly to veteran services).

**Why not LOW:** Stack recommendations are rock-solid (official docs), architecture patterns proven in production (NYC Benefits Platform, VA.gov), critical pitfalls documented in government reports, HIPAA/accessibility requirements are regulatory facts.

### Gaps to Address

**Domain-specific gaps needing validation during implementation:**

1. **Kentucky benefits eligibility rules** — Research provides general framework (income thresholds, categorical requirements) but not specific rules for Kentucky Medicaid expansion, HCBS waivers, state veteran benefits. Need SME consultation or state benefits administration partnership in Phase 3 planning.

2. **Crisis detection pattern validation** — Research shows NLP-based detection is feasible (97.5% accuracy in studies) but specific keyword/sentiment patterns for veteran population need clinical validation. Must partner with 988 Lifeline or VA crisis line in Phase 4 planning, cannot rely solely on general mental health patterns.

3. **Referral partner integration specs** — Research shows closed-loop tracking requires partner cooperation (outcome reporting, webhook/API) but specific integration patterns depend on which Kentucky organizations are onboarded. Need to survey 10-15 potential partners in Phase 6 planning to understand their technical capabilities (email-only? fax? API?).

4. **HIPAA applicability determination** — Research identifies HIPAA risk but actual legal status depends on whether Active Heroes acts as VA business associate or standalone platform. Need legal consultation before Phase 1 architecture decisions, cannot guess.

5. **Data verification automation feasibility** — Research recommends automated phone verification and website crawling for 85K+ organizations, but reliability unknown. May need higher ratio of manual verification than expected. Need pilot test with 1000 records in Phase 2 planning to measure automation success rate.

6. **State expansion timeline** — Architecture assumes multi-state from day one (configuration-driven rules), but research doesn't clarify when expansion is planned. If Kentucky-only for 12+ months, some complexity could be deferred. Need product roadmap alignment to determine if state abstraction is truly Phase 1 requirement.

**Technical gaps needing validation during implementation:**

1. **PostgreSQL full-text search performance at 85K+ rows** — Research shows it works for 200M+ rows with proper indexing, but faceted filtering + ranking + pagination may struggle. Need load testing in Phase 2 with realistic query patterns. Have Typesense migration path ready if search performance degrades.

2. **Eligibility engine rule complexity ceiling** — JSON-based rules work for simple conditions (age, income, categorical) but research doesn't address deeply nested logic (e.g., "eligible IF (disabled AND income <X) OR (caregiver AND veteran is disabled)"). May need to upgrade to Drools-like DSL if rule complexity exceeds JSON expressiveness. Monitor in Phase 3.

3. **Mobile performance budget achievability** — <500KB initial load target is aggressive for Next.js + React 19 + shadcn/ui. Research shows it's possible with code splitting and tree-shaking, but need performance testing in Phase 1 to confirm bundle size. May need to defer some shadcn/ui components or implement lazy loading.

**Process gaps needing resolution:**

1. **24/7 crisis monitoring staffing** — Research is clear this is required, but research doesn't address how to staff it (in-house? outsource to crisis line? volunteer network?). Need operational planning before Phase 4 launch, cannot ship crisis detection without this resolved.

2. **Data verification workflow ownership** — Research recommends monthly verification of database subset, but who does this work? Need to budget staff time (estimate 20 hours/month for 1000 records) or partner with 211 platform for shared verification. Resolve in Phase 2 planning.

3. **Benefits counselor SME access** — Research recommends SME audit of eligibility logic, but where to find these experts? VA benefits counselors? State workforce development? VSOs? Need to identify and onboard SME before Phase 3 launch, budget consultation fees.

---

## Sources

All sources aggregated from individual research files (STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md). Full citations available in respective files.

### Primary Sources (HIGH confidence)

**Technology stack:**
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16) — Turbopack, React Compiler
- [TypeScript 5.8 Announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/) — Latest features
- [Supabase Documentation](https://supabase.com/docs/guides/database/overview) — Database, Auth, Storage, RLS
- [shadcn/ui Documentation](https://ui.shadcn.com/docs) — Component library, WCAG 2.2 AA
- [Vercel Next.js Support](https://vercel.com/docs/frameworks/full-stack/nextjs) — Deployment, Node.js versions

**Architecture patterns:**
- [NYC Benefits Platform Screening API](https://screeningapidocs.cityofnewyork.us/) — JSON-based eligibility engine
- [Digital Government Hub: NYC Benefits Platform Case Study](https://digitalgovernmenthub.org/examples/nyc-benefits-platform-eligibility-screening-api/) — Rule-based matching
- [Supabase with Next.js Official Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) — RLS patterns

**Crisis detection:**
- [Nature Digital Medicine: NLP Crisis Detection System](https://www.nature.com/articles/s41746-023-00951-3) — 97.5% accuracy, 10-minute triage
- [PMC: Early Detection of Mental Health Crises](https://pmc.ncbi.nlm.nih.gov/articles/PMC11433454/) — 89.3% accuracy, 7.2-day early detection

**Warm handoff:**
- [AHRQ: Warm Handoff Intervention](https://www.ahrq.gov/patient-safety/reports/engage/interventions/warmhandoff.html) — Official guidelines
- [PMC: Increasing Warm Handoffs with QI Methodology](https://pmc.ncbi.nlm.nih.gov/articles/PMC8202298/) — 2x effectiveness improvement

**Pitfalls (VA failures):**
- [VA staff flag dangerous EHR errors ahead of 2026 expansion](https://www.spokesman.com/stories/2025/dec/03/va-staff-flag-dangerous-errors-ahead-of-new-health/) — EHR modernization failures
- [VA's AI Tools Lack Patient Safety Oversight](https://www.military.com/benefits/veterans-health-care/vas-ai-tools-lack-patient-safety-oversight-watchdog-warns.html) — Crisis detection without safety
- [Veterans disability benefits errors](https://www.newsweek.com/veterans-disability-benefits-errors-11092952) — Eligibility calculation mistakes

**Accessibility compliance:**
- [ADA Title II Digital Accessibility 2026: WCAG 2.1 AA](https://www.sdettech.com/blogs/ada-title-ii-digital-accessibility-2026-wcag-2-1-aa) — Federal mandate
- [Government websites face 2026 accessibility crackdown](https://www.audioeye.com/post/government-websites-face-2026-accessibility-crackdown-here-s-how-to-prepare-/) — 307 violations/page average

### Secondary Sources (MEDIUM confidence)

**Features & UX:**
- [Looking Ahead: How Veteran Support Will Evolve Into 2026](https://www.operationfamilyfund.org/looking-ahead-how-veteran-support-will-evolve-into-2026/) — 2026 trends
- [Top 7 Veteran Services Management Software in 2026](https://belldatasystems.com/blog/veteran-solutions/top-veteran-services-software/) — Platform components
- [211 Platforms](https://211sandiego.org/military-veterans/) — Resource directory patterns
- [National Resource Directory](https://nrd.gov/) — Directory UX patterns

**Referral tracking:**
- [Closed-Loop Referrals: Why 65% Fail & How to Fix It](https://www.planstreet.com/closed-loop-referrals-guide) — Failure rates
- [California HRSN Service Delivery Mandate](https://company.findhelp.com/blog/2025/03/27/california-hrsn-service-delivery/) — July 2025 closed-loop requirements

**Benefits screening:**
- [Auditing Government Benefits Screening Tools](https://digitalgovernmenthub.org/wp-content/uploads/2024/02/Exposing-Error-in-Poverty-Management-Technology-A-Method-for-Auditing-Government-Benefits-Screening-Tools.pdf) — False positive rates

**HIPAA compliance:**
- [HIPAA Security Rule Cybersecurity Strengthening](https://www.federalregister.gov/documents/2025/01/06/2024-30983/hipaa-security-rule-to-strengthen-the-cybersecurity-of-electronic-protected-health-information) — 2025 updates
- [Top HIPAA Compliance Challenges in 2025](https://www.hipaavault.com/resources/hipaa-compliance-challenges-2025/) — Encryption failures

**Data quality:**
- [United Way's National 211 Data Platform](https://openreferral.org/united-way-worldwides-national-211-data-platform-bringing-people-and-services-together/) — Interoperability challenges
- [Nonprofit Data Best Practices in 2025](https://teamheller.com/resources/blog/nonprofit-data-best-practices-in-2025) — 54% cite incomplete data

### Tertiary Sources (LOW confidence, needs validation)

- [State Management in 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns) — Zustand vs Redux
- [Drizzle vs Prisma 2026](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma) — ORM comparison
- [Biome vs ESLint 2026](https://pockit.tools/blog/biome-eslint-prettier-migration-guide/) — Migration guide
- [date-fns vs Luxon vs Day.js](https://www.dhiwise.com/post/date-fns-vs-dayjs-the-battle-of-javascript-date-libraries) — Date library comparison

---

*Research completed: 2026-02-15*
*Ready for roadmap: yes*
*Files synthesized: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*
*Next step: Orchestrator proceeds to roadmap planning with gsd-roadmapper agent*
