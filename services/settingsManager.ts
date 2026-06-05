import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@kinetix_user_settings';

export interface UserSettings {
  hapticsEnabled: boolean;
  demoModeEnabled: boolean;
  notificationsEnabled: boolean;
}

const defaultSettings: UserSettings = {
  hapticsEnabled: true,
  demoModeEnabled: false,
  notificationsEnabled: true,
};

let cachedSettings: UserSettings = { ...defaultSettings };

export const settingsManager = {
  async init(): Promise<UserSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        cachedSettings = { ...defaultSettings, ...JSON.parse(stored) };
      } else {
        cachedSettings = { ...defaultSettings };
      }
    } catch (e) {
      console.error('[SettingsManager] Failed to load settings', e);
    }
    return cachedSettings;
  },

  getSettings(): UserSettings {
    return cachedSettings;
  },

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    cachedSettings = { ...cachedSettings, ...updates };
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(cachedSettings));
    } catch (e) {
      console.error('[SettingsManager] Failed to save settings', e);
    }
    return cachedSettings;
  },
};

export default settingsManager;
