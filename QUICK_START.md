
# PickleRadar - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Run the App
The app is ready to run! You can browse courts and explore the UI immediately with mock data.

### Step 2: Enable Supabase (Optional but Recommended)
To unlock all features:

1. **Press the Supabase button** in Natively
2. **Connect to a project** (create one at [supabase.com](https://supabase.com) if needed)
3. **Run the SQL** from `SUPABASE_SETUP.md` in your Supabase SQL Editor

### Step 3: Test the Features
- Browse courts on the home screen
- Sign up for an account
- Check in at a court
- Update your profile settings

## 📱 What You Can Do Right Now

### Without Supabase
- ✅ View the welcome screen
- ✅ Browse mock court data
- ✅ Explore the UI and navigation
- ✅ See how check-ins work (UI only)

### With Supabase
- ✅ Create an account
- ✅ Sign in and out
- ✅ Check in at courts
- ✅ See real-time player counts
- ✅ Update your skill level
- ✅ Manage privacy settings
- ✅ Add friends (coming soon)

## 🎯 Key Features

### Home Screen
- View all pickleball courts
- See activity levels (Low, Medium, High)
- Check current player counts
- Tap a court to see details

### Court Detail
- View court information
- Check in with "I'm Here" button
- Select your skill level
- Check out when you leave

### Profile
- Set your skill level
- Toggle privacy settings
- Enable/disable notifications
- Manage location preferences

### Friends (Coming Soon)
- Add friends by email
- See when friends are playing
- Get notified of friend check-ins

## 🗺️ Important Note About Maps

**react-native-maps is not currently supported in Natively.**

The app displays a placeholder where the map would be. Courts are listed below for easy browsing. When map support is added, the integration is ready to go!

## 🔧 Supabase Setup (Detailed)

If you want to enable backend features, follow these steps:

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Wait for it to initialize

### 2. Run Database Setup
- Open SQL Editor in Supabase
- Copy SQL from `SUPABASE_SETUP.md`
- Run each section (Users, Courts, Check-ins, Friends)
- Run the seed data for sample courts

### 3. Connect in Natively
- Press Supabase button
- Enter your project URL and anon key
- Test the connection

## 📊 Sample Data

The app includes 5 sample courts:
1. Central Park Pickleball Courts (New York)
2. Riverside Recreation Center (Brooklyn)
3. Sunset Community Courts (Queens)
4. Harbor View Sports Complex (Staten Island)
5. Bronx Community Center (Bronx)

## 🎨 Customization

### Change Colors
Edit `styles/commonStyles.ts`:
```typescript
export const colors = {
  background: '#f9f9f9',
  text: '#212121',
  primary: '#2e7d32',  // Your brand color
  // ... more colors
};
```

### Add More Courts
Run SQL in Supabase:
```sql
INSERT INTO courts (name, address, latitude, longitude) VALUES
  ('Your Court Name', 'Address', 40.7128, -74.0060);
```

### Adjust Check-in Duration
Edit `hooks/useCheckIn.ts`:
```typescript
// Change from 3 hours to your preferred duration
expiresAt.setHours(expiresAt.getHours() + 3);
```

## 🐛 Troubleshooting

### "Supabase Required" Message
- Make sure you've pressed the Supabase button in Natively
- Verify your project URL and anon key are correct
- Check that environment variables are set

### Can't Sign In
- Verify you've run the database setup SQL
- Check that the users table exists
- Try signing up first if you haven't

### Courts Not Showing
- Check that you've run the seed data SQL
- Verify the courts table exists
- Try refreshing the court list

### Check-in Not Working
- Make sure you're signed in
- Verify the check_ins table exists
- Check that RLS policies are set up

## 📚 Additional Resources

- **SUPABASE_SETUP.md** - Complete database setup guide
- **README_PICKLEBALL.md** - Full app documentation
- **IMPLEMENTATION_SUMMARY.md** - Technical details

## 💬 Need Help?

The app is fully functional and ready to use! If you encounter any issues:

1. Check that Supabase is properly configured
2. Verify all database tables are created
3. Make sure RLS policies are enabled
4. Review the console logs for errors

## 🎉 You're Ready!

Start exploring PickleRadar and find your next pickleball game!

---

**Happy Playing! 🏓**
