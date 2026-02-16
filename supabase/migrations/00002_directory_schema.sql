-- Apply this migration via Supabase Dashboard -> SQL Editor or supabase db push
-- This migration creates the resource directory tables (organizations + businesses) with full-text search

-- ============================================================================
-- ORGANIZATIONS TABLE (veteran service organizations from IRS + other sources)
-- ============================================================================

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  ein TEXT,
  org_name TEXT NOT NULL,
  org_name_alt TEXT,
  org_type TEXT,

  -- Location
  street_address TEXT,
  street_address_2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',

  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,

  -- Classification
  ntee_code TEXT,
  ntee_description TEXT,
  irs_subsection TEXT,
  tax_exempt_status TEXT,

  -- Mission and Services
  mission_statement TEXT,
  services_offered TEXT,
  service_categories TEXT,
  eligibility_requirements TEXT,
  service_area TEXT,

  -- Financials
  total_revenue NUMERIC,
  total_expenses NUMERIC,
  total_assets NUMERIC,

  -- Staff
  num_employees INTEGER,
  num_volunteers INTEGER,

  -- Quality Indicators
  charity_navigator_rating NUMERIC(3,1),
  charity_navigator_score NUMERIC(5,1),
  va_accredited BOOLEAN DEFAULT false,

  -- Data Provenance
  data_sources TEXT[],
  last_verified_date DATE NOT NULL DEFAULT CURRENT_DATE,
  verification_method TEXT DEFAULT 'csv_import',
  confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  confidence_grade TEXT CHECK (confidence_grade IN ('A', 'B', 'C', 'D', 'F')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Full-text search (weighted: org_name > mission/services > categories/ntee)
  fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(org_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(mission_statement, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(services_offered, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(service_categories, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(ntee_description, '')), 'C')
  ) STORED
);

-- Indexes for organizations
CREATE INDEX organizations_fts_idx ON public.organizations USING GIN (fts);
CREATE INDEX organizations_state_idx ON public.organizations(state);
CREATE INDEX organizations_grade_idx ON public.organizations(confidence_grade);
CREATE UNIQUE INDEX organizations_ein_idx ON public.organizations(ein) WHERE ein IS NOT NULL;

-- ============================================================================
-- BUSINESSES TABLE (veteran-owned businesses from SAM.gov)
-- ============================================================================

CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  uei TEXT,
  cage_code TEXT,
  legal_business_name TEXT NOT NULL,
  dba_name TEXT,

  -- Location
  physical_address_line1 TEXT,
  physical_address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  latitude NUMERIC,
  longitude NUMERIC,

  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,

  -- Business Classification
  business_type TEXT,
  naics_codes TEXT,
  naics_descriptions TEXT,

  -- Owner Information
  owner_name TEXT,
  service_branch TEXT,

  -- Registration
  registration_status TEXT,
  registration_expiration TEXT,
  source TEXT,

  -- Data Provenance
  last_verified_date DATE NOT NULL DEFAULT CURRENT_DATE,
  verification_method TEXT DEFAULT 'csv_import',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Full-text search (weighted: business_name/dba > naics > owner)
  fts tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(legal_business_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(dba_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(naics_descriptions, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(owner_name, '')), 'C')
  ) STORED
);

-- Indexes for businesses
CREATE INDEX businesses_fts_idx ON public.businesses USING GIN (fts);
CREATE INDEX businesses_state_idx ON public.businesses(state);
CREATE INDEX businesses_type_idx ON public.businesses(business_type);
CREATE UNIQUE INDEX businesses_uei_idx ON public.businesses(uei) WHERE uei IS NOT NULL;

-- ============================================================================
-- FRESHNESS HELPER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.freshness_status(verified_date DATE)
RETURNS TEXT AS $$
BEGIN
  IF verified_date >= CURRENT_DATE - INTERVAL '6 months' THEN
    RETURN 'fresh';
  ELSIF verified_date >= CURRENT_DATE - INTERVAL '1 year' THEN
    RETURN 'stale';
  ELSE
    RETURN 'outdated';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- SEARCH RPC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_organizations(
  query_text TEXT DEFAULT NULL,
  filter_state TEXT DEFAULT NULL,
  filter_service_category TEXT DEFAULT NULL,
  filter_va_accredited BOOLEAN DEFAULT NULL,
  filter_confidence_grade TEXT DEFAULT NULL,
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

CREATE OR REPLACE FUNCTION public.search_businesses(
  query_text TEXT DEFAULT NULL,
  filter_state TEXT DEFAULT NULL,
  filter_business_type TEXT DEFAULT NULL,
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

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Everyone can read directory data (public resource)
CREATE POLICY "Directory organizations are publicly readable"
  ON public.organizations FOR SELECT USING (true);

CREATE POLICY "Directory businesses are publicly readable"
  ON public.businesses FOR SELECT USING (true);

-- Only admins can modify directory data
CREATE POLICY "Only admins can insert organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update organizations"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can insert businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update businesses"
  ON public.businesses FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
