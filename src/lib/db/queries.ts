/**
 * Database query functions for resource directory
 * Server-side wrappers around Supabase RPC functions
 */

import { createClient } from '@/lib/supabase/server';
import type { Organization, Business, OrganizationSearchResult, BusinessSearchResult } from '@/lib/db/types';

// ============================================================================
// ORGANIZATION QUERIES
// ============================================================================

export interface SearchOrganizationsParams {
  query?: string;
  state?: string;
  serviceCategory?: string;
  vaAccredited?: boolean;
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
 * Search organizations using full-text search with filters and pagination
 * Calls the search_organizations RPC function defined in migration 00002
 */
export async function searchOrganizations(params: SearchOrganizationsParams): Promise<SearchOrganizationsResult> {
  const supabase = await createClient();

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;

  const { data, error } = await supabase.rpc('search_organizations', {
    query_text: params.query || null,
    filter_state: params.state || null,
    filter_service_category: params.serviceCategory || null,
    filter_va_accredited: params.vaAccredited ?? null,
    filter_confidence_grade: null,
    page_number: page,
    page_size: pageSize,
  });

  if (error) {
    console.error('Error searching organizations:', error);
    throw error;
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
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching organization:', error);
    throw error;
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
    page_number: page,
    page_size: pageSize,
  });

  if (error) {
    console.error('Error searching businesses:', error);
    throw error;
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
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching business:', error);
    throw error;
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
