
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/app/integrations/supabase/client';

export default function RootLayout() {
  useEffect(() => {
    // Handle deep links for password reset
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      
      // Parse the URL
      const url = Linking.parse(event.url);
      console.log('Parsed URL:', url);
      
      // Check if this is a password reset link
      if (url.path === 'reset-password' || url.hostname === 'reset-password') {
        console.log('Password reset link detected');
        
        // Extract the token from the URL
        const params = url.queryParams;
        if (params && typeof params === 'object') {
          const token = params.token as string;
          const type = params.type as string;
          
          if (token && type === 'recovery') {
            console.log('Valid recovery token found, verifying...');
            
            // Verify the OTP token
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'recovery',
            });
            
            if (error) {
              console.error('Error verifying recovery token:', error);
            } else {
              console.log('Recovery token verified successfully:', data);
            }
          }
        }
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
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
