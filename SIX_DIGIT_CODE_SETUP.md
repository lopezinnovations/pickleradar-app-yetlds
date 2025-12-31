
# Six-Digit Code Authentication Setup Guide

This guide will help you set up the six-digit code authentication system for PickleRadar.

## Overview

The new authentication system replaces magic links with a six-digit code that users receive via email. This provides a more secure and user-friendly passwordless login experience.

## Features

- Six-digit numeric codes sent via email
- 10-minute expiration time
- Maximum 5 attempts per code
- Brute-force protection
- Automatic code cleanup
- Session persistence after login

## Setup Steps

### 1. Database Migration

Run the following SQL in your Supabase SQL Editor to create the `login_codes` table:

```sql
-- Create login_codes table for six-digit code authentication
create table if not exists login_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null,
  used boolean default false,
  attempts integer default 0,
  max_attempts integer default 5
);

-- Enable RLS
alter table login_codes enable row level security;

-- Create RLS policies
create policy "Users can view their own codes" on login_codes
  for select using (true);

create policy "Service role can insert codes" on login_codes
  for insert with check (true);

create policy "Service role can update codes" on login_codes
  for update using (true);

-- Create indexes for faster lookups
create index if not exists login_codes_email_idx on login_codes(email);
create index if not exists login_codes_code_idx on login_codes(code);
create index if not exists login_codes_expires_at_idx on login_codes(expires_at);

-- Create function to clean up expired codes
create or replace function delete_expired_login_codes()
returns void
language plpgsql
security definer
as $$
begin
  delete from login_codes
  where expires_at < now();
end;
$$;
```

### 2. Deploy Edge Functions

Deploy the two Edge Functions to your Supabase project:

#### Send Login Code Function

```bash
supabase functions deploy send-login-code
```

This function:
- Generates a six-digit code
- Stores it in the database with a 10-minute expiration
- Sends the code via email

#### Verify Login Code Function

```bash
supabase functions deploy verify-login-code
```

This function:
- Validates the code entered by the user
- Checks expiration and attempt limits
- Generates authentication tokens
- Marks the code as used

### 3. Configure Email Service (Optional but Recommended)

For production use, integrate with a third-party email service like Resend, SendGrid, or Mailgun.

#### Using Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add it to your Supabase Edge Function secrets:

```bash
supabase secrets set RESEND_API_KEY=your_api_key_here
```

4. Update the email sender in `supabase/functions/send-login-code/index.ts`:

```typescript
from: 'PickleRadar <noreply@yourdomain.com>',
```

### 4. Set Up Cron Job for Code Cleanup (Optional)

To automatically clean up expired codes, set up a cron job in Supabase:

1. Go to Database → Cron Jobs in your Supabase dashboard
2. Create a new cron job:
   - Name: `cleanup-expired-login-codes`
   - Schedule: `0 * * * *` (runs every hour)
   - SQL: `select delete_expired_login_codes();`

### 5. Update Supabase Email Templates

Update your email templates in Supabase Dashboard → Authentication → Email Templates:

#### Custom Email Template (if using Supabase's built-in email)

While the Edge Function handles email sending, you may want to update the default templates for consistency.

## Email Template

The six-digit code email includes:

- PickleRadar branding
- Large, easy-to-read code display
- 10-minute expiration notice
- Security notice
- "Powered by Lopez Innovations LLC" footer

## User Flow

### Forgot Password Flow

1. User clicks "Forgot Password?" on the login screen
2. User enters their email address
3. User clicks "Send Code"
4. System generates and sends a six-digit code
5. User receives email with the code
6. User enters the code in the app
7. System validates the code
8. User is logged in and redirected to home screen
9. Success message: "You're signed in. Welcome back!"

### Security Features

- **Code Expiration**: Codes expire after 10 minutes
- **Single Use**: Codes can only be used once
- **Attempt Limiting**: Maximum 5 attempts per code
- **Automatic Cleanup**: Expired codes are automatically deleted
- **Brute-Force Protection**: Failed attempts are tracked

## Testing

### Test the Send Code Function

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-login-code \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test the Verify Code Function

```bash
curl -X POST https://your-project.supabase.co/functions/v1/verify-login-code \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

## Troubleshooting

### Codes Not Being Sent

1. Check that the Edge Function is deployed correctly
2. Verify your email service configuration (Resend API key)
3. Check Edge Function logs in Supabase Dashboard

### Codes Not Being Validated

1. Verify the code hasn't expired (10 minutes)
2. Check that the code hasn't been used already
3. Ensure you haven't exceeded the maximum attempts (5)
4. Check Edge Function logs for errors

### Email Not Arriving

1. Check spam/junk folder
2. Verify email service is configured correctly
3. Check Edge Function logs for email sending errors
4. Test with a different email provider

## Migration from Magic Links

The new system completely replaces magic links:

- ✅ Removed magic link deep linking
- ✅ Removed `natively://` URL scheme
- ✅ Removed magic-link screen
- ✅ Updated authentication flow
- ✅ Maintained session persistence
- ✅ Kept profile data persistence

## Support

For issues or questions:
- Check Supabase Edge Function logs
- Review database logs for errors
- Verify RLS policies are correctly set up
- Ensure all environment variables are configured

## Next Steps

1. Run the database migration
2. Deploy the Edge Functions
3. Configure your email service
4. Test the authentication flow
5. Update email templates with your branding
6. Set up the cron job for cleanup

Your six-digit code authentication system is now ready to use!
