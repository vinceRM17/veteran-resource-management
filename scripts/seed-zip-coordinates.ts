#!/usr/bin/env tsx
/**
 * Seed zip_coordinates table with US zip code data from GeoNames.
 *
 * Usage:
 *   npm run seed:zips
 *
 * Downloads the free GeoNames US postal code dataset (~41k zip codes)
 * and inserts into the zip_coordinates table in batches.
 *
 * Data source: https://download.geonames.org/export/zip/US.zip
 * License: Creative Commons Attribution 4.0
 */

import { createWriteStream, createReadStream, existsSync, unlinkSync } from 'fs';
import { pipeline } from 'stream/promises';
import { createInterface } from 'readline';
import { join } from 'path';
import { execSync } from 'child_process';

// Load env from .env.local (Next.js convention)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const DATA_DIR = join(process.cwd(), 'data');
const ZIP_PATH = join(DATA_DIR, 'US.zip');
const TXT_PATH = join(DATA_DIR, 'US.txt');

interface ZipRow {
  zip_code: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

async function downloadGeoNames(): Promise<void> {
  if (existsSync(TXT_PATH)) {
    console.log('  US.txt already exists, skipping download');
    return;
  }

  // Ensure data dir exists
  execSync(`mkdir -p "${DATA_DIR}"`, { stdio: 'pipe' });

  console.log('  Downloading US zip code data from GeoNames...');
  const url = 'https://download.geonames.org/export/zip/US.zip';
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const writer = createWriteStream(ZIP_PATH);
  // @ts-expect-error ReadableStream to Node stream
  await pipeline(response.body, writer);

  console.log('  Extracting...');
  execSync(`unzip -o "${ZIP_PATH}" US.txt -d "${DATA_DIR}"`, { stdio: 'pipe' });

  // Clean up zip file
  if (existsSync(ZIP_PATH)) {
    unlinkSync(ZIP_PATH);
  }
}

async function parseGeoNames(): Promise<ZipRow[]> {
  const rows: ZipRow[] = [];
  const seen = new Set<string>();

  const rl = createInterface({
    input: createReadStream(TXT_PATH, 'utf-8'),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    // GeoNames tab-delimited: country, postal_code, place_name, state_name, state_code, ...lat, lng, accuracy
    const parts = line.split('\t');
    if (parts.length < 11) continue;

    const zipCode = parts[1].trim();
    const city = parts[2].trim();
    const stateCode = parts[4].trim();
    const lat = parseFloat(parts[9]);
    const lng = parseFloat(parts[10]);

    // Skip invalid or duplicate zip codes (keep first occurrence)
    if (!zipCode || zipCode.length !== 5 || seen.has(zipCode)) continue;
    if (isNaN(lat) || isNaN(lng)) continue;

    seen.add(zipCode);
    rows.push({
      zip_code: zipCode,
      city,
      state: stateCode,
      latitude: lat,
      longitude: lng,
    });
  }

  return rows;
}

async function insertBatch(rows: ZipRow[]): Promise<void> {
  const response = await fetch(`${supabaseUrl}/rest/v1/zip_coordinates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey!,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'resolution=ignore-duplicates',
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Insert failed (${response.status}): ${text}`);
  }
}

async function seed() {
  console.log('Seeding zip_coordinates table...\n');

  // Download and parse data
  await downloadGeoNames();
  const rows = await parseGeoNames();
  console.log(`  Parsed ${rows.length} unique zip codes\n`);

  // Batch insert in chunks of 500
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await insertBatch(batch);
    inserted += batch.length;
    const pct = Math.round((inserted / rows.length) * 100);
    process.stdout.write(`\r  Inserted ${inserted}/${rows.length} (${pct}%)`);
  }

  console.log(`\n\nDone! Seeded ${inserted} zip codes.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
