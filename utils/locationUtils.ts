
import * as Location from 'expo-location';

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

// Request location permission and get current location
export const requestLocationPermission = async (): Promise<{
  granted: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return {
        granted: false,
        error: 'Location permission denied',
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      granted: true,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.log('Error requesting location permission:', error);
    return {
      granted: false,
      error: 'Failed to get location',
    };
  }
};

// Geocode ZIP code to coordinates
export const geocodeZipCode = async (zipCode: string): Promise<{
  success: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
}> => {
  try {
    const results = await Location.geocodeAsync(zipCode);
    
    if (results.length === 0) {
      return {
        success: false,
        error: 'ZIP code not found',
      };
    }

    return {
      success: true,
      latitude: results[0].latitude,
      longitude: results[0].longitude,
    };
  } catch (error) {
    console.log('Error geocoding ZIP code:', error);
    return {
      success: false,
      error: 'Failed to geocode ZIP code',
    };
  }
};

// Open device's default map app with directions
export const openMapDirections = (latitude: number, longitude: number, label?: string) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}${label ? `&destination_place_id=${encodeURIComponent(label)}` : ''}`;
  
  // This will open in the device's default browser, which will then redirect to the map app
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
};
