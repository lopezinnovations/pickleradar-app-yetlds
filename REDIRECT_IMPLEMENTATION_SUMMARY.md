
# Authentication Redirect Implementation Summary

## Changes Made

### 1. Updated `hooks/useAuth.ts`

**Email Confirmation Redirect:**
- Changed `emailRedirectTo` in `signUp()` from `natively://email-confirmed` to `https://natively.dev/email-confirmed`

**Password Reset Redirect:**
- Changed `redirectTo` in `resetPassword()` from `natively://reset-password` to `https://natively.dev/reset-password`

### 2. Updated `app/_layout.tsx`

- Simplified deep link handling
- Removed OTP verification logic (handled by web pages now)
- Deep links `natively://email-confirmed` and `natively://reset-password` now just navigate to the appropriate screens

### 3. Updated `app.json`

- Added Android intent filters for universal links
- Configured to handle `https://natively.dev/email-confirmed` and `https://natively.dev/reset-password`
- Maintained `natively://` scheme for deep linking

### 4. Created `SUPABASE_REDIRECT_SETUP.md`

- Complete guide for configuring Supabase dashboard
- Instructions for setting Site URL and Redirect URLs
- Email template updates
- Web page implementation examples
- Testing and troubleshooting guide

## How It Works Now

### Email Confirmation Flow

```
1. User signs up
   ↓
2. Supabase sends email with link to:
   https://natively.dev/email-confirmed?token=...
   ↓
3. User clicks link → Opens web page
   ↓
4. Web page calls:
   supabase.auth.exchangeCodeForSession(window.location.href)
   ↓
5. Web page redirects to:
   natively://email-confirmed
   ↓
6. Mobile app opens → Shows success screen
   ↓
7. User is automatically signed in
```

### Password Reset Flow

```
1. User requests password reset
   ↓
2. Supabase sends email with link to:
   https://natively.dev/reset-password?token=...
   ↓
3. User clicks link → Opens web page
   ↓
4. Web page calls:
   supabase.auth.exchangeCodeForSession(window.location.href)
   ↓
5. Web page redirects to:
   natively://reset-password
   ↓
6. Mobile app opens → Shows password reset form
   ↓
7. User enters new password
```

## Next Steps

### 1. Configure Supabase Dashboard

Follow the instructions in `SUPABASE_REDIRECT_SETUP.md` to:

- Set Site URL to `https://natively.dev`
- Add redirect URLs:
  - `https://natively.dev/email-confirmed`
  - `https://natively.dev/reset-password`
  - `https://natively.dev`

### 2. Create Web Pages

You need to create two web pages at `https://natively.dev`:

**`/email-confirmed`**
- Calls `supabase.auth.exchangeCodeForSession()`
- Redirects to `natively://email-confirmed`

**`/reset-password`**
- Calls `supabase.auth.exchangeCodeForSession()`
- Redirects to `natively://reset-password`

See `SUPABASE_REDIRECT_SETUP.md` for complete HTML examples.

### 3. Update Email Templates

In Supabase Dashboard → Authentication → Email Templates:

**Confirm Signup:**
- Update to use PickleRadar branding
- Ensure link points to `https://natively.dev/email-confirmed`

**Reset Password:**
- Update to use PickleRadar branding
- Ensure link points to `https://natively.dev/reset-password`

### 4. Test the Flow

1. **Test Email Confirmation:**
   - Sign up with a new email
   - Click the confirmation link in the email
   - Verify the app opens and shows success screen

2. **Test Password Reset:**
   - Request a password reset
   - Click the reset link in the email
   - Verify the app opens and shows password reset form
   - Enter new password and verify it works

## Benefits of This Approach

✅ **No More Default Supabase Page**: Users never see the "continue building" page

✅ **Custom Branding**: Full control over the web pages users see

✅ **Seamless Experience**: Automatic redirect back to the mobile app

✅ **Universal Links**: Works on both iOS and Android

✅ **Secure**: Token exchange happens on the web, then session is passed to app

## Files Modified

- `hooks/useAuth.ts` - Updated redirect URLs
- `app/_layout.tsx` - Simplified deep link handling
- `app.json` - Added Android intent filters
- `SUPABASE_REDIRECT_SETUP.md` - New setup guide
- `REDIRECT_IMPLEMENTATION_SUMMARY.md` - This file

## No Changes Needed

The following files work correctly as-is:
- `app/email-confirmed.tsx` - Handles the success screen
- `app/reset-password.tsx` - Handles the password reset form
- `app/confirm-email.tsx` - Handles the "check your email" screen

## Important Notes

⚠️ **Web Pages Required**: The implementation requires you to create and host two web pages at `https://natively.dev`. Without these pages, the email links will not work.

⚠️ **Supabase Configuration**: You must update the Supabase dashboard settings for the redirect URLs to work.

⚠️ **Testing**: Test both flows thoroughly before deploying to production.

## Support

If you encounter issues:

1. Check the browser console on the web pages for errors
2. Check the mobile app logs for deep link handling
3. Verify Supabase dashboard configuration
4. Refer to `SUPABASE_REDIRECT_SETUP.md` for troubleshooting
