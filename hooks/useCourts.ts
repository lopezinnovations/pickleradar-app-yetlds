
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/utils/supabaseClient';
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
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    if (!isSupabaseConfigured()) {
      // Use mock data
      setCourts(MOCK_COURTS);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('courts')
        .select('*');

      if (error) throw error;
      
      // Calculate activity levels based on check-ins
      const courtsWithActivity = await Promise.all(
        data.map(async (court) => {
          const { count } = await supabase
            .from('check_ins')
            .select('*', { count: 'exact', head: true })
            .eq('court_id', court.id)
            .gte('expires_at', new Date().toISOString());

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

      setCourts(courtsWithActivity);
    } catch (error) {
      console.log('Error fetching courts:', error);
      setCourts(MOCK_COURTS);
    } finally {
      setLoading(false);
    }
  };

  return { courts, loading, refetch: fetchCourts };
};
