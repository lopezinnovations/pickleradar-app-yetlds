
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { IconSymbol } from '@/components/IconSymbol';
import { BrandingFooter } from '@/components/BrandingFooter';
import { supabase } from '@/app/integrations/supabase/client';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      console.log('ResetPasswordScreen: Checking session...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('ResetPasswordScreen: Session error:', error);
          Alert.alert(
            'Session Error',
            'Unable to verify your password reset session. Please request a new password reset link.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/auth'),
              },
            ]
          );
          return;
        }

        if (!session) {
          console.log('ResetPasswordScreen: No session found');
          Alert.alert(
            'Invalid Session',
            'Your password reset link has expired or is invalid. Please request a new password reset link.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/auth'),
              },
            ]
          );
          return;
        }

        console.log('ResetPasswordScreen: Valid session found');
        setSessionReady(true);

        // Fetch user's first name for welcome message
        if (session.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('first_name')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.first_name) {
            setFirstName(profile.first_name);
          }
        }
      } catch (error) {
        console.log('ResetPasswordScreen: Error checking session:', error);
        Alert.alert(
          'Error',
          'An error occurred. Please try again.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth'),
            },
          ]
        );
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [router]);

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log('ResetPasswordScreen: Updating password...');
      
      const result = await updatePassword(newPassword);
      
      if (result.success) {
        console.log('ResetPasswordScreen: Password updated successfully');
        setSuccess(true);
        
        // Redirect to home after showing success message
        setTimeout(() => {
          router.replace('/(tabs)/(home)/');
        }, 3000);
      } else {
        console.log('ResetPasswordScreen: Password update failed:', result.message);
        Alert.alert('Error', result.message || 'Failed to update password. Please try again.');
      }
    } catch (error: any) {
      console.log('ResetPasswordScreen: Password update error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (loading && !sessionReady) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.textSecondary, { marginTop: 16 }]}>
          Verifying your password reset link...
        </Text>
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

          <Text style={styles.title}>Password Reset Successful!</Text>

          <Text style={styles.subtitle}>
            Your password has been updated successfully.
          </Text>

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

          <Text style={[styles.message, { marginTop: 24 }]}>
            Redirecting you to the app...
          </Text>
        </View>

        <BrandingFooter />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace('/auth')}
        >
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="chevron_left" 
            size={24} 
            color={colors.primary} 
          />
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>

        <Image 
          source={require('@/assets/images/d00ee021-be7a-42f9-a115-ea45cb937f7f.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={[commonStyles.title, { color: colors.primary }]}>
          Reset Your Password
        </Text>

        <Text style={commonStyles.textSecondary}>
          Enter your new password below
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.seePasswordButton}
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.seePasswordText}>
              {showPassword ? 'Hide Password' : 'See Password'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Re-enter your password"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.seePasswordButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.seePasswordText}>
              {showConfirmPassword ? 'Hide Password' : 'See Password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.primary, { marginTop: 24 }]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <Text style={buttonStyles.text}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <BrandingFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  form: {
    width: '100%',
    marginTop: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  seePasswordButton: {
    marginTop: -8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  seePasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
