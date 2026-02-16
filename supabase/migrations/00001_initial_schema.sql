-- Apply this migration via Supabase Dashboard -> SQL Editor or supabase db push
-- This migration creates the initial database schema with Row-Level Security (RLS)

-- ============================================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'veteran' CHECK (role IN ('veteran', 'caregiver', 'admin')),
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'veteran');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SCREENING SESSIONS TABLE (for future phases, but RLS now)
-- ============================================================================

CREATE TABLE public.screening_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  answers JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.screening_sessions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see their own screening sessions
CREATE POLICY "Users can view own screening sessions"
  ON public.screening_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own screening sessions"
  ON public.screening_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own screening sessions"
  ON public.screening_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Anonymous sessions allowed (user_id can be null for guest mode)
-- Anonymous users can create sessions, but can only access them by ID
CREATE POLICY "Users can create anonymous sessions"
  ON public.screening_sessions FOR INSERT
  WITH CHECK (user_id IS NULL);

-- Note: Anonymous session access will be handled via session ID stored in client
-- The RLS policy above only allows authenticated users to see their own sessions
-- Guest sessions will need to be accessed via secure session tokens (implemented in future phases)
