/**
 * SQLite-to-Supabase ETL for veteran business records
 * Reads from veteran-business-db SQLite database and imports to Supabase
 */

import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import { validateBusinessRow } from '../validators/business';

/**
 * Create a Supabase service role client (bypasses RLS for ETL)
 */
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase credentials: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

interface ImportResult {
  imported: number;
  errors: Array<{ row: number; error: string }>;
  total: number;
}

interface ImportOptions {
  batchSize?: number;
  logProgress?: boolean;
}

/**
 * Import businesses from veteran-business-db SQLite to Supabase
 *
 * @param dbPath - Path to veteran_businesses.db SQLite file
 * @param options - Import configuration
 * @returns Import summary with counts and errors
 */
export async function importBusinesses(
  dbPath: string,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const { batchSize = 500, logProgress = true } = options;

  if (logProgress) {
    console.log(`Opening SQLite database: ${dbPath}`);
  }

  // Open SQLite database in read-only mode
  const db = new Database(dbPath, { readonly: true, fileMustExist: true });

  try {
    // Get total count
    const countResult = db.prepare('SELECT COUNT(*) as count FROM businesses').get() as {
      count: number;
    };
    const totalRows = countResult.count;

    if (logProgress) {
      console.log(`Found ${totalRows} business records in SQLite database`);
    }

    // Query all businesses (dataset is small enough - ~5,500 rows)
    const stmt = db.prepare('SELECT * FROM businesses');
    const rows = stmt.all();

    if (logProgress) {
      console.log(`Processing ${rows.length} rows...`);
    }

    // Validate and transform rows
    const validRecords: Array<Record<string, unknown>> = [];
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as Record<string, unknown>;
      const rowNumber = i + 1;

      const validationResult = validateBusinessRow(row);

      if (validationResult.success) {
        validRecords.push(validationResult.data);
      } else {
        const errorMsg = validationResult.errors
          .map((e) => `${e.field}: ${e.message}`)
          .join(', ');
        errors.push({ row: rowNumber, error: errorMsg });
      }
    }

    if (logProgress) {
      console.log(
        `Validation complete: ${validRecords.length} valid, ${errors.length} invalid`
      );
    }

    // Create Supabase service client (bypasses RLS for bulk import)
    const supabase = createServiceClient();

    // Insert in batches
    let imported = 0;
    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from('businesses')
        .insert(batch);

      if (insertError) {
        // Log batch error but continue
        const batchStart = i + 1;
        const batchEnd = Math.min(i + batchSize, validRecords.length);
        console.error(
          `Batch insert error (rows ${batchStart}-${batchEnd}):`,
          insertError.message
        );

        // Add to errors array
        errors.push({
          row: batchStart,
          error: `Batch insert failed: ${insertError.message}`,
        });
      } else {
        imported += batch.length;

        if (logProgress && imported % 1000 === 0) {
          console.log(`Imported ${imported} / ${validRecords.length} records...`);
        }
      }
    }

    if (logProgress) {
      console.log(`\nImport complete:`);
      console.log(`  Total rows: ${totalRows}`);
      console.log(`  Imported: ${imported}`);
      console.log(`  Errors: ${errors.length}`);
      console.log(`  Success rate: ${((imported / totalRows) * 100).toFixed(1)}%`);
    }

    return {
      imported,
      errors,
      total: totalRows,
    };
  } finally {
    // Always close SQLite connection
    db.close();
  }
}
