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
        // Hydrate local database session & registry, and load settings
        await Promise.all([
          db.init(),
          settingsManager.init(),
        ]);
        
        // Hydrate user specific drive logs history
        await driveManager.init();

        // ── KEY FIX: If the user is already authenticated (session restored from
        // disk), they must have completed onboarding in a previous session.
        // Skip showing onboarding again for returning users.
        if (db.isAuthenticated()) {
          launchManager.setOnboardingStatus(true);
          // Persist so future restarts also skip it
          await AsyncStorage.setItem(HAS_COMPLETED_ONBOARDING_KEY, 'true');
        }
        
        // Sync state from internal cache
        setHasCompletedOnboarding(launchManager.getOnboardingStatus());

        // If already cached in memory, skip reading from storage
        if (launchManager.getShownSplashStatus() && launchManager.getOnboardingStatus()) {
          setIsLoading(false);
          return;
        }

        const [splashVal, onboardingVal] = await Promise.all([
          AsyncStorage.getItem(HAS_SHOWN_SPLASH_KEY),
          AsyncStorage.getItem(HAS_COMPLETED_ONBOARDING_KEY)
        ]);

        if (splashVal === 'true') {
          launchManager.setShownSplashStatus(true);
          setHasShownSplash(true);
        }
        if (onboardingVal === 'true') {
          launchManager.setOnboardingStatus(true);
          setHasCompletedOnboarding(true);
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
