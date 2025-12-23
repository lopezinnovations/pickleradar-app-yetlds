
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/app/integrations/supabase/client';
import { Friend, FriendWithDetails } from '@/types';

export const useFriends = (userId: string | undefined) => {
  const [friends, setFriends] = useState<FriendWithDetails[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const getRemainingTime = (expiresAt: string): { hours: number; minutes: number; totalMinutes: number } => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes, totalMinutes };
  };

  const fetchFriends = useCallback(async () => {
    if (!userId || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data: acceptedFriends, error: friendsError } = await supabase
        .from('friends')
        .select(`
          *,
          friend:users!friends_friend_id_fkey(id, email, phone, skill_level)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      const { data: pending, error: pendingError } = await supabase
        .from('friends')
        .select(`
          *,
          requester:users!friends_user_id_fkey(id, email, phone, skill_level)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      const friendsWithDetails: FriendWithDetails[] = await Promise.all(
        (acceptedFriends || []).map(async (friendship: any) => {
          const friendData = friendship.friend;
          
          const { data: checkIn } = await supabase
            .from('check_ins')
            .select('court_id, expires_at, courts(name)')
            .eq('user_id', friendData.id)
            .gte('expires_at', new Date().toISOString())
            .single();

          let remainingTime = undefined;
          if (checkIn?.expires_at) {
            remainingTime = getRemainingTime(checkIn.expires_at);
          }

          return {
            id: friendship.id,
            userId: friendship.user_id,
            friendId: friendship.friend_id,
            status: friendship.status,
            createdAt: friendship.created_at,
            friendEmail: friendData.email,
            friendPhone: friendData.phone,
            friendSkillLevel: friendData.skill_level,
            currentCourtId: checkIn?.court_id,
            currentCourtName: checkIn?.courts?.name,
            remainingTime,
          };
        })
      );

      const pendingWithDetails: FriendWithDetails[] = (pending || []).map((friendship: any) => {
        const requesterData = friendship.requester;
        return {
          id: friendship.id,
          userId: friendship.user_id,
          friendId: friendship.friend_id,
          status: friendship.status,
          createdAt: friendship.created_at,
          friendEmail: requesterData.email,
          friendPhone: requesterData.phone,
          friendSkillLevel: requesterData.skill_level,
        };
      });

      setFriends(friendsWithDetails);
      setPendingRequests(pendingWithDetails);
    } catch (error) {
      console.log('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && isSupabaseConfigured()) {
      fetchFriends();
    } else {
      setLoading(false);
    }
  }, [userId, fetchFriends]);

  const sendFriendRequest = async (friendIdentifier: string) => {
    if (!userId || !isSupabaseConfigured()) {
      return { success: false, error: 'Not configured' };
    }

    try {
      // Try to find user by phone or email
      let friendUser = null;
      
      // Check if it looks like a phone number (contains digits and possibly +, -, (, ), spaces)
      const isPhone = /[\d+\-() ]/.test(friendIdentifier) && friendIdentifier.replace(/[\D]/g, '').length >= 10;
      
      if (isPhone) {
        // Clean phone number
        const cleanPhone = friendIdentifier.replace(/\D/g, '');
        const formattedPhone = cleanPhone.length === 10 ? `+1${cleanPhone}` : `+${cleanPhone}`;
        
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('phone', formattedPhone)
          .single();
        
        if (!error && data) {
          friendUser = data;
        }
      } else {
        // Try email
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('email', friendIdentifier)
          .single();
        
        if (!error && data) {
          friendUser = data;
        }
      }

      if (!friendUser) {
        return { success: false, error: 'User not found' };
      }

      if (friendUser.id === userId) {
        return { success: false, error: 'Cannot add yourself as a friend' };
      }

      const { data: existing } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendUser.id}),and(user_id.eq.${friendUser.id},friend_id.eq.${userId})`)
        .single();

      if (existing) {
        return { success: false, error: 'Friend request already exists' };
      }

      const { error } = await supabase
        .from('friends')
        .insert([
          {
            user_id: userId,
            friend_id: friendUser.id,
            status: 'pending',
          },
        ]);

      if (error) throw error;

      await fetchFriends();
      return { success: true, error: null };
    } catch (error: any) {
      console.log('Error sending friend request:', error);
      return { success: false, error: error.message };
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      await fetchFriends();
    } catch (error) {
      console.log('Error accepting friend request:', error);
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      await fetchFriends();
    } catch (error) {
      console.log('Error rejecting friend request:', error);
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      await fetchFriends();
    } catch (error) {
      console.log('Error removing friend:', error);
    }
  };

  return {
    friends,
    pendingRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refetch: fetchFriends,
  };
};
