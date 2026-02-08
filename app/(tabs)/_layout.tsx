
import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  // Memoize tabs array to prevent recreation on every render
  const tabs: TabBarItem[] = useMemo(() => [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'map',
      label: 'Map',
    },
    {
      name: 'friends',
      route: '/(tabs)/friends',
      icon: 'people',
      label: 'Friends',
      iosIcon: 'person.2.fill', // Explicitly set guaranteed SF Symbol for iOS
    },
    {
      name: 'messages',
      route: '/(tabs)/messages',
      icon: 'mail',
      label: 'Messages',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ], []); // Empty dependency array - tabs never change

  // Memoize screenOptions to prevent recreation on every render
  const screenOptions = useMemo(() => ({
    headerShown: false,
    animation: 'none' as const,
  }), []); // Empty dependency array - options never change

  return (
    <>
      <Stack screenOptions={screenOptions}>
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="friends" name="friends" />
        <Stack.Screen key="messages" name="messages" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
