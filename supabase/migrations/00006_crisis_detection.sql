-- Apply this migration via Supabase Dashboard -> SQL Editor
-- This migration adds crisis detection logging infrastructure
-- Depends on: 00001_initial_schema.sql (screening_sessions table)

-- ============================================================================
-- CRISIS DETECTION LOGS TABLE (audit trail for detected crisis keywords)
-- ============================================================================

CREATE TABLE public.crisis_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_session_id UUID REFERENCES public.screening_sessions(id) ON DELETE SET NULL,
  detected_keywords TEXT[] NOT NULL,
  keyword_severities TEXT[] NOT NULL,
  max_severity TEXT NOT NULL CHECK (max_severity IN ('high', 'medium')),
  source_text_hash TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  is_false_positive BOOLEAN,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crisis_detection_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can insert crisis logs (anonymous users, logged-in users)
-- This is acceptable because crisis logs contain no PHI (only keyword names and a text hash)
CREATE POLICY "Anyone can insert crisis logs"
  ON public.crisis_detection_logs FOR INSERT
  WITH CHECK (true);

-- RLS: Only authenticated users can view crisis logs
-- TODO Phase 5: Tighten to admin-only when user_roles table is implemented
CREATE POLICY "Authenticated users can view crisis logs"
  ON public.crisis_detection_logs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS: Only authenticated users can update crisis logs (for review workflow)
-- TODO Phase 5: Tighten to admin-only when user_roles table is implemented
CREATE POLICY "Authenticated users can update crisis logs"
  ON public.crisis_detection_logs FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes for efficient querying
CREATE INDEX idx_crisis_logs_detected_at
  ON public.crisis_detection_logs (detected_at DESC);

CREATE INDEX idx_crisis_logs_unreviewed
  ON public.crisis_detection_logs (reviewed_at)
  WHERE reviewed_at IS NULL;

CREATE INDEX idx_crisis_logs_session
  ON public.crisis_detection_logs (screening_session_id);

-- ============================================================================
-- CLEANUP FUNCTION (for future scheduling with pg_cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_crisis_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.crisis_detection_logs
  WHERE detected_at < now() - interval '6 years';
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron when available:
-- SELECT cron.schedule('cleanup-crisis-logs', '0 2 * * 0', 'SELECT cleanup_old_crisis_logs()');

-- ============================================================================
-- ENABLE REALTIME FOR MONITORING DASHBOARD
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.crisis_detection_logs;
