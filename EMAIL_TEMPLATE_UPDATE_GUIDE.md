
# Email Template Update Guide for PickleRadar

This guide provides the exact email templates that need to be configured in your Supabase dashboard.

## How to Update Email Templates

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `biczbxmaisdxpcbplddr`
3. Navigate to **Authentication** → **Email Templates**
4. Update each template as shown below

---

## 1. Confirm Signup Email Template

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

---

## 2. Reset Password Email Template

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

## 3. Update Redirect URLs

In the Supabase Dashboard, also update the redirect URLs:

1. Go to **Authentication** → **URL Configuration**
2. Add the following redirect URLs:
   - `https://natively.dev/email-confirmed`
   - `natively://email-confirmed`
   - `natively://reset-password`

---

## 4. SMTP Configuration (Important!)

For emails to work properly, you need to configure SMTP settings:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable custom SMTP
3. Configure your SMTP provider (e.g., SendGrid, Mailgun, AWS SES)

**Recommended SMTP Providers:**
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **AWS SES** (Pay as you go, very affordable)

**Example SMTP Configuration (SendGrid):**
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: `[Your SendGrid API Key]`
- Sender email: `noreply@yourdomain.com`
- Sender name: `PickleRadar`

---

## Testing the Email Templates

After updating the templates:

1. **Test Signup Flow:**
   - Create a new account in the app
   - Check your email for the confirmation email
   - Click the "Confirm Your Email" button
   - Verify you're redirected to the app and auto-logged in

2. **Test Password Reset Flow:**
   - Click "Forgot Password" in the app
   - Enter your email
   - Check your email for the reset password email
   - Click the "Reset Password" button
   - Verify you can reset your password

---

## Troubleshooting

**Emails not sending?**
- Check SMTP configuration in Supabase dashboard
- Verify SMTP credentials are correct
- Check spam/junk folder
- Review Supabase logs for errors

**Links not working?**
- Verify redirect URLs are configured correctly
- Check that app scheme matches in app.json
- Test deep linking with `npx uri-scheme open natively://email-confirmed --ios`

**Auto-login not working?**
- Verify the session is being established after email confirmation
- Check browser console/app logs for errors
- Ensure the token is being passed correctly in the URL

---

## Notes

- The email templates use Supabase's template variables like `{{ .ConfirmationURL }}`
- These variables are automatically replaced with the correct URLs by Supabase
- The HTML templates are responsive and work on all email clients
- The branding footer "Powered by Lopez Innovations LLC" is included in all templates
