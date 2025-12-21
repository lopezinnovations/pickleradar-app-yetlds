
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useCourts } from '@/hooks/useCourts';
import { useAuth } from '@/hooks/useAuth';
import { IconSymbol } from '@/components/IconSymbol';

export default function HomeScreen() {
  const router = useRouter();
  const { courts, loading, refetch } = useCourts();
  const { user, isConfigured } = useAuth();

  useEffect(() => {
    // Redirect to welcome if not authenticated
    if (!isConfigured) {
      router.replace('/welcome');
    } else if (!user) {
      router.replace('/auth');
    }
  }, [user, isConfigured]);

  const getActivityColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.accent;
      case 'low':
        return colors.success;
    }
  };

  const getActivityLabel = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return 'High Activity';
      case 'medium':
        return 'Medium Activity';
      case 'low':
        return 'Low Activity';
    }
  };

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
          <Text style={commonStyles.title}>PickleRadar</Text>
          <Text style={commonStyles.textSecondary}>Find active pickleball courts near you</Text>
        </View>

        <View style={styles.mapPlaceholder}>
          <IconSymbol 
            ios_icon_name="map.fill" 
            android_material_icon_name="map" 
            size={48} 
            color={colors.textSecondary} 
          />
          <Text style={[commonStyles.text, { textAlign: 'center', marginTop: 16 }]}>
            Map view is not currently supported in Natively.
          </Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
            Browse courts below to see activity levels and check in.
          </Text>
        </View>

        <View style={styles.courtsSection}>
          <View style={styles.sectionHeader}>
            <Text style={commonStyles.subtitle}>Nearby Courts</Text>
            <TouchableOpacity onPress={refetch}>
              <IconSymbol 
                ios_icon_name="arrow.clockwise" 
                android_material_icon_name="refresh" 
                size={24} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>

          {courts.map((court) => (
            <TouchableOpacity
              key={court.id}
              style={commonStyles.card}
              onPress={() => router.push(`/(tabs)/(home)/court/${court.id}`)}
            >
              <View style={styles.courtHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courtName}>{court.name}</Text>
                  <Text style={commonStyles.textSecondary}>{court.address}</Text>
                </View>
                <View style={[styles.activityBadge, { backgroundColor: getActivityColor(court.activityLevel) }]}>
                  <Text style={styles.activityText}>{getActivityLabel(court.activityLevel)}</Text>
                </View>
              </View>
              
              <View style={styles.courtFooter}>
                <View style={styles.playerCount}>
                  <IconSymbol 
                    ios_icon_name="person.2.fill" 
                    android_material_icon_name="people" 
                    size={16} 
                    color={colors.textSecondary} 
                  />
                  <Text style={[commonStyles.textSecondary, { marginLeft: 6 }]}>
                    {court.currentPlayers} {court.currentPlayers === 1 ? 'player' : 'players'}
                  </Text>
                </View>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={20} 
                  color={colors.textSecondary} 
                />
              </View>
            </TouchableOpacity>
          ))}
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
  mapPlaceholder: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  courtsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  activityBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  courtFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  playerCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
