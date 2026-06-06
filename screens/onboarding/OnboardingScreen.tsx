import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { launchManager } from '@/services/launchManager';
import { db } from '@/services/db';
import { settingsManager } from '@/services/settingsManager';

// Step subcomponents
import { OnboardingStepOne } from './components/OnboardingStepOne';
import { OnboardingStepTwo } from './components/OnboardingStepTwo';
import { OnboardingStepAvatar } from './components/OnboardingStepAvatar';
import { OnboardingStepThree } from './components/OnboardingStepThree';

export function OnboardingScreen() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  // Avatar choice state
  const [avatarUrl, setAvatarUrl] = useState('🚗');

  // Vehicle form state for step 4
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [brandError, setBrandError] = useState('');
  const [modelError, setModelError] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const totalSteps = 4;
  const matrixGreen = '#D4D4D4';     // Light Grey
  const backgroundColor = '#000000'; // Pure Black
  const hapticsEnabled = settingsManager.getSettings().hapticsEnabled;

  useEffect(() => {
    // Reset and trigger transition animation when changing steps
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeStep]);

  const validateVehicleForm = () => {
    let isValid = true;
    setBrandError('');
    setModelError('');

    if (!brand.trim()) {
      setBrandError('Vehicle brand is required');
      isValid = false;
    }
    if (!model.trim()) {
      setModelError('Vehicle model is required');
      isValid = false;
    }
    return isValid;
  };

  const handleNext = async () => {
    // Play haptic feedback
    if (hapticsEnabled) {
      try {
        if (activeStep === totalSteps - 1) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch {}
    }

    if (activeStep < totalSteps - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      // Validate step 4 vehicle details
      if (!validateVehicleForm()) return;
      
      // Save avatar
      db.updateUserAvatar(avatarUrl);
      
      // Save vehicle details to pilot profile
      db.updateUserVehicle(brand, model);
      
      // Save onboarding completion state
      launchManager.completeOnboarding();
      router.replace('/');
    }
  };

  const handleBack = async () => {
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <OnboardingStepOne />;
      case 1:
        return <OnboardingStepTwo />;
      case 2:
        return (
          <OnboardingStepAvatar
            selectedAvatar={avatarUrl}
            onSelectAvatar={setAvatarUrl}
            hapticsEnabled={hapticsEnabled}
          />
        );
      case 3:
        return (
          <OnboardingStepThree
            brand={brand}
            onChangeBrand={setBrand}
            model={model}
            onChangeModel={setModel}
            brandError={brandError}
            modelError={modelError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Header branding info */}
          <View style={styles.header}>
            <Text style={styles.logo}>KINETIX</Text>
          </View>

          {/* Dynamic Step Content with Transitions */}
          <Animated.View style={[styles.stepContentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {renderStepContent()}
          </Animated.View>

          {/* Stepper Footer Controls */}
          <View style={styles.footer}>
            {/* Step indicator dots & Back Button */}
            <View style={styles.footerLeft}>
              {activeStep > 0 ? (
                <Pressable onPress={handleBack} style={styles.backButton}>
                  <Text style={styles.backButtonText}>BACK</Text>
                </Pressable>
              ) : (
                <View style={styles.dotsContainer}>
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i === activeStep 
                          ? [styles.dotActive, { backgroundColor: matrixGreen }] 
                          : styles.dotInactive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Indicator dots shown next to Back button on later steps */}
            {activeStep > 0 && (
              <View style={[styles.dotsContainer, { marginRight: 16 }]}>
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === activeStep 
                        ? [styles.dotActive, { backgroundColor: matrixGreen }] 
                        : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Action button (Matrix Green background, black text) */}
            <Pressable 
              onPress={handleNext} 
              style={[styles.nextButton, { backgroundColor: '#D4D4D4' }]}
            >
              <Text style={styles.nextButtonText}>
                {activeStep === totalSteps - 1 ? 'START ENGINE' : 'NEXT'}
              </Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 32,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
  },
  logo: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 14,
    color: '#ffffff',
    letterSpacing: 2,
  },
  stepContentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    marginTop: 20,
  },
  footerLeft: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backButton: {
    paddingVertical: 12,
    paddingRight: 24,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 24,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#27272A',
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 27,
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});

export default OnboardingScreen;
