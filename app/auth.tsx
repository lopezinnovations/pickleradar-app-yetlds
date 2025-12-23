
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useAuth } from '@/hooks/useAuth';
import { IconSymbol } from '@/components/IconSymbol';
import { LegalFooter } from '@/components/LegalFooter';

export default function AuthScreen() {
  const router = useRouter();
  const { signInWithPhone, verifyOtp, isConfigured } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as +1 (XXX) XXX-XXXX for US numbers
    if (cleaned.length <= 1) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `+1 (${cleaned.slice(1)}`;
    } else if (cleaned.length <= 7) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4)}`;
    } else {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const getCleanPhoneNumber = (formatted: string) => {
    // Extract just the digits and add +1 prefix
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    return formatted;
  };

  const handleSendOtp = async () => {
    const cleanPhone = getCleanPhoneNumber(phoneNumber);
    
    if (!cleanPhone || cleanPhone.length < 12) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (isSignUp && !consentAccepted) {
      Alert.alert('Consent Required', 'You must agree to the Privacy Policy and Terms of Service to create an account.');
      return;
    }

    if (!isConfigured) {
      Alert.alert(
        'Supabase Required',
        'Please enable Supabase by pressing the Supabase button in Natively and connecting to a project to use authentication features.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithPhone(cleanPhone, isSignUp);
      
      if (result.success) {
        setOtpSent(true);
        Alert.alert(
          'Verification Code Sent',
          `We've sent a verification code to ${phoneNumber}. Please enter it below.`
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to send verification code. Please try again.');
      }
    } catch (error: any) {
      console.log('Send OTP error:', error);
      Alert.alert('Error', error?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanPhone = getCleanPhoneNumber(phoneNumber);
    
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOtp(cleanPhone, verificationCode, isSignUp, consentAccepted);
      
      if (result.success) {
        Alert.alert('Success', result.message || 'Successfully signed in!');
        router.replace('/(tabs)/(home)/');
      } else {
        Alert.alert('Verification Failed', result.message || 'Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      console.log('Verify OTP error:', error);
      Alert.alert('Error', error?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setVerificationCode('');
    await handleSendOtp();
  };

  const handleBack = () => {
    if (otpSent) {
      setOtpSent(false);
      setVerificationCode('');
    } else {
      router.back();
    }
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
            android_material_icon_name="chevron_left" 
            size={24} 
            color={colors.primary} 
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Image 
            source={require('@/assets/images/d00ee021-be7a-42f9-a115-ea45cb937f7f.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[commonStyles.title, { color: colors.primary }]}>
            {otpSent ? 'Enter Verification Code' : (isSignUp ? 'Create Account' : 'Welcome Back')}
          </Text>
          <Text style={commonStyles.textSecondary}>
            {otpSent 
              ? `We sent a code to ${phoneNumber}` 
              : (isSignUp ? 'Sign up to start finding courts' : 'Sign in to continue')
            }
          </Text>
        </View>

        <View style={styles.form}>
          {!otpSent ? (
            <React.Fragment>
              <TextInput
                style={commonStyles.input}
                placeholder="Phone Number"
                placeholderTextColor={colors.textSecondary}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                maxLength={18}
              />

              {isSignUp && (
                <View style={styles.consentContainer}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setConsentAccepted(!consentAccepted)}
                    disabled={loading}
                  >
                    <View style={[styles.checkbox, consentAccepted && styles.checkboxChecked]}>
                      {consentAccepted && (
                        <IconSymbol 
                          ios_icon_name="checkmark" 
                          android_material_icon_name="check" 
                          size={16} 
                          color={colors.card} 
                        />
                      )}
                    </View>
                    <View style={styles.consentTextContainer}>
                      <Text style={styles.consentText}>
                        I agree to the{' '}
                        <Text 
                          style={styles.consentLink}
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push('/legal/privacy-policy');
                          }}
                        >
                          Privacy Policy
                        </Text>
                        {' '}and{' '}
                        <Text 
                          style={styles.consentLink}
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push('/legal/terms-of-service');
                          }}
                        >
                          Terms of Service
                        </Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[
                  buttonStyles.primary, 
                  { marginTop: 8 }, 
                  (loading || (isSignUp && !consentAccepted)) && { opacity: 0.6 }
                ]}
                onPress={handleSendOtp}
                disabled={loading || (isSignUp && !consentAccepted)}
              >
                {loading ? (
                  <ActivityIndicator color={colors.card} />
                ) : (
                  <Text style={buttonStyles.text}>
                    Send Verification Code
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                  setIsSignUp(!isSignUp);
                  setConsentAccepted(false);
                }}
                disabled={loading}
              >
                <Text style={commonStyles.textSecondary}>
                  {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
                  <Text style={styles.switchButtonText}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <TextInput
                style={[commonStyles.input, styles.otpInput]}
                placeholder="000000"
                placeholderTextColor={colors.textSecondary}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                maxLength={6}
                textAlign="center"
              />

              <TouchableOpacity
                style={[
                  buttonStyles.primary, 
                  { marginTop: 8 }, 
                  loading && { opacity: 0.6 }
                ]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.card} />
                ) : (
                  <Text style={buttonStyles.text}>
                    Verify & Continue
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOtp}
                disabled={loading}
              >
                <Text style={styles.resendButtonText}>
                  Didn&apos;t receive a code? Resend
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          )}
        </View>

        {!isConfigured && (
          <View style={[commonStyles.card, { backgroundColor: colors.accent, marginTop: 20 }]}>
            <View style={styles.warningHeader}>
              <IconSymbol 
                ios_icon_name="exclamationmark.triangle.fill" 
                android_material_icon_name="warning" 
                size={24} 
                color={colors.card} 
              />
              <Text style={[commonStyles.subtitle, { marginLeft: 12, color: colors.card }]}>
                Supabase Required
              </Text>
            </View>
            <Text style={[commonStyles.textSecondary, { marginTop: 12, color: colors.card }]}>
              To use authentication and all features, please enable Supabase by pressing the Supabase button 
              in Natively and connecting to a project.
            </Text>
          </View>
        )}

        <LegalFooter />
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
  logo: {
    width: 96,
    height: 96,
    marginBottom: 16,
  },
  form: {
    width: '100%',
  },
  consentContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  consentTextContainer: {
    flex: 1,
  },
  consentText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  consentLink: {
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  otpInput: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 8,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
