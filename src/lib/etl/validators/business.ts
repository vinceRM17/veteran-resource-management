/**
 * Zod validation schema for veteran business records from SQLite
 * Maps from veteran-business-db schema to Supabase businesses table
 */

import { z } from 'zod';

/**
 * Business validation schema for SQLite import
 *
 * SQLite columns (veteran_businesses.db):
 * - id, uei, cage_code, legal_business_name, dba_name
 * - physical_address_line1, physical_address_line2, city, state, zip_code, country
 * - phone, email, website
 * - business_type, naics_codes, naics_descriptions
 * - service_branch, certification_date, registration_status, registration_expiration
 * - entity_start_date, source, latitude, longitude, distance_miles
 * - date_added, date_updated, notes
 * - owner_name, linkedin_url, yelp_rating, yelp_review_count, yelp_url
 *
 * PostgreSQL schema (businesses table):
 * - Excludes: id (Supabase generates UUID), distance_miles (relative to Active Heroes),
 *   certification_date, linkedin_url, yelp_* (not in MVP schema)
 */

export const BusinessSchema = z.object({
  // Identity - legal_business_name is REQUIRED
  legal_business_name: z
    .string()
    .trim()
    .min(1, 'Business name is required')
    .transform((val) => val || null),

  uei: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  cage_code: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  dba_name: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  // Location
  physical_address_line1: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  physical_address_line2: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  city: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  state: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^[A-Z]{2}$/.test(val),
      'State must be 2 uppercase letters'
    )
    .transform((val) => (val && val.length > 0 ? val : null)),

  zip_code: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  country: z
    .string()
    .trim()
    .optional()
    .nullable()
    .default('USA')
    .transform((val) => (val && val.length > 0 ? val : null)),

  latitude: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'number' ? val : parseFloat(val as string);
      return isNaN(num) ? null : num;
    }),

  longitude: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = typeof val === 'number' ? val : parseFloat(val as string);
      return isNaN(num) ? null : num;
    }),

  // Contact
  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || val.includes('@'),
      'Email must contain @'
    )
    .transform((val) => (val && val.length > 0 ? val : null)),

  website: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  // Business Classification
  business_type: z
    .string()
    .trim()
    .optional()
    .nullable()
    .default('Veteran Owned Small Business')
    .transform((val) =>
      val && val.length > 0 ? val : 'Veteran Owned Small Business'
    ),

  naics_codes: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  naics_descriptions: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  // Owner Information
  owner_name: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  service_branch: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  // Registration
  registration_status: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  registration_expiration: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  source: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  // Data Provenance - extract last_verified_date from date_added/date_updated
  date_added: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  date_updated: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  // Fields NOT mapped to PostgreSQL (excluded from final output)
  // - id (SQLite integer, replaced with Supabase UUID)
  // - distance_miles (relative to Active Heroes location, not useful)
  // - certification_date (not in PostgreSQL schema)
  // - entity_start_date (not in PostgreSQL schema)
  // - notes (not in PostgreSQL schema)
  // - linkedin_url, yelp_* (not in MVP schema)
});

export type ValidatedBusiness = z.infer<typeof BusinessSchema>;

/**
 * Transform validated SQLite row to Supabase insert format
 * Maps date_added/date_updated to last_verified_date (take most recent)
 */
export function transformBusinessRow(validated: ValidatedBusiness) {
  // Determine last_verified_date from date_added/date_updated (take most recent)
  let lastVerifiedDate = new Date().toISOString().split('T')[0]; // Default to today

  if (validated.date_updated) {
    try {
      lastVerifiedDate = new Date(validated.date_updated).toISOString().split('T')[0];
    } catch {
      // Invalid date, keep default
    }
  } else if (validated.date_added) {
    try {
      lastVerifiedDate = new Date(validated.date_added).toISOString().split('T')[0];
    } catch {
      // Invalid date, keep default
    }
  }

  // If both exist, take the more recent one
  if (validated.date_added && validated.date_updated) {
    try {
      const added = new Date(validated.date_added);
      const updated = new Date(validated.date_updated);
      lastVerifiedDate = (updated > added ? updated : added).toISOString().split('T')[0];
    } catch {
      // Invalid date comparison, keep default
    }
  }

  // Return only fields that exist in PostgreSQL schema
  return {
    uei: validated.uei,
    cage_code: validated.cage_code,
    legal_business_name: validated.legal_business_name,
    dba_name: validated.dba_name,
    physical_address_line1: validated.physical_address_line1,
    physical_address_line2: validated.physical_address_line2,
    city: validated.city,
    state: validated.state,
    zip_code: validated.zip_code,
    country: validated.country,
    latitude: validated.latitude,
    longitude: validated.longitude,
    phone: validated.phone,
    email: validated.email,
    website: validated.website,
    business_type: validated.business_type,
    naics_codes: validated.naics_codes,
    naics_descriptions: validated.naics_descriptions,
    owner_name: validated.owner_name,
    service_branch: validated.service_branch,
    registration_status: validated.registration_status,
    registration_expiration: validated.registration_expiration,
    source: validated.source,
    last_verified_date: lastVerifiedDate,
    verification_method: 'SQLite Import',
  };
}

/**
 * Validate a single business row from SQLite
 * Returns validated data or error details
 */
export function validateBusinessRow(row: Record<string, unknown>) {
  const result = BusinessSchema.safeParse(row);

  if (result.success) {
    return {
      success: true as const,
      data: transformBusinessRow(result.data),
    };
  }

  return {
    success: false as const,
    errors: result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  };
}
