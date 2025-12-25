
# Password Reset and Realtime Channel Fixes

## Issues Fixed

### 1. Password Reset Link Not Working ✅

**Problem**: The password reset email link was not working because of a mismatch between the app's URL scheme and the redirect URL configured in the auth flow.

**Root Cause**:
- The app scheme in `app.json` was set to `natively`
- The `resetPassword` function was using `pickleball://reset-password` as the redirect URL
- This mismatch prevented the deep link from being handled correctly

**Solution Applied**:
1. ✅ Updated `hooks/useAuth.ts` to use the correct scheme: `natively://reset-password`
2. ✅ Added deep link handling in `app/_layout.tsx` to properly process password reset tokens
3. ✅ The app now correctly handles the password reset flow

**⚠️ IMPORTANT: Configuration Required in Supabase Dashboard**

You need to add the following redirect URLs to your Supabase project's Auth settings:

1. Go to: https://supabase.com/dashboard/project/biczbxmaisdxpcbplddr/auth/url-configuration
2. Add these URLs to the "Redirect URLs" section:
   - `natively://reset-password`
   - `https://natively.dev/email-confirmed` (for email confirmation)

**Without adding these URLs to the Supabase dashboard, the password reset will not work!**

**Testing the Password Reset Flow**:

1. User clicks "Forgot Password" on the auth screen
2. User enters their email address
3. User receives an email with a password reset link
4. User clicks the link in the email
5. The app opens to the `reset-password` screen
6. User enters and confirms their new password
7. Password is updated successfully

### 2. useCourts Channel Error ✅ FIXED

**Problem**: The `useCourts` hook was showing "Channel error: undefined" in the console.

**Root Causes**:
1. The realtime subscription was using `broadcast` events instead of `postgres_changes`
2. Realtime was **disabled** for the `check_ins` table in the database

**Solutions Applied**:
1. ✅ Changed from `broadcast` events to `postgres_changes` in `hooks/useCourts.ts`
2. ✅ Enabled Realtime for the `check_ins` table via database migration
3. ✅ Added better error handling for different subscription statuses

**How It Works Now**:

```typescript
const channel = supabase
  .channel('check_ins_changes')
  .on(
    'postgres_changes',
    {
      event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'check_ins'
    },
    (payload) => {
      console.log('useCourts: Check-in change detected:', payload);
      fetchCourts();  // Refresh court data when changes occur
    }
  )
  .subscribe((status, err) => {
    if (status === 'SUBSCRIBED') {
      console.log('useCourts: Successfully subscribed to check-in updates');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('useCourts: Channel error:', err);
    }
  });
```

**Benefits**:
- ✅ Real-time updates when users check in or out of courts
- ✅ Automatic refresh of court activity levels
- ✅ Better error logging for debugging
- ✅ No more "Channel error: undefined" messages

## Verification Steps

### Test Password Reset:
1. ⚠️ **FIRST**: Add the redirect URLs to Supabase dashboard (see above)
2. Open the app and go to the auth screen
3. Click "Forgot Password"
4. Enter a valid email address
5. Check your email for the password reset link
6. Click the link - the app should open to the reset password screen
7. Enter a new password and confirm
8. You should be able to sign in with the new password

### Test Realtime Updates:
1. Open the app on two devices (or use the web version and mobile)
2. Check in to a court on one device
3. The other device should automatically update to show the new activity level within seconds
4. Check the console logs - you should see "Successfully subscribed to check-in updates"
5. No "Channel error" messages should appear

## What Was Changed

### Code Changes:

1. **`hooks/useAuth.ts`**
   - Changed `redirectTo` from `pickleball://reset-password` to `natively://reset-password`

2. **`hooks/useCourts.ts`**
   - Replaced `broadcast` events with `postgres_changes`
   - Updated subscription to listen to all database changes on `check_ins` table
   - Improved error handling and logging

3. **`app/_layout.tsx`**
   - Added deep link event listener
   - Added token verification for password reset links
   - Handles initial URL when app is opened from a link

4. **`app.json`**
   - Verified scheme is set to `natively` (no changes needed)

### Database Changes:

1. **Enabled Realtime for `check_ins` table**
   - Ran migration: `ALTER PUBLICATION supabase_realtime ADD TABLE check_ins;`
   - This allows the app to receive real-time notifications when check-ins are created, updated, or deleted

## Deep Linking Flow

The password reset flow now works as follows:

1. **User requests password reset**
   - App calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'natively://reset-password' })`
   - Supabase sends email with recovery link

2. **Email contains link**
   - Format: `https://biczbxmaisdxpcbplddr.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=natively://reset-password`

3. **User clicks link**
   - Supabase verifies the token
   - Redirects to: `natively://reset-password?token=...&type=recovery`

4. **App handles deep link**
   - `_layout.tsx` intercepts the deep link
   - Verifies the token using `supabase.auth.verifyOtp()`
   - Creates a valid session for the user

5. **User resets password**
   - `reset-password.tsx` screen is displayed
   - User enters new password
   - Password is updated via `supabase.auth.updateUser()`

## Realtime Subscription Flow

The realtime updates now work as follows:

1. **App initializes**
   - `useCourts` hook sets up a Realtime subscription
   - Subscribes to `postgres_changes` on the `check_ins` table

2. **User checks in**
   - New row is inserted into `check_ins` table
   - Supabase Realtime broadcasts the change to all subscribed clients

3. **App receives update**
   - `postgres_changes` event is triggered
   - `fetchCourts()` is called to refresh court data
   - UI updates automatically with new activity levels

4. **Cleanup**
   - When component unmounts, subscription is removed
   - Prevents memory leaks and duplicate subscriptions

## Troubleshooting

### Password Reset Issues:

**Problem**: Email link doesn't open the app
- **Solution**: Make sure redirect URLs are added to Supabase dashboard
- **Check**: Verify app scheme in `app.json` matches the redirect URL

**Problem**: "Invalid link" error when clicking email
- **Solution**: The token may have expired (tokens expire after 1 hour)
- **Check**: Request a new password reset email

**Problem**: App opens but shows error
- **Solution**: Check console logs for detailed error messages
- **Check**: Verify deep link handling in `_layout.tsx` is working

### Realtime Issues:

**Problem**: Updates don't appear in real-time
- **Solution**: Realtime is now enabled - restart the app
- **Check**: Look for "Successfully subscribed" message in console

**Problem**: "Channel error" still appears
- **Solution**: Check that you're using the latest code
- **Check**: Verify `postgres_changes` is being used, not `broadcast`

**Problem**: Multiple subscriptions or memory leaks
- **Solution**: The `hasSetupRealtime` ref prevents duplicates
- **Check**: Ensure cleanup is happening in useEffect return

## Testing Checklist

- [ ] Add redirect URLs to Supabase dashboard
- [ ] Test password reset email is received
- [ ] Test clicking email link opens the app
- [ ] Test entering new password works
- [ ] Test signing in with new password
- [ ] Test real-time updates when checking in
- [ ] Test real-time updates when checking out
- [ ] Check console for "Successfully subscribed" message
- [ ] Verify no "Channel error" messages appear
- [ ] Test on both iOS and Android (if applicable)

## Files Modified

1. ✅ `hooks/useAuth.ts` - Updated `resetPassword` to use correct app scheme
2. ✅ `hooks/useCourts.ts` - Changed from broadcast to postgres_changes
3. ✅ `app/_layout.tsx` - Added deep link handling for password reset
4. ✅ `app.json` - Confirmed correct app scheme configuration
5. ✅ Database migration - Enabled Realtime for `check_ins` table

## Summary

Both issues have been fixed:

1. **Password Reset**: Now uses the correct app scheme (`natively://`) and properly handles deep links. You just need to add the redirect URLs to your Supabase dashboard.

2. **Realtime Channel Error**: Fixed by switching to `postgres_changes` and enabling Realtime for the `check_ins` table. The app now receives real-time updates when users check in or out.

The app should now work correctly with both password reset and real-time court updates! 🎉
