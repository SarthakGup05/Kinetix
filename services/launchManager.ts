import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_SHOWN_SPLASH_KEY = '@kinetix_has_shown_splash';
const HAS_COMPLETED_ONBOARDING_KEY = '@kinetix_has_completed_onboarding';

let hasCompletedOnboardingInMemory = false;
let hasShownSplashInMemory = false;

export const launchManager = {
  getOnboardingStatus() {
    return hasCompletedOnboardingInMemory;
  },
  setOnboardingStatus(val: boolean) {
    hasCompletedOnboardingInMemory = val;
  },
  getShownSplashStatus() {
    return hasShownSplashInMemory;
  },
  setShownSplashStatus(val: boolean) {
    hasShownSplashInMemory = val;
  },
  completeOnboarding() {
    hasCompletedOnboardingInMemory = true;
    AsyncStorage.setItem(HAS_COMPLETED_ONBOARDING_KEY, 'true').catch((err) =>
      console.error('[LaunchManager] Failed to save onboarding status', err)
    );
  },
  resetLaunchStatus() {
    hasCompletedOnboardingInMemory = false;
    hasShownSplashInMemory = false;
  }
};
