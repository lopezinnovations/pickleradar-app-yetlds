
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { IconSymbol } from '@/components/IconSymbol';

export default function ProfileScreen() {
  const { user, signOut, updateUserProfile } = useAuth();
  
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    user?.skillLevel || 'Intermediate'
  );
  const [privacyOptIn, setPrivacyOptIn] = useState(user?.privacyOptIn || false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled || false);
  const [locationEnabled, setLocationEnabled] = useState(user?.locationEnabled || false);

  const handleSkillLevelChange = async (level: 'Beginner' | 'Intermediate' | 'Advanced') => {
    setSkillLevel(level);
    await updateUserProfile({ skillLevel: level });
  };

  const handlePrivacyToggle = async (value: boolean) => {
    setPrivacyOptIn(value);
    await updateUserProfile({ privacyOptIn: value });
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await updateUserProfile({ notificationsEnabled: value });
  };

  const handleLocationToggle = async (value: boolean) => {
    setLocationEnabled(value);
    await updateUserProfile({ locationEnabled: value });
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <IconSymbol 
              ios_icon_name="person.fill" 
              android_material_icon_name="person" 
              size={48} 
              color={colors.card} 
            />
          </View>
          <Text style={commonStyles.title}>{user?.email}</Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Skill Level</Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
            Let others know your playing level
          </Text>

          <View style={styles.skillLevelContainer}>
            {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.skillLevelButton,
                  skillLevel === level && styles.skillLevelButtonActive,
                ]}
                onPress={() => handleSkillLevelChange(level)}
              >
                <Text
                  style={[
                    styles.skillLevelText,
                    skillLevel === level && styles.skillLevelTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>Privacy & Permissions</Text>
          
          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Share with Friends</Text>
              <Text style={commonStyles.textSecondary}>
                Let friends see when you&apos;re playing
              </Text>
            </View>
            <Switch
              value={privacyOptIn}
              onValueChange={handlePrivacyToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={commonStyles.textSecondary}>
                Get notified when friends check in
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Location Services</Text>
              <Text style={commonStyles.textSecondary}>
                Show nearby courts based on your location
              </Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={commonStyles.subtitle}>About PickleRadar</Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
            Version 1.0.0
          </Text>
          <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
            Find active pickleball courts and connect with friends who play.
          </Text>
        </View>

        <TouchableOpacity
          style={[buttonStyles.secondary, { borderColor: colors.error, marginTop: 20 }]}
          onPress={handleSignOut}
        >
          <Text style={[buttonStyles.textSecondary, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  skillLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  skillLevelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  skillLevelButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  skillLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  skillLevelTextActive: {
    color: colors.card,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
});
