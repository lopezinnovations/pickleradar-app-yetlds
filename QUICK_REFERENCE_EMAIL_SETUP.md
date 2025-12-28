
# Quick Reference: Email Setup for PickleRadar

## What Was Implemented

### 1. Email Confirmation Page (app/email-confirmed.tsx)
- ✅ PickleRadar logo at top
- ✅ Success message: "Great! Your email has been successfully confirmed."
- ✅ "Return to Home Page" button (auto-logs user in)
- ✅ Welcome message: "Welcome back, [First Name]! Enjoy PickleRadar."
- ✅ Footer: "Powered by Lopez Innovations LLC"
- ✅ Removed "continue building" text

### 2. Confirm Email Waiting Screen (app/confirm-email.tsx)
- ✅ PickleRadar logo
- ✅ Blocking screen preventing app access
- ✅ "Resend Confirmation Email" button
- ✅ Footer: "Powered by Lopez Innovations LLC"

### 3. Password Reset Screen (app/reset-password.tsx)
- ✅ PickleRadar logo
- ✅ Password reset form
- ✅ Success screen with welcome message
- ✅ Auto-login after password reset
- ✅ Footer: "Powered by Lopez Innovations LLC"

### 4. Email Templates (Need Manual Configuration)
See `EMAIL_TEMPLATE_UPDATE_GUIDE.md` for complete HTML templates

**Confirm Signup Email:**
- Subject: "Confirm Your PickleRadar Account"
- PickleRadar logo/branding
- "Confirm Your Email" button
- Success message
- "Open PickleRadar" button
- "See you on the courts!"
- Footer: "Powered by Lopez Innovations LLC"

**Reset Password Email:**
- Subject: "Reset Your PickleRadar Password"
- PickleRadar logo/branding
- "Reset Password" button
- Warning: "If you did not request this, please ignore this email."
- Footer: "Powered by Lopez Innovations LLC"

---

## What You Need to Do in Supabase Dashboard

### Step 1: Update Email Templates (5 minutes)

1. Go to https://app.supabase.com
2. Select project: `biczbxmaisdxpcbplddr`
3. Go to **Authentication** → **Email Templates**
4. Copy templates from `EMAIL_TEMPLATE_UPDATE_GUIDE.md`
5. Update "Confirm signup" template
6. Update "Reset password" template
7. Click "Save" for each

### Step 2: Configure Redirect URLs (2 minutes)

1. Go to **Authentication** → **URL Configuration**
2. Add these redirect URLs:
   - `https://natively.dev/email-confirmed`
   - `natively://email-confirmed`
   - `natively://reset-password`
3. Click "Save"

### Step 3: Configure SMTP (10 minutes)

**Why?** Supabase's default email service is limited. You need custom SMTP for production.

**Recommended: SendGrid (Free)**

1. Sign up at https://sendgrid.com
2. Create API key
3. Verify sender email
4. In Supabase: **Project Settings** → **Auth** → **SMTP Settings**
5. Enable "Custom SMTP"
6. Enter:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: [Your SendGrid API Key]
   - Sender email: [Your verified email]
   - Sender name: `PickleRadar`
7. Click "Save"

---

## Testing Checklist

### Test Signup Flow
1. Sign up with new email
2. ✅ See "Almost done!" blocking screen
3. ✅ Receive confirmation email
4. ✅ Email has PickleRadar branding
5. ✅ Click "Confirm Your Email"
6. ✅ See success screen with logo
7. ✅ Click "Return to Home Page"
8. ✅ Auto-logged in
9. ✅ See welcome message with first name
10. ✅ Profile shows all saved data

### Test Password Reset Flow
1. Click "Forgot Password?"
2. Enter email
3. ✅ Receive reset email
4. ✅ Email has PickleRadar branding
5. ✅ Click "Reset Password"
6. ✅ Enter new password
7. ✅ See success screen
8. ✅ Auto-logged in
9. ✅ See welcome message

---

## Common Issues & Quick Fixes

### No Emails Received
- ❌ **Problem:** SMTP not configured
- ✅ **Fix:** Complete Step 3 above (Configure SMTP)

### Links Don't Work
- ❌ **Problem:** Redirect URLs not configured
- ✅ **Fix:** Complete Step 2 above (Configure Redirect URLs)

### Profile Data Missing
- ❌ **Problem:** Database table missing columns
- ✅ **Fix:** Check Supabase Table Editor → users table has:
  - first_name
  - last_name
  - pickleballer_nickname
  - dupr_rating
  - experience_level

### Auto-Login Not Working
- ❌ **Problem:** Session not established
- ✅ **Fix:** Check app logs for errors, verify redirect URLs

---

## Files Modified

- `app/email-confirmed.tsx` - Email confirmation success page
- `app/confirm-email.tsx` - Email confirmation waiting screen
- `app/reset-password.tsx` - Password reset screen
- `components/BrandingFooter.tsx` - Reusable footer component
- `hooks/useAuth.ts` - Already configured correctly

---

## Next Steps

1. ✅ Update Supabase email templates (5 min)
2. ✅ Configure redirect URLs (2 min)
3. ✅ Set up SMTP with SendGrid (10 min)
4. ✅ Test complete signup flow
5. ✅ Test password reset flow
6. ✅ Verify profile data is saved
7. ✅ Check all branding appears correctly

**Total Setup Time: ~20 minutes**

---

## Support Resources

- **Complete Guide:** `COMPLETE_EMAIL_SETUP_GUIDE.md`
- **Email Templates:** `EMAIL_TEMPLATE_UPDATE_GUIDE.md`
- **Supabase Docs:** https://supabase.com/docs/guides/auth
- **SendGrid Docs:** https://docs.sendgrid.com

---

## Summary

All code changes are complete! The app now has:
- ✅ Branded email confirmation page with auto-login
- ✅ Welcome messages with user's first name
- ✅ "Powered by Lopez Innovations LLC" footer everywhere
- ✅ Complete profile data collection

You just need to:
1. Update email templates in Supabase (copy/paste from guide)
2. Configure redirect URLs
3. Set up SMTP (SendGrid recommended)
4. Test the flows

That's it! 🎾
