
export interface Court {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  activityLevel: 'low' | 'medium' | 'high';
  currentPlayers: number;
  averageSkillLevel: number; // 0-3 representing average skill (0 = no players, 1 = Beginner, 2 = Intermediate, 3 = Advanced)
}

export interface User {
  id: string;
  email: string;
  skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  privacyOptIn: boolean;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
}

export interface CheckIn {
  id: string;
  userId: string;
  courtId: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  timestamp: string;
  expiresAt: string;
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
}
