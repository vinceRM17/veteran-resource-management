/**
 * Database query functions for resource directory
 * Server-side wrappers around Supabase RPC functions
 */

import { createClient } from '@/lib/supabase/server';
import type { Organization, Business, OrganizationSearchResult, BusinessSearchResult, SortOption } from '@/lib/db/types';

// ============================================================================
// LOCATION RESOLUTION
// ============================================================================

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Resolve a user-entered location string to lat/lng coordinates
 * via the zip_coordinates table. Supports 5-digit zip codes and city names.
 */
export async function resolveLocationCoordinates(
  location: string,
  stateFilter?: string
): Promise<Coordinates | null> {
  const trimmed = location.trim();
  if (!trimmed) return null;

  const supabase = await createClient();

  // 5-digit zip code → exact lookup
  if (/^\d{5}$/.test(trimmed)) {
    const { data } = await supabase
      .from('zip_coordinates')
      .select('latitude, longitude')
      .eq('zip_code', trimmed)
      .limit(1)
      .single();

    if (data) {
      return { lat: Number(data.latitude), lng: Number(data.longitude) };
    }
    return null;
  }

  // City name lookup — scope by state if filtered
  let query = supabase
    .from('zip_coordinates')
    .select('latitude, longitude')
    .ilike('city', trimmed);

  if (stateFilter) {
    query = query.eq('state', stateFilter.toUpperCase());
  }

  const { data } = await query.limit(1).single();

  if (data) {
    return { lat: Number(data.latitude), lng: Number(data.longitude) };
  }

  return null;
}

// ============================================================================
// ORGANIZATION QUERIES
// ============================================================================

export interface SearchOrganizationsParams {
  query?: string;
  state?: string;
  serviceCategory?: string;
  vaAccredited?: boolean;
  location?: string;
  sortBy?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface SearchOrganizationsResult {
  results: OrganizationSearchResult[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Search organizations using full-text search with filters, sorting, and pagination
 * Calls the search_organizations RPC function defined in migration 00002 (updated in 00009)
 */
export async function searchOrganizations(params: SearchOrganizationsParams): Promise<SearchOrganizationsResult> {
  const supabase = await createClient();

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const sortBy = params.sortBy || 'relevance';

  // Resolve coordinates when sorting by distance
  let userLat: number | null = null;
  let userLng: number | null = null;

  if (sortBy === 'distance' && params.location) {
    const coords = await resolveLocationCoordinates(params.location, params.state);
    if (coords) {
      userLat = coords.lat;
      userLng = coords.lng;
    }
  }

  const { data, error } = await supabase.rpc('search_organizations', {
    query_text: params.query || null,
    filter_state: params.state || null,
    filter_service_category: params.serviceCategory || null,
    filter_va_accredited: params.vaAccredited ?? null,
    filter_confidence_grade: null,
    filter_location: params.location || null,
    sort_by: sortBy,
    user_lat: userLat,
    user_lng: userLng,
    page_number: page,
    page_size: pageSize,
  });

  if (error) {
    console.error('Error searching organizations:', error);
    return { results: [], totalCount: 0, page, pageSize, totalPages: 0 };
  }

  const results = (data || []) as OrganizationSearchResult[];
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

/**
 * Get a single organization by ID
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching organization:', error);
    return null;
  }

  return data as Organization;
}

/**
 * Get distinct states from organizations for filter dropdown
 */
export async function getDistinctStates(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('state')
    .not('state', 'is', null)
    .order('state');

  if (error) {
    console.error('Error fetching states:', error);
    return [];
  }

  // Get unique states
  const states = Array.from(new Set(data.map(row => row.state).filter(Boolean))) as string[];
  return states;
}

/**
 * Get predefined service categories for filter dropdown
 * Derived from common categories in the service_categories column
 */
export function getServiceCategories(): string[] {
  return [
    'Housing',
    'Healthcare',
    'Mental Health',
    'Employment',
    'Education',
    'Legal',
    'Financial',
    'Food',
    'Transportation',
    'Disability',
    'Family Support',
    'Substance Abuse',
    'Homelessness',
    'Benefits Assistance',
  ].sort();
}

// ============================================================================
// BUSINESS QUERIES
// ============================================================================

export interface SearchBusinessesParams {
  query?: string;
  state?: string;
  businessType?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchBusinessesResult {
  results: BusinessSearchResult[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Search businesses using full-text search with filters and pagination
 * Calls the search_businesses RPC function defined in migration 00002
 */
export async function searchBusinesses(params: SearchBusinessesParams): Promise<SearchBusinessesResult> {
  const supabase = await createClient();

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;

  const { data, error } = await supabase.rpc('search_businesses', {
    query_text: params.query || null,
    filter_state: params.state || null,
    filter_business_type: params.businessType || null,
    filter_location: params.location || null,
    page_number: page,
    page_size: pageSize,
  });

  if (error) {
    console.error('Error searching businesses:', error);
    return { results: [], totalCount: 0, page, pageSize, totalPages: 0 };
  }

  const results = (data || []) as BusinessSearchResult[];
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

/**
 * Get a single business by ID
 */
export async function getBusinessById(id: string): Promise<Business | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching business:', error);
    return null;
  }

  return data as Business;
}

/**
 * Get distinct business types from businesses for filter dropdown
 */
export async function getDistinctBusinessTypes(): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('businesses')
    .select('business_type')
    .not('business_type', 'is', null)
    .order('business_type');

  if (error) {
    console.error('Error fetching business types:', error);
    return [];
  }

  // Get unique business types
  const types = Array.from(new Set(data.map(row => row.business_type).filter(Boolean))) as string[];
  return types;
}
