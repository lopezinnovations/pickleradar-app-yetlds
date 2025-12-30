
import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/app/integrations/supabase/client';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep links for magic link and password reset
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      
      // Parse the URL
      const url = Linking.parse(event.url);
      console.log('Parsed URL:', url);
      
      // Check if this is a magic link
      if (url.path === 'magic-link' || url.hostname === 'magic-link') {
        console.log('Magic link deep link detected');
        
        // Verify we have a valid session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('Error getting session:', error);
        } else if (session) {
          console.log('Valid session found for magic link');
          // Navigate directly to home with success message
          router.replace('/(tabs)/(home)/');
        } else {
          console.log('No session found - user may need to click the link again');
        }
        return;
      }
      
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
        
        // Navigate directly to the reset-password screen
        console.log('Navigating to reset-password screen...');
        router.replace('/reset-password');
        return;
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
        
        // Navigate directly to the email-confirmed screen
        console.log('Navigating to email-confirmed screen...');
        router.replace('/email-confirmed');
        return;
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
  }, [router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="confirm-email" />
      <Stack.Screen name="email-confirmed" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="magic-link" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
