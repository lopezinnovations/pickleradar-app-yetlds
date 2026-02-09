
import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { Court } from '@/types';

export default function CourtsMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);

  // Parse courts from navigation params
  const courts = useMemo(() => {
    try {
      if (params.courts && typeof params.courts === 'string') {
        const parsed = JSON.parse(params.courts) as Court[];
        console.log('CourtsMapScreen: Loaded', parsed.length, 'courts from params');
        return parsed;
      }
      return [];
    } catch (error) {
      console.error('CourtsMapScreen: Error parsing courts:', error);
      return [];
    }
  }, [params.courts]);

  // Parse user location from params
  const userLocation = useMemo(() => {
    try {
      if (params.userLocation && typeof params.userLocation === 'string') {
        return JSON.parse(params.userLocation) as { latitude: number; longitude: number };
      }
      return null;
    } catch (error) {
      console.error('CourtsMapScreen: Error parsing user location:', error);
      return null;
    }
  }, [params.userLocation]);

  // Calculate initial region
  const initialRegion = useMemo(() => {
    // If user location is available, center on user
    if (userLocation) {
      console.log('CourtsMapScreen: Centering on user location');
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    // Otherwise, center on first court
    if (courts.length > 0) {
      console.log('CourtsMapScreen: Centering on first court');
      return {
        latitude: courts[0].latitude,
        longitude: courts[0].longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    // Default to NYC if no data
    console.log('CourtsMapScreen: Using default NYC location');
    return {
      latitude: 40.7128,
      longitude: -74.0060,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [courts, userLocation]);

  // Fit map to show all markers after mount
  useEffect(() => {
    if (courts.length > 0 && mapRef.current) {
      const timeout = setTimeout(() => {
        const coordinates = courts.map(court => ({
          latitude: court.latitude,
          longitude: court.longitude,
        }));

        // Add user location if available
        if (userLocation) {
          coordinates.push(userLocation);
        }

        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [courts, userLocation]);

  const handleMarkerPress = (court: Court) => {
    console.log('User tapped marker for court:', court.name);
  };

  const handleCalloutPress = (court: Court) => {
    console.log('User tapped callout for court:', court.name);
    router.push(`/(tabs)/(home)/court/${court.id}`);
  };

  const handleBackToList = () => {
    console.log('User tapped Back to List button');
    router.back();
  };

  const getMarkerColor = (activityLevel: 'low' | 'medium' | 'high') => {
    switch (activityLevel) {
      case 'high':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'low':
      default:
        return colors.textSecondary;
    }
  };

  const courtsCountText = `${courts.length} ${courts.length === 1 ? 'Court' : 'Courts'}`;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Map View',
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        showsUserLocation={userLocation !== null}
        showsMyLocationButton={true}
        showsCompass={true}
        toolbarEnabled={false}
      >
        {courts.map((court) => {
          const distanceText = court.distance !== undefined
            ? `${court.distance.toFixed(1)} mi`
            : '';
          const playersText = `${court.currentPlayers} ${court.currentPlayers === 1 ? 'player' : 'players'}`;

          return (
            <Marker
              key={court.id}
              coordinate={{
                latitude: court.latitude,
                longitude: court.longitude,
              }}
              pinColor={getMarkerColor(court.activityLevel)}
              onPress={() => handleMarkerPress(court)}
            >
              <Callout onPress={() => handleCalloutPress(court)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {court.name}
                  </Text>
                  {distanceText && (
                    <View style={styles.calloutRow}>
                      <IconSymbol
                        ios_icon_name="location.fill"
                        android_material_icon_name="location-on"
                        size={12}
                        color={colors.primary}
                      />
                      <Text style={styles.calloutDistance}>{distanceText}</Text>
                    </View>
                  )}
                  <View style={styles.calloutRow}>
                    <View
                      style={[
                        styles.activityDot,
                        { backgroundColor: getMarkerColor(court.activityLevel) },
                      ]}
                    />
                    <Text style={styles.calloutText}>{playersText}</Text>
                  </View>
                  <Text style={styles.calloutTapHint}>Tap for details</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Back to List Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToList}>
          <IconSymbol
            ios_icon_name="list.bullet"
            android_material_icon_name="list"
            size={20}
            color={colors.card}
          />
          <Text style={styles.backButtonText}>Back to List</Text>
        </TouchableOpacity>
      </View>

      {/* Courts Count Badge */}
      <View style={styles.countBadge}>
        <Text style={styles.countBadgeText}>{courtsCountText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  backButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    right: 20,
    alignItems: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.card,
    marginLeft: 8,
  },
  countBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 80,
    right: 20,
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  calloutContainer: {
    width: 200,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  calloutDistance: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  calloutText: {
    fontSize: 13,
    color: colors.text,
  },
  calloutTapHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
