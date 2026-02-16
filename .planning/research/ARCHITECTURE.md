# Architecture Research

**Domain:** Veteran Resource Management Platform
**Researched:** 2026-02-15
**Confidence:** MEDIUM-HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                               │
│  Next.js App Router + React Server Components                           │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Screening  │  │   Resource   │  │    Crisis    │  │    User     │ │
│  │   Intake UI  │  │  Directory   │  │   Detection  │  │   Account   │ │
│  │              │  │     UI       │  │   Intercept  │  │      UI     │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │         │
├─────────┴─────────────────┴─────────────────┴─────────────────┴─────────┤
│                        APPLICATION LAYER                                 │
│  Next.js Server Actions + API Routes                                    │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Eligibility │  │   Search &   │  │    Crisis    │  │   Referral  │ │
│  │    Engine    │  │   Filter     │  │   Detector   │  │   Workflow  │ │
│  │  (JSON Rules)│  │   Service    │  │   (NLP/Rule) │  │   Handler   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │         │
├─────────┴─────────────────┴─────────────────┴─────────────────┴─────────┤
│                          DATA LAYER                                      │
│  Supabase (PostgreSQL + Auth + Storage + Real-time)                     │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐      │
│  │ Programs & │  │  Resource  │  │ Screening  │  │  User Data   │      │
│  │  Benefits  │  │ Directory  │  │  Sessions  │  │  & Profiles  │      │
│  │   (Rules)  │  │  (90K+)    │  │ (Answers)  │  │   (RLS)      │      │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────┘      │
└──────────────────────────────────────────────────────────────────────────┘
           ▲                              ▲
           │                              │
    ┌──────┴──────┐              ┌────────┴──────────┐
    │  ETL Layer  │              │  External APIs    │
    │  Python     │              │  (Crisis Lines,   │
    │  Pipelines  │              │   VA Services)    │
    └─────────────┘              └───────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Screening Intake** | Multi-step form flow with conditional logic, role toggle (veteran/caregiver), session persistence | Next.js App Router pages with React Hook Form or server-validated state |
| **Eligibility Engine** | Rule-based matching of user answers to program criteria, ranking results by relevance | JSON-based rule definitions queried via PostgreSQL functions or in-memory evaluation |
| **Crisis Detector** | Monitor screening answers for crisis indicators (suicidal ideation, violence, homelessness urgency), interrupt flow | Keyword + pattern matching with NLP sentiment analysis, immediate UI intercept |
| **Resource Directory** | Search and filter 90K+ organizations and businesses, faceted filters, full-text search | PostgreSQL full-text search with GIN indexes, paginated API endpoints |
| **Referral Workflow** | Warm handoff coordination, partner org matching, referral tracking | Server actions with email/webhook notifications, referral state machine |
| **User Accounts** | Auth, profile management, saved resources, session history | Supabase Auth + RLS for multi-tenant data isolation |
| **ETL Pipelines** | Import and sync data from vet_org_directory and veteran-business-db | Python scripts with incremental load, scheduled via cron or GitHub Actions |

## Recommended Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes (no auth)
│   │   ├── page.tsx              # Home / landing
│   │   ├── screening/            # Screening flow
│   │   │   ├── intake/           # Multi-step intake
│   │   │   │   ├── step-1/
│   │   │   │   ├── step-2/
│   │   │   │   └── review/
│   │   │   └── results/[id]/     # Results page
│   │   ├── directory/            # Resource directory
│   │   │   ├── organizations/
│   │   │   └── businesses/
│   │   └── crisis/               # Crisis resources (always accessible)
│   ├── (authenticated)/          # Protected routes
│   │   ├── dashboard/
│   │   ├── saved/
│   │   └── profile/
│   ├── api/                      # API routes
│   │   ├── screening/
│   │   │   ├── evaluate/route.ts # Eligibility evaluation
│   │   │   └── crisis/route.ts   # Crisis detection
│   │   ├── directory/
│   │   │   └── search/route.ts   # Resource search
│   │   └── referrals/
│   │       └── create/route.ts
│   └── layout.tsx
│
├── components/                   # React components
│   ├── screening/                # Screening UI components
│   │   ├── QuestionCard.tsx
│   │   ├── StepIndicator.tsx
│   │   └── ConditionalQuestion.tsx
│   ├── results/                  # Results display
│   │   ├── ProgramCard.tsx
│   │   ├── ActionPlan.tsx
│   │   └── ReferralFlow.tsx
│   ├── directory/                # Directory UI
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   └── ResourceCard.tsx
│   ├── crisis/                   # Crisis UI
│   │   ├── CrisisBar.tsx         # Always-visible crisis banner
│   │   └── CrisisIntercept.tsx   # Full-page intervention
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── MainLayout.tsx
│   └── ui/                       # Shared UI components (accessible)
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Select.tsx
│
├── lib/                          # Business logic
│   ├── screening/                # Screening logic
│   │   ├── schema.ts             # Zod schemas for questions
│   │   ├── conditional-logic.ts  # Question visibility rules
│   │   └── session-store.ts      # Session persistence
│   ├── eligibility/              # Eligibility engine
│   │   ├── rules/                # JSON rule definitions
│   │   │   ├── programs/
│   │   │   └── benefits/
│   │   ├── engine.ts             # Rule evaluation
│   │   ├── matcher.ts            # Answer-to-rule matching
│   │   └── ranking.ts            # Result ranking
│   ├── crisis/                   # Crisis detection
│   │   ├── detector.ts           # Crisis pattern matching
│   │   ├── patterns.ts           # Crisis indicators
│   │   └── escalation.ts         # Escalation workflow
│   ├── directory/                # Directory logic
│   │   ├── search.ts             # Full-text search
│   │   ├── filters.ts            # Faceted filtering
│   │   └── geocoding.ts          # Location services
│   ├── referrals/                # Referral system
│   │   ├── workflow.ts           # Referral state machine
│   │   ├── notifications.ts      # Email/webhook dispatch
│   │   └── partners.ts           # Partner org management
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Edge middleware client
│   └── utils/                    # Shared utilities
│       ├── validation.ts
│       ├── formatting.ts
│       └── constants.ts
│
├── types/                        # TypeScript types
│   ├── screening.ts
│   ├── programs.ts
│   ├── directory.ts
│   └── supabase.ts               # Generated from Supabase schema
│
├── content/                      # Static content
│   ├── programs/                 # Program descriptions
│   ├── guides/                   # Self-service guides
│   └── resources/                # Static crisis resources
│
└── middleware.ts                 # Next.js middleware (auth, crisis check)
```

### Structure Rationale

- **Route organization**: Public routes grouped separately from authenticated routes using Next.js route groups. Screening flow is public to reduce friction; saved resources require account.
- **Component hierarchy**: Co-locate components with their features (screening/, results/, directory/) for easier navigation and refactoring.
- **Business logic separation**: All business logic in `lib/` separate from UI components. Makes testing easier and allows logic reuse across API routes and server components.
- **Type safety**: Centralized types in `types/` directory, with Supabase types auto-generated from database schema.
- **Content as code**: Static program descriptions and guides in `content/` for easy editing without code changes.

## Architectural Patterns

### Pattern 1: JSON-Based Rule Engine for Eligibility

**What:** Store program eligibility rules as JSON documents in PostgreSQL, evaluate them server-side against screening answers.

**When to use:** When eligibility rules need to be updated frequently by non-developers (program managers, social workers) and rules are complex but structured (age ranges, income thresholds, categorical requirements).

**Trade-offs:**
- **Pros**: Non-developers can update rules via admin UI; rules are version-controlled in database; faster than external rule engine (Drools); easier to debug than code-based rules
- **Cons**: Less expressive than Drools DSL; complex rules (nested logic) can become verbose; no IDE support for rule authoring

**Example:**
```typescript
// Rule definition (stored in database)
interface ProgramRule {
  programId: string;
  name: string;
  criteria: {
    field: string;          // screening question ID
    operator: "eq" | "gt" | "lt" | "contains" | "in";
    value: any;
  }[];
  scoringWeight: number;    // for ranking results
  requiredDocuments: string[];
}

// Example rule
const snapRule: ProgramRule = {
  programId: "snap",
  name: "Supplemental Nutrition Assistance Program (SNAP)",
  criteria: [
    { field: "household_income", operator: "lt", value: 50000 },
    { field: "household_size", operator: "gt", value: 0 },
    { field: "state", operator: "in", value: ["KY", "TN", "IN"] }
  ],
  scoringWeight: 10,
  requiredDocuments: ["income_proof", "dd214"]
};

// Evaluation engine
function evaluateRule(rule: ProgramRule, answers: Record<string, any>): boolean {
  return rule.criteria.every(criterion => {
    const answerValue = answers[criterion.field];
    switch (criterion.operator) {
      case "eq": return answerValue === criterion.value;
      case "gt": return answerValue > criterion.value;
      case "lt": return answerValue < criterion.value;
      case "contains": return answerValue?.includes(criterion.value);
      case "in": return criterion.value.includes(answerValue);
      default: return false;
    }
  });
}
```

**Source confidence:** MEDIUM (verified via [NYC Benefits Platform API](https://screeningapidocs.cityofnewyork.us/) and [Digital Government Hub case study](https://digitalgovernmenthub.org/examples/nyc-benefits-platform-eligibility-screening-api/))

### Pattern 2: Crisis Detection with Immediate UI Intercept

**What:** Monitor screening answers in real-time for crisis indicators (keywords + sentiment patterns), interrupt the flow with full-page crisis intervention if detected.

**When to use:** When user safety is paramount and immediate intervention is more important than completing the primary flow. Essential for mental health, domestic violence, or suicide risk screening.

**Trade-offs:**
- **Pros**: Can save lives; demonstrates care and urgency; connects users to help immediately; reduces liability
- **Cons**: False positives can frustrate users; requires thoughtful UX (allow user to dismiss and continue); needs human escalation path

**Example:**
```typescript
// Crisis detection patterns
const CRISIS_PATTERNS = {
  suicidalIdeation: [
    /\b(kill myself|end (my|it all)|suicide|not worth living)\b/i,
    /\b(better off dead|no reason to live)\b/i
  ],
  homelessnessUrgency: [
    /\b(evicted|homeless today|sleeping in car|nowhere to go)\b/i
  ],
  domesticViolence: [
    /\b(hitting me|afraid of|threatened to kill)\b/i
  ]
};

// Server-side detection (in API route or server action)
async function checkForCrisis(answers: Record<string, any>): Promise<{
  isCrisis: boolean;
  severity: "high" | "medium" | "low";
  resources: CrisisResource[];
}> {
  const textAnswers = Object.values(answers)
    .filter(v => typeof v === "string")
    .join(" ");

  let isCrisis = false;
  let severity: "high" | "medium" | "low" = "low";

  // Check suicidal ideation (highest priority)
  if (CRISIS_PATTERNS.suicidalIdeation.some(pattern => pattern.test(textAnswers))) {
    isCrisis = true;
    severity = "high";
  }

  // Additional checks...

  if (isCrisis) {
    return {
      isCrisis: true,
      severity,
      resources: await getCrisisResources(severity)
    };
  }

  return { isCrisis: false, severity: "low", resources: [] };
}

// Client-side intercept (triggered by server response)
function CrisisIntercept({ severity, resources }: CrisisInterceptProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          We're Here to Help
        </h1>
        <p className="text-xl mb-6">
          Based on your answers, we want to connect you with immediate support.
        </p>

        {severity === "high" && (
          <div className="bg-red-50 border-2 border-red-600 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2">Crisis Resources</h2>
            <p className="text-lg mb-4">
              If you're in immediate danger or thinking about suicide:
            </p>
            <a
              href="tel:988"
              className="block text-4xl font-bold text-red-600 mb-2"
            >
              Call 988 (Suicide & Crisis Lifeline)
            </a>
            <p className="text-sm">Available 24/7. Free and confidential.</p>
          </div>
        )}

        {/* Additional resources */}

        <button
          onClick={() => continueScreening()}
          className="mt-8 text-blue-600 underline"
        >
          Continue with screening
        </button>
      </div>
    </div>
  );
}
```

**Source confidence:** HIGH (verified via [Nature Digital Medicine study](https://www.nature.com/articles/s41746-023-00951-3) and [PMC crisis detection research](https://pmc.ncbi.nlm.nih.gov/articles/PMC11433454/))

### Pattern 3: Warm Handoff Referral Workflow

**What:** Coordinate transfer of care from screening tool to partnered organization, ensuring veteran is "handed off" to a real person who accepts the referral.

**When to use:** When the platform acts as a connector rather than service provider, and follow-through depends on external partners. Common in healthcare and social services.

**Trade-offs:**
- **Pros**: Increases likelihood of veteran receiving help (2x higher engagement per research); closes referral loop; builds trust with users
- **Cons**: Requires partner coordination; manual follow-up if partners don't respond; privacy/consent complexity

**Example:**
```typescript
// Referral state machine
type ReferralState =
  | "pending"        // Created, not yet sent
  | "sent"           // Sent to partner org
  | "accepted"       // Partner accepted referral
  | "contacted"      // Partner contacted veteran
  | "completed"      // Service delivered
  | "declined"       // Partner declined or veteran opted out
  | "expired";       // No response after 7 days

interface Referral {
  id: string;
  veteranId: string;
  partnerId: string;
  programId: string;
  state: ReferralState;
  metadata: {
    veteranConsent: boolean;
    contactPreference: "phone" | "email" | "text";
    urgency: "immediate" | "high" | "normal";
    notes: string;
  };
  timeline: {
    createdAt: Date;
    sentAt?: Date;
    acceptedAt?: Date;
    contactedAt?: Date;
    completedAt?: Date;
  };
}

// Server action to create warm handoff
async function createWarmHandoff({
  veteranId,
  partnerId,
  programId,
  contactPreference,
  urgency
}: CreateReferralInput) {
  // 1. Verify veteran consent
  const consent = await getConsentStatus(veteranId);
  if (!consent) {
    throw new Error("Veteran consent required for referral");
  }

  // 2. Create referral record
  const referral = await supabase
    .from("referrals")
    .insert({
      veteran_id: veteranId,
      partner_id: partnerId,
      program_id: programId,
      state: "pending",
      metadata: { contactPreference, urgency }
    })
    .select()
    .single();

  // 3. Send notification to partner
  await sendPartnerNotification(partnerId, {
    referralId: referral.id,
    veteranName: "[redacted for privacy]",
    programId,
    urgency,
    contactInfo: await getVeteranContactInfo(veteranId, contactPreference)
  });

  // 4. Update state to "sent"
  await updateReferralState(referral.id, "sent");

  // 5. Schedule follow-up check (7 days)
  await scheduleFollowUp(referral.id, 7);

  return referral;
}

// Partner accepts referral (webhook or API call)
async function acceptReferral(referralId: string, partnerId: string) {
  const referral = await getReferral(referralId);

  // Verify partner ID matches
  if (referral.partner_id !== partnerId) {
    throw new Error("Unauthorized");
  }

  await updateReferralState(referralId, "accepted");

  // Notify veteran that partner is reaching out
  await sendVeteranNotification(referral.veteran_id, {
    message: `${getPartnerName(partnerId)} has accepted your referral and will contact you soon.`,
    referralId
  });
}
```

**Source confidence:** HIGH (verified via [AHRQ warm handoff guidelines](https://www.ahrq.gov/patient-safety/reports/engage/interventions/warmhandoff.html) and [PMC effectiveness study](https://pmc.ncbi.nlm.nih.gov/articles/PMC8202298/))

### Pattern 4: Server-Side Row Level Security (RLS) for Multi-Tenant Data

**What:** Use Supabase RLS policies to enforce data isolation at database level, ensuring veterans can only access their own data even if API/application logic fails.

**When to use:** When handling sensitive user data (healthcare, financial, personal screening answers) and compliance requires defense-in-depth security.

**Trade-offs:**
- **Pros**: Security at database level survives application bugs; prevents data leaks even with SQL injection; makes compliance audits easier
- **Cons**: Adds complexity to database queries; requires careful policy design; can impact performance if policies are complex

**Example:**
```sql
-- RLS policy: Veterans can only read their own screening sessions
CREATE POLICY "Veterans can view own sessions"
ON screening_sessions
FOR SELECT
USING (auth.uid() = veteran_id);

-- RLS policy: Veterans can insert their own sessions
CREATE POLICY "Veterans can create own sessions"
ON screening_sessions
FOR INSERT
WITH CHECK (auth.uid() = veteran_id);

-- RLS policy: Veterans can update only their own sessions
CREATE POLICY "Veterans can update own sessions"
ON screening_sessions
FOR UPDATE
USING (auth.uid() = veteran_id);

-- RLS policy: Service role (server) can read all for admin purposes
CREATE POLICY "Service role can read all sessions"
ON screening_sessions
FOR SELECT
USING (auth.jwt() ->> 'role' = 'service_role');
```

```typescript
// Client-side query (automatically filtered by RLS)
const { data: sessions } = await supabase
  .from("screening_sessions")
  .select("*")
  .order("created_at", { ascending: false });
// Returns ONLY sessions where veteran_id = current user's ID

// Server-side query with service role (bypasses RLS when needed)
const { data: allSessions } = await supabaseAdmin
  .from("screening_sessions")
  .select("*")
  .eq("state", "pending");
// Returns ALL pending sessions (for admin dashboard)
```

**Source confidence:** HIGH (verified via [Supabase official documentation](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) and [Next.js + Supabase best practices 2026](https://anotherwrapper.com/blog/supabase-next-js))

## Data Flow

### Screening Flow (End-to-End)

```
[User visits /screening/intake]
         ↓
[Select role: Veteran / Caregiver]  → Updates session context
         ↓
[Step 1: Basic Info]
  → Server Action: saveProgress(step1Data)
  → Supabase: INSERT INTO screening_sessions
         ↓
[Step 2: Needs Assessment]
  → Conditional questions based on Step 1
  → Crisis detection on each answer
  → If crisis detected:
      → Server Action: checkCrisis(answers)
      → Return: { isCrisis: true, resources }
      → UI: Render CrisisIntercept component
         ↓
[Step 3: Resources & Support]
  → Additional questions
         ↓
[Review & Submit]
  → Server Action: evaluateEligibility(sessionId)
      ↓
  [Eligibility Engine]
      → Load all program rules from database
      → Match rules against screening answers
      → Rank results by relevance score
      → Generate action plan
      ↓
  → Supabase: INSERT INTO screening_results
  → Return: { resultsId, matchedPrograms }
         ↓
[Redirect to /screening/results/[id]]
  → Fetch results from database
  → Display matched programs
  → Show action plan
  → Offer warm handoff options
```

### Resource Search Flow

```
[User visits /directory]
         ↓
[Search: "housing help" + Filters: KY, Veterans Only]
         ↓
[Client submits form]
  → API: GET /api/directory/search?q=housing&state=KY&veteranOnly=true
         ↓
  [Server-side search logic]
    → PostgreSQL full-text search query:
        SELECT * FROM organizations
        WHERE search_vector @@ websearch_to_tsquery('housing')
        AND state = 'KY'
        AND veteran_focused = true
        ORDER BY ts_rank(search_vector, query) DESC
        LIMIT 50;
         ↓
  → Return: { results, total, page }
         ↓
[Client renders results]
  → Pagination links
  → Filter adjustments
```

### Warm Handoff Flow

```
[User clicks "Get Help" on program result]
         ↓
[Consent modal: "Share my info with [Org]?"]
  → User confirms
         ↓
[Server Action: createReferral(programId, partnerId)]
         ↓
  [Referral workflow]
    → INSERT INTO referrals (state: pending)
    → Send email/webhook to partner org
    → UPDATE referrals SET state = 'sent'
    → Schedule follow-up check (7 days)
         ↓
[Partner receives notification]
  → Partner API: POST /api/referrals/[id]/accept
      → UPDATE referrals SET state = 'accepted'
      → Send email to veteran: "Partner will contact you"
         ↓
[Partner contacts veteran]
  → Partner API: POST /api/referrals/[id]/contacted
      → UPDATE referrals SET state = 'contacted'
         ↓
[Service delivered]
  → Partner API: POST /api/referrals/[id]/complete
      → UPDATE referrals SET state = 'completed'
```

### ETL Data Import Flow

```
[Python ETL pipeline runs (scheduled or manual)]
         ↓
[Extract: Fetch from vet_org_directory CSV/Parquet]
  → Read source data
  → Parse and validate
         ↓
[Transform: Normalize data for unified schema]
  → Geocode addresses
  → Categorize by service type
  → Deduplicate
  → Enrich with metadata
         ↓
[Load: Import to Supabase PostgreSQL]
  → UPSERT INTO organizations (on conflict update)
  → Rebuild full-text search indexes
  → Log import statistics
         ↓
[Verification]
  → Check row count
  → Validate constraints
  → Alert if errors
```

## Scaling Considerations

| Scale | Architecture Adjustments | Rationale |
|-------|--------------------------|-----------|
| **0-10K users** | Single Supabase instance, monolithic Next.js app, PostgreSQL full-text search | Simplicity over premature optimization; Supabase handles this easily; GIN indexes make search fast enough |
| **10K-100K users** | Add read replicas for directory search, enable Supabase connection pooling (Supavisor), implement edge caching for static resources | Directory search becomes bottleneck (90K+ records); read replicas offload SELECT queries; connection pooling prevents pool exhaustion |
| **100K-1M users** | Consider dedicated search service (Typesense/Meilisearch) for directory, separate eligibility engine service, implement CDN for all static assets | PostgreSQL full-text search struggles at this scale with complex ranking; eligibility evaluation becomes CPU-bound; CDN reduces origin load |
| **1M+ users** | Horizontal scaling with multi-region Supabase, microservices for eligibility/search/referrals, implement caching layer (Redis) | Geographic distribution needed for latency; service separation allows independent scaling; caching reduces database load |

### Scaling Priorities (What Breaks First)

1. **Directory search (90K+ records)**: PostgreSQL full-text search is fast but ranking faceted queries on 90K rows becomes expensive.
   - **Solution at 10K users**: Add GIN indexes, implement query caching, use read replicas
   - **Solution at 100K users**: Migrate to dedicated search service (Typesense recommended for ease of use)

2. **Eligibility engine (CPU-bound)**: Rule evaluation scales linearly with number of programs × number of answers.
   - **Solution at 10K users**: Cache evaluation results per session, optimize rule matching logic
   - **Solution at 100K users**: Move to separate service with horizontal scaling, implement result caching

3. **Database connections**: Supabase has connection limits; concurrent users exhaust pool.
   - **Solution at 10K users**: Enable Supavisor connection pooling, use serverless-friendly queries
   - **Solution at 100K users**: Implement connection pooling at application level, use read replicas

4. **Crisis detection latency**: NLP-based detection can be slow, blocking screening flow.
   - **Solution at 10K users**: Optimize regex patterns, implement timeout fallback
   - **Solution at 100K users**: Move to async processing with immediate keyword-based fast path

## Anti-Patterns

### Anti-Pattern 1: Storing Screening Rules in Application Code

**What people do:** Hard-code eligibility rules directly in TypeScript/JavaScript code rather than storing as data.

**Why it's wrong:**
- Requires developer + deployment to update rules
- No version history of rule changes
- Can't A/B test different rule configurations
- Program managers can't update rules themselves
- Makes auditing eligibility decisions difficult

**Do this instead:** Store rules as JSON in database, provide admin UI for rule management, version all rule changes.

```typescript
// ❌ DON'T DO THIS
function isEligibleForSNAP(answers: Answers): boolean {
  return answers.household_income < 50000 &&
         answers.household_size > 0 &&
         ["KY", "TN", "IN"].includes(answers.state);
}

// ✅ DO THIS
const snapRule = await supabase
  .from("program_rules")
  .select("*")
  .eq("program_id", "snap")
  .single();

const isEligible = evaluateRule(snapRule, answers);
```

### Anti-Pattern 2: Client-Side Crisis Detection

**What people do:** Run crisis detection logic in browser JavaScript to avoid server round-trip.

**Why it's wrong:**
- Users can bypass detection by disabling JavaScript
- Sensitive crisis patterns exposed in client code
- No audit trail of crisis events
- Can't trigger server-side escalation (email to crisis team)
- Privacy risk if detection logic leaked

**Do this instead:** Always detect crisis server-side, log all crisis events, implement escalation workflow.

```typescript
// ❌ DON'T DO THIS
function checkForCrisis(text: string): boolean {
  const PATTERNS = [/kill myself/i, /end it all/i];
  return PATTERNS.some(p => p.test(text));
}

// ✅ DO THIS
async function checkForCrisis(answers: Record<string, any>) {
  const response = await fetch("/api/screening/crisis", {
    method: "POST",
    body: JSON.stringify({ answers })
  });
  return response.json();
}
```

### Anti-Pattern 3: Single Massive Supabase Query for Directory Search

**What people do:** Try to implement all search, filtering, and pagination in a single complex Supabase query with 10+ filters.

**Why it's wrong:**
- Query becomes unreadable and unmaintainable
- PostgreSQL query planner struggles with many filters
- Can't optimize individual filters independently
- Difficult to debug performance issues
- Tight coupling between UI and database schema

**Do this instead:** Build search service layer that composes filters programmatically, use query builder pattern, implement caching.

```typescript
// ❌ DON'T DO THIS
const { data } = await supabase
  .from("organizations")
  .select("*")
  .textSearch("search_vector", query)
  .eq("state", filters.state)
  .eq("veteran_focused", filters.veteranOnly)
  .in("service_category", filters.categories)
  .gte("established_year", filters.minYear)
  .lte("established_year", filters.maxYear)
  .range(page * limit, (page + 1) * limit - 1)
  .order("relevance_score", { ascending: false });

// ✅ DO THIS
class DirectorySearchService {
  async search(query: string, filters: SearchFilters, page: number) {
    // Build query incrementally
    let queryBuilder = this.supabase
      .from("organizations")
      .select("*");

    // Apply filters conditionally
    if (query) {
      queryBuilder = queryBuilder.textSearch("search_vector", query);
    }
    if (filters.state) {
      queryBuilder = queryBuilder.eq("state", filters.state);
    }
    // ... more filters

    // Cache results
    const cacheKey = this.getCacheKey(query, filters, page);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const { data } = await queryBuilder;
    await this.cache.set(cacheKey, data);
    return data;
  }
}
```

### Anti-Pattern 4: Skipping Row Level Security for Performance

**What people do:** Disable RLS on sensitive tables because "queries are faster without it."

**Why it's wrong:**
- Single application bug can leak all user data
- Violates HIPAA/privacy compliance requirements
- Creates security debt that's hard to fix later
- False sense of performance gain (RLS overhead is minimal with proper indexes)
- No defense-in-depth if API layer compromised

**Do this instead:** Always enable RLS on user data tables, optimize with proper indexes, use service role only when necessary.

```sql
-- ❌ DON'T DO THIS
CREATE TABLE screening_sessions (
  id uuid PRIMARY KEY,
  veteran_id uuid REFERENCES users(id),
  answers jsonb,
  created_at timestamp
);
-- No RLS = any authenticated user can read all sessions

-- ✅ DO THIS
CREATE TABLE screening_sessions (
  id uuid PRIMARY KEY,
  veteran_id uuid REFERENCES users(id),
  answers jsonb,
  created_at timestamp
);

ALTER TABLE screening_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
ON screening_sessions
FOR SELECT
USING (auth.uid() = veteran_id);

-- Add index to optimize RLS policy
CREATE INDEX idx_sessions_veteran ON screening_sessions(veteran_id);
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Supabase Auth** | OAuth providers (Google, Apple) + email/password via Supabase client libraries | Handles session management, JWTs, password reset flows automatically |
| **Supabase Storage** | For uploaded documents (DD-214, income proof) via signed URLs | Enable RLS on storage buckets; auto-delete files after 90 days for privacy |
| **Crisis Line APIs** | Direct links (tel: and sms: protocols); no API integration needed | 988 Lifeline, Crisis Text Line (text HOME to 741741), VA Crisis Line (1-800-273-8255) |
| **VA Benefits API** | Future: Lighthouse API for real-time benefit status | Requires VA partnership; defer to post-MVP |
| **Geocoding** | Google Maps API or Mapbox for address validation and location search | Use for "find resources near me"; implement rate limiting and caching |
| **Email** | Supabase Edge Functions + Resend/SendGrid for referral notifications | Transactional emails only; no marketing emails |
| **Analytics** | Plausible or PostHog (privacy-friendly) for usage tracking | Avoid Google Analytics due to veteran privacy concerns |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Screening UI ↔ Eligibility Engine** | Server Actions with session ID | UI calls server action with session ID; engine fetches answers from database; returns results |
| **Directory UI ↔ Search Service** | API Routes (GET /api/directory/search) | Stateless search API; pass all filters as query params; return paginated JSON |
| **Crisis Detector ↔ Screening Flow** | Server Actions with answer streaming | Check each answer in real-time; return crisis flag + resources; UI intercepts immediately |
| **Referral System ↔ Partner Orgs** | Webhooks (partner calls our API) or email | Partner registers webhook URL; we POST referral data; partner responds with accept/decline |
| **ETL Pipelines ↔ Database** | Direct PostgreSQL connection with service role | Python scripts use `psycopg2` or Supabase client; run via GitHub Actions or cron |

## Build Order Implications

Based on architectural dependencies, recommend this build order:

### Phase 1: Foundation (Database + Auth)
1. Set up Supabase project with schema for organizations, programs, users
2. Enable RLS policies
3. Implement authentication flows (Next.js + Supabase Auth)
4. Build basic header/footer with crisis banner

**Why first:** Everything depends on database schema and auth being locked in.

### Phase 2: Resource Directory (Search Before Screening)
1. Import 90K+ records via ETL pipeline
2. Build search UI and API
3. Implement full-text search with filters
4. Add organization detail pages

**Why before screening:** Screening results point to directory; need directory populated to test end-to-end flow. Also simpler than screening (no complex rules).

### Phase 3: Screening & Eligibility Engine
1. Build multi-step intake form
2. Implement JSON rule engine
3. Create program rules for 10-15 core programs
4. Build results page linking to directory

**Why third:** Most complex feature; benefits from having directory already built to reference.

### Phase 4: Crisis Detection
1. Implement keyword + pattern matching
2. Build crisis intercept UI
3. Add logging and escalation workflow
4. Test with realistic scenarios

**Why fourth:** Overlays on screening flow; easier to add after screening works.

### Phase 5: Warm Handoff System
1. Build referral workflow and state machine
2. Implement partner notification system
3. Create referral tracking UI
4. Partner onboarding and testing

**Why last:** Requires coordination with external partners; can launch without it and add incrementally.

## Sources

### Architecture Patterns
- [NYC Benefits Platform Screening API](https://screeningapidocs.cityofnewyork.us/) (eligibility engine patterns)
- [Digital Government Hub: NYC Benefits Platform Case Study](https://digitalgovernmenthub.org/examples/nyc-benefits-platform-eligibility-screening-api/) (rule-based matching)
- [VA Technical Reference Model](https://www.oit.va.gov/services/trm/) (VA system architecture)
- [Top 7 Veteran Services Management Software 2026](https://belldatasystems.com/blog/veteran-solutions/top-veteran-services-software/) (platform components)

### Crisis Detection
- [Nature Digital Medicine: NLP Crisis Detection System](https://www.nature.com/articles/s41746-023-00951-3) (97.5% accuracy, 10-minute triage)
- [PMC: Early Detection of Mental Health Crises through AI](https://pmc.ncbi.nlm.nih.gov/articles/PMC11433454/) (89.3% accuracy, 7.2-day early detection)
- [National Council: Warm Handoffs for Virtual Services](https://www.thenationalcouncil.org/wp-content/uploads/2021/11/Warm-Handoffs-for-In-Person-and-Virtual-Services.pdf)

### Warm Handoff Systems
- [AHRQ: Warm Handoff Intervention](https://www.ahrq.gov/patient-safety/reports/engage/interventions/warmhandoff.html) (official guidelines)
- [PMC: Increasing Warm Handoffs with QI Methodology](https://pmc.ncbi.nlm.nih.gov/articles/PMC8202298/) (2x effectiveness improvement)
- [AAFP: How to Cultivate a Warm Handoff](https://www.aafp.org/pubs/fpm/blogs/inpractice/entry/warm_handoff.html) (clinical best practices)

### Next.js + Supabase Architecture
- [Supabase with Next.js Official Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) (official patterns)
- [Next.js + Supabase Best Practices 2026](https://anotherwrapper.com/blog/supabase-next-js) (server actions + RLS patterns)
- [Building for Scale: Next.js and Supabase](https://theyellowflashlight.com/building-for-scale-why-next-js-and-supabase-are-the-gold-standard-for-modern-saas/) (scalability patterns)
- [Next.js + Supabase: What I'd Do Differently](https://catjam.fi/articles/next-supabase-what-do-differently) (production lessons learned)

### Database & Search
- [PostgreSQL Full-Text Search: 200M+ Row Case Study](https://medium.com/@yogeshsherawat/using-full-text-search-fts-in-postgresql-for-over-200-million-rows-a-case-study-e0a347df14d0) (queries under 1 second)
- [PostgreSQL BM25 Full-Text Search Performance](https://blog.vectorchord.ai/postgresql-full-text-search-fast-when-done-right-debunking-the-slow-myth) (50x speed improvement)
- [When Postgres Stops Being Good Enough for Full-Text Search](https://blog.meilisearch.com/postgres-full-text-search-limitations/) (scaling limitations)

### ETL & Data Pipelines
- [Building ETL Pipeline with Python and PostgreSQL](https://medium.com/@davidaryee360/building-an-etl-pipeline-with-python-and-postgresql-7fc92056f9a3) (best practices)
- [PostgreSQL ETL Tools 2026](https://estuary.dev/blog/loading-data-into-postgresql/) (tooling recommendations)

### Accessibility
- [Next.js Architecture: Accessibility](https://nextjs.org/docs/architecture/accessibility) (official Next.js patterns)
- [WCAG 2.1 AA Compliance Guidelines](https://innowise.com/blog/wcag-21-aa/) (compliance requirements)
- [Next.js and Accessibility Best Practices](https://bejamas.com/hub/guides/next-js-and-accessibility) (practical implementation)

---
*Architecture research for: Veteran Resource Management Platform*
*Researched: 2026-02-15*
*Confidence: MEDIUM-HIGH (verified via official docs, case studies, and production examples)*
