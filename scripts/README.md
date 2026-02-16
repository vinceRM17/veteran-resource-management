# Directory Data Pipeline Scripts

This directory contains scripts for managing the veteran resource directory database schema and data import.

## Quick Start

### 1. Apply Database Migration

The directory schema (organizations + businesses tables with FTS) must be applied manually via Supabase SQL Editor.

```bash
npm run migration:instructions
```

This will display step-by-step instructions and the SQL to copy.

**Manual Steps:**
1. Open the Supabase SQL Editor at the URL shown
2. Copy the migration SQL from `supabase/migrations/00002_directory_schema.sql`
3. Paste into the SQL Editor and click "Run"
4. Verify the tables were created by running:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```
   Expected output: `organizations`, `businesses`, `profiles`, `screening_sessions`

### 2. Import Organization Data

After the migration is applied, import the 85K+ organization records from the vet_org_directory CSV:

```bash
npm run import:orgs
```

By default, this imports from `../vet_org_directory/data/output/veteran_org_directory.csv`.

To use a different CSV file:
```bash
npm run import:orgs -- /path/to/custom/veteran_org_directory.csv
```

**What it does:**
- Validates each row with Zod schema (52 columns)
- Rejects rows with missing org_name, malformed EIN, etc.
- Batches inserts (1000 rows per batch) for performance
- Logs progress every 5000 rows
- Fails if error rate > 10% (indicates data quality issue)

**Expected output:**
- Total rows: ~85,289
- Imported: ~75,000-80,000 (some rows rejected due to validation)
- Errors: < 10% of total
- Success rate: > 90%

## Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `apply-directory-migration.ts` | Display migration instructions | `npm run migration:instructions` |
| `import-organizations.ts` | Import organization CSV data | `npm run import:orgs [path]` |
| `check-tables.ts` | Verify tables exist | `npx tsx scripts/check-tables.ts` |

## Verification

After import completes, verify the data in Supabase SQL Editor:

```sql
-- Check row count
SELECT COUNT(*) FROM organizations;
-- Expected: 75,000+

-- Test full-text search
SELECT org_name, city, state
FROM organizations
WHERE fts @@ to_tsquery('english', 'mental & health')
LIMIT 5;

-- Test freshness function
SELECT org_name, last_verified_date, freshness_status(last_verified_date) AS freshness
FROM organizations
LIMIT 10;

-- Check confidence grade distribution
SELECT confidence_grade, COUNT(*)
FROM organizations
GROUP BY confidence_grade
ORDER BY confidence_grade;
```

## Troubleshooting

### Migration fails to apply
- **Cause:** SQL syntax error or permissions issue
- **Solution:** Check the migration SQL for errors, ensure service role key has permissions

### Import error rate > 10%
- **Cause:** Data quality issue in the CSV
- **Solution:** Review the error log (first 10 errors shown), fix the CSV data, re-run import

### Import fails with "organizations table not found"
- **Cause:** Migration not applied
- **Solution:** Run `npm run migration:instructions` and apply the migration first

### Duplicate key violation on EIN
- **Cause:** CSV contains duplicate EIN values
- **Solution:** The import continues processing other rows; duplicates are logged as errors

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (bypasses RLS for ETL)
