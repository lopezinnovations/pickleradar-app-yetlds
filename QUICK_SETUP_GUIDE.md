
# Quick Setup Guide - Signup & Messaging Updates

This guide provides step-by-step instructions to complete the setup after code deployment.

## Prerequisites
- Code has been deployed to your app
- You have access to Supabase dashboard
- Database migration has been applied

## Step 1: Verify Database Migration ✅

The migration should already be applied. To verify:

1. Go to Supabase Dashboard > Database > Tables
2. Check that `message_requests` table exists
3. Verify it has these columns:
   - id (uuid)
   - sender_id (uuid)
   - recipient_id (uuid)
   - status (text)
   - created_at (timestamptz)
   - updated_at (timestamptz)

**Status:** ✅ Already applied

## Step 2: Configure Email Template 📧

### 2.1 Navigate to Email Templates
1. Open Supabase Dashboard
2. Go to **Authentication** → **Email Templates**
3. Select **Confirm signup** template

### 2.2 Update Subject Line
Replace with:
```
Confirm your email to activate PickleRadar
```

### 2.3 Update Email Body
Copy the HTML template from `EMAIL_TEMPLATE_CONFIGURATION.md` and paste it into the template editor.

**Important:** Keep the `{{ .ConfirmationURL }}` variable intact!

### 2.4 Save Changes
Click **Save** to apply the new template.

## Step 3: Configure Redirect URLs 🔗

### 3.1 Navigate to URL Configuration
1. In Supabase Dashboard
2. Go to **Authentication** → **URL Configuration**

### 3.2 Set Site URL
```
https://natively.dev
```

### 3.3 Add Redirect URLs
Add these URLs to the allowed list:
```
https://natively.dev/email-confirmed
https://natively.dev/*
natively://email-confirmed
natively://*
```

### 3.4 Save Changes
Click **Save** to apply the configuration.

## Step 4: Test Signup Flow 🧪

### 4.1 Create Test Account
1. Open the app
2. Navigate to Sign Up
3. Fill in all required fields:
   - Email
   - Password
   - First Name
   - Last Name
   - Pickleballer Nickname
   - Experience Level
   - DUPR Rating (optional)
4. Accept terms and privacy policy
5. Click **Sign Up**

### 4.2 Verify Confirmation Screen
You should see:
- "Almost done!" heading
- Message about checking email
- Resend button
- Access locked indicator

### 4.3 Check Email
1. Open your email inbox
2. Look for email with subject: "Confirm your email to activate PickleRadar"
3. Verify the email matches the new template
4. Check spam folder if not in inbox

### 4.4 Confirm Email
1. Click the confirmation link in the email
2. You should be redirected to the app
3. Success screen should show:
   - "Your email has been successfully confirmed."
   - "You now have full functionality and access to PickleRadar."
   - "Welcome to the courts! 🎾"
4. After 2 seconds, you should be redirected to the home screen

## Step 5: Test Messaging 💬

### 5.1 Create Second Test Account
Follow Step 4.1 to create another test account.

### 5.2 Test Non-Friend Messaging
1. Sign in with first account
2. Find the second user (via search or friends page)
3. Navigate to their profile
4. Click **Send Message** (should be available even though not friends)
5. Type and send a message
6. Verify "Message request sent" banner appears

### 5.3 Test Message Request Acceptance
1. Sign out and sign in with second account
2. Check notifications for message request
3. Navigate to messages
4. Open conversation with first user
5. Reply to the message
6. Verify message request is automatically accepted

### 5.4 Test Friend Messaging
1. Send friend request between the two accounts
2. Accept the friend request
3. Send messages
4. Verify no message request is created (direct messaging)

## Step 6: Verify All Features ✅

### Signup Flow Checklist
- [ ] All profile fields collected during signup
- [ ] Validation works for all fields
- [ ] Redirects to confirm-email screen
- [ ] Cannot access app without confirmation

### Email Confirmation Checklist
- [ ] Confirmation email received
- [ ] Email template matches specification
- [ ] Clicking link authenticates user
- [ ] Success message displayed
- [ ] Automatic redirect to home screen

### Messaging Checklist
- [ ] Can message non-friends
- [ ] Message request created automatically
- [ ] Recipient receives notification
- [ ] Reply accepts request
- [ ] Friends can message directly
- [ ] Message request banner shows correctly

## Troubleshooting

### Email Not Received
**Problem:** Confirmation email not arriving

**Solutions:**
1. Check spam/junk folder
2. Verify SMTP is configured in Supabase
3. Use "Resend Confirmation Email" button
4. Check Supabase logs for email errors

### Redirect Not Working
**Problem:** Email confirmation link doesn't redirect to app

**Solutions:**
1. Verify redirect URLs are configured correctly
2. Check that Site URL matches your domain
3. Test deep linking configuration
4. Clear browser cache and try again

### Message Request Not Created
**Problem:** Sending message to non-friend doesn't create request

**Solutions:**
1. Check database connection
2. Verify message_requests table exists
3. Check RLS policies are enabled
4. Look for errors in browser console

### Cannot Send Messages
**Problem:** Send button disabled or error when sending

**Solutions:**
1. Verify user is authenticated
2. Check recipient user exists
3. Verify database permissions
4. Check network connection

## Rollback Instructions

If you need to rollback the changes:

### Rollback Database
```sql
-- Remove message request notification type
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type = ANY (ARRAY[
    'friend_request'::text, 
    'friend_accepted'::text, 
    'friend_checkin'::text, 
    'friend_checkout'::text, 
    'checkin_confirmation'::text, 
    'auto_checkout'::text
  ]));

-- Drop message_requests table
DROP TABLE IF EXISTS message_requests;
```

### Rollback Email Template
1. Go to Supabase Dashboard > Authentication > Email Templates
2. Select "Confirm signup" template
3. Restore previous template content
4. Save changes

### Rollback Code
1. Revert to previous commit
2. Redeploy application

## Support

For additional help:
- Review `SIGNUP_AND_MESSAGING_UPDATE.md` for detailed implementation
- Check `EMAIL_TEMPLATE_CONFIGURATION.md` for email template details
- Review code comments in updated files
- Check Supabase documentation for authentication and database features

## Next Steps

After successful setup:
1. Monitor user signups and email confirmations
2. Track message request acceptance rates
3. Gather user feedback on new messaging flow
4. Consider implementing suggested future enhancements
5. Update user documentation/help guides

---

**Setup Complete!** 🎉

Your app now has:
- ✅ Complete profile collection during signup
- ✅ Clear email confirmation flow
- ✅ Messaging without friendship requirement
- ✅ Message request system
- ✅ Improved user experience
