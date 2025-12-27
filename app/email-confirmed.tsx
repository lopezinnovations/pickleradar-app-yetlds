
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

export default function EmailConfirmedScreen() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    handleEmailConfirmation();
  }, []);

  const handleEmailConfirmation = async () => {
    console.log('EmailConfirmedScreen: Handling email confirmation...');
    
    try {
      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user is now authenticated
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('EmailConfirmedScreen: Error getting session:', error);
        throw error;
      }

      if (session?.user) {
        console.log('EmailConfirmedScreen: User authenticated successfully:', session.user.email);
        setSuccess(true);
        setVerifying(false);

        // Show success message for 2 seconds before redirecting
        setTimeout(() => {
          console.log('EmailConfirmedScreen: Redirecting to home...');
          router.replace('/(tabs)/(home)/');
        }, 2000);
      } else {
        console.log('EmailConfirmedScreen: No session found, redirecting to auth...');
        setVerifying(false);
        setTimeout(() => {
          router.replace('/auth');
        }, 1500);
      }
    } catch (error) {
      console.log('EmailConfirmedScreen: Error during confirmation:', error);
      setVerifying(false);
      setTimeout(() => {
        router.replace('/auth');
      }, 1500);
    }
  };

  if (verifying) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>Verifying your email...</Text>
        </View>
      </View>
    );
  }

  if (success) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.content}>
          <View style={styles.successIconContainer}>
            <IconSymbol 
              ios_icon_name="checkmark.circle.fill" 
              android_material_icon_name="check_circle" 
              size={80} 
              color={colors.primary} 
            />
          </View>

          <Text style={styles.title}>Your email has been successfully confirmed.</Text>

          <Text style={styles.subtitle}>
            You now have full functionality and access to PickleRadar.
          </Text>

          <Text style={[styles.message, { marginTop: 24 }]}>
            Redirecting you to the app...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.content}>
        <Text style={styles.message}>Redirecting...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
