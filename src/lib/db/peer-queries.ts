'use server';

/**
 * Server query functions for peer connection search
 * Calls search_peer_connections RPC function using NTEE code mapping
 */

import { createClient } from '@/lib/supabase/server';
import {
  NTEE_CODE_MAP,
  type PeerConnectionSearchParams,
  type PeerConnectionSearchResult,
} from '@/lib/db/peer-types';

// ============================================================================
// SEARCH RESULT TYPE
// ============================================================================

export interface SearchPeerConnectionsResult {
  results: PeerConnectionSearchResult[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// PEER CONNECTION QUERY
// ============================================================================

/**
 * Search organizations by peer connection type using NTEE code filtering.
 * Calls the search_peer_connections RPC function defined in migration 00008.
 *
 * @param params - Search parameters including type, location, branch, era, and pagination
 * @returns Paginated search results with total count and page metadata
 */
export async function searchPeerConnections(
  params: PeerConnectionSearchParams
): Promise<SearchPeerConnectionsResult> {
  const supabase = await createClient();

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const nteeCodes = NTEE_CODE_MAP[params.type];

  const { data, error } = await supabase.rpc('search_peer_connections', {
    filter_location: params.location || null,
    filter_ntee_codes: nteeCodes,
    filter_branch: params.branch || null,
    filter_era: params.era || null,
    page_number: page,
    page_size: pageSize,
  });

  if (error) {
    console.error('Error searching peer connections:', error);
    return { results: [], totalCount: 0, page, pageSize, totalPages: 0 };
  }

  const results = (data || []) as PeerConnectionSearchResult[];
  const totalCount = results.length > 0 ? results[0].total_count : 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    results,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
