
# Email Confirmation Setup Guide

This guide explains how to update the email confirmation template in your Supabase project to work with the new authentication flow.

## Overview

The PickleRadar app now implements a proper email confirmation flow that:

- Blocks access to the app until email is confirmed
- Shows a clear "Confirm Email" screen with a resend button
- Automatically signs users in after email confirmation
- Displays a success message after confirmation
- Routes users directly to the app home screen

## Required Email Template Updates

You need to update the email confirmation template in your Supabase dashboard to use the correct redirect URL.

### Step 1: Access Email Templates

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/biczbxmaisdxpcbplddr
2. Navigate to **Authentication** → **Email Templates**
3. Select the **Confirm signup** template

### Step 2: Update the Subject Line

Change the subject to:

```
Your email has been successfully confirmed
```

### Step 3: Update the Email Body

Replace the entire email body with:

```html
<h2>Your email has been successfully confirmed</h2>

<p>You now have full functionality and access to PickleRadar.</p>

<p>Get started here: <a href="{{ .ConfirmationURL }}">Open PickleRadar</a></p>

<p>See you on the courts!</p>

<p>— PickleRadar<br>
Powered by Lopez Innovations LLC</p>
```

### Step 4: Verify the Redirect URL

Make sure the **Site URL** in your Supabase project settings is set to:

```
https://natively.dev
```

And add the following to your **Redirect URLs**:

```
https://natively.dev/email-confirmed
natively://email-confirmed
```

To update these settings:

1. Go to **Authentication** → **URL Configuration**
2. Set the **Site URL** to `https://natively.dev`
3. Add the redirect URLs listed above to the **Redirect URLs** list

## How It Works

### Sign Up Flow

1. User fills out the sign-up form
2. After successful sign-up, they are redirected to the "Confirm Email" screen
3. The screen shows:
   - A message asking them to confirm their email
   - Their email address
   - A "Resend Confirmation Email" button
   - A "Back to Sign In" button

### Email Confirmation Flow

1. User receives the confirmation email
2. They click the confirmation link in the email
3. The link opens the app and verifies the email
4. The app shows a success message:
   - "Your email has been successfully confirmed."
   - "You now have full functionality and access to PickleRadar."
5. After 2 seconds, the user is automatically redirected to the app home screen
6. They are now fully authenticated and can use all features

### Resend Email Flow

1. If the user doesn't receive the email, they can click "Resend Confirmation Email"
2. A new confirmation email is sent
3. A success banner appears confirming the email was sent
4. The user can check their inbox again

## Testing the Flow

To test the email confirmation flow:

1. Sign up with a new email address
2. Verify you are redirected to the "Confirm Email" screen
3. Check your email for the confirmation message
4. Click the confirmation link
5. Verify you see the success message
6. Verify you are automatically redirected to the app home screen
7. Verify you can access all app features

## Troubleshooting

### Email Not Received

- Check spam/junk folder
- Use the "Resend Confirmation Email" button
- Verify SMTP is configured in Supabase (Authentication → Settings → SMTP)

### Confirmation Link Not Working

- Verify the redirect URLs are correctly configured
- Check the browser console for errors
- Verify the deep linking is working (natively:// scheme)

### User Stuck on Confirm Email Screen

- Have them click "Resend Confirmation Email"
- Verify their email is correct
- Check Supabase logs for any errors

## Security Notes

- Email confirmation is required before users can access the app
- Users cannot bypass the confirmation screen
- The confirmation token is verified server-side
- Sessions are only created after successful email verification

## Support

If you encounter any issues with email confirmation:

1. Check the Supabase logs in the dashboard
2. Verify SMTP settings are correct
3. Test with a different email provider
4. Contact support if the issue persists
