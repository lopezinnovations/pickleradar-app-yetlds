
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { IconSymbol } from '@/components/IconSymbol';
import { isSupabaseConfigured } from '@/utils/supabaseClient';

export default function FriendsScreen() {
  const { user } = useAuth();
  const [friendEmail, setFriendEmail] = useState('');
  const [friends, setFriends] = useState<any[]>([]);

  const handleAddFriend = () => {
    if (!friendEmail.trim()) {
      Alert.alert('Error', 'Please enter a friend&apos;s email');
      return;
    }

    if (!isSupabaseConfigured()) {
      Alert.alert('Supabase Required', 'Please enable Supabase to use friend features');
      return;
    }

    Alert.alert('Coming Soon', 'Friend requests will be available once Supabase is fully configured');
    setFriendEmail('');
  };

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
            Connect with friends and see when they&apos;re playing
          </Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Add Friend</Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
            Enter your friend&apos;s email to send a friend request
          </Text>

          <TextInput
            style={commonStyles.input}
            placeholder="friend@example.com"
            placeholderTextColor={colors.textSecondary}
            value={friendEmail}
            onChangeText={setFriendEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={buttonStyles.primary}
            onPress={handleAddFriend}
          >
            <Text style={buttonStyles.text}>Send Friend Request</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={commonStyles.subtitle}>Your Friends</Text>
          
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol 
                ios_icon_name="person.2.slash" 
                android_material_icon_name="people_outline" 
                size={48} 
                color={colors.textSecondary} 
              />
              <Text style={[commonStyles.text, { textAlign: 'center', marginTop: 16 }]}>
                No friends yet
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
                Add friends to see when they&apos;re playing at courts near you
              </Text>
            </View>
          ) : (
            friends.map((friend, index) => (
              <View key={index} style={commonStyles.card}>
                <View style={styles.friendItem}>
                  <View style={styles.friendAvatar}>
                    <IconSymbol 
                      ios_icon_name="person.fill" 
                      android_material_icon_name="person" 
                      size={24} 
                      color={colors.card} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.friendName}>{friend.email}</Text>
                    <Text style={commonStyles.textSecondary}>
                      {friend.isPlaying ? `Playing at ${friend.courtName}` : 'Not playing'}
                    </Text>
                  </View>
                  {friend.isPlaying && (
                    <View style={styles.playingIndicator}>
                      <View style={styles.playingDot} />
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={[commonStyles.card, { backgroundColor: colors.highlight }]}>
          <View style={styles.privacyHeader}>
            <IconSymbol 
              ios_icon_name="lock.shield.fill" 
              android_material_icon_name="shield" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={[commonStyles.subtitle, { marginLeft: 12 }]}>Privacy</Text>
          </View>
          <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>
            Your location and check-ins are only visible to friends you&apos;ve accepted. 
            You can manage your privacy settings in your profile.
          </Text>
        </View>
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
    alignItems: 'center',
  },
  section: {
    marginTop: 24,
    marginBottom: 20,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  playingIndicator: {
    marginLeft: 12,
  },
  playingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
