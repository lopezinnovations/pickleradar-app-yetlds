
# Supabase Authentication Redirect Setup

This guide explains how to configure Supabase authentication redirects for email confirmation and password reset.

## Overview

The app uses custom redirect URLs to handle email confirmation and password reset flows:

- **Email Confirmation**: `https://natively.dev/email-confirmed`
- **Password Reset**: `https://natively.dev/reset-password`

These URLs will handle the token exchange and then deep link back into the mobile app using:
- `natively://email-confirmed`
- `natively://reset-password`

## Supabase Dashboard Configuration

### 1. Navigate to Authentication Settings

1. Go to your Supabase project dashboard
2. Click on **Authentication** in the left sidebar
3. Click on **URL Configuration**

### 2. Set Site URL

Set the **Site URL** to:
```
https://natively.dev
```

### 3. Add Redirect URLs

Add the following URLs to the **Redirect URLs** list:

```
https://natively.dev/email-confirmed
https://natively.dev/reset-password
https://natively.dev
```

For local development, you may also want to add:
```
http://localhost:8081/email-confirmed
http://localhost:8081/reset-password
```

### 4. Update Email Templates

#### Confirm Signup Email Template

Go to **Authentication** > **Email Templates** > **Confirm signup**

Update the template to use the custom redirect URL:

```html
<h2>Confirm Your PickleRadar Account</h2>

<p>Follow this link to confirm your account:</p>

<p><a href="{{ .ConfirmationURL }}">Confirm Your Email</a></p>

<p>Your email has been successfully confirmed!</p>
<p>You now have full functionality and access to PickleRadar.</p>

<p>See you on the courts!</p>

<p><small>Powered by Lopez Innovations LLC</small></p>
```

**Important**: Make sure the confirmation URL in Supabase settings points to `https://natively.dev/email-confirmed`

#### Reset Password Email Template

Go to **Authentication** > **Email Templates** > **Reset password**

Update the template to use the custom redirect URL:

```html
<h2>Reset Your PickleRadar Password</h2>

<p>Follow this link to reset your password for your account:</p>

<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>

<p>If you did not request this, please ignore this email.</p>

<p><small>Powered by Lopez Innovations LLC</small></p>
```

**Important**: Make sure the reset password URL in Supabase settings points to `https://natively.dev/reset-password`

## How It Works

### Email Confirmation Flow

1. User signs up with email and password
2. Supabase sends confirmation email with link to `https://natively.dev/email-confirmed?token=...`
3. User clicks the link in their email
4. The web page at `https://natively.dev/email-confirmed` calls `supabase.auth.exchangeCodeForSession()`
5. After token exchange, the page redirects to `natively://email-confirmed`
6. The mobile app opens and displays the email confirmation success screen
7. User is automatically signed in

### Password Reset Flow

1. User requests password reset
2. Supabase sends reset email with link to `https://natively.dev/reset-password?token=...`
3. User clicks the link in their email
4. The web page at `https://natively.dev/reset-password` calls `supabase.auth.exchangeCodeForSession()`
5. After token exchange, the page redirects to `natively://reset-password`
6. The mobile app opens and displays the password reset screen
7. User enters new password and submits

## Web Pages Required

You need to create two web pages at `https://natively.dev`:

### `/email-confirmed` Page

```html
<!DOCTYPE html>
<html>
<head>
    <title>Email Confirmed - PickleRadar</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
    <h1>Confirming your email...</h1>
    <p>Please wait while we verify your email address.</p>
    
    <script>
        const supabaseUrl = 'YOUR_SUPABASE_URL';
        const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        
        async function handleEmailConfirmation() {
            try {
                // Exchange the code for a session
                const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
                
                if (error) {
                    console.error('Error exchanging code:', error);
                    document.body.innerHTML = '<h1>Error</h1><p>Failed to confirm email. Please try again.</p>';
                    return;
                }
                
                console.log('Session established:', data);
                
                // Redirect to the mobile app
                window.location.href = 'natively://email-confirmed';
            } catch (err) {
                console.error('Error:', err);
                document.body.innerHTML = '<h1>Error</h1><p>An unexpected error occurred.</p>';
            }
        }
        
        handleEmailConfirmation();
    </script>
</body>
</html>
```

### `/reset-password` Page

```html
<!DOCTYPE html>
<html>
<head>
    <title>Reset Password - PickleRadar</title>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
<body>
    <h1>Verifying reset link...</h1>
    <p>Please wait while we verify your password reset request.</p>
    
    <script>
        const supabaseUrl = 'YOUR_SUPABASE_URL';
        const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        
        async function handlePasswordReset() {
            try {
                // Exchange the code for a session
                const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
                
                if (error) {
                    console.error('Error exchanging code:', error);
                    document.body.innerHTML = '<h1>Error</h1><p>Failed to verify reset link. Please try again.</p>';
                    return;
                }
                
                console.log('Session established:', data);
                
                // Redirect to the mobile app
                window.location.href = 'natively://reset-password';
            } catch (err) {
                console.error('Error:', err);
                document.body.innerHTML = '<h1>Error</h1><p>An unexpected error occurred.</p>';
            }
        }
        
        handlePasswordReset();
    </script>
</body>
</html>
```

## Testing

### Test Email Confirmation

1. Sign up with a new email address
2. Check your email for the confirmation link
3. Click the confirmation link
4. Verify you're redirected to the web page
5. Verify the web page redirects to the mobile app
6. Verify the app shows the email confirmation success screen

### Test Password Reset

1. Request a password reset
2. Check your email for the reset link
3. Click the reset link
4. Verify you're redirected to the web page
5. Verify the web page redirects to the mobile app
6. Verify the app shows the password reset screen
7. Enter a new password and submit

## Troubleshooting

### Email Links Not Working

- Verify the redirect URLs are correctly configured in Supabase
- Check that the Site URL is set to `https://natively.dev`
- Ensure the email templates use the correct confirmation URL variables

### Deep Links Not Opening App

- Verify the app scheme is set to `natively` in `app.json`
- Test the deep links manually: `natively://email-confirmed` and `natively://reset-password`
- Check the app's deep link handling in `app/_layout.tsx`

### Token Exchange Failing

- Verify the Supabase URL and anon key are correct in the web pages
- Check the browser console for error messages
- Ensure the token hasn't expired (tokens are typically valid for 1 hour)

## Security Notes

- The web pages should be served over HTTPS
- The Supabase anon key is safe to expose in client-side code
- Tokens are single-use and expire after a short time
- Always validate the session on the server side for sensitive operations
