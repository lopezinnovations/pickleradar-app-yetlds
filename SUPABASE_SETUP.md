
# PickleRadar - Supabase Setup Guide

## Overview
PickleRadar uses Supabase for backend functionality including user authentication, court data storage, check-ins, and friend management.

## Step 1: Enable Supabase in Natively

1. Press the **Supabase** button in Natively
2. Connect to an existing Supabase project or create a new one at [supabase.com](https://supabase.com)
3. Once connected, your environment variables will be automatically configured

## Step 2: Database Schema

Run the following SQL in your Supabase SQL Editor to create the necessary tables:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  privacy_opt_in BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT false,
  location_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Courts Table
```sql
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Anyone can read courts
CREATE POLICY "Anyone can read courts" ON courts
  FOR SELECT USING (true);
```

### Check-ins Table
```sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(user_id, court_id)
);

-- Enable Row Level Security
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Users can read all check-ins
CREATE POLICY "Anyone can read check-ins" ON check_ins
  FOR SELECT USING (true);

-- Users can insert their own check-ins
CREATE POLICY "Users can insert own check-ins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own check-ins
CREATE POLICY "Users can delete own check-ins" ON check_ins
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX check_ins_court_id_idx ON check_ins(court_id);
CREATE INDEX check_ins_expires_at_idx ON check_ins(expires_at);
```

### Friends Table
```sql
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Enable Row Level Security
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Users can read their own friend relationships
CREATE POLICY "Users can read own friends" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can insert friend requests
CREATE POLICY "Users can insert friend requests" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update friend requests they received
CREATE POLICY "Users can update received requests" ON friends
  FOR UPDATE USING (auth.uid() = friend_id);

-- Users can delete their own friend relationships
CREATE POLICY "Users can delete own friends" ON friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);
```

## Step 3: Seed Sample Court Data

```sql
INSERT INTO courts (name, address, latitude, longitude) VALUES
  ('Central Park Pickleball Courts', '123 Park Ave, New York, NY', 40.7829, -73.9654),
  ('Riverside Recreation Center', '456 River Rd, Brooklyn, NY', 40.7128, -74.0060),
  ('Sunset Community Courts', '789 Sunset Blvd, Queens, NY', 40.7282, -73.7949),
  ('Harbor View Sports Complex', '321 Harbor Dr, Staten Island, NY', 40.5795, -74.1502),
  ('Bronx Community Center', '654 Grand Concourse, Bronx, NY', 40.8448, -73.8648);
```

## Step 4: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Configure email settings:
   - Enable email confirmations (recommended for production)
   - Or disable for testing (faster development)
3. Set your site URL to your app's URL

## Step 5: Environment Variables

Natively will automatically configure these when you connect Supabase:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Features Enabled

Once Supabase is configured, the following features will work:

- ✅ User authentication (sign up, sign in, sign out)
- ✅ User profiles with skill levels
- ✅ Court listings with real-time activity
- ✅ Check-in/check-out functionality
- ✅ Friend management (coming soon)
- ✅ Privacy settings
- ✅ Notification preferences

## Testing Without Supabase

The app includes mock data for courts, so you can test the UI without Supabase. However, authentication and check-in features require Supabase to be configured.

## Future Enhancements

- Push notifications when friends check in
- Location-based court suggestions
- Court activity notifications
- Subscription features
- Advanced friend features
