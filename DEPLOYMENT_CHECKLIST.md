
# Six-Digit Code Authentication - Deployment Checklist

## Pre-Deployment

- [ ] Review all code changes
- [ ] Understand the new authentication flow
- [ ] Have Supabase project access ready
- [ ] Have Resend account ready (or create one)

## Database Setup

- [ ] Open Supabase SQL Editor
- [ ] Copy SQL from `CREATE_LOGIN_CODES_TABLE.sql`
- [ ] Run the SQL script
- [ ] Verify table creation with verification queries
- [ ] Confirm RLS policies are active
- [ ] Check indexes are created

## Edge Functions Deployment

### Prerequisites
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Login to Supabase: `supabase login`
- [ ] Link to your project: `supabase link --project-ref biczbxmaisdxpcbplddr`

### Deploy Functions
- [ ] Deploy send-login-code:
  ```bash
  supabase functions deploy send-login-code
  ```
- [ ] Deploy verify-login-code:
  ```bash
  supabase functions deploy verify-login-code
  ```
- [ ] Verify both functions appear in Supabase dashboard

## Email Service Configuration

### Resend Setup
- [ ] Sign up at https://resend.com
- [ ] Verify your email address
- [ ] Add and verify your domain (e.g., pickleradar.com)
- [ ] Generate API key
- [ ] Copy API key

### Configure Supabase Secrets
- [ ] Set Resend API key:
  ```bash
  supabase secrets set RESEND_API_KEY=your_api_key_here
  ```
- [ ] Verify secret is set:
  ```bash
  supabase secrets list
  ```

## Testing

### Test Database
- [ ] Check `login_codes` table exists
- [ ] Verify RLS policies work
- [ ] Test cleanup function manually

### Test Edge Functions
- [ ] Test send-login-code with curl or Postman
- [ ] Verify email is received
- [ ] Check code is stored in database
- [ ] Test verify-login-code with valid code
- [ ] Test verify-login-code with invalid code
- [ ] Test expiration (wait 10+ minutes)
- [ ] Test max attempts (try 6 times with wrong code)

### Test App Flow
- [ ] Build app for testing
- [ ] Navigate to login screen
- [ ] Tap "Forgot Password?"
- [ ] Enter email address
- [ ] Tap "Send Code"
- [ ] Check email inbox
- [ ] Enter six-digit code
- [ ] Verify successful login
- [ ] Check redirect to home screen
- [ ] Verify session persists after app restart

### Test Error Cases
- [ ] Invalid email format
- [ ] Email not registered
- [ ] Wrong code entry
- [ ] Expired code (10+ minutes)
- [ ] Max attempts exceeded
- [ ] Network errors

## Monitoring Setup

- [ ] Set up Resend email monitoring
- [ ] Configure Supabase Edge Function logging
- [ ] Set up alerts for failed emails
- [ ] Create dashboard for monitoring

## Optional: Automated Cleanup

- [ ] Set up cron job for expired codes cleanup
- [ ] Test cron job execution
- [ ] Monitor database size

## Documentation

- [ ] Update user documentation
- [ ] Create internal troubleshooting guide
- [ ] Document email templates
- [ ] Document security measures

## Production Deployment

- [ ] All tests passing
- [ ] Email delivery confirmed
- [ ] Error handling verified
- [ ] Session persistence working
- [ ] Build production app
- [ ] Deploy to app stores (if applicable)
- [ ] Monitor initial user feedback

## Post-Deployment

- [ ] Monitor email delivery rates
- [ ] Check Edge Function logs
- [ ] Monitor database growth
- [ ] Collect user feedback
- [ ] Address any issues promptly

## Rollback Plan

If issues occur:
- [ ] Document the issue
- [ ] Check Edge Function logs
- [ ] Verify database state
- [ ] Check email service status
- [ ] Revert to previous version if needed
- [ ] Communicate with users

## Success Criteria

- ✅ Users can request login codes
- ✅ Emails are delivered within 30 seconds
- ✅ Codes work correctly
- ✅ Expired codes are rejected
- ✅ Max attempts protection works
- ✅ Session persists after login
- ✅ No security vulnerabilities
- ✅ Error messages are clear
- ✅ User experience is smooth

## Support Resources

- Supabase Dashboard: https://app.supabase.com
- Resend Dashboard: https://resend.com/dashboard
- Edge Function Logs: Supabase → Functions → Logs
- Database Logs: Supabase → Database → Logs

## Notes

- Keep API keys secure
- Monitor email delivery rates
- Clean up expired codes regularly
- Update documentation as needed
- Collect user feedback continuously
