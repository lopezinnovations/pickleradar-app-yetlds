
# Password Reset Configuration Guide

## Problem
The password reset link is directing users to the default Supabase verification page instead of the custom `https://natively.dev/reset-password` page.

## Root Cause
The Supabase email template for password reset is using the default `{{ .ConfirmationURL }}` variable, which generates a Supabase-hosted verification URL instead of redirecting directly to your custom page.

## Solution

### Step 1: Update Supabase Email Template

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/biczbxmaisdxpcbplddr
2. Navigate to **Authentication** → **Email Templates**
3. Select **Reset Password** template
4. Replace the template with the following:

```html
<h2>Reset Your PickleRadar Password</h2>

<p>Follow this link to reset your password for your account:</p>

<p><a href="{{ .SiteURL }}/auth/v1/verify?token={{ .Token }}&type=recovery&redirect_to={{ .RedirectTo }}">Reset Password</a></p>

<p>If you did not request this, please ignore this email.</p>

<p style="margin-top: 40px; color: #666; font-size: 12px;">Powered by Lopez Innovations LLC</p>
```

**Important:** The key change is using `{{ .RedirectTo }}` which will use the `redirectTo` parameter passed from the app.

### Step 2: Verify Redirect URLs in Supabase

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Ensure the following URLs are added to **Redirect URLs**:
   - `https://natively.dev/reset-password`
   - `https://natively.dev/email-confirmed`
   - `https://natively.dev`
   - `natively://reset-password` (for deep linking)
   - `natively://email-confirmed` (for deep linking)

3. Set **Site URL** to: `https://natively.dev`

### Step 3: Web Page Token Exchange

The web page at `https://natively.dev/reset-password` must:

1. Extract the token from the URL parameters
2. Call `supabase.auth.exchangeCodeForSession()` to establish the session
3. Deep link back to the app: `natively://reset-password`

Example implementation:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Reset Password - PickleRadar</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
    <div style="text-align: center; padding: 50px;">
        <h1>Resetting your password...</h1>
        <p>Please wait while we verify your link.</p>
    </div>

    <script>
        const supabase = window.supabase.createClient(
            'https://biczbxmaisdxpcbplddr.supabase.co',
            'sb_publishable_G_5RZYmomd6zB_uFbRCDtw_rBflTxYk'
        );

        async function handlePasswordReset() {
            try {
                // Exchange the code for a session
                const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
                
                if (error) {
                    console.error('Error exchanging code:', error);
                    document.body.innerHTML = `
                        <div style="text-align: center; padding: 50px;">
                            <h1>Error</h1>
                            <p>Unable to verify your password reset link. Please request a new one.</p>
                        </div>
                    `;
                    return;
                }

                console.log('Session established:', data);
                
                // Deep link back to the app
                window.location.href = 'natively://reset-password';
                
                // Fallback message if deep link doesn't work
                setTimeout(() => {
                    document.body.innerHTML = `
                        <div style="text-align: center; padding: 50px;">
                            <h1>Password Reset Ready</h1>
                            <p>Please return to the PickleRadar app to set your new password.</p>
                            <p style="margin-top: 20px; color: #666;">If the app didn't open automatically, please open it manually.</p>
                        </div>
                    `;
                }, 2000);
            } catch (error) {
                console.error('Error:', error);
                document.body.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h1>Error</h1>
                        <p>An unexpected error occurred. Please try again.</p>
                    </div>
                `;
            }
        }

        handlePasswordReset();
    </script>
</body>
</html>
```

### Step 4: App Deep Link Handling

The app is already configured to handle the `natively://reset-password` deep link. When the user is redirected back to the app:

1. The session is already established (from the web page token exchange)
2. The `app/reset-password.tsx` screen checks for a valid session
3. If valid, the user can enter their new password
4. If invalid/expired, the user is redirected back to the auth screen

## Testing the Flow

1. **Request Password Reset:**
   - Open the app
   - Go to Sign In screen
   - Tap "Forgot Password?"
   - Enter your email
   - Tap "Send Reset Link"

2. **Check Email:**
   - Open the password reset email
   - Click the "Reset Password" link

3. **Web Page:**
   - Should see "Resetting your password..." message
   - Token exchange happens automatically
   - Should redirect to app via deep link

4. **App:**
   - Opens to reset-password screen
   - Enter new password
   - Confirm password
   - Tap "Reset Password"
   - See success message
   - Redirect to home screen

## Troubleshooting

### Issue: "Invalid Session" error in app
**Solution:** The token may have expired. Request a new password reset link.

### Issue: Web page shows error
**Solution:** 
- Check that the redirect URL is added to Supabase
- Verify the email template is using `{{ .RedirectTo }}`
- Check browser console for specific errors

### Issue: Deep link doesn't open app
**Solution:**
- On iOS: Deep links may not work in some email clients. Try opening the link in Safari.
- On Android: Ensure the app is installed and the deep link scheme is registered.
- Fallback: The web page shows instructions to manually open the app.

### Issue: "Bad Request" page in Natively
**Solution:** This happens when the Supabase verification URL is opened directly in the app instead of the web browser. The web page must handle the token exchange first, then deep link back to the app.

## Current Status

✅ App code updated to:
- Check for valid session on reset-password screen
- Show loading state while verifying
- Handle expired/invalid sessions gracefully
- Redirect to auth screen if session is invalid

⚠️ **Action Required:**
1. Update the Supabase email template (Step 1)
2. Deploy the web page at `https://natively.dev/reset-password` (Step 3)
3. Test the complete flow

## Notes

- The password reset token is valid for 1 hour by default
- Users can only reset their password once per token
- After successful password reset, the user is automatically signed in
- The session persists across app restarts
