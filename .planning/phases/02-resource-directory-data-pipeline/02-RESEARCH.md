# Phase 2: Resource Directory + Data Pipeline - Research

**Researched:** 2026-02-15
**Domain:** Data ETL, PostgreSQL Full-Text Search, Directory Search UI
**Confidence:** HIGH

## Summary

Phase 2 involves importing 85,289 veteran organizations and 5,567 veteran-owned businesses from existing data sources into a Supabase PostgreSQL database, then building search/filter/detail interfaces for veterans to discover resources. The data sources already exist as Python projects with complete schemas and CSV/SQLite outputs.

The research reveals that PostgreSQL's built-in full-text search with GIN indexes is the optimal approach for this dataset size, offering sub-second query performance without external search engines. For ETL, PostgreSQL's COPY command provides 50-100x performance improvement over batch INSERT for the 85K+ record import. Data validation using Zod (TypeScript-first schema validation) combined with streaming CSV parsing prevents memory issues and catches errors before database insertion.

The existing data sources have well-defined schemas: `vet_org_directory` outputs a 50-column CSV with confidence scores (A-F grades), freshness dates, and multi-source data enrichment; `veteran-business-db` uses SQLite with 5,567 businesses including geocoding and certification data. Both datasets are production-ready and deployed on Streamlit Cloud.

**Primary recommendation:** Use PostgreSQL tsvector with GIN indexes for full-text search, implement ETL as Next.js Server Actions with streaming CSV parsing and Zod validation, use COPY command for bulk inserts, and build search UI with shadcn/ui components managing filter state via URL parameters.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Supabase | Latest | PostgreSQL database + auth | Already chosen in Phase 1, provides PostgreSQL with built-in full-text search |
| Next.js | 16+ | Web framework | Already chosen, Server Actions ideal for ETL operations |
| TypeScript | 5.1.3+ | Type safety | Required for Next.js async Server Components |
| Zod | 3.x | Runtime validation | TypeScript-first validation, fastest for TypeScript projects, auto-infers types |
| csv-parse | 5.x | CSV streaming parser | Stream-based API for 85K+ rows, part of node-csv ecosystem |
| shadcn/ui | Latest | UI components | Accessible, composable components for search/filter/pagination |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nuqs | Latest | URL state management | Managing search/filter state in URL params with type safety |
| use-debounce | Latest | Debounced callbacks | Debouncing search input (300ms delay) before API calls |
| @tanstack/react-table | 8.x | Table management | If building data table view (optional, shadcn Table uses this) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zod | Yup | Yup has better React form integration but slower performance and weaker TypeScript integration |
| csv-parse | Papa Parse | Papa Parse is faster (90K rows/sec) but csv-parse has better TypeScript support and stream API |
| PostgreSQL FTS | Elasticsearch | External search engine adds complexity, PostgreSQL FTS is sufficient for 85K records with proper indexing |

**Installation:**
```bash
npm install zod csv-parse nuqs use-debounce
npx shadcn-ui@latest init
npx shadcn-ui@latest add input select button pagination table
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── etl/                     # ETL pipeline utilities
│   │   ├── parsers/             # CSV stream parsers
│   │   ├── validators/          # Zod schemas
│   │   ├── loaders/             # Database bulk insert functions
│   │   └── types.ts             # Shared ETL types
│   ├── db/
│   │   ├── schema.ts            # Database type definitions
│   │   └── queries.ts           # Search/filter queries
│   └── utils/
│       └── search.ts            # Full-text search helpers
├── app/
│   ├── directory/               # Directory search pages
│   │   ├── page.tsx             # Organization search
│   │   ├── [id]/page.tsx        # Organization detail
│   │   └── businesses/          # Business search
│   └── api/
│       └── admin/
│           └── import/          # ETL Server Actions (admin only)
└── components/
    ├── directory/               # Directory-specific components
    │   ├── search-form.tsx      # Search + filters
    │   ├── org-card.tsx         # Organization card
    │   └── verification-badge.tsx  # Data freshness indicator
    └── ui/                      # shadcn components
```

### Pattern 1: Streaming CSV Import with Validation

**What:** Parse large CSV files in streams, validate each row with Zod, accumulate batches, then bulk insert using PostgreSQL COPY
**When to use:** Importing 85K+ rows from CSV files
**Example:**
```typescript
// Source: LogRocket TypeScript ETL guide + csv-parse docs
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';
import { z } from 'zod';

const OrgSchema = z.object({
  org_name: z.string().min(1),
  ein: z.string().regex(/^\d{2}-\d{7}$/),
  phone: z.string().nullable(),
  website: z.string().url().nullable(),
  confidence_score: z.coerce.number().min(0).max(1),
  // ... 45 more columns
});

async function importOrganizations(filePath: string) {
  const validRecords: z.infer<typeof OrgSchema>[] = [];
  const errors: { row: number; error: string }[] = [];

  const parser = createReadStream(filePath)
    .pipe(parse({ columns: true, skip_empty_lines: true }));

  let rowNum = 0;
  for await (const record of parser) {
    rowNum++;
    const result = OrgSchema.safeParse(record);

    if (result.success) {
      validRecords.push(result.data);

      // Batch insert every 1000 rows
      if (validRecords.length >= 1000) {
        await bulkInsert(validRecords);
        validRecords.length = 0;
      }
    } else {
      errors.push({ row: rowNum, error: result.error.message });
    }
  }

  // Insert remaining records
  if (validRecords.length > 0) {
    await bulkInsert(validRecords);
  }

  return { imported: rowNum - errors.length, errors };
}
```

### Pattern 2: PostgreSQL Full-Text Search with Generated Column

**What:** Pre-compute tsvector in a generated column with GIN index for fast full-text search
**When to use:** Searching across organization names, descriptions, services (multi-column text search)
**Example:**
```sql
-- Source: Supabase Full-Text Search Guide
-- Add generated tsvector column for searchable text
ALTER TABLE organizations
ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', COALESCE(org_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(mission_statement, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(services_offered, '')), 'C')
) STORED;

-- Create GIN index for fast search (3x faster than GiST)
CREATE INDEX organizations_fts_idx ON organizations USING GIN (fts);

-- Search query with ranking
SELECT
  id, org_name, city, state,
  ts_rank(fts, websearch_to_tsquery('english', 'mental health')) AS rank
FROM organizations
WHERE fts @@ websearch_to_tsquery('english', 'mental health')
ORDER BY rank DESC
LIMIT 20;
```

### Pattern 3: URL-Based Search State with Debouncing

**What:** Store search/filter state in URL params for bookmarkable searches, debounce input to reduce API calls
**When to use:** Building search interfaces with multiple filters
**Example:**
```typescript
// Source: Next.js Learn Dashboard + nuqs documentation
'use client';
import { useQueryState } from 'nuqs';
import { useDebouncedCallback } from 'use-debounce';

export function SearchForm() {
  const [search, setSearch] = useQueryState('q', { defaultValue: '' });
  const [state, setState] = useQueryState('state');
  const [benefitType, setBenefitType] = useQueryState('benefit');

  // Debounce search input to reduce server requests
  const handleSearch = useDebouncedCallback((value: string) => {
    setSearch(value || null);
  }, 300);

  return (
    <form className="space-y-4">
      <Input
        placeholder="Search organizations..."
        defaultValue={search}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <Select value={state ?? ''} onValueChange={setState}>
        <option value="">All States</option>
        <option value="KY">Kentucky</option>
        {/* ... */}
      </Select>
      {/* Filters update URL immediately, triggering server re-fetch */}
    </form>
  );
}
```

### Pattern 4: Data Freshness Tracking Schema

**What:** Track when data was last verified and calculate confidence scores based on source and completeness
**When to use:** Ensuring data quality transparency for users
**Example:**
```sql
-- Source: Data observability patterns + existing vet_org_directory schema
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ... core fields

  -- Data quality metadata
  data_sources TEXT[], -- ['irs_bmf', 'propublica']
  last_verified_date DATE NOT NULL,
  verification_method TEXT, -- 'api_sync', 'manual_verification', 'csv_import'
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  confidence_grade TEXT CHECK (confidence_grade IN ('A', 'B', 'C', 'D', 'F')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Function to calculate freshness indicator (green/yellow/red)
CREATE OR REPLACE FUNCTION freshness_status(verified_date DATE)
RETURNS TEXT AS $$
BEGIN
  CASE
    WHEN verified_date >= CURRENT_DATE - INTERVAL '6 months' THEN RETURN 'fresh';
    WHEN verified_date >= CURRENT_DATE - INTERVAL '1 year' THEN RETURN 'stale';
    ELSE RETURN 'outdated';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Pattern 5: Server Actions for ETL Operations

**What:** Use Next.js Server Actions with admin-only authorization for ETL operations
**When to use:** Building admin interfaces for data import/management
**Example:**
```typescript
// Source: Next.js Server Actions guide + Supabase RLS
'use server';
import { createClient } from '@/lib/supabase/server';
import { importOrganizations } from '@/lib/etl/parsers/organizations';

export async function importOrgData(filePath: string) {
  const supabase = createClient();

  // Check admin permission
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  // Run ETL pipeline
  const result = await importOrganizations(filePath);
  return result;
}
```

### Anti-Patterns to Avoid

- **Loading entire CSV into memory:** With 85K rows, use streams instead of `fs.readFileSync()` + `JSON.parse()`
- **Row-by-row INSERT statements:** Use batch INSERT or COPY command for 50-100x performance improvement
- **Client-side filtering of large datasets:** Use PostgreSQL queries with proper indexes, not client-side filtering
- **Storing search state in React state only:** Use URL params for bookmarkable/shareable searches
- **Hand-rolling text search:** Use PostgreSQL's built-in full-text search, not LIKE queries or client-side filtering
- **Skipping data validation:** Validate before database insertion to prevent cascading errors

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV parsing for large files | Custom string splitting logic | csv-parse with streaming | Memory overflow, encoding issues, edge cases (quotes, newlines in fields) |
| Text search across columns | LIKE queries or regex matching | PostgreSQL tsvector + GIN index | Order of magnitude faster, supports stemming, ranking, language-aware |
| Data validation | Manual type checking | Zod schemas with safeParse | Automatic TypeScript type inference, composable validators, clear error messages |
| Bulk database inserts | Loop of INSERT statements | PostgreSQL COPY command | 50-100x faster, optimized C layer, bypasses SQL parsing overhead |
| Debouncing search input | setTimeout with manual cleanup | use-debounce library | Handles edge cases (component unmount, rapid changes), tested implementation |
| URL state management | Manual URLSearchParams manipulation | nuqs library | Type-safe, React hooks API, handles SSR/client hydration |

**Key insight:** Data pipeline problems are deceptively complex with edge cases that take months to discover in production. The ecosystem has battle-tested solutions—validate with Zod, parse with csv-parse, bulk load with COPY, search with PostgreSQL FTS.

## Common Pitfalls

### Pitfall 1: Memory Overflow from Non-Streaming CSV Parsing
**What goes wrong:** Loading 85K row CSV into memory causes heap overflow or extreme slowness
**Why it happens:** `fs.readFileSync()` reads entire file before processing; large CSVs (50+ columns × 85K rows) exceed Node.js default heap
**How to avoid:** Use streaming parser (csv-parse) with generator pattern (`for await...of`) to process one row at a time
**Warning signs:** Memory usage spike during import, "JavaScript heap out of memory" errors, 30+ second import times

### Pitfall 2: Slow Batch Inserts Instead of COPY
**What goes wrong:** ETL takes 15+ minutes instead of seconds
**Why it happens:** Using client library batch INSERT sends data over network with SQL parsing overhead for each batch
**How to avoid:** Use PostgreSQL COPY command for initial bulk load (50-100x faster than INSERT)
**Warning signs:** Import progress bar moves slowly (< 1000 rows/sec), high network latency impact, repeated SQL parsing overhead

### Pitfall 3: Missing Indexes on Search Columns
**What goes wrong:** Search queries take 5+ seconds on 85K rows, pagination timeout errors
**Why it happens:** Sequential scan of all rows without GIN index on tsvector column
**How to avoid:** Create GIN index on generated tsvector column BEFORE importing data, use EXPLAIN ANALYZE to verify index usage
**Warning signs:** Query times > 1 second, EXPLAIN shows "Seq Scan" instead of "Bitmap Index Scan", pagination timeouts

### Pitfall 4: JSONB Column Performance with Large Values
**What goes wrong:** Queries on JSONB columns (confidence_detail, key_personnel) are slow despite GIN indexes
**Why it happens:** Values > 2KB trigger PostgreSQL TOAST storage, causing performance degradation
**How to avoid:** Keep JSONB fields small (< 2KB), extract frequently-queried fields to regular columns, use expression indexes
**Warning signs:** Slow queries on JSONB containment (@>), EXPLAIN shows TOAST table access, query planning time > 100ms

### Pitfall 5: Data Validation After Database Insertion
**What goes wrong:** Invalid phone numbers, malformed URLs, missing required fields get into database, causing downstream errors
**Why it happens:** Validation happens in application queries instead of at ETL boundary
**How to avoid:** Use Zod validation BEFORE database insertion, reject entire batch if any row fails, log validation errors for review
**Warning signs:** Data quality issues discovered in production, inconsistent field formats, broken URLs/phones in UI

### Pitfall 6: Client-Side Filtering of Large Datasets
**What goes wrong:** UI loads all 85K organizations into browser memory for filtering, causing freeze/crash
**Why it happens:** Fetching all data client-side instead of using server-side filtering with SQL WHERE clauses
**How to avoid:** Build filters as URL params that trigger server-side SQL queries with proper indexes
**Warning signs:** Large initial page load (MB of JSON), browser freeze when applying filters, memory warnings in DevTools

### Pitfall 7: Lost Search State on Navigation
**What goes wrong:** User applies filters, clicks detail page, clicks back—filters are reset
**Why it happens:** Search state stored in React state instead of URL params
**How to avoid:** Use nuqs or Next.js useSearchParams to store filter state in URL, making searches bookmarkable
**Warning signs:** Filters reset on browser back, can't share filtered searches via URL, poor UX for multi-page searches

### Pitfall 8: Unbounded Full-Text Search Queries
**What goes wrong:** User searches for "the" or "" (empty string), returning all 85K rows and timing out
**Why it happens:** No query validation or result limits on full-text search
**How to avoid:** Require minimum search length (3 chars), always LIMIT results (e.g., 100), use pagination with cursors
**Warning signs:** Search timeouts, database CPU spikes, users complaining about slow "simple" searches

## Code Examples

Verified patterns from official sources:

### Supabase RPC for Complex Search Queries
```typescript
// Source: Supabase JavaScript API Reference - RPC
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Create stored procedure for complex search (in migration)
/*
CREATE OR REPLACE FUNCTION search_organizations(
  query_text TEXT,
  filter_state TEXT DEFAULT NULL,
  filter_benefit TEXT DEFAULT NULL,
  result_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  org_name TEXT,
  city TEXT,
  state TEXT,
  confidence_grade TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id, o.org_name, o.city, o.state, o.confidence_grade,
    ts_rank(o.fts, websearch_to_tsquery('english', query_text)) AS rank
  FROM organizations o
  WHERE
    o.fts @@ websearch_to_tsquery('english', query_text)
    AND (filter_state IS NULL OR o.state = filter_state)
    AND (filter_benefit IS NULL OR filter_benefit = ANY(o.benefit_types))
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
*/

// Call from TypeScript with full type safety
const { data, error } = await supabase.rpc('search_organizations', {
  query_text: 'mental health',
  filter_state: 'KY',
  filter_benefit: 'healthcare',
  result_limit: 20,
});
```

### Bulk Insert with Error Tracking
```typescript
// Source: Supabase batch insert best practices + ETL error handling guides
import { createClient } from '@supabase/supabase-js';

async function bulkInsertOrganizations(records: OrgRecord[]) {
  const supabase = createClient(url, key);
  const BATCH_SIZE = 1000;
  const errors: ImportError[] = [];
  let imported = 0;

  // Process in batches
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabase
      .from('organizations')
      .insert(batch)
      .select();

    if (error) {
      // Log batch error for review
      errors.push({
        batch: Math.floor(i / BATCH_SIZE),
        rows: batch.length,
        error: error.message,
      });
    } else {
      imported += batch.length;
    }
  }

  return { imported, errors };
}
```

### CSV Streaming with Progress Tracking
```typescript
// Source: csv-parse Stream API documentation
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';

async function streamCSVWithProgress(
  filePath: string,
  onProgress: (processed: number, total: number) => void
) {
  const stats = await fs.promises.stat(filePath);
  const totalBytes = stats.size;
  let processedBytes = 0;
  let rowCount = 0;

  const stream = createReadStream(filePath);
  const parser = stream.pipe(parse({ columns: true }));

  stream.on('data', (chunk) => {
    processedBytes += chunk.length;
    onProgress(processedBytes, totalBytes);
  });

  const records = [];
  for await (const record of parser) {
    rowCount++;
    records.push(record);

    // Process in batches
    if (records.length >= 1000) {
      await processBatch(records);
      records.length = 0;
    }
  }

  if (records.length > 0) {
    await processBatch(records);
  }

  return rowCount;
}
```

### Debounced Search with URL State
```typescript
// Source: Next.js Dashboard Tutorial + nuqs documentation
'use client';
import { useQueryState } from 'nuqs';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';

export function SearchInput() {
  const [search, setSearch] = useQueryState('q');

  // Debounce for 300ms to reduce server calls
  const handleSearch = useDebouncedCallback((value: string) => {
    setSearch(value || null); // null removes param from URL
  }, 300);

  return (
    <Input
      type="search"
      placeholder="Search organizations..."
      defaultValue={search ?? ''}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Elasticsearch for search | PostgreSQL full-text search with GIN indexes | PostgreSQL 12+ (2019) | Eliminates external service, PostgreSQL FTS now fast enough for 85K-1M records |
| Manual batch INSERT loops | PostgreSQL COPY command | PostgreSQL 8+ (but underutilized) | 50-100x faster imports, critical for 85K+ row datasets |
| Yup for TypeScript validation | Zod for schema validation | Zod 3.0 (2021) | Better TypeScript integration, auto-inferred types, faster performance |
| React state for filters | URL params with nuqs | Next.js App Router (2022) + nuqs (2023) | Bookmarkable searches, better UX, server-driven state |
| Class-based ETL scripts | Server Actions for ETL | Next.js 13.4+ (2023) | ETL operations as API endpoints, integrated auth, type safety |

**Deprecated/outdated:**
- **GiST indexes for full-text search:** Use GIN indexes instead (3x faster for lookup operations)
- **Manual URLSearchParams manipulation:** Use nuqs library for type-safe URL state with React hooks
- **Papa Parse for Node.js:** Prefer csv-parse for better TypeScript/Node.js stream integration (Papa Parse is still good for browser)
- **pg-promise COPY streams:** Supabase client doesn't expose COPY directly; use batch INSERT (500-1000 rows) or server-side SQL for initial import

## Open Questions

1. **Should we merge organizations and businesses into one table or keep separate?**
   - What we know: Organizations (85K) and businesses (5.5K) have overlapping fields (name, address, contact) but different purposes (service providers vs contractors)
   - What's unclear: Whether unified search makes sense or if separate directories are clearer UX
   - Recommendation: Start with separate tables (`organizations`, `businesses`) sharing common fields via inheritance or views; evaluate merge after user testing

2. **How to handle the existing confidence_detail JSONB column (potential > 2KB)?**
   - What we know: vet_org_directory stores per-group confidence breakdown in JSONB, which could exceed 2KB TOAST threshold
   - What's unclear: Actual size distribution of confidence_detail values
   - Recommendation: Analyze existing CSV to measure JSONB sizes; if > 2KB common, extract summary fields (grade, score) to regular columns

3. **Should ETL run as one-time import or scheduled sync?**
   - What we know: Data sources update periodically (IRS BMF quarterly, ProPublica monthly)
   - What's unclear: Whether Phase 2 scope includes automated refresh or just initial import
   - Recommendation: Phase 2 = one-time import with Server Action UI; Phase 3/4 can add scheduled syncs via cron/background jobs

4. **How to handle data conflicts during re-import (upsert vs replace)?**
   - What we know: EIN is unique identifier for organizations, UEI for businesses
   - What's unclear: Merge strategy when re-importing (overwrite all, merge fields, keep manual edits)
   - Recommendation: Use ON CONFLICT (ein) DO UPDATE with timestamp checks; preserve manual edits via `updated_by` column

## Sources

### Primary (HIGH confidence)
- [Supabase Full-Text Search Guide](https://supabase.com/docs/guides/database/full-text-search) - PostgreSQL FTS implementation patterns
- [Supabase Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations) - Schema versioning with TypeScript types
- [Supabase JavaScript RPC](https://supabase.com/docs/reference/javascript/rpc) - Stored procedure patterns
- [Next.js Server Actions: use server directive](https://nextjs.org/docs/app/api-reference/directives/use-server) - Server Actions for database operations
- [csv-parse Stream API](https://csv.js.org/parse/api/stream/) - Streaming CSV parsing
- [PostgreSQL GIN Indexes](https://www.postgresql.org/docs/current/gin.html) - Official GIN index documentation
- [PostgreSQL COPY Documentation](https://www.postgresql.org/docs/current/populate.html) - Bulk loading best practices

### Secondary (MEDIUM confidence)
- [Postgres text search: balancing query time and relevancy (Sourcegraph)](https://sourcegraph.com/blog/postgres-text-search-balancing-query-time-and-relevancy) - tsvector vs trigram comparison
- [Testing Postgres Ingest: INSERT vs COPY (Tiger Data)](https://www.tigerdata.com/learn/testing-postgres-ingest-insert-vs-batch-insert-vs-copy) - Performance benchmarks
- [Comparing schema validation libraries: Zod vs. Yup (LogRocket)](https://blog.logrocket.com/comparing-schema-validation-libraries-zod-vs-yup/) - Validation library comparison
- [Use TypeScript instead of Python for ETL pipelines (LogRocket)](https://blog.logrocket.com/use-typescript-instead-python-etl-pipelines/) - TypeScript ETL patterns
- [Data Validation in ETL - 2026 Guide (Integrate.io)](https://www.integrate.io/blog/data-validation-etl/) - ETL validation best practices
- [What Is Data Freshness in Data Observability? (Sifflet)](https://www.siffletdata.com/blog/data-freshness) - Data freshness tracking patterns
- [Next.js: Adding Search and Pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) - URL-based search patterns
- [shadcn/ui Pagination Component](https://ui.shadcn.com/docs/components/radix/pagination) - UI component patterns
- [nuqs - Type-safe search params](https://github.com/47ng/nuqs) - URL state management library
- [Understanding Postgres GIN Indexes (pganalyze)](https://pganalyze.com/blog/gin-index) - GIN index performance guide

### Tertiary (LOW confidence - data source analysis)
- Analyzed `/Users/vincecain/Projects/vet_org_directory/config/schema.py` - 50-column schema with confidence scoring
- Analyzed `/Users/vincecain/Projects/veteran-business-db/database.py` - Business database schema
- Counted records: 85,289 organizations (CSV), 5,567 businesses (SQLite)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Supabase/PostgreSQL FTS is well-documented, Zod and csv-parse are industry standard for TypeScript
- Architecture: HIGH - Patterns verified from official Supabase/Next.js docs, existing data sources analyzed directly
- Pitfalls: HIGH - Based on real-world benchmarks (COPY vs INSERT, GIN vs GiST, streaming vs loading)
- ETL performance: MEDIUM - Benchmarks are from general PostgreSQL testing, not this specific dataset

**Research date:** 2026-02-15
**Valid until:** 2026-04-15 (60 days - stable PostgreSQL/Supabase features)

**Dataset verification:**
- vet_org_directory: 85,289 rows verified (CSV line count)
- veteran-business-db: 5,567 rows verified (SQLite COUNT query)
- Both datasets are production-ready with complete schemas
- Data quality: vet_org_directory has A-F confidence grades, freshness tracking already implemented
