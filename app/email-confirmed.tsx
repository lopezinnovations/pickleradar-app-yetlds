
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { BrandingFooter } from '@/components/BrandingFooter';

export default function EmailConfirmedScreen() {
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);

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
        
        // Fetch user profile to get first name
        const { data: profile } = await supabase
          .from('users')
          .select('first_name')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.first_name) {
          setFirstName(profile.first_name);
        }
        
        setSuccess(true);
        setVerifying(false);
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

  const handleReturnHome = () => {
    console.log('EmailConfirmedScreen: Returning to home...');
    router.replace('/(tabs)/(home)/');
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
          <Image 
            source={require('@/assets/images/d00ee021-be7a-42f9-a115-ea45cb937f7f.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.successIconContainer}>
            <IconSymbol 
              ios_icon_name="checkmark.circle.fill" 
              android_material_icon_name="check_circle" 
              size={64} 
              color={colors.primary} 
            />
          </View>

          <Text style={styles.title}>Great! Your email has been successfully confirmed.</Text>

          <Text style={styles.subtitle}>
            You can now return to your app.
          </Text>

          <TouchableOpacity
            style={[buttonStyles.primary, { marginTop: 32, width: '100%', maxWidth: 300 }]}
            onPress={handleReturnHome}
            activeOpacity={0.8}
          >
            <Text style={buttonStyles.text}>Return to Home Page</Text>
          </TouchableOpacity>

          {firstName && (
            <View style={styles.welcomeBox}>
              <Text style={styles.welcomeText}>
                Welcome back, {firstName}!
              </Text>
              <Text style={styles.welcomeSubtext}>
                Enjoy PickleRadar.
              </Text>
            </View>
          )}
        </View>

        <BrandingFooter />
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
  },
  welcomeBox: {
    backgroundColor: colors.highlight,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 32,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
});
