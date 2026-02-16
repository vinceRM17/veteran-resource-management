# Domain Pitfalls

**Domain:** Veteran Resource Management / Social Services Platform
**Researched:** 2026-02-15
**Confidence:** MEDIUM

Research based on documented failures in VA systems (2025-2026), 211 platform implementations, benefits screening tools, and social services platforms. High confidence in critical pitfalls identified through government reports and post-mortems; medium confidence in solutions based on best practices from digital health and crisis intervention fields.

---

## Critical Pitfalls

### Pitfall 1: Data Quality Death Spiral

**What goes wrong:**
Resource database becomes unusable within 6-12 months due to stale contact information, dead links, closed organizations, and changed service offerings. Veterans get excited about a program match, call a disconnected number or visit a closed location, and lose trust in the entire platform. This is the single most common reason veteran service platforms fail their anti-isolation mission.

**Why it happens:**
85K+ organizations with no centralized update mechanism. Nonprofits close, phone numbers change, eligibility rules shift, but nobody updates the database. Importing data is easy; maintaining it is exponentially harder. Organizations assume "someone else" is keeping data current.

**How to avoid:**
- **Phase 1:** Design database schema with data freshness tracking (last_verified_date, verification_method, confidence_score)
- **Phase 2:** Build automated verification (phone number checks, website crawling, email validation) before launch
- **Ongoing:** Human verification workflow where staff systematically verify subset of records monthly
- **Never assume:** Imported data is current; always treat as unverified until contact confirmed

**Warning signs:**
- User feedback mentioning "wrong phone number" or "place was closed"
- Verification timestamps showing records >6 months old for >20% of database
- Referral completion rate dropping over time (indicates dead links)
- No staff time budgeted for ongoing data maintenance

**Phase to address:**
Phase 1 (Database design), Phase 2 (Automated verification), Phase 3+ (Ongoing maintenance workflow)

**Recovery cost:** HIGH — once trust is lost, veterans stop using the platform; rebuilding database credibility takes 6-12 months

---

### Pitfall 2: Crisis Detection Theater (Life-or-Death UX Failure)

**What goes wrong:**
Crisis detection appears to work in demos but fails in production when it matters most. Veterans in mental health crisis use the screening tool, express suicidal ideation in free-text fields or through behavioral patterns, but the system either doesn't detect it, alerts go to unmanned inboxes, or the response is delayed 24-72 hours. VA's own AI tools have been criticized for lacking safety oversight; this mistake literally kills people.

**Why it happens:**
Teams implement keyword detection for "suicide" but miss contextual expressions like "I can't do this anymore" or "my family would be better off." Alerts route to email instead of real-time monitoring. No after-hours coverage. No testing with actual crisis language. Treating crisis detection as a technical feature instead of a clinical intervention requiring 24/7 human oversight.

**How to avoid:**
- **Phase 1:** Partner with crisis intervention experts (988 Suicide & Crisis Lifeline, VA crisis line) during design
- **MVP:** Always-visible crisis resources (sticky header/footer) on every page, never conditional
- **Never ship without:** 24/7 human monitoring for any AI-detected crisis flags (page can't be ready for production without this)
- **Testing:** Use real anonymized crisis language from VA crisis line transcripts (with permission), not developer-imagined scenarios
- **Backup:** If warm handoff fails, automated SMS/call to verified crisis line, not just email to referral partner

**Warning signs:**
- Crisis detection logic only in screening results (should be on every text input field)
- Alert goes to email, not real-time monitoring dashboard
- No documented SLA for crisis response (<5 minutes should be standard)
- Crisis resources only shown after screening complete (too late)
- Testing only with phrases like "I want to kill myself" (obvious cases), not subtle expressions

**Phase to address:**
Phase 1 (Core screening MVP) — this cannot be deferred

**Recovery cost:** CATASTROPHIC — cannot be recovered from; one preventable death destroys organization credibility and morally devastating to team

---

### Pitfall 3: False Promise Overmatching (Eligibility Calculation Errors)

**What goes wrong:**
Screening tool tells veteran "You qualify for 8 programs!" but after spending hours applying, they're denied for 6 of them. Research shows benefits screening tools frequently produce false positives where the tool predicts eligibility but formal determination finds them ineligible. This wastes veterans' time and emotional energy, creating disappointment that drives them away from legitimate help.

**Why it happens:**
Eligibility rules are far more complex than initial logic captures. "Disabled veteran" has 15+ sub-definitions with different income thresholds, asset tests, service-connection requirements, and state-specific variations. Developers implement simplified rules to ship faster. Missing edge cases like: "eligible BUT only if you don't have other insurance" or "eligible BUT 18-month waitlist" or "eligible BUT only in these 3 counties."

**How to avoid:**
- **Phase 1:** Conservative matching by default (only show "Likely Eligible" if confidence >80%, otherwise "Possibly Eligible - requires verification")
- **Phase 2:** Partner with benefits counselors to audit eligibility logic before launch
- **Never:** Present screening results as definitive eligibility determination; always include "pre-screening only, not official determination" disclaimer
- **Transparency:** Show WHY each match was made ("You matched because: disabled veteran status + income under $X")
- **Feedback loop:** Track referral outcomes; if program consistently rejects "matches," tighten eligibility rules

**Warning signs:**
- No distinction between "likely eligible," "possibly eligible," and "definitely eligible"
- Eligibility rules implemented without consultation with actual benefits administrators
- No tracking of referral outcomes (can't measure false positive rate)
- Marketing materials promising "find programs you qualify for" (overpromising)
- Rules engine has <50 total conditions (real eligibility logic has hundreds)

**Phase to address:**
Phase 1 (Core screening logic) — must include confidence scoring from day one

**Recovery cost:** MEDIUM — requires re-auditing all eligibility rules, re-communicating to users, rebuilding trust with referral partners

---

### Pitfall 4: The Black Hole Referral (No Closed-Loop Tracking)

**What goes wrong:**
Platform sends referral to community organization, but there's no mechanism to confirm the veteran actually received services. 65% of traditional referrals fail (research-documented). Veteran calls number, gets voicemail, never calls back. Organization receives referral, attempts contact once, veteran doesn't respond, case closes. Platform shows "referral sent ✓" suggesting success, but veteran received no actual help.

**Why it happens:**
Treating referrals as one-way data transmission instead of two-way accountability relationship. Community organizations have limited capacity, high turnover, and no obligation to report back. Veterans in crisis may not follow through on first contact. Building "send referral" feature is easy; building closed-loop tracking with follow-up reminders and outcome verification is 10x harder.

**How to avoid:**
- **MVP requirement:** Referral tracking with three statuses minimum: Sent, Contact Attempted, Services Delivered
- **Partner onboarding:** Only list organizations that agree to report back on referral outcomes (or at minimum, report "unable to reach client")
- **Veteran side:** Automated SMS check-ins 3 days and 7 days after referral ("Did you connect with [Org]? Reply YES/NO")
- **Escalation:** If no contact after 7 days, resurface other options to veteran + alert human case manager
- **Metrics:** Track referral completion rate by organization; deprioritize or remove organizations with <30% completion

**Warning signs:**
- Referral feature only sends email to organization (no tracking)
- No follow-up mechanism on veteran side
- Success metrics only measure "referrals sent," not "services delivered"
- No contractual obligation for referral partners to report outcomes
- No "backup plan" when primary referral fails

**Phase to address:**
Phase 4 (Referral system) — cannot ship referrals without basic tracking

**Recovery cost:** MEDIUM — requires retroactive outreach to veterans who received failed referrals, rebuilding partner relationships with tracking requirements

---

### Pitfall 5: HIPAA Scope Creep (Privacy Overreach)

**What goes wrong:**
Team assumes all veteran data is HIPAA-protected and over-engineers privacy controls, OR assumes none of it is protected and under-engineers. Reality: some data (service history, basic demographics) is not HIPAA; some data (disability details, mental health screening responses) likely is if connected to healthcare referrals. Misunderstanding scope leads to either building an expensive, unusable fortress OR exposing sensitive data.

**Why it happens:**
HIPAA only applies to "covered entities" (healthcare providers, plans, clearinghouses) and their "business associates." A standalone resource platform may not be covered UNLESS it's acting as a business associate to VA healthcare. If platform stores "protected health information" (individually identifiable health info) for referral purposes, it may trigger HIPAA. Many developers don't understand these boundaries and guess wrong.

**How to avoid:**
- **Phase 0:** Legal consultation to determine actual HIPAA status (covered entity? business associate? neither?)
- **Data minimization:** Don't collect health details unless absolutely required for matching (e.g., don't ask "what's your diagnosis?" when "do you have a service-connected disability?" suffices)
- **Encryption:** Encrypt sensitive fields (disability status, mental health responses) at rest and in transit regardless of HIPAA status (just good practice)
- **Access controls:** Role-based access; staff can only see PII if their job requires it
- **De-identified analytics:** Aggregate screening data for reporting without storing individually identifiable responses

**Warning signs:**
- No legal review of HIPAA applicability before architecture decisions
- Storing detailed medical information not required for service matching
- All staff have full database access (no role-based controls)
- No encryption for sensitive fields
- Privacy policy written by developers instead of legal/compliance

**Phase to address:**
Phase 0 (Pre-development legal review), Phase 1 (Database architecture with proper encryption/access controls)

**Recovery cost:** HIGH if discovered post-launch; potential HIPAA violations carry $100-$50,000 per record fines, requires breach notification, complete re-architecture

---

### Pitfall 6: Accessibility Theater (WCAG Compliance Checkbox)

**What goes wrong:**
Team runs automated accessibility checker (e.g., axe, Lighthouse), fixes flagged issues, declares victory. Real veteran users with disabilities (screen reader users, low vision, motor impairments, cognitive disabilities) cannot actually use the platform. Research shows automated tools only catch ~30% of accessibility issues; the remaining 70% require manual testing with assistive technology.

**Why it happens:**
Treating accessibility as compliance requirement instead of user need. Government sites average 307 violations per page, with 51% failing keyboard navigation. Developers test with mouse only. No actual disabled users in testing. Forms have labels but illogical tab order. Error messages are visible but not announced to screen readers. "Skip to content" link exists but is broken.

**How to avoid:**
- **Phase 1:** WCAG 2.1 AA compliance from day one (not retrofitted later); federal sites must meet this by 2026
- **Every sprint:** Manual testing with screen reader (NVDA/JAWS), keyboard-only navigation, browser zoom to 200%
- **User testing:** Include veterans with disabilities in every round of usability testing (not just final "accessibility audit")
- **Forms especially:** Every form field has label, logical tab order, clear error messages announced to screen readers
- **Content readability:** Plain language (<8th grade reading level), especially for benefits descriptions
- **Crisis resources:** Always keyboard-accessible and screen-reader-friendly (failure here is life-threatening)

**Warning signs:**
- Only using automated accessibility checkers
- No manual testing with screen readers
- "Skip navigation" link is broken or missing
- Form errors not associated with form fields (screen readers can't announce them)
- Developers never disable mouse during testing
- No veterans with disabilities in user testing

**Phase to address:**
Phase 1 (MVP) — accessibility must be built-in, not bolted-on

**Recovery cost:** MEDIUM — requires re-work of existing UI components, potential legal liability (ADA violations), reputational damage in veteran community

---

### Pitfall 7: The VA.gov Overlap Confusion

**What goes wrong:**
Platform duplicates VA.gov services poorly, creating confusion about which platform veterans should use. Veterans bounce between systems, re-entering data, getting conflicting information. Organizations waste resources rebuilding what already exists instead of filling gaps. VA.gov already has benefits calculators, facility locators, health record access — rebuilding these creates worse user experience, not better.

**Why it happens:**
Underestimating VA.gov's existing capabilities or assuming veterans don't know about it. "We can do it better" mentality. Not understanding the platform's role is to COMPLEMENT VA.gov (state/local resources, community organizations, peer connections, crisis intervention) not COMPETE with it.

**How to avoid:**
- **Phase 0:** Audit VA.gov features before building anything; document what exists and what gaps remain
- **Integration over duplication:** Link to VA.gov for federal benefits; focus platform on state-specific programs, community organizations, and warm handoffs
- **Clear positioning:** Platform is "Active Heroes connects you to LOCAL resources and community support" not "get VA benefits"
- **Reduce re-entry:** If veteran has VA.gov login, allow data import (with permission) instead of re-asking disability status, service dates, etc.
- **Navigation:** "For VA benefits, visit VA.gov. For local Kentucky resources and peer support, we can help."

**Warning signs:**
- Building features that exactly match VA.gov functionality (benefits calculator, facility finder)
- No documented "what VA.gov does vs. what we do" comparison
- Marketing materials that suggest replacing VA.gov
- No integration or links to VA.gov
- User testing shows confusion about which platform to use for what

**Phase to address:**
Phase 0 (Product positioning), Phase 1 (Avoid scope creep into VA.gov territory)

**Recovery cost:** LOW if caught early; HIGH if launched with overlapping features (requires product repositioning, user re-education)

---

### Pitfall 8: Mobile Bandwidth Blindness (Rural Veteran Exclusion)

**What goes wrong:**
Platform works beautifully on office WiFi but unusable for rural veterans on limited mobile data. 22.3% of rural Americans lack reliable broadband; veterans in Appalachian Kentucky may only have spotty mobile coverage with data caps. Large images, auto-playing videos, heavy JavaScript bundles make the site too slow or expensive to use.

**Why it happens:**
Developers working on high-speed connections never experience the platform as rural users do. Modern frameworks (React, Next.js) have large JavaScript bundles. Stock photos are high-resolution. Third-party widgets (maps, chat) add bloat. No testing on throttled connections or mobile data.

**How to avoid:**
- **Performance budget:** Page weight <500KB initial load, <2MB total per session
- **Image optimization:** Compress images, lazy load below fold, use modern formats (WebP)
- **Offline-first:** Core screening flow works with intermittent connectivity (save progress locally)
- **Testing:** Use Chrome DevTools throttling (Slow 3G) on every feature before merge
- **Progressive enhancement:** Core functionality works without JavaScript (forms submit, crisis resources visible)
- **Text-first:** Results page is text-based; avoid requiring maps or heavy visualizations

**Warning signs:**
- Lighthouse performance score <80
- JavaScript bundle >1MB
- No testing on throttled connections
- Auto-playing videos or large background images
- Forms don't work without JavaScript
- No image compression pipeline

**Phase to address:**
Phase 1 (MVP) — performance must be designed-in, not optimized later

**Recovery cost:** MEDIUM — requires image re-compression, code splitting, potentially rewriting performance-critical pages

---

### Pitfall 9: State-Specific Rules Hardcoded Everywhere (Scalability Killer)

**What goes wrong:**
"We're only in Kentucky, so we'll just hardcode KY rules." Six months later, wants to expand to Tennessee. Discovers eligibility logic, tax calculators, income thresholds, Medicaid expansion rules, and program names are hardcoded in 47 files. Expansion requires rewriting 30% of codebase. Research on multi-state benefits systems shows tightly coupled architecture makes changes cost-prohibitive.

**Why it happens:**
Optimizing for short-term "ship faster" over long-term scalability. State-specific rules feel like implementation details, not architectural decisions. Developers don't realize that "Kentucky only" is a temporary constraint, not permanent state.

**How to avoid:**
- **Phase 1:** Configuration-driven eligibility engine from day one (rules in JSON/database, not code)
- **Data model:** State/jurisdiction as first-class entity (program table has state_id, not assumed)
- **Content:** Store program descriptions, income limits, contact info in CMS or database, not hardcoded strings
- **Testing:** Write eligibility tests as data (input scenarios + expected results), not hardcoded assertions
- **Rule versioning:** Track when rules change (Kentucky Medicaid expansion rules changed in 2014, will change again)

**Warning signs:**
- Strings like "Kentucky Medicaid" hardcoded in components
- Income thresholds (e.g., "$2,829/month SSI limit") in business logic files
- No state/jurisdiction column in database tables
- Adding new state requires code changes instead of configuration
- Rules engine logic has state-specific if/else blocks

**Phase to address:**
Phase 1 (Database schema and rules engine architecture) — cannot be refactored later without massive cost

**Recovery cost:** HIGH — requires re-architecting rules engine, database migrations, rewriting business logic

---

### Pitfall 10: Trauma-Uninformed UX (Re-Traumatization Through Design)

**What goes wrong:**
Veterans experiencing PTSD, military sexual trauma, or moral injury encounter UX patterns that trigger distress: aggressive CTAs ("APPLY NOW!"), red error messages, permanent actions without undo, forced disclosure of trauma details, or rushed timers. Platform intended to help becomes source of anxiety.

**Why it happens:**
Designers unfamiliar with trauma-informed care principles. Standard UX patterns (urgency, scarcity, forced progression) that work for e-commerce are harmful for crisis services. Collecting unnecessary trauma details "just in case." Not understanding that "help-seeking" can be terrifying for veterans with trust issues from military or VA experiences.

**How to avoid:**
- **Tone:** Calm, supportive, non-urgent language ("When you're ready" vs. "Act now!")
- **Control:** Easy undo, save progress, come back later (no forced completion)
- **Privacy defaults:** Sharing is opt-in, not opt-out; less than 5% of people change default settings
- **Progressive disclosure:** Only ask for details when absolutely needed; don't frontload trauma questions
- **Error handling:** Gentle language ("Let's fix this together" not "Error: Invalid input"), easy correction
- **Content moderation:** If community features exist, clear guidelines and moderation to prevent harmful content
- **Visual design:** Calming colors (blues, greens), adequate whitespace, not visually overwhelming

**Warning signs:**
- Forms collect trauma details not required for matching (e.g., "describe your PTSD symptoms")
- Default settings share user data (should default to private)
- Aggressive CTAs or countdown timers
- No way to save progress and return later
- Red/alarming error messages
- Multi-step flows with no back button
- No consultation with trauma-informed care experts

**Phase to address:**
Phase 1 (UX design) — must be embedded in design system from beginning

**Recovery cost:** MEDIUM — requires UX redesign, content rewrite, user testing with trauma survivors, potential reputational damage

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Import org data without verification | Fast database population (1 week vs. 3 months) | 40-60% stale data within 6 months, loss of user trust | Never — verification pipeline must exist before import |
| Email-based referrals (no tracking) | Ship referral feature in 1 sprint | 65% referral failure rate, no accountability, user frustration | Never for crisis services; maybe acceptable for informational referrals |
| Hardcoded state rules | Ship MVP 2 weeks faster | Cannot expand beyond Kentucky without major rewrite | Acceptable ONLY if documented as tech debt with timeline to refactor |
| Client-side only crisis detection | No backend complexity | Fails if JavaScript disabled, no audit trail, can be bypassed | Never — crisis detection requires server-side validation + human monitoring |
| Skip manual accessibility testing | Ship 40% faster | 70% of accessibility issues undetected, potential ADA violations | Never for government-serving platforms (legal requirement by 2026) |
| Store plaintext sensitive data | No encryption overhead | HIPAA violations ($50K per record), breach liability | Never — always encrypt disability status, health info, SSN equivalents |
| No closed-loop referral tracking | Ship Phase 4 in half the time | Unknown referral success rate, veterans lost in "black hole" | Maybe acceptable in early pilot with <100 users + plan to add tracking |
| Single database for all states | Simpler architecture | Performance degradation at scale, cannot isolate state-specific outages | Acceptable for MVP (<1000 users); must partition before multi-state |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| VA.gov API (Lighthouse) | Assuming all veterans have VA.gov login | Graceful fallback; many veterans don't know about VA.gov or have login issues |
| 988 Crisis Lifeline | Sending data to 988 assumes instant response | 988 is for humans, not API callbacks; always show direct phone number as primary option |
| Community orgs (referrals) | Assuming org has email/API for referrals | Most small nonprofits have phone-only; need PDF/fax fallback |
| SMS notifications | Sending without opt-in | Requires explicit opt-in per TCPA; default to email |
| Google Maps (org locations) | Trusting Google's "open/closed" status | Google data is often wrong for small nonprofits; verify independently |
| Benefits.gov screening | Treating screening result as eligibility determination | Benefits.gov results are pre-screening only, not official determination |
| State Medicaid APIs | Assuming real-time eligibility checks | Most states don't offer APIs; requires screen scraping or manual verification |
| VA health records (FHIR) | Assuming veteran consents to data sharing | Requires explicit consent; many veterans distrust data sharing |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all 85K orgs on map | Map loads slowly or crashes browser | Cluster markers, server-side filtering, paginate results | >5K orgs visible at once |
| Full-text search without indexes | Search takes 5+ seconds | Elasticsearch/Algolia for org search, PostgreSQL full-text for small datasets | >10K searchable records |
| N+1 queries for program eligibility | Screening results page takes 10+ seconds | Eager loading, batch database queries, cache eligibility rules | >50 programs evaluated per user |
| Storing referral history in session | Session size grows until crash | Store in database, session only holds reference ID | >20 referrals per user session |
| Real-time eligibility checks to state APIs | Page timeout waiting for slow API | Async job queue, cache results, show estimated eligibility immediately | >100 concurrent users |
| Unoptimized images in org listings | Mobile data usage spikes, slow page loads | Compress images, lazy load, use CDN with automatic optimization | >100 org cards per page |
| Synchronous email sending in request | Form submission takes 3-5 seconds | Background job queue for emails/SMS | >500 emails/hour |
| Client-side filtering of large datasets | Browser freezes on filter change | Server-side filtering with pagination | >1K records to filter |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing SSN or full DOB | Identity theft if breached; HIPAA violation | Only store last 4 SSN + birth year; use hashed IDs for matching |
| Logging sensitive screening responses | PII in application logs accessible to all developers | Redact health info, disability status, income from logs; audit log access |
| Weak session timeout for sensitive data | Shared computer in library = next person sees previous veteran's results | 15-minute timeout for authenticated sessions; 5 minutes for screening with PII |
| Referral emails with full PII | Email is unencrypted; org staff may forward/store insecurely | Send referral ID only; org logs into portal to see details |
| Public-facing admin panel | Attackers find /admin endpoint, attempt brute force | Separate admin domain or IP whitelist; never /admin on public site |
| No rate limiting on screening | Attacker scrapes all eligibility rules or DDoS screening endpoint | Rate limit by IP: 10 screenings/hour for anonymous, 50/hour for authenticated |
| Unencrypted database backups | Backup stolen from S3 = full PII exposure | Encrypt backups at rest; rotate encryption keys quarterly |
| Third-party tracking scripts on screening | Facebook Pixel or Google Analytics sends disability status to third parties | No tracking on screening/referral pages; only aggregate anonymous analytics |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Asking "Are you a veteran?" first | Non-veterans (family, caregivers) leave immediately | Ask "Who are you helping?" with options: myself, family member, client I serve |
| 20-question screening before results | Cognitive overload; users abandon | Progressive disclosure: ask 3-5 critical questions, show initial matches, refine if needed |
| Showing 47 programs user "qualifies" for | Paralysis by choice; no idea where to start | Rank by priority, show top 3-5 with "See X more programs" expansion |
| Technical benefit names ("HCBS Waiver") | Confusing jargon; users don't recognize programs they need | Plain language ("Home Care Support for Seniors") with official name in small text |
| "Required" fields for optional data | Users enter fake data or abandon | Only mark truly required fields; explain why data is needed |
| No mobile number during screening | Platform cannot send crisis resources or follow-up | Ask for phone during screening with clear "We'll text you a summary + crisis line" value prop |
| Referral sent with no confirmation to user | User doesn't know if it worked; calls helpline to check | Immediate confirmation page + email + SMS with "What happens next" timeline |
| Dead-end "no matches" page | User feels helpless; no next steps | Always show crisis resources + human help option even with no matches |
| Asking for diagnosis details | Invasive; often not needed for matching | Ask functional impact ("Do you need help with daily activities?") not diagnosis |
| Auto-advancing multi-step form | Cognitive pressure; feels rushed | User-controlled "Next" button; show progress bar; allow going back |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Crisis Detection:** Implemented keyword matching BUT missing after-hours human monitoring (24/7 required)
- [ ] **Organization Database:** Imported 85K orgs BUT no verification workflow (40-60% will be stale in 6 months)
- [ ] **Referral System:** Sends email to org BUT no closed-loop tracking (65% of referrals fail without follow-up)
- [ ] **Accessibility:** Passes automated checker BUT not tested with actual screen readers (70% of issues missed)
- [ ] **Eligibility Logic:** Works for simple cases BUT missing edge cases that cause false positives (reduces trust)
- [ ] **Mobile Experience:** Responsive layout BUT not tested on throttled connection (rural veterans excluded)
- [ ] **Privacy:** HIPAA-compliant forms BUT logs contain PII (compliance violation)
- [ ] **State Expansion:** Works in Kentucky BUT rules are hardcoded (cannot scale)
- [ ] **Performance:** Fast with 100 users BUT N+1 queries will break at 1,000 users
- [ ] **Error Handling:** Shows errors BUT messages are technical/alarming (trauma-uninformed)
- [ ] **Data Encryption:** Encrypted in transit BUT plaintext at rest (breach risk)
- [ ] **Backup System:** Automated backups BUT never tested restore (unvalidated DR plan)

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Stale org data discovered | MEDIUM | 1) Pause new referrals to unverified orgs, 2) Run emergency verification campaign (call top 500 orgs), 3) Add "Last verified: [date]" to all listings, 4) Implement ongoing verification workflow |
| Crisis detection failure (veteran harmed) | CATASTROPHIC | 1) Immediate incident response team, 2) Family notification + support, 3) External audit of crisis systems, 4) Implement 24/7 human monitoring before resuming service, 5) Transparency report |
| False positive eligibility (user complaints) | MEDIUM | 1) Add confidence levels to all matches ("Likely" vs "Possibly"), 2) Audit eligibility rules with benefits experts, 3) Email affected users with corrected matches, 4) Track false positive rate by program |
| HIPAA violation discovered | HIGH | 1) Legal counsel immediately, 2) Breach assessment (how many records?), 3) OCR notification if >500 records, 4) User notification per HIPAA rules, 5) Forensic audit, 6) Implement encryption + access controls |
| Accessibility lawsuit | HIGH | 1) Immediate accessibility audit with disabled users, 2) Remediation plan with timeline, 3) Settlement negotiation, 4) Hire accessibility consultant, 5) Ongoing manual testing |
| Referral black hole (no outcomes tracked) | MEDIUM | 1) Survey recent users ("Did you receive services?"), 2) Implement closed-loop tracking retroactively, 3) Partner re-engagement with new tracking requirements, 4) Transparent metrics dashboard |
| Performance degradation at scale | LOW-MEDIUM | 1) Emergency caching for slow queries, 2) Database query optimization, 3) Add application performance monitoring (APM), 4) Horizontal scaling if needed, 5) Performance budget enforcement |
| VA.gov overlap confusion | LOW | 1) Clarify positioning in all marketing, 2) Add "When to use VA.gov vs Active Heroes" guide, 3) Deep-link to VA.gov for federal benefits, 4) User education campaign, 5) Deprecate duplicate features |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Data Quality Death Spiral | Phase 1: Database schema with freshness tracking; Phase 2: Automated + human verification workflow | Measure: % records verified in last 6 months >80%; user complaints about stale data <5% |
| Crisis Detection Theater | Phase 1: Core screening MVP with 24/7 human monitoring and always-visible crisis resources | Measure: Crisis alert response time <5 minutes 99.9% of time; zero missed critical alerts |
| False Promise Overmatching | Phase 1: Eligibility engine with confidence scoring; pre-launch audit with benefits experts | Measure: False positive rate <20%; user satisfaction with match accuracy >70% |
| Black Hole Referral | Phase 4: Closed-loop referral tracking with SMS follow-up and outcome reporting | Measure: Known outcome for >70% of referrals; completion rate >40% |
| HIPAA Scope Creep | Phase 0: Legal review; Phase 1: Encryption + access controls in database design | Measure: Pass HIPAA security assessment; zero compliance violations |
| Accessibility Theater | Phase 1: WCAG 2.1 AA compliance; manual testing with assistive tech every sprint | Measure: Zero critical accessibility issues; successful task completion by disabled users >90% |
| VA.gov Overlap Confusion | Phase 0: Product positioning; Phase 1: Link to VA.gov, don't duplicate | Measure: User survey "I understand when to use this vs VA.gov" >80% |
| Mobile Bandwidth Blindness | Phase 1: Performance budget <500KB; test on Slow 3G every PR | Measure: Lighthouse performance score >80; works on Slow 3G |
| State Rules Hardcoded | Phase 1: Configuration-driven rules engine; state as first-class entity | Measure: Can add new state with zero code changes |
| Trauma-Uninformed UX | Phase 1: Trauma-informed design principles; consultation with care experts | Measure: User feedback "platform felt supportive" >80%; no reports of re-traumatization |

---

## Sources

### VA System Failures & Lessons Learned (HIGH confidence)
- [VA staff flag dangerous EHR errors ahead of 2026 expansion](https://www.spokesman.com/stories/2025/dec/03/va-staff-flag-dangerous-errors-ahead-of-new-health/) — EHR modernization failures causing patient harm
- [VA responds to EHR glitches ahead of renewed 2026 rollouts](https://www.healthcareitnews.com/news/va-responds-reports-ehr-glitches-ahead-renewed-2026-rollouts) — Pattern of IT modernization failures
- [VA's AI Tools Lack Patient Safety Oversight](https://www.military.com/benefits/veterans-health-care/vas-ai-tools-lack-patient-safety-oversight-watchdog-warns.html) — Crisis detection without safety mechanisms
- [Veterans disability benefits errors](https://www.newsweek.com/veterans-disability-benefits-errors-11092952) — Eligibility calculation mistakes
- [VA IT Reform Leading Practices](https://www.gao.gov/products/gao-25-108627) — Lessons learned from modernization
- [Veterans Affairs: Better Communication Needed for Community Care](https://files.gao.gov/reports/GAO-25-107212/index.html) — Organizational duplication and overlap
- [701(b) 5-Year IT Benefits Delivery Modernization Plan](https://digital.va.gov/wp-content/uploads/2024/12/701b-5-Year-IT-Benefits-Delivery-Modernization-Plan-2024-Addendum.pdf) — Incremental modernization over "big bang"

### Crisis Intervention & Suicide Prevention (MEDIUM confidence)
- [VA's AI suicide prevention tools and clinical interventions](https://www.nextgov.com/artificial-intelligence/2025/10/vas-ai-suicide-prevention-tools-arent-meant-replace-clinical-interventions-advocates-want-it-stay-way/408576/) — AI limitations in crisis detection
- [Inside VA's AI effort to uncover veterans at high suicide risk](https://www.nextgov.com/artificial-intelligence/2025/07/inside-vas-yearslong-ai-effort-uncover-veterans-high-risk-suicide/406781/) — 60% of veteran suicides not in VA system
- [Digital suicide prevention tools systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC12234914/) — Usability concerns and crisis detection failures

### 211 Platform & Resource Database Challenges (MEDIUM confidence)
- [United Way's National 211 Data Platform](https://openreferral.org/united-way-worldwides-national-211-data-platform-bringing-people-and-services-together/) — Data quality and interoperability challenges
- [211 Technology Framework](https://register.211.org/files/211%20Technology%20Framework.pdf) — Platform-specific protocols limiting interoperability
- [Data Transformation Challenge Statistics](https://www.integrate.io/blog/data-transformation-challenge-statistics/) — 64% cite data quality as top challenge

### Referral Systems & Warm Handoffs (MEDIUM confidence)
- [Closed-Loop Referrals: Why 65% Fail & How to Fix It](https://www.planstreet.com/closed-loop-referrals-guide) — Black hole referral problem
- [Increasing Warm Handoffs in Primary Care](https://pmc.ncbi.nlm.nih.gov/articles/PMC8202298/) — Best practices for follow-up
- [California HRSN Service Delivery Mandate](https://company.findhelp.com/blog/2025/03/27/california-hrsn-service-delivery/) — July 2025 closed-loop requirements
- [Closed-Loop Referral Implementation Guidance - DHCS](https://www.dhcs.ca.gov/CalAIM/Documents/WIP-CLR-Implementation-Guidance.pdf) — Known closure requirements

### Benefits Screening & Eligibility (MEDIUM confidence)
- [Auditing Government Benefits Screening Tools](https://digitalgovernmenthub.org/wp-content/uploads/2024/02/Exposing-Error-in-Poverty-Management-Technology-A-Method-for-Auditing-Government-Benefits-Screening-Tools.pdf) — False positive rates in screening tools
- [SNAP Payment Error Rates](https://www.congress.gov/crs-product/IF10860) — Eligibility calculation errors

### Multi-State Benefits Systems (MEDIUM confidence)
- [Implementing Benefits Eligibility + Enrollment Systems](https://digitalgovernmenthub.org/publications/implementing-benefits-eligibility-enrollment-systems-key-context/) — State-specific architecture challenges
- [Building Configurable Benefits Platform at Scale](https://medium.com/@harshal.raut/building-a-highly-configurable-benefits-enrollment-platform-at-scale-772c1fdd073d) — Configuration-driven design
- [McKinsey: Better Integrated Eligibility Systems](https://mckinsey.com/industries/public-and-social-sector/our-insights/insights-into-better-integrated-eligibility-systems) — Tech debt in tightly coupled systems

### HIPAA & Privacy Compliance (MEDIUM confidence)
- [HIPAA Security Rule Cybersecurity Strengthening](https://www.federalregister.gov/documents/2025/01/06/2024-30983/hipaa-security-rule-to-strengthen-the-cybersecurity-of-electronic-protected-health-information) — 2025 regulatory updates
- [Top HIPAA Compliance Challenges in 2025](https://www.hipaavault.com/resources/hipaa-compliance-challenges-2025/) — Encryption and authentication failures
- [HIPAA Compliance for AI in Digital Health](https://www.foley.com/insights/publications/2025/05/hipaa-compliance-ai-digital-health-privacy-officers-need-know/) — De-identification risks

### Accessibility (HIGH confidence - government requirements)
- [ADA Title II Digital Accessibility 2026: WCAG 2.1 AA](https://www.sdettech.com/blogs/ada-title-ii-digital-accessibility-2026-wcag-2-1-aa) — Federal mandate by 2026
- [Government websites face 2026 accessibility crackdown](https://www.audioeye.com/post/government-websites-face-2026-accessibility-crackdown-here-s-how-to-prepare-/) — 307 violations per page average
- [Only 5.2% Websites Pass WCAG](https://www.accessibility.works/blog/web-accessibility-compliance-study-report-for-wcag-ada-eaa-compliance/) — 94.8% failure rate
- [WCAG 2025: Trends, Pitfalls & Practical Implementation](https://medium.com/@alendennis77/wcag-in-2025-trends-pitfalls-practical-implementation-8cdc2d6e38ad) — 30% automated detection, 70% manual testing

### Digital Divide & Rural Access (MEDIUM confidence)
- [Closing the Digital Divide: Broadband Access Nationwide](https://www.wesco.com/us/en/knowledge-hub/articles/closing-the-digital-divide-expanding-broadband-access-nationwide.html) — 37% rural population lacks internet
- [Rural broadband statistics](https://www.brookings.edu/articles/why-the-federal-government-needs-to-step-up-their-efforts-to-close-the-rural-broadband-divide/) — 22.3% rural Americans lack terrestrial broadband
- [Redefining digital divide in healthcare](https://pmc.ncbi.nlm.nih.gov/articles/PMC12052546/) — Mobile-only households with data caps

### Trauma-Informed Design (MEDIUM confidence)
- [Trauma-informed design for UX content](https://uxcontent.com/a-guide-to-trauma-informed-content-design/) — Six core principles
- [Trauma-Informed Design: Social Services Website](https://uxpajournal.org/trauma-informed-design-leveraging-usability-heuristics-on-a-social-services-website/) — Default privacy settings, error handling
- [Scoping review of trauma-informed care in design](https://pmc.ncbi.nlm.nih.gov/articles/PMC12304634/) — Safety, choice, control, empowerment

### Nonprofit Data Management (MEDIUM confidence)
- [Nonprofit Data Best Practices in 2025](https://teamheller.com/resources/blog/nonprofit-data-best-practices-in-2025) — 54% identify incomplete data as obstacle
- [Data Management for Nonprofits: Overcoming Challenges](https://doublethedonation.com/data-management-for-nonprofits/) — Stale data, lack of ownership
- [Nonprofit Data Hygiene](https://npoinfo.com/nonprofit-data-hygiene/) — Monthly/quarterly verification cadence

---

*Pitfalls research for: Veteran Resource Management Platform*
*Researched: 2026-02-15*
*Confidence: MEDIUM (HIGH for VA documented failures; MEDIUM for solutions based on best practices)*
