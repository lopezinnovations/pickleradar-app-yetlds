
# Six-Digit Code Email Template Configuration

## Overview

This document provides the email template configuration for the six-digit code authentication system.

## Email Template

The email template is embedded in the `send-login-code` Edge Function. It includes:

- Professional PickleRadar branding
- Gradient header with app name
- Large, easy-to-read code display
- Clear expiration notice
- Security information
- Company branding footer

## HTML Template

The complete HTML template is located in:
```
supabase/functions/send-login-code/index.ts
```

## Template Features

### Header
- Gradient background (purple to violet)
- White PickleRadar logo text
- Professional appearance

### Code Display
- 36px font size
- Bold weight
- 8px letter spacing
- Monospace font (Courier New)
- Purple color (#667eea)
- Gray background with border
- Centered alignment

### Content
- Clear instructions
- Expiration notice (10 minutes)
- Security notice for unauthorized requests

### Footer
- Horizontal rule separator
- "Powered by Lopez Innovations LLC"
- Gray text color
- Small font size (12px)

## Customization

### Change Company Name

In `supabase/functions/send-login-code/index.ts`, update:

```typescript
<p style="margin: 5px 0;">Powered by <strong>Your Company Name</strong></p>
```

### Change Colors

Update the gradient colors:

```typescript
<div style="background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%); ...">
```

Update the code color:

```typescript
<p style="font-size: 36px; ... color: #YOUR_COLOR; ...">
```

### Change App Name

Update all instances of "PickleRadar":

```typescript
<h1 style="color: white; margin: 0; font-size: 28px;">Your App Name</h1>
```

### Change Expiration Time

Update the expiration notice:

```typescript
<p style="font-size: 16px; color: #555;">
  Enter this code in the app to access your profile. The code will expire in <strong>YOUR_TIME</strong>.
</p>
```

Also update the actual expiration in the code:

```typescript
// Change from 10 minutes to your desired time
const expiresAt = new Date(Date.now() + YOUR_MINUTES * 60 * 1000).toISOString();
```

## Email Service Configuration

### Using Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Get your API key
4. Add to Supabase secrets:

```bash
supabase secrets set RESEND_API_KEY=your_api_key_here
```

5. Update the sender email:

```typescript
from: 'PickleRadar <noreply@yourdomain.com>',
```

### Using SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Update the Edge Function to use SendGrid API:

```typescript
const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');

const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sendgridApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email }],
      subject: 'Your PickleRadar Login Code',
    }],
    from: { email: 'noreply@yourdomain.com', name: 'PickleRadar' },
    content: [{
      type: 'text/html',
      value: emailHtml,
    }],
  }),
});
```

### Using Mailgun

1. Sign up at [mailgun.com](https://mailgun.com)
2. Get your API key and domain
3. Update the Edge Function to use Mailgun API:

```typescript
const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY');
const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN');

const formData = new FormData();
formData.append('from', 'PickleRadar <noreply@yourdomain.com>');
formData.append('to', email);
formData.append('subject', 'Your PickleRadar Login Code');
formData.append('html', emailHtml);

const response = await fetch(
  `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
    },
    body: formData,
  }
);
```

## Testing the Email Template

### Test Email Sending

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-login-code \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com"}'
```

### Preview the Email

1. Send a test email to yourself
2. Check how it renders in different email clients:
   - Gmail
   - Outlook
   - Apple Mail
   - Mobile email apps

### Email Client Compatibility

The template uses inline styles for maximum compatibility with email clients:

- ✅ Gmail
- ✅ Outlook
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Mobile email apps
- ✅ Dark mode support

## Best Practices

### Email Deliverability

1. **Verify Your Domain**: Use a verified domain for sending emails
2. **SPF Records**: Set up SPF records for your domain
3. **DKIM**: Enable DKIM signing
4. **DMARC**: Configure DMARC policy
5. **Sender Reputation**: Monitor your sender reputation

### Email Content

1. **Clear Subject**: Use a clear, descriptive subject line
2. **Branding**: Include your logo and brand colors
3. **Instructions**: Provide clear instructions
4. **Security**: Include security notices
5. **Support**: Provide contact information

### Code Display

1. **Large Font**: Make the code easy to read
2. **Monospace Font**: Use a monospace font for clarity
3. **Letter Spacing**: Add spacing between digits
4. **Contrast**: Ensure good contrast with background
5. **Copy-Paste**: Make it easy to copy the code

## Troubleshooting

### Emails Not Arriving

1. Check spam/junk folder
2. Verify email service configuration
3. Check Edge Function logs
4. Test with different email providers
5. Verify domain authentication

### Emails Look Broken

1. Use inline styles only
2. Test in multiple email clients
3. Avoid complex CSS
4. Use tables for layout if needed
5. Test on mobile devices

### Codes Not Displaying

1. Check HTML encoding
2. Verify template variables
3. Test with different email clients
4. Check for JavaScript blocking
5. Use plain text fallback

## Plain Text Fallback

For email clients that don't support HTML, provide a plain text version:

```typescript
const emailText = `
Your PickleRadar Login Code

Use the six-digit code below to sign in to your PickleRadar account:

${code}

Enter this code in the app to access your profile. The code will expire in 10 minutes.

If you did not request this code, you can safely ignore this email.

---
Powered by Lopez Innovations LLC
`;
```

## Localization

To support multiple languages, create language-specific templates:

```typescript
const templates = {
  en: {
    subject: 'Your PickleRadar Login Code',
    title: 'Your PickleRadar Login Code',
    instruction: 'Use the six-digit code below to sign in to your PickleRadar account:',
    expiration: 'Enter this code in the app to access your profile. The code will expire in 10 minutes.',
    security: 'If you did not request this code, you can safely ignore this email.',
  },
  es: {
    subject: 'Tu Código de Inicio de Sesión de PickleRadar',
    title: 'Tu Código de Inicio de Sesión de PickleRadar',
    instruction: 'Usa el código de seis dígitos a continuación para iniciar sesión en tu cuenta de PickleRadar:',
    expiration: 'Ingresa este código en la aplicación para acceder a tu perfil. El código expirará en 10 minutos.',
    security: 'Si no solicitaste este código, puedes ignorar este correo electrónico de forma segura.',
  },
};
```

## Support

For email template issues:
1. Check Edge Function logs
2. Test with different email providers
3. Verify HTML rendering
4. Check email service configuration
5. Review spam filter settings

Your email template is now configured and ready to use!
