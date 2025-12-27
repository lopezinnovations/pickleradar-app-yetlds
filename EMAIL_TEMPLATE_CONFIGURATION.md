
# Email Template Configuration Guide

This guide provides instructions for updating the email confirmation template in your Supabase dashboard to match the new signup flow requirements.

## Email Confirmation Template

### Subject Line
```
Confirm your email to activate PickleRadar
```

### Email Body (HTML)

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
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #4CAF50;
    }
    .header h1 {
      color: #4CAF50;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px 0;
    }
    .content p {
      font-size: 16px;
      margin: 15px 0;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 15px 40px;
      background-color: #4CAF50;
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 14px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to PickleRadar!</h1>
  </div>
  
  <div class="content">
    <p><strong>You're almost ready to hit the courts.</strong></p>
    
    <p>Please confirm your email to activate your account and unlock full access.</p>
    
    <div class="button-container">
      <a href="{{ .ConfirmationURL }}" class="button">Confirm Email</a>
    </div>
    
    <p>Once confirmed, you'll be taken straight into the app.</p>
    
    <p style="margin-top: 30px;">See you on the courts!</p>
  </div>
  
  <div class="footer">
    <p><strong>— PickleRadar</strong></p>
    <p>Powered by Lopez Innovations LLC</p>
  </div>
</body>
</html>
```

### Plain Text Version

```
Welcome to PickleRadar!

You're almost ready to hit the courts.

Please confirm your email to activate your account and unlock full access.

Confirm your email by clicking this link:
{{ .ConfirmationURL }}

Once confirmed, you'll be taken straight into the app.

See you on the courts!

— PickleRadar
Powered by Lopez Innovations LLC
```

## How to Update in Supabase Dashboard

1. **Navigate to Authentication Settings**
   - Go to your Supabase project dashboard
   - Click on "Authentication" in the left sidebar
   - Select "Email Templates"

2. **Select Confirm Signup Template**
   - Find the "Confirm signup" template
   - Click to edit

3. **Update Subject Line**
   - Replace the subject with: `Confirm your email to activate PickleRadar`

4. **Update Email Body**
   - Replace the HTML content with the template above
   - Make sure to keep the `{{ .ConfirmationURL }}` variable intact

5. **Update Redirect URL**
   - In Authentication > URL Configuration
   - Set the Site URL to: `https://natively.dev`
   - Add redirect URL: `https://natively.dev/email-confirmed`

6. **Save Changes**
   - Click "Save" to apply the new template

## Testing

After updating the template:

1. Create a test account through the signup flow
2. Check your email for the confirmation message
3. Verify the email matches the new template
4. Click the confirmation link
5. Ensure you're redirected to the app with the success message

## Important Notes

- The `{{ .ConfirmationURL }}` variable is automatically populated by Supabase
- Do not modify or remove this variable
- The redirect URL must match what's configured in your Supabase project
- Email styling may vary slightly depending on the email client

## Troubleshooting

**Email not sending:**
- Check SMTP configuration in Supabase dashboard
- Verify email service is enabled
- Check spam/junk folders

**Redirect not working:**
- Verify redirect URLs are correctly configured
- Check that deep linking is properly set up in the app
- Ensure the URL scheme matches your app configuration

**Template not updating:**
- Clear browser cache
- Wait a few minutes for changes to propagate
- Try sending a test email to verify changes
