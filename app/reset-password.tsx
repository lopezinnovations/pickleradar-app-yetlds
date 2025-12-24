
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidSession(true);
      } else {
        Alert.alert(
          'Invalid Link',
          'This password reset link is invalid or has expired. Please request a new one.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth'),
            },
          ]
        );
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
        Alert.alert(
          'Success',
          'Your password has been updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/(home)/'),
            },
          ]
        );
      } else {
        console.log('ResetPasswordScreen: Password update failed:', result.message);
        Alert.alert('Error', result.message || 'Failed to update password. Please try again.');
      }
    } catch (error: any) {
      console.log('ResetPasswordScreen: Password update error:', error);
      Alert.alert('Error', error?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasValidSession) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.textSecondary, { marginTop: 16 }]}>
          Verifying reset link...
        </Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol 
              ios_icon_name="lock.shield.fill" 
              android_material_icon_name="lock_reset" 
              size={64} 
              color={colors.primary} 
            />
          </View>
          <Text style={[commonStyles.title, { color: colors.primary }]}>
            Reset Password
          </Text>
          <Text style={commonStyles.textSecondary}>
            Enter your new password below
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[commonStyles.input, styles.passwordInput]}
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
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <IconSymbol
                ios_icon_name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                android_material_icon_name={showPassword ? 'visibility_off' : 'visibility'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[commonStyles.input, styles.passwordInput]}
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
              style={styles.showPasswordButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              <IconSymbol
                ios_icon_name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                android_material_icon_name={showConfirmPassword ? 'visibility_off' : 'visibility'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              buttonStyles.primary, 
              { marginTop: 24 }, 
              loading && { opacity: 0.6 }
            ]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <React.Fragment>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={20} 
                  color={colors.card} 
                />
                <Text style={[buttonStyles.text, { marginLeft: 8 }]}>
                  Update Password
                </Text>
              </React.Fragment>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.replace('/auth')}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[commonStyles.card, { backgroundColor: colors.highlight, marginTop: 32 }]}>
          <View style={styles.tipHeader}>
            <IconSymbol 
              ios_icon_name="lightbulb.fill" 
              android_material_icon_name="lightbulb" 
              size={20} 
              color={colors.primary} 
            />
            <Text style={[commonStyles.subtitle, { marginLeft: 8 }]}>
              Password Tips
            </Text>
          </View>
          <Text style={[commonStyles.textSecondary, { marginTop: 12, lineHeight: 22 }]}>
            - Use at least 6 characters{'\n'}
            - Mix uppercase and lowercase letters{'\n'}
            - Include numbers and special characters{'\n'}
            - Avoid common words or patterns
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
  },
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
