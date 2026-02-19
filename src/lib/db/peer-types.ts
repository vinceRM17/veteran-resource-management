/**
 * TypeScript types for peer connection search results and NTEE code mappings
 * These types support the peer connection features added in Phase 7.
 */

// ============================================================================
// PEER CONNECTION TYPE
// ============================================================================

/**
 * The three categories of peer connections veterans can browse
 */
export type PeerConnectionType = 'support-groups' | 'events' | 'opportunities';

// ============================================================================
// NTEE CODE MAPPING
// ============================================================================

/**
 * Maps each PeerConnectionType to the NTEE code wildcard patterns used to
 * filter organizations in search_peer_connections RPC function.
 *
 * NTEE codes:
 * - W30%: Veterans organizations (primary category for all types)
 * - P20%: Human service organizations - support groups
 * - P40%: Family services
 * - A23%: Cultural arts programs / community events
 * - A24%: Folk arts
 * - J21%: Employment services
 * - J22%: Vocational rehabilitation
 */
export const NTEE_CODE_MAP: Record<PeerConnectionType, string[]> = {
  'support-groups': ['W30%', 'P20%', 'P40%'],
  events: ['W30%', 'A23%', 'A24%'],
  opportunities: ['W30%', 'J21%', 'J22%'],
};

// ============================================================================
// SEARCH RESULT INTERFACE
// ============================================================================

/**
 * Shape of a single result returned by the search_peer_connections RPC function.
 * Extends OrganizationSearchResult with ntee_code, ntee_description, ein, and
 * tax_exempt_status fields needed for verification badge display.
 */
export interface PeerConnectionSearchResult {
  id: string;
  org_name: string;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  services_offered: string | null;
  ntee_code: string | null;
  ntee_description: string | null;
  ein: string | null;
  tax_exempt_status: string | null;
  va_accredited: boolean;
  phone: string | null;
  email: string | null;
  website: string | null;
  last_verified_date: string;
  confidence_score: number | null;
  rank: number;
  total_count: number;
}

// ============================================================================
// SEARCH PARAMS INTERFACE
// ============================================================================

/**
 * Parameters for the searchPeerConnections server query function
 */
export interface PeerConnectionSearchParams {
  type: PeerConnectionType;
  location?: string;
  branch?: string;
  era?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// VERIFICATION SOURCE
// ============================================================================

/**
 * Verification badge info for an organization listing.
 * Tiers: primary (VA), secondary (501c3), tertiary (IRS/directory)
 */
export interface VerificationSource {
  label: string;
  source: string;
  tier: 'primary' | 'secondary' | 'tertiary';
}

/**
 * Determines which verification badge to show for an organization.
 * Classification priority:
 *   1. VA Accredited — highest confidence, directly verified by VA
 *   2. Verified Nonprofit — IRS 501(c)(3) with EIN
 *   3. Registered Organization — has EIN but no 501(c)(3) status
 *   4. Listed Organization — directory listing only
 */
export function getVerificationSource(org: {
  va_accredited: boolean;
  ein: string | null;
  tax_exempt_status: string | null;
}): VerificationSource {
  if (org.va_accredited) {
    return {
      label: 'VA Accredited',
      source: 'U.S. Department of Veterans Affairs',
      tier: 'primary',
    };
  }

  if (org.ein && org.tax_exempt_status && org.tax_exempt_status.includes('501(c)(3)')) {
    return {
      label: 'Verified Nonprofit',
      source: `Registered 501(c)(3) (EIN: ${org.ein})`,
      tier: 'secondary',
    };
  }

  if (org.ein) {
    return {
      label: 'Registered Organization',
      source: 'IRS Exempt Organizations database',
      tier: 'tertiary',
    };
  }

  return {
    label: 'Listed Organization',
    source: 'Directory listing',
    tier: 'tertiary',
  };
}

// ============================================================================
// DISPLAY LABELS AND DESCRIPTIONS
// ============================================================================

/**
 * Human-readable display names for each peer connection type
 */
export const PEER_CONNECTION_LABELS: Record<PeerConnectionType, string> = {
  'support-groups': 'Support Groups',
  events: 'Events & Activities',
  opportunities: 'Opportunities',
};

/**
 * One-line descriptions for each type, used on the landing page category cards
 */
export const PEER_CONNECTION_DESCRIPTIONS: Record<PeerConnectionType, string> = {
  'support-groups':
    'Connect with veterans who understand. Find peer support groups, group therapy programs, and community organizations near you.',
  events:
    'Stay engaged with your community. Browse veteran events, activities, and programs from verified organizations in your area.',
  opportunities:
    'Take the next step in your career or service. Find employment assistance, vocational training, and volunteer opportunities for veterans.',
};
