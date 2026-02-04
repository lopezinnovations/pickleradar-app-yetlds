
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleResetPassword = async () => {
    console.log('User tapped Reset Password button');

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Error', 'Please confirm your password');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log('Updating password in Supabase');
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.log('Password update error:', error);
        Alert.alert('Error', error.message || 'Failed to reset password. Please try again.');
        return;
      }

      console.log('Password updated successfully');

      // Clear form
      setNewPassword('');
      setConfirmPassword('');

      // Show success message and redirect to login
      Alert.alert(
        'Password Changed',
        'Your password has been changed successfully. You can now sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/auth');
            },
          },
        ]
      );
    } catch (error: any) {
      console.log('Unexpected error during password reset:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueWithoutResetting = () => {
    console.log('User chose to continue without resetting password');
    Alert.alert(
      'Continue Without Resetting?',
      'You can reset your password later from the Profile screen.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            router.replace('/(tabs)/(home)/');
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="chevron-left" 
            size={24} 
            color={colors.primary} 
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <IconSymbol 
              ios_icon_name="lock.shield.fill" 
              android_material_icon_name="lock" 
              size={48} 
              color={colors.primary} 
            />
          </View>
          <Text style={[commonStyles.title, { color: colors.primary }]}>
            Reset Password
          </Text>
          <Text style={commonStyles.textSecondary}>
            Create a new password for your account
          </Text>
          {email && (
            <Text style={styles.emailText}>
              {email}
            </Text>
          )}
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="At least 8 characters"
            placeholderTextColor={colors.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowNewPassword(!showNewPassword)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.showPasswordText}>
              {showNewPassword ? 'Hide Password' : 'Show Password'}
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
            style={styles.showPasswordButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.showPasswordText}>
              {showConfirmPassword ? 'Hide Password' : 'Show Password'}
            </Text>
          </TouchableOpacity>

          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirementRow}>
              <IconSymbol 
                ios_icon_name={newPassword.length >= 8 ? 'checkmark.circle.fill' : 'circle'} 
                android_material_icon_name={newPassword.length >= 8 ? 'check-circle' : 'radio-button-unchecked'} 
                size={20} 
                color={newPassword.length >= 8 ? colors.primary : colors.textSecondary} 
              />
              <Text style={[styles.requirementText, newPassword.length >= 8 && styles.requirementMet]}>
                At least 8 characters
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <IconSymbol 
                ios_icon_name={newPassword === confirmPassword && newPassword.length > 0 ? 'checkmark.circle.fill' : 'circle'} 
                android_material_icon_name={newPassword === confirmPassword && newPassword.length > 0 ? 'check-circle' : 'radio-button-unchecked'} 
                size={20} 
                color={newPassword === confirmPassword && newPassword.length > 0 ? colors.primary : colors.textSecondary} 
              />
              <Text style={[styles.requirementText, newPassword === confirmPassword && newPassword.length > 0 && styles.requirementMet]}>
                Passwords match
              </Text>
            </View>
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
              <Text style={buttonStyles.text}>
                Reset Password
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContinueWithoutResetting}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              Continue Without Resetting
            </Text>
          </TouchableOpacity>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
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
  showPasswordButton: {
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  showPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  requirementsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  requirementMet: {
    color: colors.primary,
    fontWeight: '500',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
