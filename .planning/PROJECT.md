# Veteran Resource Management

## What This Is

A comprehensive, one-stop-shop web application that connects veterans, active duty service members, and their families to every resource they might need — benefits, healthcare, housing, education, employment, mental health support, peer connections, financial assistance, and crisis intervention. Built for Active Heroes but designed to be scalable and usable by any veteran organization or directly by veterans nationwide without organizational affiliation.

## Core Value

A veteran in crisis or need can put in their information and immediately feel connected — to programs they qualify for, to people who can help, and to peers who understand what they're going through. **Isolation is the enemy; connection is the mission.**

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Veteran or caregiver can complete a screening questionnaire about their situation and needs
- [ ] Screening results return personalized, prioritized list of programs and resources they qualify for
- [ ] Unified flow adapts based on "I am a veteran" vs "I am supporting a veteran" toggle
- [ ] Searchable directory of 85K+ veteran organizations (imported from vet_org_directory)
- [ ] Searchable directory of 5,500+ veteran-owned businesses (imported from veteran-business-db)
- [ ] Crisis resources (988 Lifeline, Crisis Text Line, VA crisis line) always visible on every page
- [ ] Smart crisis detection during screening — if answers suggest crisis, immediately surface crisis resources and offer warm handoff
- [ ] Resource categories: healthcare, housing, education, employment, financial assistance, mental health, PTSD, legal, disability, family support
- [ ] Benefits discovery: VA benefits, state benefits, discounts, donations, special programs
- [ ] Self-service tools: exercises, guides, checklists for mental health, PTSD management, transition planning
- [ ] Peer connection: surface support groups, buddy programs, veteran communities near the user
- [ ] Warm handoff capability: connect veteran to a real person (case manager, peer mentor) at partnered orgs
- [ ] User can create an account for ongoing support, saved resources, and progress tracking
- [ ] Quick screening path for immediate needs (no account required)
- [ ] Caregiver-specific resources surface when caregiver role is selected
- [ ] Nationwide coverage: federal VA benefits + state-specific resources for all 50 states
- [ ] Mobile-responsive web design (native mobile app deferred to future)

### Out of Scope

- Native mobile app (iOS/Android) — web-first, mobile app deferred until web is validated
- Real-time chat or messaging between veterans — complexity too high for v1
- Telehealth or direct medical services — this is a connector, not a provider
- Case management system (full CRM) — warm handoff yes, but not a full case management tool
- Content creation / social media features — this is not a social platform
- White-label admin panel for other orgs — scalable architecture yes, but admin tooling deferred

## Context

**Existing data assets:**
- `vet_org_directory` — ETL pipeline with 85,289 veteran organizations from 7 federal data sources (IRS BMF, ProPublica, VA VSO, NRD, etc.). Python/Streamlit, deployed on Streamlit Cloud. Phase 1/3 complete.
- `veteran-business-db` — 5,567 veteran-owned businesses from SAM.gov and USAspending.gov. Python/Streamlit with Turso/SQLite, deployed on Streamlit Cloud. Live.

**Inspiration:**
- IDD Benefits Navigator (`idd-benefits-navigator`) — Next.js/TypeScript screening tool for disability benefits in Kentucky. Rule-based eligibility engine, multi-step intake form, personalized results with action plans. This is the UX pattern to follow.

**The problem:**
Veterans face a fragmented landscape of resources — VA programs, state benefits, nonprofit services, peer support, crisis lines — spread across dozens of websites and agencies. Many veterans don't know what they qualify for. Family members providing care have even fewer resources. The result is isolation, unmet needs, and in worst cases, suicide. This tool consolidates everything into one place and uses screening to surface what's relevant.

**Target users:**
- Veterans (all eras, all branches, all discharge statuses)
- Active duty service members transitioning out
- Family members and caregivers of veterans
- Veteran service organizations (as a tool to serve their communities)

## Constraints

- **Tech stack**: Next.js / TypeScript — production-grade UI, SEO for resource pages, component ecosystem for complex flows
- **Database**: Supabase (PostgreSQL) — auth, real-time subscriptions, storage, row-level security
- **Data integration**: Must import and unify data from existing vet_org_directory and veteran-business-db pipelines
- **Accessibility**: WCAG 2.1 AA compliance — many veterans have disabilities
- **Privacy**: Veteran data is sensitive — encryption at rest, minimal data collection, clear privacy policy
- **Performance**: Must work on low-bandwidth connections (rural veterans, mobile devices)
- **Crisis safety**: Crisis resources must never be more than one click away on any page

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js/TypeScript over Python/Streamlit | Production-grade UI needed for public-facing tool; SEO for resource pages; IDD Navigator pattern to build from | — Pending |
| Supabase for backend | Auth, real-time, storage, PostgreSQL — proven with ArtSpark; scales well | — Pending |
| Web-first, mobile later | Validate the concept before investing in native apps; responsive design covers mobile use | — Pending |
| Unified veteran/caregiver flow | Single flow that adapts is simpler to build and maintain than two separate paths | — Pending |
| Nationwide from day one | Federal VA benefits apply everywhere; state resources can be layered in progressively | — Pending |
| Import existing data rather than link | Unified search experience; veterans shouldn't need to know about separate tools | — Pending |
| Always-visible crisis resources + smart detection | Both passive and proactive approaches to crisis — this is life-or-death functionality | — Pending |

---
*Last updated: 2026-02-15 after initialization*
