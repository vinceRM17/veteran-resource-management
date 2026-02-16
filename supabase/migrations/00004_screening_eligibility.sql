-- Apply this migration via Supabase Dashboard -> SQL Editor
-- This migration adds eligibility rules and screening results tables
-- Depends on: 00001_initial_schema.sql (screening_sessions table)

-- ============================================================================
-- ADD ROLE COLUMN TO EXISTING SCREENING SESSIONS TABLE
-- ============================================================================

ALTER TABLE public.screening_sessions
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('veteran', 'caregiver'));

-- ============================================================================
-- ELIGIBILITY RULES TABLE (stores json-rules-engine format rules)
-- ============================================================================

CREATE TABLE public.eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT NOT NULL,
  program_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'kentucky',
  rule_definition JSONB NOT NULL,
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low')),
  required_role TEXT CHECK (required_role IN ('veteran', 'caregiver')),
  required_docs TEXT[] NOT NULL DEFAULT '{}',
  next_steps TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_date DATE,
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_id, jurisdiction, confidence_level, version)
);

-- Enable Row Level Security
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read rules (public data)
CREATE POLICY "Anyone can read eligibility rules"
  ON public.eligibility_rules FOR SELECT
  USING (true);

-- RLS: Only service role can insert/update (admin-only via service key)
-- No INSERT/UPDATE policies for authenticated users means only service role bypasses RLS

-- Index for loading active rules by jurisdiction
CREATE INDEX idx_eligibility_rules_jurisdiction_active
  ON public.eligibility_rules (jurisdiction, is_active)
  WHERE is_active = true;

-- Index for looking up rules by program
CREATE INDEX idx_eligibility_rules_program
  ON public.eligibility_rules (program_id);

-- ============================================================================
-- SCREENING RESULTS TABLE (stores eligibility evaluation outcomes)
-- ============================================================================

CREATE TABLE public.screening_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.screening_sessions(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  program_name TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  confidence_label TEXT NOT NULL,
  required_docs TEXT[] NOT NULL DEFAULT '{}',
  next_steps TEXT[] NOT NULL DEFAULT '{}',
  rule_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.screening_results ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see results for their own sessions
CREATE POLICY "Users can view own screening results"
  ON public.screening_results FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.screening_sessions
      WHERE user_id = auth.uid()
    )
  );

-- RLS: Anonymous sessions accessible by session ID (UUID secrecy = access control)
CREATE POLICY "Anonymous users can view screening results"
  ON public.screening_results FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.screening_sessions
      WHERE user_id IS NULL
    )
  );

-- RLS: Service role handles inserts (no INSERT policy = service role only)

-- Index for fast lookup by session
CREATE INDEX idx_screening_results_session
  ON public.screening_results (session_id);

-- ============================================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER FOR ELIGIBILITY RULES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_eligibility_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_eligibility_rules_timestamp
  BEFORE UPDATE ON public.eligibility_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_eligibility_rules_updated_at();
