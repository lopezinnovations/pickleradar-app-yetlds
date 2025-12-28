
# Complete Email Setup Guide for PickleRadar

This guide walks you through setting up the complete email confirmation and password reset flow with auto-login functionality.

## Overview

The implementation includes:
1. ✅ Post-signup email confirmation page with PickleRadar branding
2. ✅ Branded system emails (Reset Password & Confirm Signup)
3. ✅ Auto-login flow after email confirmation
4. ✅ Welcome message with user's first name
5. ✅ "Powered by Lopez Innovations LLC" footer on all screens and emails

---

## Part 1: Update Supabase Email Templates

### Step 1: Access Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project: `biczbxmaisdxpcbplddr`
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Update "Confirm Signup" Template

**Subject:**
```
Confirm Your PickleRadar Account
```

**Email Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a3d1a;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px 30px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-text {
      font-size: 32px;
      font-weight: 800;
      color: #2C7A7B;
      margin: 0;
    }
    h1 {
      color: #1a3d1a;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 20px;
      text-align: center;
    }
    p {
      color: #5a7a5a;
      font-size: 16px;
      margin-bottom: 20px;
      text-align: center;
    }
    .button {
      display: inline-block;
      background-color: #2C7A7B;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 30px auto;
      display: block;
      width: fit-content;
    }
    .button:hover {
      background-color: #236566;
    }
    .success-message {
      background-color: #e8f5e9;
      padding: 20px;
      border-radius: 12px;
      margin: 30px 0;
      text-align: center;
    }
    .success-message p {
      color: #2C7A7B;
      font-weight: 600;
      margin: 5px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #c8e6c9;
    }
    .footer p {
      color: #5a7a5a;
      font-size: 12px;
      margin: 5px 0;
    }
    .signature {
      margin-top: 30px;
      text-align: center;
      color: #5a7a5a;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1 class="logo-text">🎾 PickleRadar</h1>
    </div>
    
    <h1>Confirm Your PickleRadar Account</h1>
    
    <p>Welcome to PickleRadar! You're almost ready to hit the courts.</p>
    
    <p>Follow this link to confirm your account:</p>
    
    <a href="{{ .ConfirmationURL }}" class="button">Confirm Your Email</a>
    
    <div class="success-message">
      <p>Your email has been successfully confirmed!</p>
      <p>You now have full functionality and access to PickleRadar.</p>
    </div>
    
    <a href="{{ .ConfirmationURL }}" class="button">Open PickleRadar</a>
    
    <div class="signature">
      <p>See you on the courts!</p>
    </div>
    
    <div class="footer">
      <p>Powered by Lopez Innovations LLC</p>
    </div>
  </div>
</body>
</html>
```

### Step 3: Update "Reset Password" Template

**Subject:**
```
Reset Your PickleRadar Password
```

**Email Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a3d1a;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 40px 30px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-text {
      font-size: 32px;
      font-weight: 800;
      color: #2C7A7B;
      margin: 0;
    }
    h1 {
      color: #1a3d1a;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 20px;
      text-align: center;
    }
    p {
      color: #5a7a5a;
      font-size: 16px;
      margin-bottom: 20px;
      text-align: center;
    }
    .button {
      display: inline-block;
      background-color: #2C7A7B;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 30px auto;
      display: block;
      width: fit-content;
    }
    .button:hover {
      background-color: #236566;
    }
    .warning {
      background-color: #fff3e0;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .warning p {
      color: #e65100;
      font-size: 14px;
      margin: 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #c8e6c9;
    }
    .footer p {
      color: #5a7a5a;
      font-size: 12px;
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1 class="logo-text">🎾 PickleRadar</h1>
    </div>
    
    <h1>Reset Your PickleRadar Password</h1>
    
    <p>We received a request to reset your password for your PickleRadar account.</p>
    
    <p>Follow this link to reset your password for your account:</p>
    
    <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
    
    <div class="warning">
      <p>If you did not request this, please ignore this email.</p>
    </div>
    
    <div class="footer">
      <p>Powered by Lopez Innovations LLC</p>
    </div>
  </div>
</body>
</html>
```

---

## Part 2: Configure Redirect URLs

### Step 1: Update URL Configuration

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   - `https://natively.dev/email-confirmed`
   - `natively://email-confirmed`
   - `natively://reset-password`

### Step 2: Verify Site URL

Make sure the **Site URL** is set to:
- `https://natively.dev` (for production)
- Or your custom domain if you have one

---

## Part 3: Configure SMTP (Critical!)

### Why SMTP is Required

Supabase's default email service has limitations. For production use, you MUST configure custom SMTP.

### Recommended SMTP Providers

1. **SendGrid** (Recommended)
   - Free tier: 100 emails/day
   - Easy setup
   - Reliable delivery

2. **Mailgun**
   - Free tier: 5,000 emails/month
   - Good for higher volume

3. **AWS SES**
   - Pay as you go
   - Very affordable
   - Requires AWS account

### Step-by-Step: SendGrid Setup

1. **Create SendGrid Account**
   - Go to https://sendgrid.com
   - Sign up for free account
   - Verify your email

2. **Create API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it "PickleRadar"
   - Select "Full Access"
   - Copy the API key (you won't see it again!)

3. **Verify Sender Email**
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Enter your email (e.g., noreply@yourdomain.com)
   - Complete verification

4. **Configure in Supabase**
   - Go to Supabase Dashboard
   - Navigate to **Project Settings** → **Auth** → **SMTP Settings**
   - Enable "Enable Custom SMTP"
   - Enter the following:
     - **Host:** `smtp.sendgrid.net`
     - **Port:** `587`
     - **Username:** `apikey`
     - **Password:** [Your SendGrid API Key]
     - **Sender email:** [Your verified email]
     - **Sender name:** `PickleRadar`

5. **Save and Test**
   - Click "Save"
   - Test by signing up a new user

---

## Part 4: Testing the Complete Flow

### Test 1: Signup and Email Confirmation

1. **Sign Up**
   - Open the app
   - Click "Sign Up"
   - Fill in all required fields:
     - First Name
     - Last Name
     - Pickleballer Nickname
     - DUPR (optional)
     - Experience Level
     - Email
     - Password
   - Accept terms and conditions
   - Click "Sign Up"

2. **Verify Blocking Screen**
   - You should see the "Almost done!" screen
   - Verify it shows your email address
   - Verify you cannot access the app yet

3. **Check Email**
   - Open your email inbox
   - Look for "Confirm Your PickleRadar Account"
   - Check spam folder if not in inbox
   - Verify the email has:
     - PickleRadar logo/branding
     - "Confirm Your Email" button
     - "Open PickleRadar" button
     - "Powered by Lopez Innovations LLC" footer

4. **Click Confirmation Link**
   - Click "Confirm Your Email" button
   - You should be redirected to the app
   - Verify you see the success screen with:
     - PickleRadar logo
     - "Great! Your email has been successfully confirmed."
     - "Return to Home Page" button
     - Welcome message with your first name
     - "Powered by Lopez Innovations LLC" footer

5. **Verify Auto-Login**
   - Click "Return to Home Page"
   - Verify you're logged in automatically
   - Verify you can access all app features
   - Check that your profile shows all saved data

### Test 2: Password Reset Flow

1. **Request Password Reset**
   - Sign out of the app
   - Click "Forgot Password?"
   - Enter your email
   - Click "Send Reset Link"

2. **Check Email**
   - Open your email inbox
   - Look for "Reset Your PickleRadar Password"
   - Verify the email has:
     - PickleRadar logo/branding
     - "Reset Password" button
     - Warning about ignoring if not requested
     - "Powered by Lopez Innovations LLC" footer

3. **Reset Password**
   - Click "Reset Password" button
   - Enter new password
   - Confirm new password
   - Click "Reset Password"

4. **Verify Success**
   - You should see success screen with:
     - PickleRadar logo
     - "Password Reset Successful!"
     - Welcome message with your first name
     - "Powered by Lopez Innovations LLC" footer
   - Verify you're automatically logged in
   - Verify you're redirected to home screen

### Test 3: Profile Data Verification

1. **Check Profile Page**
   - Navigate to Profile tab
   - Verify all fields are populated:
     - First Name
     - Last Name
     - Pickleballer Nickname
     - DUPR (if entered)
     - Experience Level

2. **Verify in Database**
   - Go to Supabase Dashboard
   - Navigate to **Table Editor** → **users**
   - Find your user record
   - Verify all fields are saved correctly

---

## Part 5: Troubleshooting

### Emails Not Sending

**Problem:** No emails are received after signup or password reset

**Solutions:**
1. Check SMTP configuration in Supabase
2. Verify SMTP credentials are correct
3. Check SendGrid dashboard for errors
4. Verify sender email is verified
5. Check spam/junk folder
6. Review Supabase logs: **Logs** → **Auth Logs**

### Links Not Working

**Problem:** Clicking email links doesn't redirect to app

**Solutions:**
1. Verify redirect URLs are configured in Supabase
2. Check that app scheme matches in app.json (`natively`)
3. Test deep linking manually:
   ```bash
   # iOS
   npx uri-scheme open natively://email-confirmed --ios
   
   # Android
   npx uri-scheme open natively://email-confirmed --android
   ```
4. Check browser console for errors
5. Verify the URL in the email is correct

### Auto-Login Not Working

**Problem:** User is not automatically logged in after confirmation

**Solutions:**
1. Check that session is being established
2. Verify token is being passed in URL
3. Check app logs for errors:
   ```bash
   # View logs
   npx expo start
   ```
4. Verify Supabase session is active:
   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Session:', session);
   ```

### Profile Data Not Saving

**Problem:** User profile fields are empty after signup

**Solutions:**
1. Check that all fields are being passed to `signUp` function
2. Verify database table has correct columns
3. Check for database errors in Supabase logs
4. Verify RLS policies allow inserts:
   ```sql
   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

### Welcome Message Not Showing

**Problem:** "Welcome back, [First Name]!" not displayed

**Solutions:**
1. Verify first name is saved in database
2. Check that profile fetch is successful
3. Add console logs to debug:
   ```javascript
   console.log('First Name:', firstName);
   ```

---

## Part 6: Verification Checklist

Use this checklist to verify everything is working:

- [ ] Supabase email templates updated (Confirm Signup)
- [ ] Supabase email templates updated (Reset Password)
- [ ] Redirect URLs configured in Supabase
- [ ] SMTP configured and tested
- [ ] Signup flow creates user profile with all fields
- [ ] Email confirmation email received
- [ ] Email has PickleRadar branding
- [ ] Email has "Powered by Lopez Innovations LLC" footer
- [ ] Clicking confirmation link redirects to app
- [ ] Success screen shows with logo and message
- [ ] "Return to Home Page" button works
- [ ] User is automatically logged in
- [ ] Welcome message shows with first name
- [ ] Profile page shows all saved data
- [ ] Password reset email received
- [ ] Password reset email has branding
- [ ] Password reset flow works correctly
- [ ] Auto-login works after password reset
- [ ] All screens have branding footer

---

## Part 7: Production Deployment

### Before Going Live

1. **Update Email Templates**
   - Replace emoji logo with actual logo image
   - Add your domain to sender email
   - Test on multiple email clients

2. **Configure Custom Domain**
   - Set up custom domain for emails
   - Update sender email to use your domain
   - Verify SPF and DKIM records

3. **Increase SMTP Limits**
   - Upgrade SendGrid plan if needed
   - Monitor email delivery rates
   - Set up email analytics

4. **Security**
   - Enable rate limiting in Supabase
   - Set up email verification timeout
   - Configure password requirements

5. **Monitoring**
   - Set up error tracking
   - Monitor email delivery rates
   - Track user signup completion rates

---

## Support

If you encounter issues:

1. Check Supabase logs: **Logs** → **Auth Logs**
2. Check app console logs
3. Review this guide's troubleshooting section
4. Check Supabase documentation: https://supabase.com/docs/guides/auth

---

## Summary

You've successfully implemented:

✅ Branded email confirmation page with auto-login
✅ Branded system emails (Confirm Signup & Reset Password)
✅ Auto-login flow with welcome message
✅ Complete profile data collection and storage
✅ "Powered by Lopez Innovations LLC" branding throughout

The user experience is now:
1. User signs up → Sees blocking screen
2. User confirms email → Auto-logged in with welcome message
3. User resets password → Auto-logged in with welcome message
4. All emails and screens have consistent PickleRadar branding
