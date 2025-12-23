
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/app/integrations/supabase/client';
import { Court } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

const MOCK_COURTS: Court[] = [
  {
    id: '1',
    name: 'Central Park Pickleball Courts',
    address: '123 Park Ave, New York, NY',
    latitude: 40.7829,
    longitude: -73.9654,
    activityLevel: 'high',
    currentPlayers: 8,
    averageSkillLevel: 3.5,
    friendsPlayingCount: 0,
    description: 'Beautiful outdoor courts in the heart of Central Park',
    openTime: '6:00 AM',
    closeTime: '10:00 PM',
  },
  {
    id: '2',
    name: 'Riverside Recreation Center',
    address: '456 River Rd, Brooklyn, NY',
    latitude: 40.7128,
    longitude: -74.0060,
    activityLevel: 'medium',
    currentPlayers: 4,
    averageSkillLevel: 2.5,
    friendsPlayingCount: 0,
    description: 'Indoor and outdoor courts with great river views',
    openTime: '7:00 AM',
    closeTime: '9:00 PM',
  },
  {
    id: '3',
    name: 'Sunset Community Courts',
    address: '789 Sunset Blvd, Queens, NY',
    latitude: 40.7282,
    longitude: -73.7949,
    activityLevel: 'low',
    currentPlayers: 2,
    averageSkillLevel: 1.5,
    friendsPlayingCount: 0,
  },
];

const skillLevelToNumber = (skillLevel: string): number => {
  switch (skillLevel) {
    case 'Beginner':
      return 1;
    case 'Intermediate':
      return 2;
    case 'Advanced':
      return 3;
    default:
      return 2;
  }
};

export const useCourts = (userId?: string) => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const hasSetupRealtime = useRef(false);

  const fetchCourts = useCallback(async () => {
    console.log('useCourts: Fetching courts...');
    setLoading(true);
    
    if (!isSupabaseConfigured()) {
      console.log('useCourts: Supabase not configured, using mock data');
      setCourts(MOCK_COURTS);
      setLoading(false);
      return;
    }

    try {
      console.log('useCourts: Fetching from Supabase...');
      const { data, error } = await supabase
        .from('courts')
        .select('*');

      if (error) {
        console.log('useCourts: Error fetching courts:', error);
        throw error;
      }
      
      console.log('useCourts: Fetched', data?.length || 0, 'courts');

      // Get user's friends if userId is provided
      let friendIds: string[] = [];
      if (userId) {
        const { data: friendsData } = await supabase
          .from('friends')
          .select('friend_id')
          .eq('user_id', userId)
          .eq('status', 'accepted');

        friendIds = (friendsData || []).map(f => f.friend_id);
        console.log('useCourts: User has', friendIds.length, 'friends');
      }
      
      const courtsWithActivity = await Promise.all(
        (data || []).map(async (court) => {
          // Fetch check-ins with user data to get DUPR ratings
          const { data: checkIns, error: checkInsError } = await supabase
            .from('check_ins')
            .select(`
              skill_level, 
              user_id,
              users!inner(dupr_rating)
            `)
            .eq('court_id', court.id)
            .gte('expires_at', new Date().toISOString());

          if (checkInsError) {
            console.log('useCourts: Error fetching check-ins for court', court.id, ':', checkInsError);
          }

          const currentPlayers = checkIns?.length || 0;
          
          // Count friends playing at this court
          const friendsPlaying = checkIns?.filter(checkIn => friendIds.includes(checkIn.user_id)) || [];
          const friendsPlayingCount = friendsPlaying.length;
          
          // Calculate average skill level
          let averageSkillLevel = 0;
          if (currentPlayers > 0 && checkIns) {
            const skillSum = checkIns.reduce((sum, checkIn) => {
              return sum + skillLevelToNumber(checkIn.skill_level);
            }, 0);
            averageSkillLevel = skillSum / currentPlayers;
          }

          // Calculate average DUPR if data exists
          let averageDupr: number | undefined;
          if (checkIns && checkIns.length > 0) {
            const duprRatings = checkIns
              .map(checkIn => checkIn.users?.dupr_rating)
              .filter((rating): rating is number => rating !== null && rating !== undefined);
            
            if (duprRatings.length > 0) {
              const duprSum = duprRatings.reduce((sum, rating) => sum + rating, 0);
              averageDupr = duprSum / duprRatings.length;
            }
          }

          let activityLevel: 'low' | 'medium' | 'high' = 'low';
          if (currentPlayers >= 6) activityLevel = 'high';
          else if (currentPlayers >= 3) activityLevel = 'medium';

          return {
            id: court.id,
            name: court.name,
            address: court.address,
            latitude: court.latitude,
            longitude: court.longitude,
            activityLevel,
            currentPlayers,
            averageSkillLevel,
            friendsPlayingCount,
            description: court.description,
            openTime: court.open_time,
            closeTime: court.close_time,
            googlePlaceId: court.google_place_id,
            averageDupr,
          };
        })
      );

      console.log('useCourts: Successfully processed courts with activity levels, skill averages, friend counts, and DUPR data');
      setCourts(courtsWithActivity);
    } catch (error) {
      console.log('useCourts: Error in fetchCourts, falling back to mock data:', error);
      setCourts(MOCK_COURTS);
    } finally {
      setLoading(false);
      console.log('useCourts: Fetch complete');
    }
  }, [userId]);

  useEffect(() => {
    console.log('useCourts: Initializing...');
    fetchCourts();
    
    // Only setup realtime once
    if (isSupabaseConfigured() && !hasSetupRealtime.current) {
      hasSetupRealtime.current = true;
      
      try {
        console.log('useCourts: Setting up realtime subscription for check-ins');
        
        const channel = supabase.channel('check_ins:changes', {
          config: { broadcast: { self: true } }
        });
        
        channelRef.current = channel;

        channel
          .on('broadcast', { event: 'INSERT' }, (payload) => {
            console.log('useCourts: Check-in created', payload);
            fetchCourts();
          })
          .on('broadcast', { event: 'DELETE' }, (payload) => {
            console.log('useCourts: Check-in deleted', payload);
            fetchCourts();
          })
          .on('broadcast', { event: 'UPDATE' }, (payload) => {
            console.log('useCourts: Check-in updated', payload);
            fetchCourts();
          })
          .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              console.log('useCourts: Successfully subscribed to check-in updates');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('useCourts: Channel error:', err);
            } else if (status === 'CLOSED') {
              console.log('useCourts: Channel closed');
            }
          });
      } catch (error) {
        console.error('useCourts: Error setting up realtime subscription:', error);
      }
    }

    return () => {
      if (channelRef.current) {
        console.log('useCourts: Cleaning up realtime subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        hasSetupRealtime.current = false;
      }
    };
  }, [fetchCourts]);

  return { courts, loading, refetch: fetchCourts };
};
