import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@kinetix_user_settings';

export interface UserSettings {
  hapticsEnabled: boolean;
  demoModeEnabled: boolean;
  notificationsEnabled: boolean;
  groqApiKey?: string;
  groqModel?: string;
}

const defaultSettings: UserSettings = {
  hapticsEnabled: true,
  demoModeEnabled: false,
  notificationsEnabled: true,
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile',
};

let cachedSettings: UserSettings = { ...defaultSettings };
let activeUserId: string | null = null;

export const settingsManager = {
  async init(userId?: string): Promise<UserSettings> {
    activeUserId = userId || null;
    const key = userId ? `${SETTINGS_KEY}_${userId}` : SETTINGS_KEY;
    try {
      const stored = await AsyncStorage.getItem(key);
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
    const key = activeUserId ? `${SETTINGS_KEY}_${activeUserId}` : SETTINGS_KEY;
    try {
      await AsyncStorage.setItem(key, JSON.stringify(cachedSettings));
    } catch (e) {
      console.error('[SettingsManager] Failed to save settings', e);
    }
    return cachedSettings;
  },
};

export default settingsManager;
