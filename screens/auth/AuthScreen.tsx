import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/ThemedText';
import { Checkbox } from '@/components/Checkbox';
import { db } from '@/services/db';
import { settingsManager } from '@/services/settingsManager';

const haptic = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
};

// Auth module subcomponents
import { AuthBrandingHeader } from './components/AuthBrandingHeader';
import { AuthSegmentedTabs } from './components/AuthSegmentedTabs';
import { SocialLoginButtons } from './components/SocialLoginButtons';

export function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Field focus states
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Field validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const backgroundColor = '#000000'; // Pure Black
  const cardColor = '#18181B';       // Zinc 900
  const borderColor = '#27272A';     // Zinc 800
  const matrixGreen = '#D4D4D4';     // Light Grey

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setNameError('');

    if (!email.includes('@')) {
      setEmailError('Enter a valid email address');
      isValid = false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    if (!isLogin && !name.trim()) {
      setNameError('Name is required');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      haptic.error();   // shake feedback on validation fail
      return;
    }

    setIsLoading(true);
    setError(null);
    haptic.medium();    // confirm press

    try {
      if (isLogin) {
        const result = await db.login(email, password);
        if (result.success) {
          haptic.success();
          router.replace('/');
        } else {
          haptic.error();
          setError(result.error || 'Invalid credentials');
        }
      } else {
        const result = await db.register(name, email, password);
        if (result.success) {
          haptic.success();
          router.replace('/');
        } else {
          haptic.error();
          setError(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      haptic.error();
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* Branding header */}
        <AuthBrandingHeader />

        {/* Heading Title */}
        <View style={styles.headerTextContainer}>
          <ThemedText style={styles.mainTitle}>Get Started now</ThemedText>
          <ThemedText variant="muted" style={styles.mainSubtitle}>
            {isLogin 
              ? 'Log in to your account to seamlessly browse, explore, and analyze your driving habits with Kinetix.'
              : 'Sign up for a new account to seamlessly browse, explore, and analyze your driving habits with Kinetix.'}
          </ThemedText>
        </View>

        {/* Segmented Login / Signup Toggle */}
        <AuthSegmentedTabs isLogin={isLogin} onToggle={(val) => { haptic.light(); setIsLogin(val); setError(null); }} />

        {/* Error Notification Banner */}
        {error && (
          <View style={styles.errorAlert}>
            <ThemedText variant="mono" style={styles.errorAlertText}>
              [ERROR] // {error.toUpperCase()}
            </ThemedText>
          </View>
        )}

        {/* Input Form Card */}
        <View style={styles.formContainer}>
          
          {/* Name Field (Sign Up Mode only) */}
          {!isLogin && (
            <View style={styles.inputWrapper}>
              <ThemedText style={styles.inputLabel}>Name</ThemedText>
              <View style={[
                styles.inputFieldContainer,
                { 
                  backgroundColor: cardColor, 
                  borderColor: nameError ? '#ef4444' : isNameFocused ? matrixGreen : borderColor 
                }
              ]}>
                <Ionicons name="person-outline" size={20} color="#71717A" style={styles.inputIcon} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#71717A"
                  style={styles.textInput}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  editable={!isLoading}
                />
              </View>
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>
          )}

          {/* Email Field */}
          <View style={styles.inputWrapper}>
            <ThemedText style={styles.inputLabel}>Email</ThemedText>
            <View style={[
              styles.inputFieldContainer,
              { 
                backgroundColor: cardColor, 
                borderColor: emailError ? '#ef4444' : isEmailFocused ? matrixGreen : borderColor 
              }
            ]}>
              <Ionicons name="mail-outline" size={20} color="#71717A" style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="test@kinetix.ai"
                placeholderTextColor="#71717A"
                style={styles.textInput}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                editable={!isLoading}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password Field */}
          <View style={styles.inputWrapper}>
            <ThemedText style={styles.inputLabel}>Password</ThemedText>
            <View style={[
              styles.inputFieldContainer,
              { 
                backgroundColor: cardColor, 
                borderColor: passwordError ? '#ef4444' : isPasswordFocused ? matrixGreen : borderColor 
              }
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color="#71717A" style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#71717A"
                style={styles.textInput}
                secureTextEntry
                autoCapitalize="none"
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                editable={!isLoading}
              />
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Option Row with Checkbox & Forgot Password */}
          <View style={styles.optionsRow}>
            <Checkbox checked={rememberMe} onValueChange={setRememberMe} label="Remember me" />
            <Pressable>
              <Text style={styles.forgotPasswordText}>Forget Password?</Text>
            </Pressable>
          </View>

          {/* Submit Button */}
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={matrixGreen} />
            </View>
          ) : (
            <Pressable 
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton, 
                { backgroundColor: '#D4D4D4' },
                pressed && styles.pressed
              ]}
            >
              <Text style={styles.submitButtonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
            </Pressable>
          )}

        </View>

        {/* Separator */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or Sign In With</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <SocialLoginButtons />

        {/* Navigation switch footer */}
        <View style={styles.toggleFooter}>
          <Text style={styles.footerNormalText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </Text>
          <Pressable onPress={() => { haptic.light(); setIsLogin(!isLogin); setError(null); }}>
            <Text style={[styles.footerLinkText, { color: matrixGreen }]}>
              {isLogin ? 'Sign up' : 'Login'}
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Custom simple Text Component for the segment buttons
import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerTextContainer: {
    gap: 8,
    marginBottom: 28,
    paddingTop: 18,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 40,
  },
  mainSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.7,
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorAlertText: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '700',
  },
  formContainer: {
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderWidth: 1.5,
    borderRadius: 27,
    paddingHorizontal: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    height: '100%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
  },
  submitButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  loaderContainer: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#27272A',
  },
  dividerText: {
    fontSize: 12,
    color: '#71717A',
    marginHorizontal: 16,
    fontWeight: '600',
  },
  toggleFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerNormalText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  footerLinkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});

export default AuthScreen;
