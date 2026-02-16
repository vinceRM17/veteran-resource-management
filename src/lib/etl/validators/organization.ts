/**
 * Zod validation schema for organization CSV rows
 * Validates and transforms raw CSV data before database insertion
 */

import { z } from 'zod';

// Helper transformers
const trimString = z.string().transform((val) => {
  const trimmed = val.trim();
  return trimmed === '' ? null : trimmed;
});

const optionalTrimString = z.string().optional().transform((val) => {
  if (!val) return null;
  const trimmed = val.trim();
  return trimmed === '' ? null : trimmed;
});

const booleanFromString = z.string().optional().transform((val) => {
  if (!val) return false;
  const normalized = val.trim().toLowerCase();
  return normalized === 'yes' || normalized === 'true' || normalized === '1';
});

const optionalNumber = z.string().optional().transform((val) => {
  if (!val || val.trim() === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
});

const einPattern = /^\d{2}-\d{7}$/;
const statePattern = /^[A-Z]{2}$/;

const phoneTransform = z.string().optional().transform((val) => {
  if (!val) return null;
  // Strip all non-digits
  const digits = val.replace(/\D/g, '');
  // Keep if 10+ digits (valid US phone number length)
  return digits.length >= 10 ? digits : null;
});

const urlTransform = z.string().optional().transform((val) => {
  if (!val) return null;
  const trimmed = val.trim();
  if (trimmed === '') return null;
  // Basic URL check
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return null;
  return trimmed;
});

const emailTransform = z.string().optional().transform((val) => {
  if (!val) return null;
  const trimmed = val.trim();
  if (trimmed === '' || !trimmed.includes('@')) return null;
  return trimmed;
});

const dataSourcesTransform = z.string().optional().transform((val) => {
  if (!val || val.trim() === '') return null;
  // Split by semicolon or comma
  return val.split(/[;,]/).map((s) => s.trim()).filter((s) => s !== '');
});

const confidenceScoreTransform = z.string().optional().transform((val) => {
  if (!val || val.trim() === '') return null;
  const num = Number(val);
  if (isNaN(num) || num < 0 || num > 1) return null;
  return num;
});

/**
 * Zod schema for validating organization CSV rows
 * Matches the 52-column structure from vet_org_directory
 */
export const OrganizationSchema = z.object({
  // Identity (org_name is REQUIRED)
  org_name: trimString.refine((val) => val !== null && val.length > 0, {
    message: 'org_name is required and cannot be empty',
  }),
  org_name_alt: optionalTrimString,
  ein: optionalTrimString.transform((val) => {
    if (!val) return null;
    // Validate EIN pattern if present
    if (!einPattern.test(val)) return null;
    return val;
  }),
  org_type: optionalTrimString,

  // Location
  street_address: optionalTrimString,
  street_address_2: optionalTrimString,
  city: optionalTrimString,
  state: optionalTrimString.transform((val) => {
    if (!val) return null;
    const upper = val.toUpperCase();
    // Validate 2-letter state code if present
    if (!statePattern.test(upper)) return null;
    return upper;
  }),
  zip_code: optionalTrimString,
  country: optionalTrimString,

  // Contact
  phone: phoneTransform,
  email: emailTransform,
  website: urlTransform,

  // Classification
  ntee_code: optionalTrimString,
  ntee_description: optionalTrimString,
  irs_subsection: optionalTrimString,
  irs_filing_requirement: optionalTrimString, // Not in DB but in CSV
  tax_exempt_status: optionalTrimString,
  ruling_date: optionalTrimString, // Not in DB but in CSV

  // Mission and Services
  mission_statement: optionalTrimString,
  services_offered: optionalTrimString,
  service_categories: optionalTrimString,
  eligibility_requirements: optionalTrimString,
  service_area: optionalTrimString,

  // Organization Details (not all in DB)
  year_founded: optionalTrimString,
  fiscal_year_end: optionalTrimString,

  // Financials
  total_revenue: optionalNumber,
  total_expenses: optionalNumber,
  total_assets: optionalNumber,
  total_liabilities: optionalNumber, // Not in DB
  net_assets: optionalNumber, // Not in DB
  annual_revenue_range: optionalTrimString, // Not in DB

  // Staff
  num_employees: optionalNumber.transform((val) => (val === null ? null : Math.floor(val))),
  num_volunteers: optionalNumber.transform((val) => (val === null ? null : Math.floor(val))),

  // Personnel (not in DB but in CSV)
  key_personnel: optionalTrimString,
  board_members: optionalTrimString,

  // Quality Indicators
  charity_navigator_rating: optionalNumber,
  charity_navigator_score: optionalNumber,
  cn_alert_level: optionalTrimString, // Not in DB
  va_accredited: booleanFromString,
  accreditation_details: optionalTrimString, // Not in DB

  // Social Media (not in DB)
  facebook_url: optionalTrimString,
  twitter_url: optionalTrimString,
  linkedin_url: optionalTrimString,
  instagram_url: optionalTrimString,
  youtube_url: optionalTrimString,

  // Data Provenance
  data_sources: dataSourcesTransform,
  data_freshness_date: optionalTrimString,
  confidence_score: confidenceScoreTransform,
  confidence_grade: optionalTrimString.transform((val) => {
    if (!val) return null;
    const upper = val.toUpperCase();
    if (!['A', 'B', 'C', 'D', 'F'].includes(upper)) return null;
    return upper;
  }),
  confidence_detail: optionalTrimString, // Not in DB
  record_last_updated: optionalTrimString, // Not in DB
});

export type ValidatedOrganization = z.infer<typeof OrganizationSchema>;

/**
 * Validate a raw CSV row and return success/failure result
 */
export function validateOrganizationRow(
  row: Record<string, string>
): { success: true; data: ValidatedOrganization } | { success: false; error: string } {
  try {
    const result = OrganizationSchema.safeParse(row);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      // Format Zod errors into readable message
      const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errors };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
