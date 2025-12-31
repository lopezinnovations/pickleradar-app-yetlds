
# Quick Start: Six-Digit Code Authentication

## What You Need to Do

### 1. Run Database Migration (Required)

Copy and paste this SQL into your Supabase SQL Editor:

```sql
-- Create login_codes table
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
create policy "Users can view their own codes" on login_codes for select using (true);
create policy "Service role can insert codes" on login_codes for insert with check (true);
create policy "Service role can update codes" on login_codes for update using (true);

-- Create indexes
create index if not exists login_codes_email_idx on login_codes(email);
create index if not exists login_codes_code_idx on login_codes(code);
create index if not exists login_codes_expires_at_idx on login_codes(expires_at);

-- Cleanup function
create or replace function delete_expired_login_codes()
returns void language plpgsql security definer as $$
begin
  delete from login_codes where expires_at < now();
end;
$$;
```

### 2. Deploy Edge Functions (Required)

In your terminal, run:

```bash
# Deploy send-login-code function
supabase functions deploy send-login-code

# Deploy verify-login-code function
supabase functions deploy verify-login-code
```

### 3. Configure Email Service (Highly Recommended)

For production, set up Resend:

1. Sign up at https://resend.com
2. Get your API key
3. Run:

```bash
supabase secrets set RESEND_API_KEY=your_api_key_here
```

4. Update the sender email in `supabase/functions/send-login-code/index.ts`:

```typescript
from: 'PickleRadar <noreply@yourdomain.com>',
```

### 4. Test It (Recommended)

1. Open your app
2. Click "Forgot Password?"
3. Enter your email
4. Click "Send Code"
5. Check your email for the code
6. Enter the code in the app
7. You should be logged in!

## That's It!

Your six-digit code authentication is now live. Users can now:

- Use "Forgot Password?" to get a login code
- Receive a six-digit code via email
- Enter the code to sign in
- Get logged in automatically

## What Changed for Users

### Before (Magic Links)
1. Click "Forgot Password?"
2. Enter email
3. Receive email with link
4. Click link
5. Wait for redirect
6. Hope deep linking works

### After (Six-Digit Codes)
1. Click "Forgot Password?"
2. Enter email
3. Receive email with code
4. Enter code in app
5. Logged in instantly!

## Troubleshooting

### "Edge Function not found"
- Make sure you deployed both functions
- Check function names match exactly

### "Email not arriving"
- Check spam folder
- Verify Resend API key is set
- Check Edge Function logs in Supabase

### "Invalid code"
- Code expires after 10 minutes
- Code can only be used once
- Maximum 5 attempts per code

## Need Help?

Check these files for detailed information:
- `SIX_DIGIT_CODE_SETUP.md` - Complete setup guide
- `SIX_DIGIT_CODE_IMPLEMENTATION.md` - Technical details
- `EMAIL_TEMPLATE_SIX_DIGIT_CODE.md` - Email customization

## Quick Commands

```bash
# Deploy functions
supabase functions deploy send-login-code
supabase functions deploy verify-login-code

# Set Resend API key
supabase secrets set RESEND_API_KEY=your_key

# View function logs
supabase functions logs send-login-code
supabase functions logs verify-login-code

# Test send code
curl -X POST https://your-project.supabase.co/functions/v1/send-login-code \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

You're all set! 🎉
