#!/usr/bin/env tsx
/**
 * Display instructions for applying the directory schema migration
 * Migration must be applied manually via Supabase SQL Editor
 */

import fs from 'fs';
import path from 'path';

function showMigrationInstructions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    process.exit(1);
  }

  // Extract project ref from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  console.log(`\n${'='.repeat(80)}`);
  console.log('APPLY DIRECTORY SCHEMA MIGRATION');
  console.log(`${'='.repeat(80)}\n`);

  console.log(`Step 1: Open Supabase SQL Editor`);
  if (projectRef) {
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);
  } else {
    console.log(`   Go to your Supabase project > SQL Editor > New query\n`);
  }

  console.log(`Step 2: Copy migration SQL`);
  const migrationPath = path.resolve(__dirname, '../supabase/migrations/00002_directory_schema.sql');
  console.log(`   File: ${migrationPath}`);

  // Read and display migration summary
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  const lines = migrationSQL.split('\n');

  console.log(`   Size: ${lines.length} lines (${Buffer.byteLength(migrationSQL, 'utf8')} bytes)\n`);

  console.log(`Step 3: Paste the migration SQL into the editor and click "Run"\n`);

  console.log(`Step 4: Verify tables were created`);
  console.log(`   Run: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`);
  console.log(`   Expected: organizations, businesses, profiles, screening_sessions\n`);

  console.log(`Step 5: Import organization data`);
  console.log(`   Run: npm run import:orgs\n`);

  console.log(`${'='.repeat(80)}\n`);

  // Display migration preview
  console.log(`Migration Preview (first 30 lines):\n`);
  console.log(lines.slice(0, 30).join('\n'));
  console.log(`\n... and ${lines.length - 30} more lines\n`);
}

showMigrationInstructions();
