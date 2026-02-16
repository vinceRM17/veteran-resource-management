#!/usr/bin/env tsx
/**
 * CLI script to import organization data from CSV into Supabase
 * Usage: npm run import:orgs [csv-file-path]
 * Default path: ../vet_org_directory/data/output/veteran_org_directory.csv
 */

import { importOrganizations } from '../src/lib/etl/parsers/organization-import';
import path from 'path';

const DEFAULT_CSV_PATH = '../vet_org_directory/data/output/veteran_org_directory.csv';
const ERROR_RATE_THRESHOLD = 0.1; // 10% error rate threshold

async function main() {
  // Get CSV path from CLI args or use default
  const csvPath = process.argv[2] || DEFAULT_CSV_PATH;
  const resolvedPath = path.resolve(process.cwd(), csvPath);

  console.log(`Starting organization import from: ${resolvedPath}\n`);

  try {
    const result = await importOrganizations(resolvedPath);

    // Print summary
    console.log('\n=== Import Summary ===');
    console.log(`Total rows: ${result.total}`);
    console.log(`Imported: ${result.imported}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Success rate: ${((result.imported / result.total) * 100).toFixed(2)}%`);

    // Print first 10 errors if any
    if (result.errors.length > 0) {
      console.log('\n=== First 10 Errors ===');
      result.errors.slice(0, 10).forEach((err) => {
        console.log(`Row ${err.row}: ${err.error}`);
      });

      if (result.errors.length > 10) {
        console.log(`\n... and ${result.errors.length - 10} more errors`);
      }
    }

    // Check error rate threshold
    const errorRate = result.errors.length / result.total;
    if (errorRate > ERROR_RATE_THRESHOLD) {
      console.error(
        `\nERROR: Error rate (${(errorRate * 100).toFixed(2)}%) exceeds threshold (${ERROR_RATE_THRESHOLD * 100}%)`
      );
      console.error('This indicates a data quality issue. Please review the errors above.');
      process.exit(1);
    }

    console.log('\n✓ Import completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n✗ Import failed:', err);
    process.exit(1);
  }
}

main();
