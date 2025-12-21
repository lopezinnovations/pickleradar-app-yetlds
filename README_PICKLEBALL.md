
# PickleRadar 🏓

A React Native mobile app built with Expo 54 that helps pickleball players find active courts and connect with friends.

## Features

### Core Features
- 🗺️ **Map-based Court Discovery** - Browse pickleball courts with real-time activity levels
- 📍 **Check-in System** - Let others know you're playing with skill level selection
- 👥 **Social Features** - Connect with friends and see when they're playing
- 🔔 **Smart Notifications** - Get notified when friends check in (coming soon)
- 🔒 **Privacy First** - Opt-in visibility and location sharing

### Activity Levels
- **High Activity** - 6+ players currently checked in
- **Medium Activity** - 3-5 players currently checked in  
- **Low Activity** - 1-2 players currently checked in

### Skill Levels
- Beginner
- Intermediate
- Advanced

## Tech Stack

- **Framework**: React Native with Expo 54
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (authentication, database, real-time)
- **Language**: TypeScript
- **Styling**: React Native StyleSheet

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- Supabase account (for backend features)

### Installation

1. The app is ready to run in Natively
2. To enable full functionality, set up Supabase:
   - Press the Supabase button in Natively
   - Connect to a Supabase project
   - Follow the setup guide in `SUPABASE_SETUP.md`

### Running the App

The app will start on the welcome screen. You can:
- Browse courts without authentication (mock data)
- Sign up/sign in to use check-in features
- Manage your profile and privacy settings

## Project Structure

```
app/
  ├── (tabs)/           # Main tab navigation
  │   ├── (home)/       # Home screen with court map
  │   ├── friends.tsx   # Friends list
  │   └── profile.tsx   # User profile & settings
  ├── welcome.tsx       # Welcome/onboarding screen
  ├── auth.tsx          # Authentication screen
  └── _layout.tsx       # Root layout
components/           # Reusable components
hooks/               # Custom React hooks
  ├── useAuth.ts      # Authentication hook
  ├── useCourts.ts    # Courts data hook
  └── useCheckIn.ts   # Check-in functionality
types/               # TypeScript type definitions
utils/               # Utility functions
styles/              # Common styles and colors
```

## Color Scheme

- **Background**: #f9f9f9 (Light gray)
- **Text**: #212121 (Dark gray)
- **Primary**: #2e7d32 (Dark green - pickleball court)
- **Secondary**: #c6ff00 (Bright yellow-green - pickleball ball)
- **Accent**: #ffb300 (Amber - highlights)
- **Card**: #ffffff (White)
- **Highlight**: #b9f6ca (Light green)

## Important Notes

### Maps Limitation
⚠️ `react-native-maps` is not currently supported in Natively. The app displays a placeholder where the map would be. Courts are listed below for browsing and selection.

### Supabase Setup
🔧 Backend features require Supabase configuration. See `SUPABASE_SETUP.md` for detailed setup instructions.

## Future Enhancements

- [ ] Push notifications for friend check-ins
- [ ] Location-based court suggestions
- [ ] Court activity notifications
- [ ] Subscription features
- [ ] Advanced friend features
- [ ] Court reviews and ratings
- [ ] Game scheduling
- [ ] Tournament organization

## Privacy & Data

- Location permission is optional
- No continuous GPS tracking
- Friend visibility is opt-in only
- Aggregated data only for heat maps
- Check-ins expire after 3 hours

## License

This project is built for demonstration purposes.
