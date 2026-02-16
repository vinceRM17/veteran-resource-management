# Roadmap: Veteran Resource Management

**Project:** Veteran Resource Management Platform
**Depth:** Standard
**Phases:** 7
**Coverage:** 45/45 v1 requirements mapped

## Overview

This roadmap delivers a comprehensive veteran resource platform that connects veterans, caregivers, and families to benefits, resources, and support. The structure prioritizes crisis safety and benefits screening as core value, with resource directory providing the match engine, followed by engagement features (accounts, self-service, peer connection). Each phase delivers a complete, verifiable capability that brings veterans closer to the resources they need.

## Phases

### Phase 1: Foundation + Crisis Safety

**Goal:** Platform is secure, accessible, and always safe — veterans can access crisis resources immediately on every page.

**Dependencies:** None (project foundation)

**Requirements:** FOUND-01, FOUND-02, FOUND-03, FOUND-04, CRISIS-01

**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffold + accessible layout shell + crisis banner (FOUND-01, FOUND-04, CRISIS-01)
- [ ] 01-02-PLAN.md — Supabase auth + database schema + RLS policies (FOUND-02, FOUND-03)

**Success Criteria:**
1. User can load the homepage on Slow 3G connection (<500KB initial load, <3 seconds)
2. User can navigate entire site with keyboard only (Tab, Enter, Escape) without mouse
3. User can authenticate with email/password or Google OAuth and stay logged in across sessions
4. User can see crisis resources (988 Lifeline, Crisis Text Line, VA Crisis Line) on every page via sticky banner
5. Veteran data stored in database is protected by Row-Level Security (unauthorized queries return empty results)

---

### Phase 2: Resource Directory + Data Pipeline

**Goal:** Veterans can search and discover 90K+ organizations and businesses that serve them, with confidence the data is current.

**Dependencies:** Phase 1 (database schema, authentication)

**Requirements:** DIR-01, DIR-02, DIR-03, DIR-04, DIR-05, DIR-06, DATA-01, DATA-02, DATA-03, DATA-04

**Plans:** 4 plans

Plans:
- [ ] 02-01-PLAN.md — Database schema (organizations + businesses tables, FTS indexes, RLS) + Organization ETL import (DATA-01, DATA-03, DATA-04)
- [ ] 02-02-PLAN.md — Business ETL import from SQLite (DATA-02, DATA-03)
- [ ] 02-03-PLAN.md — Organization search UI with filters, pagination, and detail pages (DIR-01, DIR-02, DIR-03, DIR-05)
- [ ] 02-04-PLAN.md — Business search UI, documentation checklists, site navigation (DIR-04, DIR-06)

**Success Criteria:**
1. User can search across 85K+ veteran organizations using full-text search (finds "mental health" in descriptions, services, tags)
2. User can filter directory by benefit type, state, veteran-focused status, and service category (multiple filters combine with AND logic)
3. User can view organization detail page showing contact info, services offered, last verified date, and confidence score
4. User can search 5,500+ veteran-owned businesses by industry and location
5. ETL pipeline imports data from vet_org_directory and veteran-business-db without manual intervention
6. Database rejects invalid records during import (missing required fields, malformed phone numbers, invalid URLs)
7. Each organization record shows verification freshness (last_verified_date within 6 months = green, older = yellow/red)

---

### Phase 3: Core Screening + Eligibility Engine

**Goal:** Veterans complete a screening questionnaire and receive personalized, ranked list of programs they qualify for with clear next steps.

**Dependencies:** Phase 2 (resource directory must be populated for screening results to link to organizations)

**Requirements:** SCREEN-01, SCREEN-02, SCREEN-03, SCREEN-04, SCREEN-05, SCREEN-06, SCREEN-07, SCREEN-08, SCREEN-09, ELIG-01, ELIG-02, ELIG-03, ELIG-04, ELIG-05

**Plans:** 4 plans

Plans:
- [ ] 03-01-PLAN.md — Database schema (eligibility_rules + screening_results tables) + screening content + Zod schemas + seed data
- [ ] 03-02-PLAN.md — Zustand screening store + 5-step multi-step form UI with conditional logic and persistence
- [ ] 03-03-PLAN.md — Eligibility rules engine (json-rules-engine) + confidence scoring + unit tests
- [ ] 03-04-PLAN.md — Submission server action + results page + PDF export + RLS updates + end-to-end verification

**Success Criteria:**
1. User can complete 5-7 question screening without creating an account (guest mode)
2. User selects "I am a veteran" or "I am supporting a veteran" and sees role-appropriate questions
3. User answers questions with conditional logic (e.g., "Are you a caregiver?" → Yes → caregiver-specific questions appear)
4. User can close browser mid-screening and resume from same step when returning (session persistence)
5. User sees screening results with matched programs ranked by confidence ("Likely Eligible" vs "Possibly Eligible")
6. User can export results as PDF showing matched programs, required documentation, and next steps
7. Screening content reads at 6th-8th grade level (tested with readability tool)
8. Caregiver-specific resources (respite care, caregiver benefits) surface only when caregiver role selected
9. Rules engine evaluates answers against 10-15 core Kentucky benefit programs stored as JSON in database
10. Each matched program shows confidence score, required documents, and action steps

---

### Phase 4: Smart Crisis Detection

**Goal:** When veteran shows signs of crisis during screening, system immediately interrupts with full-page intervention and connects them to help.

**Dependencies:** Phase 3 (crisis detection monitors screening answers)

**Requirements:** CRISIS-02, CRISIS-03, CRISIS-04

**Plans:** 3 plans

Plans:
- [ ] 04-01-PLAN.md — Database schema (crisis_detection_logs) + crisis keywords + detector + audit logger (CRISIS-02, CRISIS-04)
- [ ] 04-02-PLAN.md — CrisisIntercept component + free-text field + server action integration + end-to-end wiring (CRISIS-02, CRISIS-03)
- [ ] 04-03-PLAN.md — Real-time crisis monitoring dashboard + human review workflow (CRISIS-04)

**Success Criteria:**
1. Server monitors every screening answer for crisis keywords and patterns (e.g., "hopeless", "end it", "no reason to live")
2. When crisis detected, screening flow interrupts with full-page CrisisIntercept component showing 988 Lifeline, Crisis Text Line, and VA Crisis Line with one-click call/text
3. All crisis detection events are logged with timestamp, detected keywords, and user session ID for audit trail
4. Crisis detection dashboard shows real-time alerts for 24/7 human monitoring team

---

### Phase 5: User Accounts + Personalized Dashboard

**Goal:** Veterans create accounts to save screening results, track progress on action steps, and bookmark resources for later.

**Dependencies:** Phase 3 (accounts save screening results)

**Requirements:** ACCT-01, ACCT-02, ACCT-03, ACCT-04

**Plans:** 4 plans

Plans:
- [ ] 05-01-PLAN.md — Database migration (bookmarks, action_items, admin RLS) + session claiming + auth flow updates (ACCT-01)
- [ ] 05-02-PLAN.md — Dashboard page with screening history + Save Results CTA + Header nav update (ACCT-02)
- [ ] 05-03-PLAN.md — Bookmark system (button, server actions, list page) + Action items page with progress tracking (ACCT-03, ACCT-04)
- [ ] 05-04-PLAN.md — Dashboard integration wiring + admin route protection + end-to-end verification

**Success Criteria:**
1. User can create account after completing screening (optional, not forced)
2. User sees personalized dashboard with screening history (past screenings with dates and matched programs)
3. User can bookmark organizations and programs from search results and screening matches
4. User can check off action steps (e.g., "Gather discharge papers", "Call VA eligibility office") and see progress bar
5. User's saved resources and progress persist across devices when logged in

---

### Phase 6: Self-Service Tools

**Goal:** Veterans access evidence-based mental health exercises, transition guides, and checklists for self-directed support.

**Dependencies:** Phase 1 (foundation), Phase 5 (accounts for progress tracking on checklists)

**Requirements:** SELF-01, SELF-02, SELF-03

**Plans:** 2 plans

Plans:
- [ ] 06-01-PLAN.md — Mental health exercise content + transition checklist content + tools landing page + exercise browse/detail pages (SELF-01, SELF-03)
- [ ] 06-02-PLAN.md — Transition checklist pages with progress tracking + header navigation update (SELF-02, SELF-03)

**Success Criteria:**
1. User can browse mental health exercises and guides organized by topic (PTSD, anxiety, sleep, anger management)
2. User can access transition planning checklists for separating service members (180 days, 90 days, 30 days milestones)
3. Self-service content is evidence-based (sourced from VA PTSD Coach, DoD transition resources) and reads at 6th-8th grade level
4. User can track completion of checklist items if logged in

---

### Phase 7: Peer Connection + Benefits Interaction Warnings

**Goal:** Veterans discover verified support groups, events, and opportunities near them, and understand when applying for one benefit might affect another.

**Dependencies:** Phase 2 (organization directory provides verified nonprofit data), Phase 3 (benefits interaction warnings appear in screening results)

**Requirements:** PEER-01, PEER-02, PEER-03, BINT-01, BINT-02, BINT-03

**Verification Model:**
- Registered 501(c)(3) nonprofits are considered verified by default (EIN, IRS data already in directory)
- VA-accredited organizations and government programs are verified by default
- Organizations with public negative indicators (revoked tax-exempt status, Charity Navigator warnings, state AG actions) are flagged or excluded
- Individual peer mentors are NOT listed unless verified through an established program (e.g., VA Peer Support Specialists, certified team leaders from recognized veteran organizations)
- No user-submitted profiles or self-registration as mentors
- Every listing must trace back to a verified organization

**Success Criteria:**
1. User can search for verified support groups, veteran communities, and events by location (ZIP code or city)
2. User can discover opportunities (employment programs, volunteer roles, community activities) from verified organizations filtered by branch and era
3. All listings show verification source (e.g., "Registered 501(c)(3)", "VA Accredited", "Listed by DAV") and organizational backing
4. When screening results include programs with known interactions, user sees warning banner (e.g., "Applying for SSI may affect SNAP eligibility")
5. Warning includes plain-language explanation of the interaction and link to benefits counselor
6. All interaction rules are validated by subject matter expert before going live

---

## Progress

| Phase | Status | Requirements | Completion |
|-------|--------|--------------|------------|
| 1 - Foundation + Crisis Safety | Complete (2026-02-15) | 5 | 100% |
| 2 - Resource Directory + Data Pipeline | Complete (2026-02-16) | 10 | 100% |
| 3 - Core Screening + Eligibility Engine | Complete (2026-02-16) | 14 | 100% |
| 4 - Smart Crisis Detection | Complete (2026-02-16) | 3 | 100% |
| 5 - User Accounts + Personalized Dashboard | Complete (2026-02-16) | 4 | 100% |
| 6 - Self-Service Tools | Planning Complete | 3 | 0% |
| 7 - Peer Connection + Benefits Interaction | Pending | 6 | 0% |

**Total:** 7 phases, 45 requirements

---

*Last updated: 2026-02-16*
*Next: `/gsd:execute-phase 6`*
