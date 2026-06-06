import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import HomeScreen from "@/screens/home/HomeScreen";
import { db } from '@/services/db';
import { driveManager } from '@/services/driveManager';
import { AnimatedSplashScreen } from '@/screens/splash/AnimatedSplashScreen';
import { launchManager } from '@/services/launchManager';
import { settingsManager } from '@/services/settingsManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_SHOWN_SPLASH_KEY = '@kinetix_has_shown_splash';
const HAS_COMPLETED_ONBOARDING_KEY = '@kinetix_has_completed_onboarding';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownSplash, setHasShownSplash] = useState(launchManager.getShownSplashStatus());
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(launchManager.getOnboardingStatus());

  useEffect(() => {
    async function loadLaunchSettings() {
      try {
        // 1. Hydrate local database session & registry first
        await db.init();

        // 2. Load user-specific settings if a user is logged in
        const currentUser = db.getCurrentUser();
        await settingsManager.init(currentUser?.id);
        
        // 3. Hydrate user specific drive logs history
        await driveManager.init();

        // ── KEY FIX: Check onboarding status directly from the user profile database record
        const userCompletedOnboarding = db.isAuthenticated() && !!currentUser?.hasCompletedOnboarding;
        
        launchManager.setOnboardingStatus(userCompletedOnboarding);
        setHasCompletedOnboarding(userCompletedOnboarding);

        // Skip reading splash status from disk if already cached in memory
        if (launchManager.getShownSplashStatus()) {
          setIsLoading(false);
          return;
        }

        const splashVal = await AsyncStorage.getItem(HAS_SHOWN_SPLASH_KEY);
        if (splashVal === 'true') {
          launchManager.setShownSplashStatus(true);
          setHasShownSplash(true);
        }
      } catch (e) {
        console.error('[Index] Failed to retrieve launch settings', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadLaunchSettings();
  }, []);

  const handleSplashComplete = async () => {
    try {
      launchManager.setShownSplashStatus(true);
      setHasShownSplash(true);
      await AsyncStorage.setItem(HAS_SHOWN_SPLASH_KEY, 'true');
    } catch (e) {
      console.error('[Index] Failed to save splash completion status', e);
    }
  };

  if (isLoading) {
    // Render a blank dark view for a few milliseconds while reading storage
    return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
  }

  // 1. If we haven't shown the animated splash screen yet, run it.
  if (!hasShownSplash) {
    return <AnimatedSplashScreen onComplete={handleSplashComplete} />;
  }

  // 2. Auth redirect flow (pre-authenticated by default for ease of dev)
  if (!db.isAuthenticated()) {
    return <Redirect href="/auth" />;
  }

  // 3. If onboarding is not completed, redirect to it.
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  // 4. Go straight to Home Dashboard
  return <HomeScreen />;
}
