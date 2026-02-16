/**
 * Database types for resource directory tables
 * These types mirror the Supabase schema defined in 00002_directory_schema.sql
 */

// ============================================================================
// ORGANIZATIONS TABLE
// ============================================================================

export interface Organization {
  id: string;

  // Identity
  ein: string | null;
  org_name: string;
  org_name_alt: string | null;
  org_type: string | null;

  // Location
  street_address: string | null;
  street_address_2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;

  // Contact
  phone: string | null;
  email: string | null;
  website: string | null;

  // Classification
  ntee_code: string | null;
  ntee_description: string | null;
  irs_subsection: string | null;
  tax_exempt_status: string | null;

  // Mission and Services
  mission_statement: string | null;
  services_offered: string | null;
  service_categories: string | null;
  eligibility_requirements: string | null;
  service_area: string | null;

  // Financials
  total_revenue: number | null;
  total_expenses: number | null;
  total_assets: number | null;

  // Staff
  num_employees: number | null;
  num_volunteers: number | null;

  // Quality Indicators
  charity_navigator_rating: number | null;
  charity_navigator_score: number | null;
  va_accredited: boolean;

  // Data Provenance
  data_sources: string[] | null;
  last_verified_date: string;
  verification_method: string | null;
  confidence_score: number | null;
  confidence_grade: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// BUSINESSES TABLE
// ============================================================================

export interface Business {
  id: string;

  // Identity
  uei: string | null;
  cage_code: string | null;
  legal_business_name: string;
  dba_name: string | null;

  // Location
  physical_address_line1: string | null;
  physical_address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;

  // Contact
  phone: string | null;
  email: string | null;
  website: string | null;

  // Business Classification
  business_type: string | null;
  naics_codes: string | null;
  naics_descriptions: string | null;

  // Owner Information
  owner_name: string | null;
  service_branch: string | null;

  // Registration
  registration_status: string | null;
  registration_expiration: string | null;
  source: string | null;

  // Data Provenance
  last_verified_date: string;
  verification_method: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SEARCH RESULT TYPES (matching RPC function returns)
// ============================================================================

export interface OrganizationSearchResult {
  id: string;
  org_name: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  services_offered: string | null;
  service_categories: string | null;
  confidence_grade: string | null;
  confidence_score: number | null;
  last_verified_date: string;
  va_accredited: boolean;
  phone: string | null;
  email: string | null;
  website: string | null;
  rank: number;
  total_count: number;
}

export interface BusinessSearchResult {
  id: string;
  legal_business_name: string;
  dba_name: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  business_type: string | null;
  naics_descriptions: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  owner_name: string | null;
  service_branch: string | null;
  last_verified_date: string;
  rank: number;
  total_count: number;
}

// ============================================================================
// FRESHNESS STATUS (mirrors SQL freshness_status function)
// ============================================================================

export type FreshnessStatus = 'fresh' | 'stale' | 'outdated';

/**
 * Calculate freshness status based on last verified date
 * Mirrors the SQL freshness_status() function logic:
 * - fresh: verified within last 6 months
 * - stale: verified within last year (but > 6 months)
 * - outdated: verified more than 1 year ago
 */
export function getFreshnessStatus(lastVerifiedDate: string): FreshnessStatus {
  const verified = new Date(lastVerifiedDate);
  const now = new Date();
  const monthsAgo = (now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsAgo < 6) {
    return 'fresh';
  } else if (monthsAgo < 12) {
    return 'stale';
  } else {
    return 'outdated';
  }
}

/**
 * Get Tailwind CSS color class for freshness status
 */
export function getFreshnessColor(status: FreshnessStatus): string {
  switch (status) {
    case 'fresh':
      return 'text-green-600';
    case 'stale':
      return 'text-yellow-600';
    case 'outdated':
      return 'text-red-600';
  }
}

/**
 * Get human-readable label for freshness status
 */
export function getFreshnessLabel(status: FreshnessStatus): string {
  switch (status) {
    case 'fresh':
      return 'Verified';
    case 'stale':
      return 'Needs Review';
    case 'outdated':
      return 'Outdated';
  }
}
