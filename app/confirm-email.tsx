
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string | undefined;
  const [loading, setLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'No email address found. Please sign up again.');
      return;
    }

    setLoading(true);
    setResendSuccess(false);

    try {
      console.log('ConfirmEmailScreen: Resending confirmation email to:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      if (error) {
        console.log('ConfirmEmailScreen: Resend error:', error);
        throw error;
      }

      console.log('ConfirmEmailScreen: Confirmation email resent successfully');
      setResendSuccess(true);
      Alert.alert(
        'Email Sent',
        'A new confirmation email has been sent. Please check your inbox and spam folder.'
      );
    } catch (error: any) {
      console.log('ConfirmEmailScreen: Resend error:', error);
      Alert.alert(
        'Error',
        'Failed to resend confirmation email. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.replace('/auth');
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol 
            ios_icon_name="envelope.fill" 
            android_material_icon_name="mail" 
            size={80} 
            color={colors.primary} 
          />
        </View>

        <Text style={styles.title}>Almost done!</Text>

        <Text style={styles.message}>
          Please check your email and confirm your address to activate your account.
        </Text>

        {email && (
          <Text style={styles.email}>{email}</Text>
        )}

        <Text style={[styles.message, { marginTop: 16 }]}>
          Click the confirmation link in your email to unlock full access to PickleRadar.
        </Text>

        <Text style={[styles.message, { marginTop: 16, fontSize: 14, fontStyle: 'italic' }]}>
          Don&apos;t forget to check your spam folder!
        </Text>

        <View style={styles.accessNote}>
          <IconSymbol 
            ios_icon_name="lock.fill" 
            android_material_icon_name="lock" 
            size={20} 
            color={colors.primary} 
          />
          <Text style={[styles.message, { marginLeft: 8, fontSize: 14 }]}>
            Access will unlock after confirmation
          </Text>
        </View>

        {resendSuccess && (
          <View style={styles.successBanner}>
            <IconSymbol 
              ios_icon_name="checkmark.circle.fill" 
              android_material_icon_name="check_circle" 
              size={20} 
              color={colors.card} 
            />
            <Text style={styles.successText}>Email sent successfully!</Text>
          </View>
        )}

        <TouchableOpacity
          style={[buttonStyles.primary, { marginTop: 32 }]}
          onPress={handleResendEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={buttonStyles.text}>Resend Confirmation Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToSignIn}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Back to Sign In</Text>
        </TouchableOpacity>
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
    paddingTop: 48,
  },
  iconContainer: {
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
    marginBottom: 24,
    lineHeight: 32,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
  accessNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.highlight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 24,
  },
});
