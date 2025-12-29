
# Quick Fix: Password Reset Link Issue

## The Problem
When users click the password reset link in their email, they see a "Bad Request" page instead of being able to reset their password.

## Why This Happens
The Supabase email is sending users to:
```
https://biczbxmaisdxpcbplddr.supabase.co/auth/v1/verify?token=...&redirect_to=https://natively.dev/reset-password
```

This Supabase URL needs to be handled by a web page first (not the app directly).

## The Fix (3 Steps)

### 1. Update Supabase Email Template

Go to: https://supabase.com/dashboard/project/biczbxmaisdxpcbplddr/auth/templates

Click on **"Reset Password"** template and use this:

```html
<h2>Reset Your PickleRadar Password</h2>

<p>Follow this link to reset your password for your account:</p>

<p><a href="{{ .SiteURL }}/auth/v1/verify?token={{ .Token }}&type=recovery&redirect_to={{ .RedirectTo }}">Reset Password</a></p>

<p>If you did not request this, please ignore this email.</p>

<p style="margin-top: 40px; color: #666; font-size: 12px;">Powered by Lopez Innovations LLC</p>
```

### 2. Create Web Page at https://natively.dev/reset-password

This page needs to:
1. Exchange the token for a session
2. Deep link back to the app

```html
<!DOCTYPE html>
<html>
<head>
    <title>Reset Password - PickleRadar</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
        }
        h1 { color: #333; margin-bottom: 16px; }
        p { color: #666; line-height: 1.6; }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
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
                console.log('Exchanging code for session...');
                const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
                
                if (error) {
                    console.error('Error:', error);
                    document.querySelector('.container').innerHTML = `
                        <h1>❌ Error</h1>
                        <p>Unable to verify your password reset link. It may have expired.</p>
                        <p style="margin-top: 20px;">Please request a new password reset link from the app.</p>
                    `;
                    return;
                }

                console.log('Session established successfully');
                
                // Update UI
                document.querySelector('.container').innerHTML = `
                    <h1>✅ Verified!</h1>
                    <p>Opening PickleRadar app...</p>
                `;
                
                // Deep link back to the app
                setTimeout(() => {
                    window.location.href = 'natively://reset-password';
                    
                    // Show fallback message after 2 seconds
                    setTimeout(() => {
                        document.querySelector('.container').innerHTML = `
                            <h1>✅ Ready to Reset</h1>
                            <p>Please return to the PickleRadar app to set your new password.</p>
                            <p style="margin-top: 20px; color: #999; font-size: 14px;">
                                If the app didn't open automatically, please open it manually.
                            </p>
                        `;
                    }, 2000);
                }, 500);
            } catch (error) {
                console.error('Unexpected error:', error);
                document.querySelector('.container').innerHTML = `
                    <h1>❌ Error</h1>
                    <p>An unexpected error occurred. Please try again.</p>
                `;
            }
        }

        handlePasswordReset();
    </script>
</body>
</html>
```

### 3. Verify Redirect URLs in Supabase

Go to: https://supabase.com/dashboard/project/biczbxmaisdxpcbplddr/auth/url-configuration

Add these URLs to **Redirect URLs**:
- `https://natively.dev/reset-password`
- `https://natively.dev/email-confirmed`
- `natively://reset-password`
- `natively://email-confirmed`

Set **Site URL** to: `https://natively.dev`

## How It Works Now

1. **User requests password reset** → App calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://natively.dev/reset-password' })`

2. **User receives email** → Email contains link to Supabase verification URL with redirect parameter

3. **User clicks link** → Opens in browser, Supabase redirects to `https://natively.dev/reset-password?token=...`

4. **Web page loads** → JavaScript exchanges token for session, then deep links to `natively://reset-password`

5. **App opens** → Reset password screen checks for valid session, allows user to set new password

## Testing

1. In the app, go to Sign In → Forgot Password
2. Enter your email and request reset
3. Check your email and click the link
4. Should see web page briefly, then app opens
5. Enter new password in the app
6. Success! 🎉

## App Changes Made

✅ Updated `app/reset-password.tsx`:
- Added session validation on screen load
- Shows loading state while checking session
- Redirects to auth screen if session is invalid/expired
- Better error handling and user feedback

✅ Updated `app/_layout.tsx`:
- Enhanced deep link handling
- Added session verification logging
- Better error handling

## What You Need To Do

1. ✅ **Update Supabase email template** (Step 1 above)
2. ✅ **Deploy web page** at https://natively.dev/reset-password (Step 2 above)
3. ✅ **Verify redirect URLs** in Supabase (Step 3 above)

Once these are done, test the flow end-to-end!
