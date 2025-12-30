
# Password Reset Flow - Complete Implementation

## Overview
The password reset flow has been fully implemented and configured. Here's how it works:

## Flow Diagram

```
User clicks reset link in email
         ↓
https://natively.dev/reset-password?token=...
         ↓
Web page exchanges token for session
         ↓
Deep link: natively://reset-password
         ↓
App opens Reset Password screen
         ↓
User enters new password
         ↓
Password updated successfully
         ↓
Redirect to home screen
```

## Implementation Details

### 1. Web Page (WEB_PAGE_RESET_PASSWORD.html)

**Location:** `https://natively.dev/reset-password`

**What it does:**
- Receives the password reset link with token from Supabase email
- Calls `supabase.auth.exchangeCodeForSession(window.location.href)` to exchange the token for a session
- On success, deep-links to `natively://reset-password`
- Shows appropriate error messages if the link is expired or invalid

**Key Features:**
- Beautiful UI with loading spinner
- Success/error states with clear messaging
- Automatic deep-linking with fallback button
- Proper error handling for expired links

### 2. App Deep Link Handler (app/_layout.tsx)

**What it does:**
- Listens for deep links using `expo-linking`
- Detects `natively://reset-password` deep link
- Validates the session exists
- Navigates directly to `/reset-password` screen using `router.replace()`

**Key Features:**
- Handles both app launch and in-app deep links
- Logs all deep link events for debugging
- No intermediate confirmation screens

### 3. Reset Password Screen (app/reset-password.tsx)

**What it does:**
- Validates that a valid session exists
- Shows error and redirects to auth if no session
- Allows user to enter and confirm new password
- Updates password via `supabase.auth.updateUser()`
- Shows success message with user's first name
- Redirects to home screen after 3 seconds

**Key Features:**
- Session validation on mount
- Password visibility toggles
- Password strength validation (min 6 characters)
- Password confirmation matching
- Beautiful success screen
- Personalized welcome message

## Configuration Required

### Supabase Dashboard Settings

1. **Site URL:**
   - Set to: `https://natively.dev`

2. **Redirect URLs:**
   - Add: `https://natively.dev/reset-password`
   - Add: `natively://reset-password`

3. **Email Templates:**
   - Go to Authentication → Email Templates → Reset Password
   - Ensure the redirect URL is set to: `https://natively.dev/reset-password`

### App Configuration (app.json)

- **Scheme:** `natively` (configured)
- **Android Intent Filters:** Configured for `https://natively.dev/reset-password`

## Testing the Flow

### Step 1: Request Password Reset
1. Open the app
2. Go to Sign In screen
3. Tap "Forgot Password?"
4. Enter your email
5. Tap "Send Reset Link"

### Step 2: Check Email
1. Open your email inbox
2. Find the password reset email from Supabase
3. Click the reset link

### Step 3: Web Page
1. Browser opens to `https://natively.dev/reset-password`
2. Page shows "Resetting your password..."
3. Token is exchanged for session
4. Page shows "Link Verified! Opening PickleRadar app..."

### Step 4: App Opens
1. App automatically opens (deep link)
2. Reset Password screen appears
3. No intermediate screens shown

### Step 5: Reset Password
1. Enter new password (min 6 characters)
2. Confirm new password
3. Tap "Reset Password"
4. Success screen appears
5. After 3 seconds, redirected to home screen

## Troubleshooting

### Issue: Web page shows "Link Expired or Invalid"
**Solution:** The token has expired. Request a new password reset link.

### Issue: App doesn't open automatically
**Solution:** 
- Tap the "Open PickleRadar" button on the web page
- Or manually open the app - the session is already established

### Issue: "Invalid Session" alert in app
**Solution:** 
- The session wasn't properly established
- Click the reset link in the email again
- Ensure you're clicking the link on the same device where the app is installed

### Issue: Deep link not working
**Solution:**
- Ensure the app is installed on the device
- Check that the scheme is set to `natively` in app.json
- Rebuild the app after changing app.json

## Security Notes

- Tokens are single-use and expire after a set time
- Session is validated before allowing password reset
- Password must be at least 6 characters
- All password reset attempts are logged
- User is automatically signed in after successful reset

## User Experience

The flow is designed to be seamless:
1. **No manual token entry** - Token is automatically exchanged
2. **No copy/paste** - Deep linking handles navigation
3. **No intermediate screens** - Direct to password reset
4. **Clear feedback** - Loading states, success messages, error handling
5. **Personalized** - Welcome message with user's first name
6. **Automatic redirect** - No need to manually navigate after success

## Code Files

- `WEB_PAGE_RESET_PASSWORD.html` - Web page for token exchange
- `app/_layout.tsx` - Deep link handler
- `app/reset-password.tsx` - Reset password screen
- `hooks/useAuth.ts` - Authentication logic
- `app.json` - App configuration

## Next Steps

The password reset flow is now complete and ready to use. Make sure to:

1. ✅ Deploy `WEB_PAGE_RESET_PASSWORD.html` to `https://natively.dev/reset-password`
2. ✅ Configure Supabase redirect URLs
3. ✅ Update email template in Supabase
4. ✅ Test the complete flow on both iOS and Android
5. ✅ Verify deep linking works correctly

---

**Implementation Status:** ✅ Complete

**Last Updated:** January 2025
