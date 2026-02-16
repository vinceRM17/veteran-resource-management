-- Apply this migration via Supabase Dashboard -> SQL Editor
-- This migration adds bookmarks, action_items tables, tightens crisis log RLS,
-- adds is_admin() helper, and enables session claiming for guest-to-user flow.
-- Depends on: 00001_initial_schema.sql (profiles, screening_sessions)
-- Depends on: 00006_crisis_detection.sql (crisis_detection_logs)

-- ============================================================================
-- 1. BOOKMARKS TABLE
-- ============================================================================

CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('organization', 'business', 'program')),
  resource_id TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_type, resource_id)
);

-- Enable Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
  ON public.bookmarks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Index for listing bookmarks by user, newest first
CREATE INDEX idx_bookmarks_user_created
  ON public.bookmarks (user_id, created_at DESC);

-- ============================================================================
-- 2. ACTION ITEMS TABLE
-- ============================================================================

CREATE TABLE public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.screening_sessions(id) ON DELETE SET NULL,
  program_id TEXT,
  program_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only manage their own action items
CREATE POLICY "Users can view own action items"
  ON public.action_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own action items"
  ON public.action_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own action items"
  ON public.action_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own action items"
  ON public.action_items FOR DELETE
  USING (auth.uid() = user_id);

-- Index for listing action items by user, grouped by completion status
CREATE INDEX idx_action_items_user_status
  ON public.action_items (user_id, is_completed, sort_order);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_action_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_action_items_timestamp
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.update_action_items_updated_at();

-- ============================================================================
-- 3. TIGHTEN CRISIS DETECTION LOGS RLS TO ADMIN-ONLY
-- ============================================================================

-- Drop old permissive policies (these allowed any authenticated user)
DROP POLICY IF EXISTS "Authenticated users can view crisis logs" ON public.crisis_detection_logs;
DROP POLICY IF EXISTS "Authenticated users can update crisis logs" ON public.crisis_detection_logs;

-- New admin-only policies using profiles.role
CREATE POLICY "Admin users can view crisis logs"
  ON public.crisis_detection_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update crisis logs"
  ON public.crisis_detection_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Note: "Anyone can insert crisis logs" policy is intentionally left unchanged.
-- Anonymous users must be able to insert crisis logs for safety.

-- ============================================================================
-- 4. HELPER FUNCTION TO CHECK ADMIN ROLE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- 5. UPDATE SCREENING SESSIONS RLS FOR SESSION CLAIMING
-- ============================================================================

-- Drop old update policy if it exists (from 00001)
DROP POLICY IF EXISTS "Users can update own screening sessions" ON public.screening_sessions;

-- Allow authenticated users to claim guest sessions (user_id IS NULL)
-- USING: user owns session OR session is unclaimed
-- WITH CHECK: can only set user_id to their own ID
CREATE POLICY "Users can update own screening sessions"
  ON public.screening_sessions FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);
