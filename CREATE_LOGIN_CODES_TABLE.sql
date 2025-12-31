
-- =====================================================
-- PickleRadar Six-Digit Code Authentication
-- Database Setup Script
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- 1. Create login_codes table
CREATE TABLE IF NOT EXISTS public.login_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.login_codes ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policy for service role
-- This allows Edge Functions to manage login codes
CREATE POLICY "Service role can manage login codes"
  ON public.login_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_codes_email_used 
  ON public.login_codes(email, used);

CREATE INDEX IF NOT EXISTS idx_login_codes_expires_at 
  ON public.login_codes(expires_at);

-- 5. Create cleanup function
-- This function removes expired codes older than 1 hour
CREATE OR REPLACE FUNCTION clean_expired_login_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.login_codes
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$;

-- =====================================================
-- Optional: Set up automatic cleanup
-- =====================================================
-- You can run this manually or set up a cron job:
-- SELECT clean_expired_login_codes();
-- =====================================================

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify the setup:

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'login_codes'
);

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'login_codes';

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'login_codes';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'login_codes';

-- =====================================================
-- Done! Your database is ready for six-digit code auth
-- =====================================================
