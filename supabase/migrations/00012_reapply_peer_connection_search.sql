-- Migration: Add peer connection search RPC function
-- Purpose: Filter organizations by NTEE codes and location for peer connection features
-- Apply via Supabase Dashboard -> SQL Editor

-- ============================================================================
-- PEER CONNECTION SEARCH RPC FUNCTION
-- ============================================================================
-- This function queries organizations by NTEE code patterns, enabling veterans
-- to find verified support groups, events, and opportunities from the directory.
--
-- NTEE code patterns use SQL LIKE wildcards (e.g., 'W30%' matches W301, W302, etc.)
-- Location filtering matches city or zip prefix, consistent with search_organizations.
--
-- filter_branch and filter_era are included for API stability but are pass-through
-- for now — the organizations table does not yet have branch/era columns.
-- These parameters are reserved for future enhancement when branch/era data
-- is collected from veteran service organizations.

CREATE OR REPLACE FUNCTION public.search_peer_connections(
  filter_location TEXT DEFAULT NULL,
  filter_ntee_codes TEXT[] DEFAULT NULL,
  filter_branch TEXT DEFAULT NULL,
  filter_era TEXT DEFAULT NULL,
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  org_name TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  services_offered TEXT,
  ntee_code TEXT,
  ntee_description TEXT,
  ein TEXT,
  tax_exempt_status TEXT,
  va_accredited BOOLEAN,
  phone TEXT,
  email TEXT,
  website TEXT,
  last_verified_date DATE,
  confidence_score NUMERIC,
  rank BIGINT,
  total_count BIGINT
) AS $$
DECLARE
  offset_val INT := (page_number - 1) * page_size;
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.org_name,
    o.city,
    o.state,
    o.zip_code,
    o.services_offered,
    o.ntee_code,
    o.ntee_description,
    o.ein,
    o.tax_exempt_status,
    o.va_accredited,
    o.phone,
    o.email,
    o.website,
    o.last_verified_date,
    o.confidence_score,
    ROW_NUMBER() OVER (
      ORDER BY
        o.va_accredited DESC,
        o.confidence_score DESC NULLS LAST,
        o.org_name ASC
    ) AS rank,
    COUNT(*) OVER () AS total_count
  FROM public.organizations o
  WHERE
    -- NTEE code filter: match any of the provided wildcard patterns
    (
      filter_ntee_codes IS NULL
      OR EXISTS (
        SELECT 1
        FROM unnest(filter_ntee_codes) AS pattern
        WHERE o.ntee_code LIKE pattern
      )
    )
    -- Location filter: city prefix or zip prefix match
    AND (
      filter_location IS NULL
      OR o.city ILIKE '%' || filter_location || '%'
      OR o.zip_code ILIKE filter_location || '%'
    )
    -- filter_branch: placeholder for future enhancement (no branch column yet)
    -- filter_era: placeholder for future enhancement (no era column yet)
  ORDER BY
    o.va_accredited DESC,
    o.confidence_score DESC NULLS LAST,
    o.org_name ASC
  LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.search_peer_connections IS
'Search organizations by NTEE code patterns and location for peer connection features.
Returns verified support groups, events organizations, and opportunity providers from
the resource directory, ordered by VA accreditation status and data confidence score.
Parameters filter_branch and filter_era are reserved for future enhancement.';

-- Grant execute to authenticated and anonymous users (same pattern as other search functions)
GRANT EXECUTE ON FUNCTION public.search_peer_connections TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_peer_connections TO anon;
