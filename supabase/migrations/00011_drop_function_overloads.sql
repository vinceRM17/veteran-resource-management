-- Migration: Drop stale function overloads that cause PostgREST routing issues
--
-- Problem: CREATE OR REPLACE with different parameter counts creates NEW overloads
-- instead of replacing the old function. This causes PostgREST to route calls
-- to the wrong version. We need to drop all old overloads and keep only the
-- current version.
--
-- Overload history:
--   00002: search_organizations(TEXT,TEXT,TEXT,BOOLEAN,TEXT,INT,INT) - 7 params
--   00003: search_organizations(TEXT,TEXT,TEXT,BOOLEAN,TEXT,TEXT,INT,INT) - 8 params
--   00009: search_organizations(TEXT,TEXT,TEXT,BOOLEAN,TEXT,TEXT,TEXT,NUMERIC,NUMERIC,INT,INT) - 11 params
--   00002: search_businesses(TEXT,TEXT,TEXT,INT,INT) - 5 params
--   00003: search_businesses(TEXT,TEXT,TEXT,TEXT,INT,INT) - 6 params
--   00010: search_businesses(TEXT,TEXT,TEXT,TEXT,TEXT,NUMERIC,NUMERIC,INT,INT) - 9 params

-- ============================================================================
-- DROP ALL search_organizations OVERLOADS
-- ============================================================================

-- Original from 00002 (7 params, no filter_location)
DROP FUNCTION IF EXISTS public.search_organizations(TEXT, TEXT, TEXT, BOOLEAN, TEXT, INT, INT);

-- From 00003 (8 params, added filter_location)
DROP FUNCTION IF EXISTS public.search_organizations(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, INT, INT);

-- From 00009/00010 (11 params, added sort_by + coords)
DROP FUNCTION IF EXISTS public.search_organizations(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, INT, INT);

-- ============================================================================
-- DROP ALL search_businesses OVERLOADS
-- ============================================================================

-- Original from 00002 (5 params, no filter_location)
DROP FUNCTION IF EXISTS public.search_businesses(TEXT, TEXT, TEXT, INT, INT);

-- From 00003 (6 params, added filter_location)
DROP FUNCTION IF EXISTS public.search_businesses(TEXT, TEXT, TEXT, TEXT, INT, INT);

-- From 00010 (9 params, added sort_by + coords)
DROP FUNCTION IF EXISTS public.search_businesses(TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, INT, INT);

-- ============================================================================
-- RECREATE search_organizations (single clean version)
-- ============================================================================

CREATE FUNCTION public.search_organizations(
  query_text TEXT DEFAULT NULL,
  filter_state TEXT DEFAULT NULL,
  filter_service_category TEXT DEFAULT NULL,
  filter_va_accredited BOOLEAN DEFAULT NULL,
  filter_confidence_grade TEXT DEFAULT NULL,
  filter_location TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance',
  user_lat NUMERIC DEFAULT NULL,
  user_lng NUMERIC DEFAULT NULL,
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS TABLE (
  id UUID, org_name TEXT, city TEXT, state TEXT, zip_code TEXT,
  services_offered TEXT, service_categories TEXT,
  confidence_grade TEXT, confidence_score NUMERIC,
  last_verified_date DATE, va_accredited BOOLEAN,
  phone TEXT, email TEXT, website TEXT,
  rank REAL, total_count BIGINT,
  distance_miles NUMERIC
) AS $$
DECLARE
  offset_val INT := (page_number - 1) * page_size;
BEGIN
  RETURN QUERY
  SELECT
    o.id, o.org_name, o.city, o.state, o.zip_code,
    o.services_offered, o.service_categories,
    o.confidence_grade, o.confidence_score,
    o.last_verified_date, o.va_accredited,
    o.phone, o.email, o.website,
    CASE
      WHEN query_text IS NOT NULL AND length(trim(query_text)) >= 3
      THEN ts_rank(o.fts, websearch_to_tsquery('english', query_text))
      ELSE 1.0::REAL
    END AS rank,
    COUNT(*) OVER() AS total_count,
    CASE
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND zc.latitude IS NOT NULL
      THEN ROUND(haversine_miles(user_lat, user_lng, zc.latitude, zc.longitude), 1)
      ELSE NULL
    END AS distance_miles
  FROM public.organizations o
  LEFT JOIN public.zip_coordinates zc ON o.zip_code = zc.zip_code
  WHERE
    (query_text IS NULL OR length(trim(query_text)) < 3 OR o.fts @@ websearch_to_tsquery('english', query_text))
    AND (filter_state IS NULL OR o.state = filter_state)
    AND (filter_service_category IS NULL OR o.service_categories ILIKE '%' || filter_service_category || '%')
    AND (filter_va_accredited IS NULL OR o.va_accredited = filter_va_accredited)
    AND (filter_confidence_grade IS NULL OR o.confidence_grade = filter_confidence_grade)
    AND (filter_location IS NULL OR o.city ILIKE filter_location || '%' OR o.zip_code LIKE filter_location || '%')
  ORDER BY
    CASE
      WHEN sort_by = 'distance' AND user_lat IS NOT NULL AND user_lng IS NOT NULL AND zc.latitude IS NOT NULL
        THEN haversine_miles(user_lat, user_lng, zc.latitude, zc.longitude)
      WHEN sort_by = 'distance' THEN 999999
      ELSE NULL
    END ASC NULLS LAST,
    CASE WHEN sort_by = 'name' THEN o.org_name ELSE NULL END ASC NULLS LAST,
    CASE
      WHEN sort_by IS NULL OR sort_by = 'relevance' THEN
        CASE
          WHEN query_text IS NOT NULL AND length(trim(query_text)) >= 3
          THEN ts_rank(o.fts, websearch_to_tsquery('english', query_text))
          ELSE 1.0::REAL
        END
      ELSE NULL
    END DESC NULLS LAST,
    CASE
      WHEN sort_by IS NULL OR sort_by = 'relevance' THEN o.confidence_score
      ELSE NULL
    END DESC NULLS LAST
  LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- RECREATE search_businesses (single clean version)
-- ============================================================================

CREATE FUNCTION public.search_businesses(
  query_text TEXT DEFAULT NULL,
  filter_state TEXT DEFAULT NULL,
  filter_business_type TEXT DEFAULT NULL,
  filter_location TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance',
  user_lat NUMERIC DEFAULT NULL,
  user_lng NUMERIC DEFAULT NULL,
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS TABLE (
  id UUID, legal_business_name TEXT, dba_name TEXT,
  city TEXT, state TEXT, zip_code TEXT,
  business_type TEXT, naics_descriptions TEXT,
  phone TEXT, email TEXT, website TEXT,
  owner_name TEXT, service_branch TEXT,
  last_verified_date DATE,
  rank REAL, total_count BIGINT,
  distance_miles NUMERIC
) AS $$
DECLARE
  offset_val INT := (page_number - 1) * page_size;
BEGIN
  RETURN QUERY
  SELECT
    b.id, b.legal_business_name, b.dba_name,
    b.city, b.state, b.zip_code,
    b.business_type, b.naics_descriptions,
    b.phone, b.email, b.website,
    b.owner_name, b.service_branch,
    b.last_verified_date,
    CASE
      WHEN query_text IS NOT NULL AND length(trim(query_text)) >= 3
      THEN ts_rank(b.fts, websearch_to_tsquery('english', query_text))
      ELSE 1.0::REAL
    END AS rank,
    COUNT(*) OVER() AS total_count,
    CASE
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND zc.latitude IS NOT NULL
      THEN ROUND(haversine_miles(user_lat, user_lng, zc.latitude, zc.longitude), 1)
      ELSE NULL
    END AS distance_miles
  FROM public.businesses b
  LEFT JOIN public.zip_coordinates zc ON b.zip_code = zc.zip_code
  WHERE
    (query_text IS NULL OR length(trim(query_text)) < 3 OR b.fts @@ websearch_to_tsquery('english', query_text))
    AND (filter_state IS NULL OR b.state = filter_state)
    AND (filter_business_type IS NULL OR b.business_type = filter_business_type)
    AND (filter_location IS NULL OR b.city ILIKE filter_location || '%' OR b.zip_code LIKE filter_location || '%')
  ORDER BY
    CASE
      WHEN sort_by = 'distance' AND user_lat IS NOT NULL AND user_lng IS NOT NULL AND zc.latitude IS NOT NULL
        THEN haversine_miles(user_lat, user_lng, zc.latitude, zc.longitude)
      WHEN sort_by = 'distance' THEN 999999
      ELSE NULL
    END ASC NULLS LAST,
    CASE WHEN sort_by = 'name' THEN b.legal_business_name ELSE NULL END ASC NULLS LAST,
    CASE
      WHEN sort_by IS NULL OR sort_by = 'relevance' THEN
        CASE
          WHEN query_text IS NOT NULL AND length(trim(query_text)) >= 3
          THEN ts_rank(b.fts, websearch_to_tsquery('english', query_text))
          ELSE 1.0::REAL
        END
      ELSE NULL
    END DESC NULLS LAST,
    b.legal_business_name ASC
  LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql STABLE;
