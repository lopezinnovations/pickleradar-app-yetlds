
# Six-Digit Code Authentication - Troubleshooting Guide

## Common Issues and Solutions

### 1. Email Not Received

#### Symptoms
- User requests code but doesn't receive email
- No error message shown in app

#### Possible Causes & Solutions

**A. Resend API Key Not Set**
```bash
# Check if secret exists
supabase secrets list

# Set the secret
supabase secrets set RESEND_API_KEY=your_key_here
```

**B. Domain Not Verified in Resend**
1. Go to Resend dashboard
2. Navigate to Domains
3. Verify your sending domain
4. Update DNS records as instructed

**C. Email in Spam Folder**
- Check user's spam/junk folder
- Add SPF, DKIM, and DMARC records
- Use a verified domain

**D. Resend API Error**
```bash
# Check Edge Function logs
supabase functions logs send-login-code

# Look for Resend API errors
```

**E. Wrong Email Configuration**
- Verify "from" address in Edge Function
- Ensure domain matches verified domain
- Check email format is correct

---

### 2. Code Validation Fails

#### Symptoms
- User enters correct code but it's rejected
- Error: "Invalid or expired code"

#### Possible Causes & Solutions

**A. Code Expired**
- Codes expire after 10 minutes
- User needs to request a new code
- Check `expires_at` in database:
```sql
SELECT * FROM login_codes 
WHERE email = 'user@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

**B. Code Already Used**
- Codes are single-use only
- Check `used` field in database
- Request a new code

**C. Database Table Missing**
```sql
-- Verify table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'login_codes'
);
```

**D. RLS Policy Issues**
```sql
-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'login_codes';

-- Ensure service role policy exists
```

**E. Wrong Code Entered**
- User may have mistyped the code
- Check remaining attempts
- Code is case-sensitive (though should be numbers only)

---

### 3. Too Many Attempts

#### Symptoms
- Error: "You have exceeded the maximum number of attempts"
- User locked out after 5 tries

#### Solutions

**A. Request New Code**
- User should request a new code
- Old code will be deleted automatically
- New code will have fresh attempt counter

**B. Manual Reset (Admin)**
```sql
-- Delete failed code
DELETE FROM login_codes 
WHERE email = 'user@example.com' 
AND used = false;
```

**C. Adjust Max Attempts (If Needed)**
```sql
-- Update max_attempts for a specific code
UPDATE login_codes 
SET max_attempts = 10 
WHERE email = 'user@example.com' 
AND used = false;
```

---

### 4. User Not Found

#### Symptoms
- Error: "No account found with this email address"
- User claims they have an account

#### Solutions

**A. Verify User Exists**
```sql
-- Check auth.users table
SELECT email, created_at 
FROM auth.users 
WHERE email = 'user@example.com';
```

**B. User Needs to Sign Up**
- User may not have completed registration
- Direct them to sign up screen

**C. Email Mismatch**
- User may be using different email
- Check for typos
- Verify email case sensitivity

---

### 5. Session Not Persisting

#### Symptoms
- User logs in successfully but session doesn't persist
- User logged out after app restart

#### Solutions

**A. Check AsyncStorage**
```javascript
// In app code, verify AsyncStorage is working
import AsyncStorage from '@react-native-async-storage/async-storage';

// Test storage
await AsyncStorage.setItem('test', 'value');
const value = await AsyncStorage.getItem('test');
console.log('AsyncStorage working:', value === 'value');
```

**B. Verify Supabase Client Configuration**
```typescript
// Ensure auth config is correct
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

**C. Check Token Expiration**
```javascript
// Check session validity
const { data: { session } } = await supabase.auth.getSession();
console.log('Session expires at:', session?.expires_at);
```

---

### 6. Edge Function Errors

#### Symptoms
- Generic error messages
- Function timeouts
- 500 Internal Server Error

#### Solutions

**A. Check Function Logs**
```bash
# View recent logs
supabase functions logs send-login-code --tail

# View specific time range
supabase functions logs verify-login-code --since 1h
```

**B. Test Function Directly**
```bash
# Test send-login-code
curl -X POST \
  https://biczbxmaisdxpcbplddr.supabase.co/functions/v1/send-login-code \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**C. Redeploy Functions**
```bash
# Redeploy both functions
supabase functions deploy send-login-code
supabase functions deploy verify-login-code
```

**D. Check Environment Variables**
```bash
# List all secrets
supabase secrets list

# Verify required secrets exist
# - SUPABASE_URL (automatic)
# - SUPABASE_SERVICE_ROLE_KEY (automatic)
# - RESEND_API_KEY (manual)
```

---

### 7. Database Performance Issues

#### Symptoms
- Slow code validation
- Timeouts
- Database errors

#### Solutions

**A. Check Table Size**
```sql
-- Check number of records
SELECT COUNT(*) FROM login_codes;

-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('login_codes'));
```

**B. Clean Up Old Codes**
```sql
-- Run cleanup function
SELECT clean_expired_login_codes();

-- Or manual cleanup
DELETE FROM login_codes 
WHERE expires_at < NOW() - INTERVAL '1 hour';
```

**C. Verify Indexes**
```sql
-- Check indexes exist
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'login_codes';
```

**D. Set Up Automated Cleanup**
- Create a cron job to run cleanup function
- Schedule it to run every hour
- Monitor database size

---

### 8. Email Template Issues

#### Symptoms
- Email looks broken
- Code not visible
- Formatting issues

#### Solutions

**A. Test Email Rendering**
- Send test email to yourself
- Check on multiple email clients
- Verify HTML renders correctly

**B. Update Email Template**
- Edit `send-login-code/index.ts`
- Update HTML template
- Redeploy function

**C. Check Email Client Compatibility**
- Some clients block certain CSS
- Use inline styles
- Test on Gmail, Outlook, Apple Mail

---

## Debugging Checklist

When troubleshooting, go through this checklist:

1. **Database**
   - [ ] Table exists
   - [ ] RLS policies correct
   - [ ] Indexes present
   - [ ] No orphaned codes

2. **Edge Functions**
   - [ ] Functions deployed
   - [ ] Logs show no errors
   - [ ] Environment variables set
   - [ ] CORS headers correct

3. **Email Service**
   - [ ] Resend API key valid
   - [ ] Domain verified
   - [ ] DNS records correct
   - [ ] No rate limiting

4. **App**
   - [ ] Supabase client configured
   - [ ] AsyncStorage working
   - [ ] Network connectivity
   - [ ] Error handling working

5. **User Flow**
   - [ ] Email validation working
   - [ ] Code input accepting numbers
   - [ ] Success messages showing
   - [ ] Redirects working

---

## Getting Help

If you're still stuck:

1. **Check Logs**
   - Edge Function logs
   - Database logs
   - App console logs

2. **Verify Configuration**
   - All environment variables
   - Database schema
   - RLS policies

3. **Test Components**
   - Test each part separately
   - Isolate the issue
   - Use curl/Postman for API testing

4. **Review Documentation**
   - Supabase docs
   - Resend docs
   - This troubleshooting guide

5. **Contact Support**
   - Supabase support
   - Resend support
   - Community forums

---

## Prevention

To avoid issues:

- Monitor email delivery rates
- Set up automated cleanup
- Log all errors properly
- Test thoroughly before deployment
- Keep documentation updated
- Monitor database size
- Review logs regularly
- Have rollback plan ready

---

## Quick Reference

### Useful SQL Queries

```sql
-- View recent codes
SELECT * FROM login_codes 
ORDER BY created_at DESC 
LIMIT 10;

-- Check expired codes
SELECT COUNT(*) FROM login_codes 
WHERE expires_at < NOW();

-- View codes for specific email
SELECT * FROM login_codes 
WHERE email = 'user@example.com' 
ORDER BY created_at DESC;

-- Clean up all expired codes
DELETE FROM login_codes 
WHERE expires_at < NOW();

-- Reset attempts for a code
UPDATE login_codes 
SET attempts = 0 
WHERE email = 'user@example.com' 
AND used = false;
```

### Useful CLI Commands

```bash
# View function logs
supabase functions logs send-login-code --tail

# List secrets
supabase secrets list

# Deploy function
supabase functions deploy send-login-code

# Test function locally
supabase functions serve send-login-code
```

---

## Emergency Procedures

### If Email Service Fails

1. Check Resend status page
2. Verify API key is valid
3. Check rate limits
4. Switch to backup email service if available
5. Notify users of the issue

### If Database Issues

1. Check Supabase status
2. Verify connection
3. Check for locks
4. Run cleanup if needed
5. Scale up if necessary

### If Complete Failure

1. Check all services are up
2. Review recent changes
3. Check logs for errors
4. Rollback if needed
5. Communicate with users
