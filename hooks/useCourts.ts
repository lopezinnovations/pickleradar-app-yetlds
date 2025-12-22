
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/app/integrations/supabase/client';
import { Court } from '@/types';

// Mock data for when Supabase is not configured
const MOCK_COURTS: Court[] = [
  {
    id: '1',
    name: 'Central Park Pickleball Courts',
    address: '123 Park Ave, New York, NY',
    latitude: 40.7829,
    longitude: -73.9654,
    activityLevel: 'high',
    currentPlayers: 8,
  },
  {
    id: '2',
    name: 'Riverside Recreation Center',
    address: '456 River Rd, Brooklyn, NY',
    latitude: 40.7128,
    longitude: -74.0060,
    activityLevel: 'medium',
    currentPlayers: 4,
  },
  {
    id: '3',
    name: 'Sunset Community Courts',
    address: '789 Sunset Blvd, Queens, NY',
    latitude: 40.7282,
    longitude: -73.7949,
    activityLevel: 'low',
    currentPlayers: 2,
  },
];

export const useCourts = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useCourts: Initializing...');
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
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
      
      // Calculate activity levels based on check-ins
      const courtsWithActivity = await Promise.all(
        (data || []).map(async (court) => {
          const { count, error: countError } = await supabase
            .from('check_ins')
            .select('*', { count: 'exact', head: true })
            .eq('court_id', court.id)
            .gte('expires_at', new Date().toISOString());

          if (countError) {
            console.log('useCourts: Error counting check-ins for court', court.id, ':', countError);
          }

          const currentPlayers = count || 0;
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
          };
        })
      );

      console.log('useCourts: Successfully processed courts with activity levels');
      setCourts(courtsWithActivity);
    } catch (error) {
      console.log('useCourts: Error in fetchCourts, falling back to mock data:', error);
      setCourts(MOCK_COURTS);
    } finally {
      setLoading(false);
      console.log('useCourts: Fetch complete');
    }
  };

  return { courts, loading, refetch: fetchCourts };
};
