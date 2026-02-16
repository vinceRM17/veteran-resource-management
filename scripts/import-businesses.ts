/**
 * CLI script to import veteran businesses from SQLite to Supabase
 *
 * Usage:
 *   npm run import:businesses
 *   npm run import:businesses -- /path/to/veteran_businesses.db
 */

import { config } from 'dotenv';
import { importBusinesses } from '@/lib/etl/parsers/business-import';
import path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function main() {
  // Get database path from CLI args or use default
  const args = process.argv.slice(2);
  const dbPath =
    args[0] ||
    path.resolve(
      process.cwd(),
      '../veteran-business-db/veteran_businesses.db'
    );

  console.log('='.repeat(60));
  console.log('Veteran Business Import - SQLite to Supabase');
  console.log('='.repeat(60));
  console.log(`Database: ${dbPath}\n`);

  try {
    const result = await importBusinesses(dbPath, {
      batchSize: 500,
      logProgress: true,
    });

    console.log('\n' + '='.repeat(60));
    console.log('IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total rows:     ${result.total}`);
    console.log(`Imported:       ${result.imported}`);
    console.log(`Errors:         ${result.errors.length}`);
    console.log(
      `Success rate:   ${((result.imported / result.total) * 100).toFixed(1)}%`
    );
    console.log(`Error rate:     ${((result.errors.length / result.total) * 100).toFixed(1)}%`);

    // Show first 10 errors if any
    if (result.errors.length > 0) {
      console.log('\n' + '-'.repeat(60));
      console.log('First 10 Errors:');
      console.log('-'.repeat(60));
      result.errors.slice(0, 10).forEach((err) => {
        console.log(`Row ${err.row}: ${err.error}`);
      });

      if (result.errors.length > 10) {
        console.log(`... and ${result.errors.length - 10} more errors`);
      }
    }

    console.log('\n' + '='.repeat(60));

    // Exit with error if error rate > 10%
    const errorRate = (result.errors.length / result.total) * 100;
    if (errorRate > 10) {
      console.error(
        `\nERROR: Error rate (${errorRate.toFixed(1)}%) exceeds 10% threshold`
      );
      console.error('Import rejected due to data quality issues');
      process.exit(1);
    }

    console.log('\nImport completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('IMPORT FAILED');
    console.error('='.repeat(60));
    console.error(error);
    process.exit(1);
  }
}

main();
