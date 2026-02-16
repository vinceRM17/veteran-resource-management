# Phase 7: Peer Connection + Benefits Interaction Warnings - Research

**Researched:** 2026-02-16
**Domain:** Geospatial search, rules engines, trust & safety, benefits interaction modeling
**Confidence:** MEDIUM

## Summary

Phase 7 extends the existing resource directory (Phase 2) and eligibility engine (Phase 3) with two major capabilities: (1) peer connection features that let veterans discover verified support groups, events, and opportunities near them using location-based search, and (2) benefits interaction warnings that flag when applying for one benefit might negatively affect another.

The existing infrastructure provides strong foundations: 85K+ organizations with NTEE codes and location data, json-rules-engine v7 with 15 active Kentucky benefit rules, and Supabase PostgreSQL with full-text search. Location search can be implemented with simple text matching (city/ZIP prefix) or geospatial queries using PostGIS extension. Benefits interaction warnings require extending the rules engine with "conflict" event types that fire when screening results contain incompatible programs.

Trust and safety for peer connections is addressed by the verification model specified in the phase requirements: only 501(c)(3) registered nonprofits, VA-accredited organizations, and government programs are listed (no user-submitted profiles). All 85K+ organizations already have EIN data for verification against IRS databases.

**Primary recommendation:** Use simple text-based location filtering (city/ZIP ILIKE matching) for MVP, add PostGIS ST_DWithin radius search in future phase if demand warrants. Extend existing json-rules-engine with benefits interaction rules that evaluate screening results (not inputs) to detect conflicts like SSI+SNAP income thresholds or Medicaid cliff effects.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| json-rules-engine | 7.3.1 | Benefits interaction rules engine | Already used for eligibility matching (Phase 3), supports complex nested conditions, dynamic facts, and event-based rule firing |
| PostgreSQL | 17+ | Database with geospatial support | Supabase managed PostgreSQL, standard for location-based queries |
| PostGIS (optional) | 3.4+ | Geospatial extension for radius search | Industry standard for PostgreSQL geospatial queries, used by location-based platforms worldwide |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nuqs | 2.8.8 | URL state management for filters | Already used in directory search (Phase 2), handles location/branch/era filters |
| Zod | 4.3.6 | Schema validation for filter inputs | Already used for screening forms (Phase 3), validates ZIP codes and coordinates |
| TypeScript discriminated unions | 5.x | Type-safe event/warning types | Ensures benefit interaction warnings have required fields at compile time |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Text-based location (city/ZIP ILIKE) | PostGIS ST_DWithin radius search | PostGIS: More accurate distance calculations but requires migration, GiST indexes, lat/lng data for all orgs. Text: Simpler MVP, works with existing data. |
| json-rules-engine for interactions | Custom if/else logic | Custom: Faster initially but becomes unmaintainable as interaction rules grow (15+ combinations). Rules engine: Declarative, auditable, versionable. |
| Organizations table filtering | New peer_connections table | New table: More flexible schema but duplicates 85K records. Existing table: Reuses directory data, NTEE code filtering already implemented. |

**Installation:**
```bash
# PostGIS (optional - only if implementing radius search)
# Enable via Supabase Dashboard -> Database -> Extensions
# CREATE EXTENSION IF NOT EXISTS postgis;

# No new npm packages required - all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── peer-connection/
│       ├── page.tsx                    # Peer connection landing page
│       ├── support-groups/page.tsx     # Support groups search
│       ├── events/page.tsx             # Events/opportunities search
│       └── [id]/page.tsx               # Detail page (reuses directory detail)
├── lib/
│   ├── db/
│   │   └── peer-queries.ts             # Location-filtered org queries
│   └── eligibility/
│       ├── interaction-rules.ts        # Benefits interaction rule definitions
│       ├── interaction-detector.ts     # Evaluates results for conflicts
│       └── interaction-types.ts        # TypeScript types for warnings
└── components/
    └── peer-connection/
        ├── location-filter.tsx         # ZIP/city/radius input
        ├── branch-era-filter.tsx       # Military branch and era filters
        └── interaction-warning.tsx     # Warning banner component
```

### Pattern 1: Location-Based Filtering with NTEE Codes
**What:** Filter organizations table by NTEE codes that indicate peer support services (W30 for military/veterans, P20 for human services support groups) and location (city/ZIP text matching or PostGIS radius search)

**When to use:** Discovering support groups, events, and opportunities near a veteran's location

**Example:**
```typescript
// Simple text-based location filtering (MVP approach)
// Source: Based on existing search_organizations RPC function (migration 00003_location_search.sql)

export async function searchSupportGroups(params: {
  location: string;          // City name or ZIP code
  branch?: string;           // Filter by military branch
  era?: string;              // Filter by service era
  type: 'support-groups' | 'events' | 'opportunities';
  page?: number;
}) {
  const supabase = await createClient();

  // NTEE code mapping for peer connection types
  const nteeCodeFilters = {
    'support-groups': ['W30%', 'P20%', 'P40%'],  // Veterans orgs, support groups
    'events': ['W30%', 'A23%'],                   // Veterans orgs, cultural programs
    'opportunities': ['W30%', 'J21%', 'J22%'],   // Veterans orgs, employment, vocational
  };

  const { data, error } = await supabase.rpc('search_peer_connections', {
    filter_location: params.location,
    filter_ntee_codes: nteeCodeFilters[params.type],
    filter_branch: params.branch || null,
    filter_era: params.era || null,
    page_number: params.page || 1,
    page_size: 20,
  });

  return data;
}
```

**Alternative: PostGIS radius search (future enhancement)**
```sql
-- Requires: latitude/longitude columns + GiST index
-- CREATE INDEX organizations_geom_idx ON organizations USING GIST (ST_MakePoint(longitude, latitude));

CREATE OR REPLACE FUNCTION search_peer_connections_radius(
  user_lat NUMERIC,
  user_lng NUMERIC,
  radius_miles INT DEFAULT 25,
  filter_ntee_codes TEXT[] DEFAULT NULL
)
RETURNS TABLE (...) AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM organizations o
  WHERE
    ST_DWithin(
      ST_MakePoint(o.longitude, o.latitude)::geography,
      ST_MakePoint(user_lng, user_lat)::geography,
      radius_miles * 1609.34  -- Convert miles to meters
    )
    AND (filter_ntee_codes IS NULL OR o.ntee_code LIKE ANY(filter_ntee_codes));
END;
$$ LANGUAGE plpgsql;
```

### Pattern 2: Benefits Interaction Detection
**What:** Extend json-rules-engine to evaluate screening results (not inputs) for program conflicts using a second pass after eligibility matching completes

**When to use:** After screening results are generated, before displaying to user

**Example:**
```typescript
// Source: Adapted from existing eligibility engine (src/lib/eligibility/engine.ts)

import { Engine } from 'json-rules-engine';
import type { ProgramMatch } from '@/lib/db/screening-types';

export interface BenefitInteraction {
  type: 'warning' | 'conflict' | 'info';
  programIds: string[];
  title: string;
  description: string;
  recommendation: string;
  learnMoreUrl?: string;
}

export async function detectBenefitInteractions(
  matches: ProgramMatch[],
  userAnswers: Record<string, unknown>
): Promise<BenefitInteraction[]> {
  const engine = new Engine([], { allowUndefinedFacts: true });

  // Add interaction rules
  engine.addRule({
    conditions: {
      all: [
        { fact: 'hasProgram', operator: 'equal', value: 'ssi' },
        { fact: 'hasProgram', operator: 'equal', value: 'snap-ky' },
        { fact: 'householdIncome', operator: 'equal', value: '25k-40k' }
      ]
    },
    event: {
      type: 'benefit-interaction',
      params: {
        type: 'warning',
        programIds: ['ssi', 'snap-ky'],
        title: 'SSI may affect SNAP eligibility',
        description: 'Applying for SSI can push your countable income over SNAP limits. Your SNAP benefits may decrease by $1 for every $3 increase in SSI payments.',
        recommendation: 'Talk to a benefits counselor before applying to understand the total impact on your household.',
        learnMoreUrl: 'https://www.ssa.gov/ssi/text-other-ussi.htm'
      }
    },
    priority: 10
  });

  // Create facts from screening results
  const facts = {
    ...userAnswers,
    matchedProgramIds: matches.map(m => m.programId),
    hasProgram: (programId: string) =>
      matches.some(m => m.programId === programId)
  };

  const { events } = await engine.run(facts);

  return events.map(e => e.params as BenefitInteraction);
}
```

### Pattern 3: Verification Badge Display
**What:** Show verification source and organizational backing for every peer connection listing

**When to use:** All support group cards, event listings, and opportunity results

**Example:**
```tsx
// Source: Adapted from existing OrgCard component pattern

export function PeerConnectionCard({ org }: { org: Organization }) {
  const verificationBadge = getVerificationBadge(org);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{org.org_name}</CardTitle>
          <Badge variant={verificationBadge.variant}>
            {verificationBadge.icon}
            {verificationBadge.label}
          </Badge>
        </div>
        <CardDescription>{org.city}, {org.state}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {org.services_offered}
        </p>
        <div className="text-xs text-muted-foreground">
          <strong>Verified:</strong> {verificationBadge.source}
        </div>
      </CardContent>
    </Card>
  );
}

function getVerificationBadge(org: Organization) {
  if (org.va_accredited) {
    return {
      variant: 'default' as const,
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      label: 'VA Accredited',
      source: 'U.S. Department of Veterans Affairs'
    };
  }
  if (org.ein && org.tax_exempt_status === '501(c)(3)') {
    return {
      variant: 'secondary' as const,
      icon: <Shield className="h-3 w-3 mr-1" />,
      label: 'Verified Nonprofit',
      source: `Registered 501(c)(3) (EIN: ${org.ein})`
    };
  }
  return {
    variant: 'outline' as const,
    icon: <Building className="h-3 w-3 mr-1" />,
    label: 'Listed Organization',
    source: 'Verified via IRS database'
  };
}
```

### Anti-Patterns to Avoid

- **Anti-pattern: Storing duplicate peer connection data in separate table**
  - Why bad: 85K+ organizations already in database with all required fields (name, location, NTEE codes, EIN, verification status). Creating peer_connections table duplicates data and creates sync issues.
  - What to do instead: Filter existing organizations table by NTEE codes (W30, P20, P40, A23, J21, J22) and add peer-specific fields like `peer_connection_types` (TEXT[]) and `service_branch_focus` (TEXT) if needed.

- **Anti-pattern: Client-side distance calculations**
  - Why bad: Inaccurate (Haversine formula assumes perfect sphere, doesn't account for Earth's ellipsoid shape), slow for large datasets, doesn't leverage database indexes.
  - What to do instead: Use PostgreSQL text matching for MVP (city/ZIP ILIKE), upgrade to PostGIS ST_DWithin for production radius search.

- **Anti-pattern: Hard-coding benefit interaction logic in components**
  - Why bad: Business rules scattered across UI code, no audit trail, impossible for SME to review/validate, brittle when interactions change.
  - What to do instead: Store interaction rules in database using same json-rules-engine format as eligibility rules, version them, require SME approval before activation.

- **Anti-pattern: Allowing user-submitted peer mentor profiles**
  - Why bad: Trust & safety nightmare, requires identity verification infrastructure, moderation workflows, liability concerns for platform.
  - What to do instead: Only list peer mentors verified through established programs (VA Peer Support Specialists with certification, DAV chapter leaders, VFW post commanders). Trace every listing back to verified parent organization.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Distance calculations | Custom Haversine formula in TypeScript | PostGIS ST_DWithin with geography type | Edge cases: timezone boundaries, international date line, polar regions, datum transformations. PostGIS handles all correctly. Performance: GiST index speeds up queries 100x vs. sequential scan. |
| Benefits interaction rules | If/else chains in screening results page | json-rules-engine with "conflict" event type | Complexity: 15 programs × 15 programs = 225 possible interactions. Rules engine makes this maintainable. Auditability: SMEs can review JSON rules, can't review nested if/else. Versioning: Rules in database with version numbers, not deployed code. |
| 501(c)(3) verification | Scraping IRS website | IRS Exempt Organizations Business Master File or ProPublica Nonprofit Explorer API | Legal: IRS data is public domain, but scraping violates terms of service. Freshness: Bulk file updated monthly, guaranteed authoritative. Performance: API response < 100ms vs. page scrape 2-5 seconds. |
| ZIP code geocoding | Third-party API calls | Simple ZIP prefix text matching (MVP) or self-hosted PostGIS + TIGER/Line shapefile | Cost: Geocoding APIs charge per request ($0.005-0.05 per lookup). Volume: 85K orgs × monthly updates = $$. Accuracy: Text matching "40206" finds Louisville KY orgs just fine for MVP. Privacy: No external API calls = no PII leakage. |

**Key insight:** Benefits interaction detection is deceptively complex. SSI affects Medicaid eligibility, Medicaid affects SNAP, SNAP cliff effects vary by state, VA disability compensation interacts with SSI differently than SSDI, and all rules change annually with COLA adjustments. Never hand-roll this logic — use rules engine + SME validation workflow + versioning.

## Common Pitfalls

### Pitfall 1: Not Filtering Organizations by Relevant NTEE Codes
**What goes wrong:** Searching all 85K organizations for "support groups" returns irrelevant results like museums, churches, and schools

**Why it happens:** Organizations table has broad NTEE codes. Without filtering to W30 (military/veterans), P20 (support groups), P40 (family services), searches return all orgs with "support" in mission statement.

**How to avoid:** Create NTEE code mapping for each peer connection type:
- Support groups: W30%, P20%, P40% (veterans orgs, support groups, family services)
- Events: W30%, A23%, A24% (veterans orgs, cultural programs, folk arts)
- Opportunities: W30%, J21%, J22% (veterans orgs, vocational counseling, employment services)

**Warning signs:** Search results include organizations that clearly don't provide peer support (food banks, medical clinics, homeless shelters)

### Pitfall 2: Showing Benefit Interactions Before User Completes Screening
**What goes wrong:** Interaction warnings fire during screening based on partial answers, confusing user and potentially discouraging them from completing form

**Why it happens:** Temptation to warn user in real-time as they select programs of interest, but partial data yields false positives (e.g., warning about SSI+SNAP interaction when user hasn't answered income question yet)

**How to avoid:** Run interaction detection ONLY on final screening results after submission. Interaction rules evaluate completed ProgramMatch objects, not raw screening answers.

**Warning signs:** User sees warning banners that disappear when they answer more questions, or warnings that don't apply to their situation

### Pitfall 3: Using Text-Based Location Search Without Normalization
**What goes wrong:** User searches "Louisville" but orgs are stored as "Louisville CDP" or "Louisville Metro" — no results returned despite 50+ matching organizations

**Why it happens:** Location data from IRS/SAM.gov has inconsistent formatting. City names include suffixes (CDP, Metro, Town of), abbreviations (St. vs Saint, Ft. vs Fort), and typos.

**How to avoid:**
1. Normalize location data during ETL import (strip suffixes, expand abbreviations, title case)
2. Use ILIKE with wildcards: `city ILIKE '%Louisville%'` instead of `city = 'Louisville'`
3. Consider full-text search on city column: `to_tsvector('english', city) @@ websearch_to_tsquery('english', $1)`

**Warning signs:** User searches known city name, gets "No results found" despite orgs existing in database

### Pitfall 4: Not Handling Benefits Cliff Effects in Interaction Warnings
**What goes wrong:** Warning says "SSI may affect SNAP" but doesn't explain cliff effect: earning $1 more can lose $500/month in benefits

**Why it happens:** Generic interaction rules don't account for income thresholds and phase-out rates. User sees warning but doesn't understand severity.

**How to avoid:** Interaction rules must include:
- Threshold values (e.g., "130% FPL for SNAP gross income limit")
- Phase-out rates (e.g., "SNAP decreases $1 for every $3 earned")
- Cliff points (e.g., "Medicaid terminates entirely above 138% FPL")
- Household size dependencies (e.g., "Limits vary by household size")

**Warning signs:** User feedback: "The warning wasn't helpful, I still don't know what will happen"

### Pitfall 5: Missing Verification Expiration Logic
**What goes wrong:** Organization's 501(c)(3) status was revoked years ago but still shows "Verified Nonprofit" badge

**Why it happens:** EIN data imported from IRS snapshot doesn't auto-update. Tax-exempt status can be revoked for non-filing or compliance issues.

**How to avoid:**
1. Add `verification_expires_date` column to organizations table
2. Run monthly ETL job to refresh IRS Business Master File extract
3. Flag organizations with warnings in IRS data (automatic revocation list)
4. Hide or mark expired verifications in UI
5. Display `last_verified_date` on all peer connection listings

**Warning signs:** User reports organization that is no longer operational or had status revoked

## Code Examples

Verified patterns from official sources:

### Geospatial Query with PostGIS
```sql
-- Source: PostGIS documentation - https://postgis.net/docs/ST_DWithin.html
-- Find all support groups within 25 miles of user location

CREATE OR REPLACE FUNCTION search_nearby_support_groups(
  user_latitude NUMERIC,
  user_longitude NUMERIC,
  radius_miles INT DEFAULT 25
)
RETURNS TABLE (
  id UUID,
  org_name TEXT,
  city TEXT,
  state TEXT,
  distance_miles NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.org_name,
    o.city,
    o.state,
    ROUND(
      ST_Distance(
        ST_MakePoint(o.longitude, o.latitude)::geography,
        ST_MakePoint(user_longitude, user_latitude)::geography
      ) / 1609.34, -- Convert meters to miles
      1
    ) AS distance_miles
  FROM organizations o
  WHERE
    o.ntee_code LIKE ANY(ARRAY['W30%', 'P20%', 'P40%'])
    AND ST_DWithin(
      ST_MakePoint(o.longitude, o.latitude)::geography,
      ST_MakePoint(user_longitude, user_latitude)::geography,
      radius_miles * 1609.34  -- Convert miles to meters
    )
  ORDER BY
    ST_Distance(
      ST_MakePoint(o.longitude, o.latitude)::geography,
      ST_MakePoint(user_longitude, user_latitude)::geography
    ) ASC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Benefits Interaction Rule Definition
```typescript
// Source: json-rules-engine documentation - https://github.com/CacheControl/json-rules-engine
// Detect SSI + SNAP income cliff interaction

export const ssiSnapInteractionRule = {
  program_id: 'interaction-ssi-snap',
  rule_definition: {
    conditions: {
      all: [
        // User matched both programs
        {
          fact: 'matchedProgramIds',
          operator: 'contains',
          value: 'ssi'
        },
        {
          fact: 'matchedProgramIds',
          operator: 'contains',
          value: 'snap-ky'
        },
        // Income near threshold where interaction matters
        {
          fact: 'householdIncome',
          operator: 'in',
          value: ['15k-25k', '25k-40k']
        }
      ]
    },
    event: {
      type: 'benefit-interaction',
      params: {
        type: 'warning',
        programIds: ['ssi', 'snap-ky'],
        title: 'SSI Income Counts Toward SNAP Eligibility',
        description: 'SSI payments count as income for SNAP (food stamps). If your SSI benefit pushes you over 130% of the federal poverty line, you may lose SNAP benefits entirely. SNAP also decreases by approximately $1 for every $3 in SSI payments.',
        recommendation: 'Before applying for SSI, talk to a benefits counselor at your local DCBS office or call 1-855-459-6328 to understand the total impact on your household benefits.',
        severity: 'medium',
        learnMoreUrl: 'https://www.ssa.gov/ssi/text-other-ussi.htm'
      }
    }
  }
};
```

### Location Filter Component with ZIP Code Validation
```tsx
// Source: Zod documentation + existing screening form pattern
'use client';

import { useQueryState } from 'nuqs';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const locationSchema = z.string()
  .min(2, 'Enter at least 2 characters')
  .refine(
    (val) => {
      // Accept city names (letters, spaces, hyphens)
      if (/^[a-zA-Z\s-]+$/.test(val)) return true;
      // Accept ZIP codes (5 digits or ZIP+4 format)
      if (/^\d{5}(-\d{4})?$/.test(val)) return true;
      return false;
    },
    { message: 'Enter a city name or ZIP code' }
  );

export function LocationFilter() {
  const [location, setLocation] = useQueryState('location');
  const [input, setInput] = useState(location || '');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = () => {
    const result = locationSchema.safeParse(input);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setError(null);
    setLocation(input);
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="City name or ZIP code"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          aria-invalid={!!error}
          aria-describedby={error ? 'location-error' : undefined}
        />
        {error && (
          <p id="location-error" className="text-sm text-destructive mt-1">
            {error}
          </p>
        )}
      </div>
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual distance calculations with Haversine formula | PostGIS geography type with ST_DWithin | PostGIS 1.5 (2010) | Geography type automatically handles geodetic calculations, datum transformations, and coordinate system conversions. 10-100x faster with GiST indexes. |
| Storing lat/lng as separate NUMERIC columns | PostGIS GEOMETRY or GEOGRAPHY point type | PostGIS 2.0 (2012) | Native spatial types enable spatial joins, buffering, intersection queries. Required for serious geospatial applications. |
| Hard-coded business rules in application code | Declarative rules engines (json-rules-engine, Drools, Easy Rules) | 2010s | Rules become data, not code. Non-technical staff can author/review. Version control, audit trails, A/B testing. |
| Single-pass eligibility evaluation | Multi-pass evaluation (eligibility → interaction detection → warnings) | Best practice since 2015+ | Separation of concerns: eligibility rules answer "do they qualify?", interaction rules answer "what conflicts exist?". Easier to maintain, test, and validate with SMEs. |
| Text-only benefit warnings | Structured warnings with severity, thresholds, phase-out rates | Benefits cliff research 2018-2024 | Generic warnings don't help users make decisions. Specific dollar amounts and thresholds enable informed choice. |

**Deprecated/outdated:**
- **Google Maps Geocoding API for address validation**: Expensive at scale ($0.005-0.05 per lookup), privacy concerns (sends addresses to Google), rate limits. Use PostGIS + TIGER/Line shapefiles (free, self-hosted, unlimited) or simple text matching for MVP.
- **Client-side filtering for location search**: Sending all 85K organizations to browser, then filtering by distance in JavaScript. Page size: 50MB+ JSON, parse time: 5-10 seconds on mobile, crashes on older devices. Always filter server-side.
- **Single "benefits" table for eligibility + interactions**: Tried in early Phase 3 iterations, caused confusion (is this program a match or a warning?). Separate concerns: eligibility_rules for matching, interaction_rules for conflicts.

## Open Questions

1. **Should we implement PostGIS radius search for MVP or defer to future phase?**
   - What we know: 85K orgs already have city/state/ZIP, text-based search works for those fields, PostGIS requires lat/lng coordinates and migration
   - What's unclear: How many orgs are missing city/state/ZIP? How many users will search by radius vs. city name? Does "within 25 miles of Louisville" provide meaningful value over "in Louisville"?
   - Recommendation: Start with text-based ILIKE matching for MVP. Track user behavior (do users add "nearby" or "within X miles" to searches?). If 20%+ users want radius, run one-time geocoding job and add PostGIS in Phase 8.

2. **How many benefit interaction rules exist for Kentucky programs?**
   - What we know: 15 programs currently in eligibility_rules table, SSI+SNAP interaction documented by SSA, Medicaid cliff effects documented by APHSA
   - What's unclear: Total count of meaningful interactions (1-2 or 50+?), which interactions matter most to veterans, SME availability to validate rules
   - Recommendation: Start with 3-5 highest-impact interactions (SSI+SNAP, SSI+Medicaid, VA disability+SSI, SNAP+Medicaid, VA Pension+SSI). Run user interviews after Phase 7 launch to identify additional interactions users care about.

3. **Should peer connection types (support groups, events, opportunities) be separate pages or tabs on single page?**
   - What we know: Directory has separate /directory/organizations and /directory/businesses pages, worked well in Phase 2
   - What's unclear: Are support groups, events, opportunities different enough to warrant separate pages? Or should user see "all peer connections near me" in one view?
   - Recommendation: Separate pages for MVP (/peer-connection/support-groups, /peer-connection/events, /peer-connection/opportunities). Easier to optimize filters/layout per type, simpler routing, cleaner URLs for sharing. Can add unified view later if user research shows demand.

4. **How should branch/era filtering work for organizations that serve all veterans?**
   - What we know: Many orgs serve all veterans regardless of branch/era (DAV, VFW chapters), some specialize (Vietnam Veterans of America, Iraq and Afghanistan Veterans of America)
   - What's unclear: Should "Army" filter hide orgs that serve all branches? Or only show Army-specific + all-branches orgs?
   - Recommendation: Add `service_branch_focus` (TEXT[]) and `service_era_focus` (TEXT[]) columns to organizations. NULL/empty = serves all. Filter logic: show org if (filter matches focus) OR (focus is NULL/empty). This way VFW Louisville shows up for all branch searches.

## Sources

### Primary (HIGH confidence)
- PostGIS Documentation - [PostGIS: Geo queries | Supabase Docs](https://supabase.com/docs/guides/database/extensions/postgis)
- PostGIS Documentation - [ST_DWithin](https://postgis.net/docs/ST_DWithin.html)
- json-rules-engine v7 - [npm package](https://www.npmjs.com/package/json-rules-engine) (version 7.3.1 confirmed installed in package.json)
- json-rules-engine GitHub - [docs/rules.md](https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md)
- Social Security Administration - [SSI and Eligibility for Other Government Programs](https://www.ssa.gov/ssi/text-other-ussi.htm)
- Social Security Administration - [What's New in 2026?](https://www.ssa.gov/redbook/newfor2026.htm)
- IRS Tax Exempt Organization Search - [Search tool](https://www.irs.gov/charities-non-profits/tax-exempt-organization-search)
- National Center for Charitable Statistics - [NTEE Codes](https://nccs.urban.org/project/national-taxonomy-exempt-entities-ntee-codes)

### Secondary (MEDIUM confidence)
- APHSA Benefit Cliff Dashboard - [Resource Hub](https://aphsa.org/benefit-cliff-dashboard/)
- Benefits Cliff Explained - [Fed Communities](https://fedcommunities.org/the-benefits-cliff-explained/)
- VA Peer Support Specialist Certification - [PRS Portal](https://www.vaprs.org/about-peer-family-support/prs-certification/)
- Virginia Certified Peer Recovery Specialist - [Requirements](https://www.vacertboard.org/cprs)
- PostGIS Performance Guide - [Crunchy Data Blog](https://www.crunchydata.com/blog/postgis-performance-indexing-and-explain)
- PostgreSQL GiST Indexes - [Documentation](https://www.postgresql.org/docs/current/gist.html)
- ActiveFence Trust & Safety Guide - [What is Trust and Safety](https://www.activefence.com/what-is-trust-and-safety/)

### Tertiary (LOW confidence)
- ProPublica Nonprofit Explorer - [API](https://projects.propublica.org/nonprofits/) (mentioned as API option, not verified for production use)
- NTEE Code definitions for W30, P20, P40 - Confirmed W30 exists via search results but specific centile definitions not found in official IRS documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - json-rules-engine v7 already installed and working (Phase 3), PostgreSQL/PostGIS well-documented
- Architecture: MEDIUM - Location filtering pattern is straightforward, benefits interaction detection requires SME validation of rules
- Pitfalls: MEDIUM - Location search pitfalls well-known (text normalization, PostGIS indexing), benefits cliff pitfalls documented by APHSA but specific interactions need validation

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (30 days - stable domain)

**Key unknowns requiring validation:**
1. Exact count of meaningful benefit interactions for Kentucky programs (start with 3-5, expand based on user research)
2. Percentage of organizations missing city/state/ZIP data (affects text-based search viability)
3. SME availability to review and approve interaction rules before launch (Phase requirement: "All interaction rules are validated by subject matter expert before going live")
