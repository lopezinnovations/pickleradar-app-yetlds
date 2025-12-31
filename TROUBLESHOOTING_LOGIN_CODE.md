
# Troubleshooting Login Code Issues

## Problem
"Unable to send login code. Please try again or use password login."

## Root Causes

### 1. Missing RESEND_API_KEY
The most common issue is that the Resend API key is not configured in your Supabase Edge Functions.

**Solution:**
1. Go to [Resend.com](https://resend.com) and sign up for a free account
2. Create an API key in the Resend dashboard
3. In your Supabase project, go to **Project Settings** → **Edge Functions** → **Secrets**
4. Add a new secret:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key (starts with `re_`)

### 2. Edge Function Not Deployed
The Edge Functions might not be deployed to Supabase.

**Solution:**
Deploy the Edge Functions using the Supabase CLI:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref biczbxmaisdxpcbplddr

# Deploy the Edge Functions
supabase functions deploy send-login-code
supabase functions deploy verify-login-code
```

### 3. Missing login_codes Table
The database table for storing login codes might not exist.

**Solution:**
Create the table using the Supabase SQL Editor:

```sql
-- Create login_codes table
CREATE TABLE IF NOT EXISTS login_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE login_codes ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_login_codes_email ON login_codes(email);
CREATE INDEX IF NOT EXISTS idx_login_codes_expires_at ON login_codes(expires_at);

-- RLS policies (service role bypasses these, but good to have)
CREATE POLICY "Service role can manage login codes" ON login_codes
  FOR ALL USING (auth.role() = 'service_role');
```

### 4. Email Domain Not Verified
If you're using a custom domain in the "from" address, it needs to be verified in Resend.

**Current Configuration:**
The Edge Function uses `onboarding@resend.dev` which is a Resend test domain that works immediately.

**For Production:**
1. Add your domain in Resend dashboard
2. Add the required DNS records
3. Update the Edge Function to use your domain:
   ```typescript
   from: 'PickleRadar <noreply@yourdomain.com>',
   ```

## Testing the Fix

### 1. Check Edge Function Logs
After deploying, test the function and check logs:

```bash
# View logs for send-login-code
supabase functions logs send-login-code

# View logs for verify-login-code
supabase functions logs verify-login-code
```

### 2. Test Directly
You can test the Edge Function directly using curl:

```bash
curl -X POST \
  https://biczbxmaisdxpcbplddr.supabase.co/functions/v1/send-login-code \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. Check the App
1. Open the app
2. Go to "Forgot Password?"
3. Enter a valid email address
4. Click "Send Code"
5. Check the console logs for detailed error messages

## Common Error Messages

### "Email service not configured"
- **Cause:** RESEND_API_KEY is not set
- **Fix:** Add the API key to Supabase Edge Function secrets

### "User not found"
- **Cause:** The email doesn't exist in your auth.users table
- **Fix:** Sign up first, then try the forgot password flow

### "Failed to generate login code"
- **Cause:** Database error when inserting the code
- **Fix:** Check if the login_codes table exists and has correct schema

### "Failed to send email"
- **Cause:** Resend API error (invalid key, rate limit, etc.)
- **Fix:** Check Resend dashboard for error details

## Quick Setup Checklist

- [ ] Resend account created
- [ ] Resend API key obtained
- [ ] API key added to Supabase Edge Function secrets
- [ ] login_codes table created in database
- [ ] Edge Functions deployed to Supabase
- [ ] Test email sent successfully

## Support

If you're still having issues:

1. Check the Edge Function logs in Supabase dashboard
2. Verify the RESEND_API_KEY is correctly set
3. Ensure the login_codes table exists
4. Test with the curl command above
5. Check your Resend dashboard for delivery status

## Alternative: Use Password Login

While debugging, users can still sign in using their password:
1. Click "Sign In" instead of "Forgot Password?"
2. Enter email and password
3. Click "Sign In"
