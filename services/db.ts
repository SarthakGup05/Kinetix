/**
 * Local database simulation service for users and session state — Offline Persistent.
 */
import { User } from '@/types/index';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_SESSION_KEY = '@kinetix_active_session';
const USER_REGISTRY_KEY  = '@kinetix_user_registry';

// Default mock pilot profile prepopulated for testing
const defaultUser: User = {
  id: 'usr_01',
  name: 'Test Pilot',
  email: 'test@kinetix.ai',
  createdAt: new Date().toISOString(),
  vehicleBrand: 'Porsche',
  vehicleModel: 'Taycan',
  hasCompletedOnboarding: true,
};

const usersTable = new Map<string, { user: User; passwordHash: string }>();
let currentSessionUser: User | null = null;

export const db = {
  /**
   * Hydrate in-memory database and session state from local disk storage
   */
  async init(): Promise<void> {
    try {
      const [registryStr, sessionStr] = await Promise.all([
        AsyncStorage.getItem(USER_REGISTRY_KEY),
        AsyncStorage.getItem(ACTIVE_SESSION_KEY),
      ]);

      usersTable.clear();

      if (registryStr) {
        const list: { user: User; passwordHash: string }[] = JSON.parse(registryStr);
        list.forEach((item) => {
          usersTable.set(item.user.email.toLowerCase(), item);
        });
      } else {
        // Prepopulate registry with default pilot so it works out of the box
        const defaultEntry = { user: defaultUser, passwordHash: 'password123' };
        usersTable.set(defaultUser.email.toLowerCase(), defaultEntry);
        await AsyncStorage.setItem(USER_REGISTRY_KEY, JSON.stringify([defaultEntry]));
      }

      if (sessionStr) {
        currentSessionUser = JSON.parse(sessionStr);
      } else {
        currentSessionUser = null;
      }
    } catch (e) {
      console.error('[DB] Failed to hydrate offline database', e);
    }
  },

  /**
   * Save user registry to disk
   */
  async saveRegistryToDisk(): Promise<void> {
    try {
      const list = Array.from(usersTable.values());
      await AsyncStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('[DB] Failed to save user registry to disk', e);
    }
  },

  /**
   * Register a new user and save to local storage
   */
  async register(name: string, email: string, passwordHash: string): Promise<{ success: boolean; error?: string; user?: User }> {
    // Simulate database write delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const emailKey = email.toLowerCase().trim();
    if (usersTable.has(emailKey)) {
      return { success: false, error: 'User already exists' };
    }

    const newUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      email: emailKey,
      createdAt: new Date().toISOString(),
    };

    usersTable.set(emailKey, { user: newUser, passwordHash });
    await this.saveRegistryToDisk();

    currentSessionUser = newUser;
    try {
      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.error('[DB] Failed to write session to disk', e);
    }

    return { success: true, user: newUser };
  },

  /**
   * Login an existing user and save active session
   */
  async login(email: string, passwordHash: string): Promise<{ success: boolean; error?: string; user?: User }> {
    // Simulate database query delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const emailKey = email.toLowerCase().trim();
    const entry = usersTable.get(emailKey);

    if (!entry || entry.passwordHash !== passwordHash) {
      return { success: false, error: 'Invalid email or password' };
    }

    currentSessionUser = entry.user;
    try {
      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(entry.user));
    } catch (e) {
      console.error('[DB] Failed to write session to disk', e);
    }

    return { success: true, user: entry.user };
  },

  /**
   * Log out and delete active session from disk
   */
  async logout(): Promise<void> {
    currentSessionUser = null;
    try {
      await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch (e) {
      console.error('[DB] Failed to delete active session', e);
    }
  },

  /**
   * Retrieve active session user
   */
  getCurrentUser(): User | null {
    return currentSessionUser;
  },

  /**
   * Check if a user is authenticated
   */
  isAuthenticated(): boolean {
    return currentSessionUser !== null;
  },

  /**
   * Update active user's vehicle details
   */
  updateUserVehicle(brand: string, model: string): void {
    if (currentSessionUser) {
      currentSessionUser.vehicleBrand = brand.trim();
      currentSessionUser.vehicleModel = model.trim();
      currentSessionUser.hasCompletedOnboarding = true;

      const entry = usersTable.get(currentSessionUser.email.toLowerCase());
      if (entry) {
        entry.user.vehicleBrand = brand.trim();
        entry.user.vehicleModel = model.trim();
        entry.user.hasCompletedOnboarding = true;
        this.saveRegistryToDisk(); // Save registry updates in background
      }

      AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(currentSessionUser)).catch((e) => {
        console.error('[DB] Failed to sync session vehicle details', e);
      });
    }
  },

  /**
   * Update active user's profile details (name and email)
   */
  async updateUserProfile(name: string, email: string): Promise<{ success: boolean; error?: string }> {
    if (!currentSessionUser) {
      return { success: false, error: 'No active session' };
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return { success: false, error: 'Name cannot be empty' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Invalid email address' };
    }

    const oldEmail = currentSessionUser.email.toLowerCase();

    // If email is changing, check for duplicates
    if (oldEmail !== trimmedEmail && usersTable.has(trimmedEmail)) {
      return { success: false, error: 'Email is already registered by another account' };
    }

    const entry = usersTable.get(oldEmail);
    if (!entry) {
      return { success: false, error: 'User details not found in database registry' };
    }

    // Update in-memory user details
    currentSessionUser.name = trimmedName;
    currentSessionUser.email = trimmedEmail;

    // Update table entry
    entry.user.name = trimmedName;
    entry.user.email = trimmedEmail;

    if (oldEmail !== trimmedEmail) {
      usersTable.delete(oldEmail);
      usersTable.set(trimmedEmail, entry);
    }

    await this.saveRegistryToDisk();

    try {
      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(currentSessionUser));
    } catch (e) {
      console.error('[DB] Failed to save updated session to disk', e);
    }

    return { success: true };
  },

  /**
   * Update active user's avatar URL/emoji
   */
  updateUserAvatar(avatarUrl: string): void {
    if (currentSessionUser) {
      currentSessionUser.avatarUrl = avatarUrl;

      const entry = usersTable.get(currentSessionUser.email.toLowerCase());
      if (entry) {
        entry.user.avatarUrl = avatarUrl;
        this.saveRegistryToDisk();
      }

      AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(currentSessionUser)).catch((e) => {
        console.error('[DB] Failed to sync session avatar details', e);
      });
    }
  },

  /**
   * Delete active user's account from offline persistent registry database
   */
  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    if (!currentSessionUser) {
      return { success: false, error: 'No active session' };
    }
    const emailKey = currentSessionUser.email.toLowerCase();
    usersTable.delete(emailKey);
    await this.saveRegistryToDisk();
    await this.logout();
    return { success: true };
  },
};

export default db;
