/**
 * Streaming CSV import for organization data
 * Validates rows with Zod, batches inserts for performance
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';
import fs from 'fs';
import { validateOrganizationRow, type ValidatedOrganization } from '../validators/organization';

const BATCH_SIZE = 1000;
const PROGRESS_LOG_INTERVAL = 5000;

interface ImportError {
  row: number;
  error: string;
}

interface ImportResult {
  imported: number;
  errors: ImportError[];
  total: number;
}

/**
 * Create a Supabase service role client (bypasses RLS for ETL)
 */
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Map validated CSV row to database organization record
 */
function mapToDbRecord(validated: ValidatedOrganization) {
  return {
    // Identity
    ein: validated.ein,
    org_name: validated.org_name,
    org_name_alt: validated.org_name_alt,
    org_type: validated.org_type,

    // Location
    street_address: validated.street_address,
    street_address_2: validated.street_address_2,
    city: validated.city,
    state: validated.state,
    zip_code: validated.zip_code,
    country: validated.country || 'US',

    // Contact
    phone: validated.phone,
    email: validated.email,
    website: validated.website,

    // Classification
    ntee_code: validated.ntee_code,
    ntee_description: validated.ntee_description,
    irs_subsection: validated.irs_subsection,
    tax_exempt_status: validated.tax_exempt_status,

    // Mission and Services
    mission_statement: validated.mission_statement,
    services_offered: validated.services_offered,
    service_categories: validated.service_categories,
    eligibility_requirements: validated.eligibility_requirements,
    service_area: validated.service_area,

    // Financials
    total_revenue: validated.total_revenue,
    total_expenses: validated.total_expenses,
    total_assets: validated.total_assets,

    // Staff
    num_employees: validated.num_employees,
    num_volunteers: validated.num_volunteers,

    // Quality Indicators
    charity_navigator_rating: validated.charity_navigator_rating,
    charity_navigator_score: validated.charity_navigator_score,
    va_accredited: validated.va_accredited,

    // Data Provenance
    data_sources: validated.data_sources,
    last_verified_date: validated.data_freshness_date || new Date().toISOString().split('T')[0],
    verification_method: 'csv_import',
    confidence_score: validated.confidence_score,
    confidence_grade: validated.confidence_grade,
  };
}

/**
 * Insert a batch of organizations into Supabase
 */
async function insertBatch(supabase: ReturnType<typeof createServiceClient>, batch: ValidatedOrganization[]) {
  const records = batch.map(mapToDbRecord);

  const { error } = await supabase.from('organizations').insert(records);

  if (error) {
    throw new Error(`Batch insert failed: ${error.message}`);
  }
}

/**
 * Import organizations from CSV file with streaming, validation, and batch insert
 */
export async function importOrganizations(filePath: string): Promise<ImportResult> {
  const supabase = createServiceClient();
  const errors: ImportError[] = [];
  let batch: ValidatedOrganization[] = [];
  let imported = 0;
  let total = 0;
  let rowNumber = 0;

  return new Promise((resolve, reject) => {
    const parser = parse({
      columns: true, // First row is headers
      skip_empty_lines: true,
      relax_column_count: true, // Allow inconsistent column counts
      bom: true, // Handle BOM (byte-order mark)
      trim: true,
    });

    const stream = fs.createReadStream(filePath).pipe(parser);

    stream.on('data', async (row: Record<string, string>) => {
      rowNumber++;
      total++;

      // Validate row
      const result = validateOrganizationRow(row);

      if (result.success) {
        batch.push(result.data);

        // Insert batch when it reaches BATCH_SIZE
        if (batch.length >= BATCH_SIZE) {
          try {
            await insertBatch(supabase, batch);
            imported += batch.length;
            batch = [];

            // Log progress every PROGRESS_LOG_INTERVAL rows
            if (total % PROGRESS_LOG_INTERVAL === 0) {
              console.log(`Processed ${total} rows (${imported} imported, ${errors.length} errors)`);
            }
          } catch (err) {
            console.error(`Batch insert error at row ${rowNumber}:`, err);
            errors.push({ row: rowNumber, error: String(err) });
            batch = []; // Clear batch on error to avoid retry loop
          }
        }
      } else {
        errors.push({ row: rowNumber, error: result.error });
      }
    });

    stream.on('end', async () => {
      try {
        // Insert remaining batch
        if (batch.length > 0) {
          await insertBatch(supabase, batch);
          imported += batch.length;
        }

        console.log(`\nImport complete: ${imported}/${total} rows imported (${errors.length} errors)`);
        resolve({ imported, errors, total });
      } catch (err) {
        reject(err);
      }
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}
