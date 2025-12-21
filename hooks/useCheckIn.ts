
import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/utils/supabaseClient';
import { CheckIn } from '@/types';

export const useCheckIn = () => {
  const [loading, setLoading] = useState(false);

  const checkIn = async (
    userId: string,
    courtId: string,
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  ) => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured - mock check-in');
      return { success: true, error: null };
    }

    setLoading(true);
    try {
      // Check if user is already checked in at this court
      const { data: existing } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', userId)
        .eq('court_id', courtId)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (existing) {
        return { success: false, error: 'Already checked in at this court' };
      }

      // Create check-in (expires in 3 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 3);

      const { error } = await supabase
        .from('check_ins')
        .insert([
          {
            user_id: userId,
            court_id: courtId,
            skill_level: skillLevel,
            expires_at: expiresAt.toISOString(),
          },
        ]);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.log('Check-in error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async (userId: string, courtId: string) => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured - mock check-out');
      return { success: true, error: null };
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('check_ins')
        .delete()
        .eq('user_id', userId)
        .eq('court_id', courtId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.log('Check-out error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getUserCheckIn = async (userId: string) => {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*, courts(*)')
        .eq('user_id', userId)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.log('Error fetching user check-in:', error);
      return null;
    }
  };

  return { checkIn, checkOut, getUserCheckIn, loading };
};
