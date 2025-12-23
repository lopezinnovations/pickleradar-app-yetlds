
export interface Court {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  activityLevel: 'low' | 'medium' | 'high';
  currentPlayers: number;
  averageSkillLevel: number;
  friendsPlayingCount: number;
  distance?: number; // Distance in miles from user's location
  description?: string; // Google Maps description
  openTime?: string; // Court open time
  closeTime?: string; // Court close time
  googlePlaceId?: string; // Google Place ID
  averageDupr?: number; // Average DUPR of checked-in players
}

export interface User {
  id: string;
  email: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  privacyOptIn: boolean;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  latitude?: number;
  longitude?: number;
  zipCode?: string;
  duprRating?: number;
  locationPermissionRequested?: boolean;
}

export interface CheckIn {
  id: string;
  userId: string;
  courtId: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  timestamp: string;
  expiresAt: string;
  durationMinutes: number;
  notificationId?: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface FriendWithDetails extends Friend {
  friendEmail: string;
  friendSkillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  currentCourtId?: string;
  currentCourtName?: string;
  remainingTime?: {
    hours: number;
    minutes: number;
    totalMinutes: number;
  };
}

export type SortOption = 'active-high' | 'active-low' | 'skill-high' | 'skill-low' | 'distance';

export interface FilterOptions {
  maxDistance?: number; // in miles
  friendsOnly?: boolean;
  skillLevels?: Array<'Beginner' | 'Intermediate' | 'Advanced'>; // Changed from min/max to array of selected levels
}
