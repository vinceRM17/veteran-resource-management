# Veteran Resource Management

## What This Is

A comprehensive, one-stop-shop web application that connects veterans, active duty service members, and their families to benefits, healthcare, housing, education, employment, mental health support, peer connections, financial assistance, and crisis intervention. Built for Active Heroes but designed to be scalable and usable by any veteran organization or directly by veterans nationwide without organizational affiliation.

## Core Value

A veteran in crisis or need can put in their information and immediately feel connected — to programs they qualify for, to people who can help, and to peers who understand what they're going through. **Isolation is the enemy; connection is the mission.**

## Requirements

### Validated

- ✓ Veteran or caregiver can complete a screening questionnaire about their situation and needs — v1.0
- ✓ Screening results return personalized, prioritized list of programs and resources they qualify for — v1.0
- ✓ Unified flow adapts based on "I am a veteran" vs "I am supporting a veteran" toggle — v1.0
- ✓ Searchable directory of 85K+ veteran organizations (imported from vet_org_directory) — v1.0
- ✓ Searchable directory of 5,500+ veteran-owned businesses (imported from veteran-business-db) — v1.0
- ✓ Crisis resources (988 Lifeline, Crisis Text Line, VA crisis line) always visible on every page — v1.0
- ✓ Smart crisis detection during screening — if answers suggest crisis, immediately surface crisis resources — v1.0
- ✓ Self-service tools: exercises, guides, checklists for mental health, PTSD management, transition planning — v1.0
- ✓ Peer connection: surface support groups, events, and opportunities from verified organizations near the user — v1.0
- ✓ User can create an account for ongoing support, saved resources, and progress tracking — v1.0
- ✓ Quick screening path for immediate needs (no account required) — v1.0
- ✓ Caregiver-specific resources surface when caregiver role is selected — v1.0
- ✓ Benefits interaction warnings when one program might affect eligibility for another — v1.0
- ✓ Mobile-responsive web design — v1.0

### Active

- [ ] Warm handoff capability: connect veteran to a real person (case manager, peer mentor) at partnered orgs
- [ ] Nationwide coverage: expand state-specific resources beyond Kentucky to all 50 states
- [ ] Resource categories: healthcare, housing, education, employment, financial assistance, mental health, PTSD, legal, disability, family support (expand beyond current 15 programs)
- [ ] Benefits discovery: VA benefits, state benefits, discounts, donations, special programs (broader coverage)

### Out of Scope

- Native mobile app (iOS/Android) — web-first, mobile app deferred until web is validated
- Real-time chat or messaging between veterans — complexity too high, moderation burden
- Telehealth or direct medical services — this is a connector, not a provider
- Case management system (full CRM) — warm handoff yes, but not a full case management tool
- Content creation / social media features — this is not a social platform
- White-label admin panel for other orgs — scalable architecture yes, but admin tooling deferred
- Application submission to agencies — each agency has own systems/auth
- Real-time benefits dollar calculation — rules too complex, high error rate damages trust
- AI chatbot for benefits questions — AI hallucinates on complex rules
- VA system integration (VBMS) — requires accreditation

## Context

**Current State (v1.0 shipped 2026-02-18):**
- 15,491 lines TypeScript across 202 files
- Tech stack: Next.js 15 + TypeScript, Supabase (PostgreSQL), Tailwind CSS 4, Zustand, nuqs, json-rules-engine
- 7 phases complete: crisis safety, resource directory, screening, crisis detection, accounts, self-service tools, peer connection
- 90K+ organizations and 5,500+ businesses imported via ETL pipelines
- 15 eligibility rules with dual confidence tiers (Likely/Possibly Eligible)
- 5 benefit interaction rules (SSI+SNAP, SSI+Medicaid, VA Disability+SSI, SSDI+SSI, VA Pension+SNAP)
- 36 passing tests
- 8 Supabase migrations (manual application required)

**Existing data assets:**
- `vet_org_directory` — ETL pipeline with 85,289 veteran organizations from 7 federal data sources (IRS BMF, ProPublica, VA VSO, NRD, etc.)
- `veteran-business-db` — 5,567 veteran-owned businesses from SAM.gov and USAspending.gov

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
| Next.js/TypeScript over Python/Streamlit | Production-grade UI needed for public-facing tool; SEO for resource pages; IDD Navigator pattern to build from | ✓ Good — 15K LOC, clean component architecture |
| Supabase for backend | Auth, real-time, storage, PostgreSQL — proven with ArtSpark; scales well | ✓ Good — RLS, real-time crisis dashboard, auth all working |
| Web-first, mobile later | Validate the concept before investing in native apps; responsive design covers mobile use | ✓ Good — responsive design covers mobile |
| Unified veteran/caregiver flow | Single flow that adapts is simpler to build and maintain than two separate paths | ✓ Good — conditional logic cleanly handles role switching |
| Nationwide from day one | Federal VA benefits apply everywhere; state resources can be layered in progressively | ✓ Good — 15 programs seeded, state expansion is configuration |
| Import existing data rather than link | Unified search experience; veterans shouldn't need to know about separate tools | ✓ Good — 90K+ records imported, unified FTS search |
| Always-visible crisis resources + smart detection | Both passive and proactive approaches to crisis — this is life-or-death functionality | ✓ Good — banner + 27 keywords + monitoring dashboard |
| Tailwind CSS 4 with @tailwindcss/postcss | v4 separated PostCSS plugin from core package | ✓ Good — modern CSS, system fonts only |
| json-rules-engine for eligibility | Rules stored as JSON in database, non-developers can update | ✓ Good — 15 rules + 5 interaction rules |
| nuqs for URL state management | Bookmarkable search URLs with type-safe URL state | ✓ Good — all search filters persist in URL |
| Manual Supabase migrations | CLI not installed; manual is documented best practice | ⚠ Revisit — automate for production |
| SHA-256 hash for crisis logs | Avoid storing PHI, HIPAA compliance | ✓ Good — privacy preserved |

---
*Last updated: 2026-02-18 after v1.0 milestone*
