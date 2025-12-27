
import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { supabase, isSupabaseConfigured } from '@/app/integrations/supabase/client';
import { colors } from '@/styles/commonStyles';

export default function LandingScreen() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Only check auth once on mount
    if (hasCheckedAuth.current) {
      return;
    }
    hasCheckedAuth.current = true;
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('LandingScreen: Checking authentication status...');
    
    if (!isSupabaseConfigured()) {
      console.log('LandingScreen: Supabase not configured, redirecting to welcome');
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('LandingScreen: Error getting session:', error);
        setIsAuthenticated(false);
      } else if (session?.user) {
        console.log('LandingScreen: User session found:', session.user.email);
        
        // Check if email is confirmed
        if (session.user.email_confirmed_at) {
          console.log('LandingScreen: Email confirmed, user is authenticated');
          setIsAuthenticated(true);
        } else {
          console.log('LandingScreen: Email not confirmed, redirecting to confirm-email');
          setNeedsEmailConfirmation(true);
          setUserEmail(session.user.email);
        }
      } else {
        console.log('LandingScreen: No active session');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('LandingScreen: Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on authentication status
  if (needsEmailConfirmation) {
    return <Redirect href={{ pathname: '/confirm-email', params: { email: userEmail } }} />;
  } else if (isAuthenticated) {
    return <Redirect href="/(tabs)/(home)/" />;
  } else {
    return <Redirect href="/welcome" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
