
# PickleRadar Email Setup Checklist

Use this checklist to track your progress setting up the email confirmation and auto-login flow.

---

## ✅ Code Implementation (DONE)

- [x] Email confirmation page (`app/email-confirmed.tsx`)
- [x] Confirm email waiting screen (`app/confirm-email.tsx`)
- [x] Password reset screen (`app/reset-password.tsx`)
- [x] Branding footer component (`components/BrandingFooter.tsx`)
- [x] Auto-login functionality
- [x] Welcome message with first name
- [x] Profile data collection
- [x] DUPR validation (1.0-7.0)
- [x] Experience level selection
- [x] Terms & privacy acceptance

---

## 📋 Supabase Configuration (TO DO)

### Email Templates

- [ ] Open Supabase Dashboard (https://app.supabase.com)
- [ ] Select project: `biczbxmaisdxpcbplddr`
- [ ] Navigate to **Authentication** → **Email Templates**
- [ ] Open `EMAIL_TEMPLATE_UPDATE_GUIDE.md`
- [ ] Update "Confirm signup" template
  - [ ] Copy HTML from guide
  - [ ] Paste into Supabase
  - [ ] Update subject line
  - [ ] Click "Save"
- [ ] Update "Reset password" template
  - [ ] Copy HTML from guide
  - [ ] Paste into Supabase
  - [ ] Update subject line
  - [ ] Click "Save"

### Redirect URLs

- [ ] Navigate to **Authentication** → **URL Configuration**
- [ ] Add redirect URL: `https://natively.dev/email-confirmed`
- [ ] Add redirect URL: `natively://email-confirmed`
- [ ] Add redirect URL: `natively://reset-password`
- [ ] Click "Save"

### SMTP Configuration

- [ ] Sign up for SendGrid (https://sendgrid.com)
- [ ] Verify email address
- [ ] Create API key
  - [ ] Go to Settings → API Keys
  - [ ] Click "Create API Key"
  - [ ] Name it "PickleRadar"
  - [ ] Select "Full Access"
  - [ ] Copy API key (save it somewhere safe!)
- [ ] Verify sender email
  - [ ] Go to Settings → Sender Authentication
  - [ ] Click "Verify a Single Sender"
  - [ ] Enter your email
  - [ ] Complete verification
- [ ] Configure SMTP in Supabase
  - [ ] Navigate to **Project Settings** → **Auth** → **SMTP Settings**
  - [ ] Enable "Custom SMTP"
  - [ ] Enter Host: `smtp.sendgrid.net`
  - [ ] Enter Port: `587`
  - [ ] Enter Username: `apikey`
  - [ ] Enter Password: [Your SendGrid API Key]
  - [ ] Enter Sender email: [Your verified email]
  - [ ] Enter Sender name: `PickleRadar`
  - [ ] Click "Save"

---

## 🧪 Testing (TO DO)

### Test 1: Signup Flow

- [ ] Open app
- [ ] Click "Sign Up"
- [ ] Fill in all fields:
  - [ ] First Name
  - [ ] Last Name
  - [ ] Pickleballer Nickname
  - [ ] DUPR (optional)
  - [ ] Experience Level
  - [ ] Email
  - [ ] Password
- [ ] Accept terms and conditions
- [ ] Click "Sign Up"
- [ ] Verify: Redirected to "Almost done!" screen
- [ ] Verify: Cannot access app yet
- [ ] Check email inbox (and spam folder)
- [ ] Verify: Email received
- [ ] Verify: Email has PickleRadar branding
- [ ] Verify: Email has "Confirm Your Email" button
- [ ] Verify: Email has "Powered by Lopez Innovations LLC" footer
- [ ] Click "Confirm Your Email" button
- [ ] Verify: App opens to success screen
- [ ] Verify: Screen shows PickleRadar logo
- [ ] Verify: Screen shows success message
- [ ] Verify: Screen shows welcome message with first name
- [ ] Verify: Screen has "Return to Home Page" button
- [ ] Click "Return to Home Page"
- [ ] Verify: Automatically logged in
- [ ] Verify: Redirected to home screen
- [ ] Navigate to Profile tab
- [ ] Verify: First Name is displayed
- [ ] Verify: Last Name is displayed
- [ ] Verify: Pickleballer Nickname is displayed
- [ ] Verify: DUPR is displayed (if entered)
- [ ] Verify: Experience Level is displayed

### Test 2: Resend Email

- [ ] Sign up with new email
- [ ] On "Almost done!" screen, click "Resend Confirmation Email"
- [ ] Verify: Success message appears
- [ ] Check email inbox
- [ ] Verify: New confirmation email received

### Test 3: Password Reset Flow

- [ ] Sign out of app
- [ ] Click "Forgot Password?"
- [ ] Enter email address
- [ ] Click "Send Reset Link"
- [ ] Check email inbox
- [ ] Verify: Email received
- [ ] Verify: Email has PickleRadar branding
- [ ] Verify: Email has "Reset Password" button
- [ ] Verify: Email has warning text
- [ ] Verify: Email has "Powered by Lopez Innovations LLC" footer
- [ ] Click "Reset Password" button
- [ ] Verify: App opens to reset password screen
- [ ] Enter new password
- [ ] Confirm new password
- [ ] Click "Reset Password"
- [ ] Verify: Success screen appears
- [ ] Verify: Screen shows welcome message with first name
- [ ] Verify: Automatically logged in
- [ ] Verify: Redirected to home screen
- [ ] Try signing in with new password
- [ ] Verify: Sign in works with new password

### Test 4: Edge Cases

- [ ] Test with invalid email format
- [ ] Test with weak password (< 6 characters)
- [ ] Test with mismatched passwords
- [ ] Test with DUPR < 1.0
- [ ] Test with DUPR > 7.0
- [ ] Test without accepting terms
- [ ] Test resend email multiple times
- [ ] Test clicking confirmation link twice

---

## 🔍 Verification (TO DO)

### Visual Verification

- [ ] All screens have PickleRadar logo
- [ ] All screens have "Powered by Lopez Innovations LLC" footer
- [ ] No screens say "continue building"
- [ ] All buttons are properly styled
- [ ] All text is readable and properly formatted
- [ ] Welcome messages show correct first name

### Functional Verification

- [ ] Email confirmation blocks app access
- [ ] Auto-login works after email confirmation
- [ ] Auto-login works after password reset
- [ ] Profile data is saved correctly
- [ ] DUPR validation works (1.0-7.0)
- [ ] Experience level is saved
- [ ] Terms acceptance is recorded

### Email Verification

- [ ] Emails are delivered promptly
- [ ] Emails don't go to spam
- [ ] Email links work correctly
- [ ] Email branding looks professional
- [ ] Email footer is present

---

## 📊 Database Verification (TO DO)

- [ ] Open Supabase Dashboard
- [ ] Navigate to **Table Editor** → **users**
- [ ] Find test user record
- [ ] Verify fields are populated:
  - [ ] id
  - [ ] email
  - [ ] first_name
  - [ ] last_name
  - [ ] pickleballer_nickname
  - [ ] dupr_rating (if entered)
  - [ ] experience_level
  - [ ] terms_accepted (should be true)
  - [ ] privacy_accepted (should be true)
  - [ ] accepted_at (should have timestamp)
  - [ ] accepted_version (should be "v1.0")

---

## 🐛 Troubleshooting (If Needed)

### If emails are not sending:

- [ ] Check SMTP configuration in Supabase
- [ ] Verify SendGrid API key is correct
- [ ] Check SendGrid dashboard for errors
- [ ] Verify sender email is verified
- [ ] Check Supabase logs: **Logs** → **Auth Logs**

### If links are not working:

- [ ] Verify redirect URLs are configured
- [ ] Check app scheme in app.json
- [ ] Test deep linking manually
- [ ] Check browser console for errors

### If auto-login is not working:

- [ ] Check app console logs
- [ ] Verify session is being established
- [ ] Check token is being passed in URL
- [ ] Review Supabase auth logs

### If profile data is missing:

- [ ] Check database table has correct columns
- [ ] Verify RLS policies allow inserts
- [ ] Check for database errors in logs
- [ ] Verify all fields are being passed to signUp function

---

## ✅ Final Checklist

- [ ] All Supabase configurations complete
- [ ] All tests passing
- [ ] All verifications complete
- [ ] No errors in console logs
- [ ] No errors in Supabase logs
- [ ] User experience is smooth
- [ ] Branding is consistent
- [ ] Documentation reviewed

---

## 🎉 Success!

When all items are checked:

✅ Email confirmation flow is working
✅ Auto-login is functioning
✅ Profile data is being saved
✅ Branding is consistent
✅ User experience is seamless

**Congratulations! Your PickleRadar email setup is complete! 🎾**

---

## 📚 Reference Documents

- `START_HERE.md` - Quick start guide
- `QUICK_REFERENCE_EMAIL_SETUP.md` - Quick reference
- `EMAIL_TEMPLATE_UPDATE_GUIDE.md` - Email template HTML
- `COMPLETE_EMAIL_SETUP_GUIDE.md` - Comprehensive guide
- `IMPLEMENTATION_COMPLETE.md` - Implementation details
- `USER_FLOW_DIAGRAM.md` - Visual flow diagrams

---

## 📝 Notes

Use this space to track any issues or customizations:

```
[Your notes here]
```

---

**Last Updated:** [Current Date]
**Status:** Ready for Configuration
**Estimated Time:** 30 minutes
