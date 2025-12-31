
# Six-Digit Code Authentication Setup Guide

## Overview

The PickleRadar app now uses a six-digit code system for passwordless login via the "Forgot Password?" flow. This replaces the previous magic link system.

## What's Been Implemented

### 1. **Database Table: `login_codes`**

You need to create this table in your Supabase database. Run the following SQL in the Supabase SQL Editor:

```sql
-- Create login_codes table for six-digit code authentication
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

-- Enable RLS
ALTER TABLE public.login_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Service role can do everything (for Edge Functions)
CREATE POLICY "Service role can manage login codes"
  ON public.login_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_login_codes_email_used ON public.login_codes(email, used);
CREATE INDEX IF NOT EXISTS idx_login_codes_expires_at ON public.login_codes(expires_at);

-- Create function to clean up expired codes
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
```

### 2. **Edge Functions**

Two Edge Functions have been created:

#### `send-login-code`
- Generates a six-digit numeric code
- Stores it in the database with a 10-minute expiration
- Sends the code via email using Resend API
- Deletes any existing unused codes for the email

#### `verify-login-code`
- Validates the code against the database
- Checks for expiration and max attempts (5 tries)
- Marks the code as used after successful verification
- Generates session tokens for the user
- Returns access and refresh tokens

### 3. **Email Configuration**

You need to set up the Resend API for sending emails:

1. Sign up for a Resend account at https://resend.com
2. Get your API key from the Resend dashboard
3. Add the API key to your Supabase Edge Function secrets:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

4. Configure your sending domain in Resend (e.g., pickleradar.com)

### 4. **Email Template**

The email template includes:
- PickleRadar branding with gradient header
- Large, centered six-digit code
- Clear instructions
- 10-minute expiration notice
- "Powered by Lopez Innovations LLC" footer

### 5. **App Flow**

#### Forgot Password Flow:
1. User taps "Forgot Password?" on the login screen
2. User enters their email address
3. User taps "Send Code"
4. System sends a six-digit code to the email
5. User sees: "Check your email for a six-digit code and enter it here"
6. User enters the six-digit code
7. System validates the code
8. On success: User is logged in and redirected to home screen
9. Success message: "You're signed in. Welcome back!"

#### Security Features:
- Code expires after 10 minutes
- Maximum 5 attempts per code
- Code is single-use only
- Old unused codes are deleted when a new code is requested
- Brute-force protection via attempt limiting

### 6. **What Was Removed**

- All deep link handling for magic links
- References to `natively://magic-link`
- Web-based confirmation pages
- Magic link email templates

## Deployment Steps

### Step 1: Create the Database Table

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script provided above

### Step 2: Deploy Edge Functions

Deploy both Edge Functions to your Supabase project:

```bash
# Deploy send-login-code function
supabase functions deploy send-login-code

# Deploy verify-login-code function
supabase functions deploy verify-login-code
```

### Step 3: Configure Email Service

1. Set up Resend API key:
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

2. Verify your sending domain in Resend

### Step 4: Test the Flow

1. Build and install the app on your device
2. Navigate to the login screen
3. Tap "Forgot Password?"
4. Enter your email address
5. Check your email for the six-digit code
6. Enter the code in the app
7. Verify you're logged in successfully

## Troubleshooting

### Email Not Sending

**Issue**: User doesn't receive the six-digit code email

**Solutions**:
1. Check that RESEND_API_KEY is set correctly
2. Verify your domain in Resend
3. Check Resend dashboard for delivery status
4. Look at Edge Function logs for errors

### Code Validation Fails

**Issue**: Valid code is rejected

**Solutions**:
1. Check that the `login_codes` table exists
2. Verify RLS policies are set correctly
3. Check Edge Function logs for errors
4. Ensure code hasn't expired (10 minutes)

### Too Many Attempts

**Issue**: User locked out after 5 attempts

**Solutions**:
1. Request a new code (old code will be deleted)
2. Check database for stuck codes
3. Run cleanup function if needed

## Maintenance

### Cleaning Up Expired Codes

Run this periodically to clean up old codes:

```sql
SELECT clean_expired_login_codes();
```

Or set up a cron job in Supabase to run this automatically.

### Monitoring

Monitor the following:
- Email delivery rates in Resend dashboard
- Edge Function logs for errors
- Database table size (clean up old codes)
- Failed login attempts

## User Experience

### Success Flow
1. User requests code → "Check your email for a six-digit code"
2. User enters code → "You're signed in. Welcome back!"
3. User is redirected to home screen

### Error Handling
- Invalid email: "Please enter a valid email address"
- User not found: "No account found with this email address. Please sign up first."
- Invalid code: "The code you entered is incorrect. You have X attempts remaining."
- Expired code: "The code you entered is invalid or has expired. Please request a new code."
- Too many attempts: "You have exceeded the maximum number of attempts. Please request a new code."

## Next Steps

1. ✅ Create the `login_codes` table in Supabase
2. ✅ Deploy both Edge Functions
3. ✅ Configure Resend API key
4. ✅ Test the complete flow
5. ✅ Monitor email delivery
6. ✅ Set up automated cleanup for expired codes

## Support

If you encounter any issues:
1. Check the Edge Function logs in Supabase
2. Verify all environment variables are set
3. Test email delivery in Resend dashboard
4. Check database table structure and RLS policies
