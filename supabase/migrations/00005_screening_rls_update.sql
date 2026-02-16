-- Migration 00005: Update RLS policies for guest screening access
-- Allows guest users (no auth) to submit screenings and view results

-- ============================================================================
-- SCREENING SESSIONS: Allow guest insert + select
-- ============================================================================

-- Drop overly restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view own screening sessions" ON public.screening_sessions;
DROP POLICY IF EXISTS "Users can insert screening sessions" ON public.screening_sessions;
DROP POLICY IF EXISTS "Users can view screening sessions" ON public.screening_sessions;
DROP POLICY IF EXISTS "Anyone can insert screening sessions" ON public.screening_sessions;

-- Guest + authenticated users can insert screening sessions
CREATE POLICY "Anyone can insert screening sessions"
  ON public.screening_sessions FOR INSERT
  WITH CHECK (true);

-- Authenticated users see their own; guest sessions (user_id IS NULL) are publicly readable
CREATE POLICY "Users can view screening sessions"
  ON public.screening_sessions FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IS NULL
  );

-- ============================================================================
-- SCREENING RESULTS: Enable RLS and allow read/insert
-- ============================================================================

ALTER TABLE public.screening_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read screening results" ON public.screening_results;
DROP POLICY IF EXISTS "Anyone can insert screening results" ON public.screening_results;

-- Anyone can read screening results (they need the session ID to find them)
CREATE POLICY "Anyone can read screening results"
  ON public.screening_results FOR SELECT
  USING (true);

-- Allow inserts from server actions (anon key used server-side)
CREATE POLICY "Anyone can insert screening results"
  ON public.screening_results FOR INSERT
  WITH CHECK (true);
