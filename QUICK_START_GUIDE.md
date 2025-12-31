
# Quick Start Guide - Six-Digit Code Authentication

## 🚀 Get Started in 5 Minutes

### Step 1: Create Database Table (2 minutes)

1. Open your Supabase project: https://app.supabase.com
2. Go to **SQL Editor**
3. Copy and paste the SQL from `CREATE_LOGIN_CODES_TABLE.sql`
4. Click **Run**
5. ✅ Verify success message

### Step 2: Set Up Resend (2 minutes)

1. Sign up at https://resend.com
2. Verify your email
3. Go to **API Keys** → **Create API Key**
4. Copy the API key
5. ✅ Save it somewhere safe

### Step 3: Configure Supabase (1 minute)

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref biczbxmaisdxpcbplddr

# Set Resend API key
supabase secrets set RESEND_API_KEY=your_api_key_here
```

### Step 4: Deploy Edge Functions (1 minute)

```bash
# Deploy both functions
supabase functions deploy send-login-code
supabase functions deploy verify-login-code
```

### Step 5: Test It! (2 minutes)

1. Build and run your app
2. Go to login screen
3. Tap **"Forgot Password?"**
4. Enter your email
5. Tap **"Send Code"**
6. Check your email
7. Enter the 6-digit code
8. ✅ You're logged in!

---

## 📋 Verification Checklist

After setup, verify everything works:

- [ ] Database table exists
- [ ] RLS policies active
- [ ] Edge Functions deployed
- [ ] Resend API key set
- [ ] Email received
- [ ] Code validates
- [ ] Login successful
- [ ] Session persists

---

## 🔧 Quick Troubleshooting

### Email Not Received?
```bash
# Check Edge Function logs
supabase functions logs send-login-code --tail
```

### Code Not Working?
```sql
-- Check database
SELECT * FROM login_codes 
WHERE email = 'your@email.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

### Need to Reset?
```sql
-- Delete old codes
DELETE FROM login_codes 
WHERE email = 'your@email.com';
```

---

## 📚 Full Documentation

For detailed information, see:

- **Setup Guide**: `SIX_DIGIT_CODE_SETUP_COMPLETE.md`
- **Deployment Checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Troubleshooting**: `TROUBLESHOOTING_SIX_DIGIT_CODE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY_SIX_DIGIT_CODE.md`

---

## 🎯 What You Get

✅ Passwordless login with 6-digit codes  
✅ 10-minute code expiration  
✅ 5-attempt brute-force protection  
✅ Professional email templates  
✅ "Powered by Lopez Innovations LLC" branding  
✅ Secure session management  
✅ No magic links or deep linking  
✅ Complete error handling  

---

## 💡 Pro Tips

1. **Test First**: Always test in development before production
2. **Monitor Emails**: Check Resend dashboard for delivery rates
3. **Clean Up**: Run cleanup function regularly
4. **Backup**: Keep your API keys secure
5. **Document**: Update docs as you make changes

---

## 🆘 Need Help?

1. Check the troubleshooting guide
2. Review Edge Function logs
3. Verify all configuration
4. Test each component separately
5. Contact support if needed

---

## ✨ You're All Set!

Your six-digit code authentication is now live. Users can:

1. Request a code via "Forgot Password?"
2. Receive it by email within seconds
3. Enter it in the app
4. Get logged in automatically
5. Stay logged in across sessions

**Welcome to secure, passwordless authentication! 🎉**
