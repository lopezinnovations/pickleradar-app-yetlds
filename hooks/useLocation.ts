
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useAuth';
import { requestLocationPermission, geocodeZipCode } from '@/utils/locationUtils';

export const useLocation = () => {
  const { user, updateUserProfile } = useAuth();
  const [requestingPermission, setRequestingPermission] = useState(false);

  const requestLocationOnFirstLogin = useCallback(async () => {
    if (!user) return;

    Alert.alert(
      'Enable Location Services',
      'PickleRadar would like to access your location to show nearby courts. You can also search by ZIP code if you prefer.',
      [
        {
          text: 'Use ZIP Code',
          onPress: () => {
            updateUserProfile({ locationPermissionRequested: true });
          },
        },
        {
          text: 'Allow Location',
          onPress: async () => {
            await requestLocation();
          },
        },
      ]
    );
  }, [user, updateUserProfile]);

  // Request location permission on first login
  useEffect(() => {
    if (user && !user.locationPermissionRequested && !user.latitude && !user.longitude) {
      requestLocationOnFirstLogin();
    }
  }, [user, requestLocationOnFirstLogin]);

  const requestLocation = async () => {
    if (!user) return;

    setRequestingPermission(true);
    const result = await requestLocationPermission();
    
    if (result.granted && result.latitude && result.longitude) {
      await updateUserProfile({
        latitude: result.latitude,
        longitude: result.longitude,
        locationEnabled: true,
        locationPermissionRequested: true,
      });
      Alert.alert('Success', 'Location saved! You can now see nearby courts.');
    } else {
      await updateUserProfile({ locationPermissionRequested: true });
      Alert.alert(
        'Location Access Denied',
        'You can still use PickleRadar by searching for courts using a ZIP code.'
      );
    }
    
    setRequestingPermission(false);
  };

  const updateZipCode = async (zipCode: string) => {
    if (!user) return { success: false, error: 'Not logged in' };

    const result = await geocodeZipCode(zipCode);
    
    if (result.success && result.latitude && result.longitude) {
      await updateUserProfile({
        zipCode,
        latitude: result.latitude,
        longitude: result.longitude,
      });
      return { success: true };
    } else {
      return { success: false, error: result.error || 'Invalid ZIP code' };
    }
  };

  return {
    requestLocation,
    updateZipCode,
    requestingPermission,
    hasLocation: !!(user?.latitude && user?.longitude),
    userLocation: user?.latitude && user?.longitude ? {
      latitude: user.latitude,
      longitude: user.longitude,
    } : null,
  };
};
