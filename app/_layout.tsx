
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/app/integrations/supabase/client';

export default function RootLayout() {
  useEffect(() => {
    // Handle deep links for password reset and email confirmation
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      
      // Parse the URL
      const url = Linking.parse(event.url);
      console.log('Parsed URL:', url);
      
      // Check if this is a password reset link
      if (url.path === 'reset-password' || url.hostname === 'reset-password') {
        console.log('Password reset deep link detected');
        
        // Verify we have a valid session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('Error getting session:', error);
        } else if (session) {
          console.log('Valid session found for password reset');
        } else {
          console.log('No session found - user may need to click the link again');
        }
        
        // The reset-password screen will handle session validation
      }
      
      // Check if this is an email confirmation link
      if (url.path === 'email-confirmed' || url.hostname === 'email-confirmed') {
        console.log('Email confirmation deep link detected');
        
        // Verify we have a valid session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('Error getting session:', error);
        } else if (session) {
          console.log('Valid session found for email confirmation');
        } else {
          console.log('No session found - user may need to click the link again');
        }
        
        // The email-confirmed screen will handle session validation
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('App opened with URL:', url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="confirm-email" />
      <Stack.Screen name="email-confirmed" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
