-- Migration: Add zip_coordinates reference table and proximity sorting to search_organizations
-- Apply via Supabase Dashboard -> SQL Editor

-- ============================================================================
-- ZIP COORDINATES TABLE (~41k US zip codes with lat/lng)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.zip_coordinates (
  zip_code TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL
);

-- Indexes for city/state lookups
CREATE INDEX idx_zip_city_state ON public.zip_coordinates (LOWER(city), state);
CREATE INDEX idx_zip_state ON public.zip_coordinates (state);

-- RLS: public read access
ALTER TABLE public.zip_coordinates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Zip coordinates are publicly readable"
  ON public.zip_coordinates FOR SELECT USING (true);

-- ============================================================================
-- HAVERSINE DISTANCE FUNCTION (returns miles)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.haversine_miles(
  lat1 NUMERIC, lon1 NUMERIC,
  lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  r NUMERIC := 3958.8; -- Earth radius in miles
  dlat NUMERIC;
  dlon NUMERIC;
  a NUMERIC;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlon := RADIANS(lon2 - lon1);
  a := SIN(dlat / 2) ^ 2 + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlon / 2) ^ 2;
  RETURN r * 2 * ASIN(SQRT(a));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- UPDATED search_organizations WITH SORT + DISTANCE SUPPORT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_organizations(
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
    -- Distance calculation via zip_coordinates join
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
    CASE sort_by
      WHEN 'distance' THEN
        CASE
          WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND zc.latitude IS NOT NULL
          THEN haversine_miles(user_lat, user_lng, zc.latitude, zc.longitude)
          ELSE 999999
        END
      ELSE 0
    END ASC,
    CASE sort_by
      WHEN 'name' THEN o.org_name
      ELSE NULL
    END ASC NULLS LAST,
    CASE
      WHEN sort_by = 'relevance' OR sort_by IS NULL THEN
        CASE
          WHEN query_text IS NOT NULL AND length(trim(query_text)) >= 3
          THEN ts_rank(o.fts, websearch_to_tsquery('english', query_text))
          ELSE 1.0::REAL
        END
      ELSE 0::REAL
    END DESC,
    CASE
      WHEN sort_by = 'relevance' OR sort_by IS NULL THEN o.confidence_score
      ELSE NULL
    END DESC NULLS LAST
  LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql STABLE;
