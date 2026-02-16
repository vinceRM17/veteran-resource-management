-- Migration: Add location (city/zip) filtering to search functions
-- Apply via Supabase Dashboard -> SQL Editor

-- ============================================================================
-- UPDATE search_organizations to support location filtering
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_organizations(
  query_text TEXT DEFAULT NULL,
  filter_state TEXT DEFAULT NULL,
  filter_service_category TEXT DEFAULT NULL,
  filter_va_accredited BOOLEAN DEFAULT NULL,
  filter_confidence_grade TEXT DEFAULT NULL,
  filter_location TEXT DEFAULT NULL,
  page_number INT DEFAULT 1,
  page_size INT DEFAULT 20
)
RETURNS TABLE (
  id UUID, org_name TEXT, city TEXT, state TEXT, zip_code TEXT,
  services_offered TEXT, service_categories TEXT,
  confidence_grade TEXT, confidence_score NUMERIC,
  last_verified_date DATE, va_accredited BOOLEAN,
  phone TEXT, email TEXT, website TEXT,
  rank REAL, total_count BIGINT
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
    COUNT(*) OVER() AS total_count
  FROM public.organizations o
  WHERE
    (query_text IS NULL OR length(trim(query_text)) < 3 OR o.fts @@ websearch_to_tsquery('english', query_text))
    AND (filter_state IS NULL OR o.state = filter_state)
    AND (filter_service_category IS NULL OR o.service_categories ILIKE '%' || filter_service_category || '%')
    AND (filter_va_accredited IS NULL OR o.va_accredited = filter_va_accredited)
    AND (filter_confidence_grade IS NULL OR o.confidence_grade = filter_confidence_grade)
    AND (filter_location IS NULL OR o.city ILIKE filter_location || '%' OR o.zip_code LIKE filter_location || '%')
  ORDER BY
    CASE
      WHEN query_text IS NOT NULL AND length(trim(query_text)) >= 3
      THEN ts_rank(o.fts, websearch_to_tsquery('english', query_text))
      ELSE 1.0::REAL
    END DESC,
    o.confidence_score DESC NULLS LAST
  LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- UPDATE search_businesses to support location filtering
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_businesses(
  query_text TEXT DEFAULT NULL,
  filter_state TEXT DEFAULT NULL,
  filter_business_type TEXT DEFAULT NULL,
  filter_location TEXT DEFAULT NULL,
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
  rank REAL, total_count BIGINT
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
    COUNT(*) OVER() AS total_count
  FROM public.businesses b
  WHERE
    (query_text IS NULL OR length(trim(query_text)) < 3 OR b.fts @@ websearch_to_tsquery('english', query_text))
    AND (filter_state IS NULL OR b.state = filter_state)
    AND (filter_business_type IS NULL OR b.business_type = filter_business_type)
    AND (filter_location IS NULL OR b.city ILIKE filter_location || '%' OR b.zip_code LIKE filter_location || '%')
  ORDER BY
    CASE
      WHEN query_text IS NOT NULL AND length(trim(query_text)) >= 3
      THEN ts_rank(b.fts, websearch_to_tsquery('english', query_text))
      ELSE 1.0::REAL
    END DESC,
    b.legal_business_name ASC
  LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql STABLE;
