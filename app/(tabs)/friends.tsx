
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { IconSymbol } from '@/components/IconSymbol';
import { BrandingFooter } from '@/components/BrandingFooter';

export default function FriendsScreen() {
  const { user } = useAuth();
  const { 
    friends, 
    pendingRequests, 
    allUsers, 
    loading, 
    sendFriendRequestById, 
    acceptFriendRequest, 
    rejectFriendRequest, 
    removeFriend 
  } = useFriends(user?.id);
  const [searchQuery, setSearchQuery] = useState('');

  const formatUserName = (firstName?: string, lastName?: string, nickname?: string, email?: string, phone?: string) => {
    if (firstName && lastName) {
      const displayName = `${firstName} ${lastName.charAt(0)}.`;
      if (nickname) {
        return `${displayName} (${nickname})`;
      }
      return displayName;
    }
    if (nickname) {
      return nickname;
    }
    return email || phone || 'Unknown User';
  };

  const handleAddFriendById = async (friendId: string, friendName: string) => {
    const result = await sendFriendRequestById(friendId);
    
    if (result.success) {
      Alert.alert('Success', `Friend request sent to ${friendName}!`);
    } else {
      Alert.alert('Error', result.error || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    await acceptFriendRequest(friendshipId);
    Alert.alert('Success', 'Friend request accepted!');
  };

  const handleRejectRequest = async (friendshipId: string) => {
    await rejectFriendRequest(friendshipId);
  };

  const handleRemoveFriend = (friendshipId: string, friendName: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFriend(friendshipId),
        },
      ]
    );
  };

  // Filter users based on search query
  const filteredUsers = allUsers.filter(u => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const firstName = u.first_name?.toLowerCase() || '';
    const lastName = u.last_name?.toLowerCase() || '';
    const nickname = u.pickleballer_nickname?.toLowerCase() || '';
    const email = u.email?.toLowerCase() || '';
    
    return firstName.includes(query) || 
           lastName.includes(query) || 
           nickname.includes(query) || 
           email.includes(query);
  });

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={commonStyles.title}>Friends</Text>
          <Text style={commonStyles.textSecondary}>
            Connect with other pickleball players
          </Text>
        </View>

        {/* My Friends Section */}
        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>
            My Friends ({friends.length})
          </Text>
          
          {friends.length === 0 ? (
            <View style={[commonStyles.card, { marginTop: 12, alignItems: 'center', padding: 32 }]}>
              <IconSymbol 
                ios_icon_name="person.2.slash" 
                android_material_icon_name="people_outline" 
                size={48} 
                color={colors.textSecondary} 
              />
              <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
                No friends yet. Add friends to see when they&apos;re playing!
              </Text>
            </View>
          ) : (
            friends.map((friend, index) => {
              const displayName = formatUserName(
                friend.friendFirstName,
                friend.friendLastName,
                friend.friendNickname,
                friend.friendEmail,
                friend.friendPhone
              );
              
              return (
                <View key={index} style={[commonStyles.card, { marginTop: 12 }]}>
                  <View style={styles.friendHeader}>
                    <View style={styles.friendIcon}>
                      <IconSymbol 
                        ios_icon_name="person.fill" 
                        android_material_icon_name="person" 
                        size={24} 
                        color={colors.primary} 
                      />
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={commonStyles.subtitle}>{displayName}</Text>
                      {friend.friendExperienceLevel && (
                        <Text style={commonStyles.textSecondary}>
                          {friend.friendExperienceLevel}
                          {friend.friendDuprRating && ` • DUPR: ${friend.friendDuprRating}`}
                        </Text>
                      )}
                      {friend.currentCourtName ? (
                        <View style={styles.playingContainer}>
                          <View style={styles.atCourtBadge}>
                            <IconSymbol 
                              ios_icon_name="location.fill" 
                              android_material_icon_name="location_on" 
                              size={16} 
                              color={colors.card} 
                            />
                            <Text style={styles.atCourtText}>
                              At {friend.currentCourtName}
                            </Text>
                          </View>
                          {friend.remainingTime && (
                            <View style={styles.timeContainer}>
                              <IconSymbol 
                                ios_icon_name="clock.fill" 
                                android_material_icon_name="schedule" 
                                size={14} 
                                color={colors.primary} 
                              />
                              <Text style={styles.timeText}>
                                {friend.remainingTime.hours > 0 && `${friend.remainingTime.hours}h `}
                                {friend.remainingTime.minutes}m left
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View style={styles.offlineContainer}>
                          <View style={styles.offlineDot} />
                          <Text style={styles.offlineText}>Not at a court</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveFriend(friend.id, displayName)}
                    >
                      <IconSymbol 
                        ios_icon_name="trash" 
                        android_material_icon_name="delete" 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Friend Requests Section */}
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={commonStyles.subtitle}>Friend Requests ({pendingRequests.length})</Text>
            <Text style={[commonStyles.textSecondary, { marginTop: 4, marginBottom: 8 }]}>
              Accept or deny incoming friend requests
            </Text>
            {pendingRequests.map((request, index) => {
              const displayName = formatUserName(
                request.friendFirstName,
                request.friendLastName,
                request.friendNickname,
                request.friendEmail,
                request.friendPhone
              );
              
              return (
                <View key={index} style={[commonStyles.card, { marginTop: 12 }]}>
                  <View style={styles.friendHeader}>
                    <View style={styles.friendIcon}>
                      <IconSymbol 
                        ios_icon_name="person.fill" 
                        android_material_icon_name="person" 
                        size={24} 
                        color={colors.accent} 
                      />
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={commonStyles.subtitle}>{displayName}</Text>
                      {request.friendExperienceLevel && (
                        <Text style={commonStyles.textSecondary}>
                          {request.friendExperienceLevel}
                          {request.friendDuprRating && ` • DUPR: ${request.friendDuprRating}`}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[buttonStyles.primary, { flex: 1, marginRight: 8 }]}
                      onPress={() => handleAcceptRequest(request.id)}
                    >
                      <Text style={buttonStyles.text}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[buttonStyles.secondary, { flex: 1 }]}
                      onPress={() => handleRejectRequest(request.id)}
                    >
                      <Text style={[buttonStyles.text, { color: colors.text }]}>Deny</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>Find People</Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 4, marginBottom: 12 }]}>
            Search for players to add as friends
          </Text>
          
          <View style={styles.searchContainer}>
            <IconSymbol 
              ios_icon_name="magnifyingglass" 
              android_material_icon_name="search" 
              size={20} 
              color={colors.textSecondary} 
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, nickname, or email..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* All Users List */}
        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>
            All Users ({filteredUsers.length})
          </Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 4, marginBottom: 8 }]}>
            {searchQuery.trim() ? 'Search results' : 'All players in the app'}
          </Text>
          
          {filteredUsers.length === 0 ? (
            <View style={[commonStyles.card, { marginTop: 12, alignItems: 'center', padding: 32 }]}>
              <IconSymbol 
                ios_icon_name="person.crop.circle.badge.questionmark" 
                android_material_icon_name="person_search" 
                size={48} 
                color={colors.textSecondary} 
              />
              <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
                {searchQuery.trim() ? 'No users found matching your search' : 'No other users in the app yet'}
              </Text>
            </View>
          ) : (
            filteredUsers.map((otherUser, index) => {
              const displayName = formatUserName(
                otherUser.first_name,
                otherUser.last_name,
                otherUser.pickleballer_nickname,
                otherUser.email
              );
              
              return (
                <View key={index} style={[commonStyles.card, { marginTop: 12 }]}>
                  <View style={styles.friendHeader}>
                    <View style={styles.friendIcon}>
                      <IconSymbol 
                        ios_icon_name="person.fill" 
                        android_material_icon_name="person" 
                        size={24} 
                        color={colors.primary} 
                      />
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={commonStyles.subtitle}>{displayName}</Text>
                      {otherUser.experience_level && (
                        <Text style={commonStyles.textSecondary}>
                          {otherUser.experience_level}
                          {otherUser.dupr_rating && ` • DUPR: ${otherUser.dupr_rating}`}
                        </Text>
                      )}
                      {otherUser.isAtCourt ? (
                        <View style={styles.offlineContainer}>
                          <View style={styles.onlineDot} />
                          <Text style={styles.onlineText}>At a court</Text>
                        </View>
                      ) : (
                        <View style={styles.offlineContainer}>
                          <View style={styles.offlineDot} />
                          <Text style={styles.offlineText}>Not at a court</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => handleAddFriendById(otherUser.id, displayName)}
                    >
                      <IconSymbol 
                        ios_icon_name="plus.circle.fill" 
                        android_material_icon_name="add_circle" 
                        size={32} 
                        color={colors.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <BrandingFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginTop: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    marginRight: 12,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  requestActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  playingContainer: {
    marginTop: 8,
  },
  atCourtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  atCourtText: {
    fontSize: 13,
    color: colors.card,
    fontWeight: '700',
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
    marginRight: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  offlineText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  onlineText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
});
