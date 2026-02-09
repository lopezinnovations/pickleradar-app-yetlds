
import { Stack } from 'expo-router';
import { useMemo } from 'react';

export default function HomeLayout() {
  // Memoize screenOptions to prevent recreation on every render
  const screenOptions = useMemo(() => ({
    headerShown: false,
    animation: 'slide_from_right' as const,
  }), []); // Empty dependency array - options never change

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" />
      <Stack.Screen name="court/[id]" />
      <Stack.Screen name="courts-map" />
    </Stack>
  );
}
