
-- Create login_codes table for six-digit code authentication
-- This table stores temporary login codes sent via email

-- Drop existing table if you need to recreate it
-- DROP TABLE IF EXISTS login_codes CASCADE;

-- Create the table
CREATE TABLE IF NOT EXISTS login_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE NOT NULL,
  attempts INTEGER DEFAULT 0 NOT NULL,
  max_attempts INTEGER DEFAULT 5 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE login_codes ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_login_codes_email ON login_codes(email);
CREATE INDEX IF NOT EXISTS idx_login_codes_expires_at ON login_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_codes_used ON login_codes(used);
CREATE INDEX IF NOT EXISTS idx_login_codes_email_used ON login_codes(email, used);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage login codes" ON login_codes;
DROP POLICY IF EXISTS "Allow service role full access" ON login_codes;

-- Create RLS policy for service role (Edge Functions use service role)
CREATE POLICY "Allow service role full access" ON login_codes
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create a function to automatically clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_login_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM login_codes
  WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$;

-- Optional: Create a scheduled job to clean up expired codes
-- This requires pg_cron extension
-- Uncomment if you want automatic cleanup:
-- SELECT cron.schedule(
--   'cleanup-expired-login-codes',
--   '0 * * * *', -- Run every hour
--   'SELECT cleanup_expired_login_codes();'
-- );

-- Grant necessary permissions
GRANT ALL ON login_codes TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Verify the table was created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'login_codes'
ORDER BY ordinal_position;
