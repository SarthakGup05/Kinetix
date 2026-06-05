/**
 * Drive session and scoring telematics manager.
 * Oversees active drive cycles, G-force threshold evaluations, and local ride history.
 */
import { sensorManager, type SensorData } from './sensorManager';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './db';

export interface DriveEvent {
  id: string;
  timestamp: string;
  type: 'braking' | 'acceleration' | 'turn' | 'phone_handling';
  points: number;
  description: string;
}

export interface DriveSession {
  id: string;
  timestamp: string;
  durationSeconds: number;
  distanceKm: number;
  startScore: number;
  finalScore: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  deductions: {
    braking: number;
    accel: number;
    turns: number;
    handling: number;
  };
  eventLogs: DriveEvent[];
}

// Global active session state
let activeSession: DriveSession | null = null;
let activeSubscription: (() => void) | null = null;
let durationInterval: ReturnType<typeof setInterval> | null = null;

// Event trigger cooldowns (in milliseconds)
const COOLDOWN_DURATION = 3500;
const lastTriggerTimes = {
  braking: 0,
  acceleration: 0,
  turn: 0,
  phone_handling: 0,
};

// In-memory drive history populated with premium telemetry details
let driveHistory: DriveSession[] = [];

// Active callbacks list for live updates
let sessionListeners = new Set<(session: DriveSession) => void>();

function calculateRating(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  return 'poor';
}

export const driveManager = {
  /**
   * Start a new drive session
   */
  startDrive() {
    if (activeSession) return;

    // Reset cooldown records
    lastTriggerTimes.braking = 0;
    lastTriggerTimes.acceleration = 0;
    lastTriggerTimes.turn = 0;
    lastTriggerTimes.phone_handling = 0;

    activeSession = {
      id: `drv_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      durationSeconds: 0,
      distanceKm: 0,
      startScore: 100,
      finalScore: 100,
      rating: 'excellent',
      deductions: { braking: 0, accel: 0, turns: 0, handling: 0 },
      eventLogs: [],
    };

    // Increment elapsed duration timer
    durationInterval = setInterval(() => {
      if (activeSession) {
        activeSession.durationSeconds += 1;
        // Mock distance accrual (averaging 50 km/h)
        activeSession.distanceKm = Number((activeSession.durationSeconds * 0.0138).toFixed(2));
        
        // Notify all active listeners
        sessionListeners.forEach((listener) => listener({ ...activeSession! }));
      }
    }, 1000);

    // Subscribe to G-Force accelerometer/gyroscope streams
    activeSubscription = sensorManager.subscribe((data: SensorData) => {
      if (!activeSession) return;

      const now = Date.now();
      let scoreUpdated = false;

      // Event Detection logic in the Aligned Vehicle Coordinate Frame
      const { longitudinal, lateral, yawRate, handlingRate } = data.vehicle;

      // 1. Harsh Braking (longitudinal dynamic Gs < -0.4g)
      if (longitudinal < -0.4 && now - lastTriggerTimes.braking > COOLDOWN_DURATION) {
        lastTriggerTimes.braking = now;
        activeSession.deductions.braking += 1;
        activeSession.finalScore = Math.max(0, activeSession.finalScore - 5);
        activeSession.eventLogs.unshift({
          id: `ev_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          type: 'braking',
          points: 5,
          description: 'Harsh braking event detected',
        });
        scoreUpdated = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }

      // 2. Harsh Acceleration (longitudinal dynamic Gs > 0.4g)
      else if (longitudinal > 0.4 && now - lastTriggerTimes.acceleration > COOLDOWN_DURATION) {
        lastTriggerTimes.acceleration = now;
        activeSession.deductions.accel += 1;
        activeSession.finalScore = Math.max(0, activeSession.finalScore - 5);
        activeSession.eventLogs.unshift({
          id: `ev_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          type: 'acceleration',
          points: 5,
          description: 'Rapid acceleration launch detected',
        });
        scoreUpdated = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }

      // 3. Sharp Turns (yaw rotation > 0.5 rad/s combined with significant lateral G-force)
      else if (Math.abs(yawRate) > 0.5 && Math.abs(lateral) > 0.25 && now - lastTriggerTimes.turn > COOLDOWN_DURATION) {
        lastTriggerTimes.turn = now;
        activeSession.deductions.turns += 1;
        activeSession.finalScore = Math.max(0, activeSession.finalScore - 3);
        activeSession.eventLogs.unshift({
          id: `ev_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          type: 'turn',
          points: 3,
          description: 'Sharp lateral turn detected',
        });
        scoreUpdated = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }

      // 4. Phone Handling (pitch/roll/rotation orthogonal to gravity > 0.8 rad/s)
      else if (handlingRate > 0.8 && now - lastTriggerTimes.phone_handling > COOLDOWN_DURATION) {
        lastTriggerTimes.phone_handling = now;
        activeSession.deductions.handling += 1;
        activeSession.finalScore = Math.max(0, activeSession.finalScore - 10);
        activeSession.eventLogs.unshift({
          id: `ev_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          type: 'phone_handling',
          points: 10,
          description: 'Harsh phone handling event detected',
        });
        scoreUpdated = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      }

      if (scoreUpdated) {
        activeSession.rating = calculateRating(activeSession.finalScore);
        sessionListeners.forEach((listener) => listener({ ...activeSession! }));
      }
    });
  },

  /**
   * Complete the active drive session, unsubscribe from sensors, and log history
   */
  endDrive(): DriveSession {
    if (!activeSession) {
      throw new Error('No active drive session to stop');
    }

    // Clear subscriptions
    if (activeSubscription) {
      activeSubscription();
      activeSubscription = null;
    }
    if (durationInterval) {
      clearInterval(durationInterval);
      durationInterval = null;
    }

    const completedSession = { ...activeSession };
    driveHistory.unshift(completedSession);
    
    // Save updated history to AsyncStorage per user
    const user = db.getCurrentUser();
    if (user) {
      AsyncStorage.setItem(`@kinetix_drive_history_${user.id}`, JSON.stringify(driveHistory)).catch((e) => {
        console.error('[DriveManager] Failed to persist new drive session', e);
      });
    }

    // Clear active reference
    activeSession = null;

    return completedSession;
  },

  /**
   * Register a listener for real-time drive session metrics
   */
  subscribeToSession(listener: (session: DriveSession) => void): () => void {
    sessionListeners.add(listener);
    if (activeSession) {
      listener({ ...activeSession });
    }
    return () => {
      sessionListeners.delete(listener);
    };
  },

  /**
   * Fetch active session data
   */
  getActiveSession(): DriveSession | null {
    return activeSession ? { ...activeSession } : null;
  },

  /**
   * Fetch historical ride list
   */
  getDriveHistory(): DriveSession[] {
    return [...driveHistory];
  },

  /**
   * Fetch lifetime dashboard statistics
   */
  getLifetimeStats() {
    const totalDrives = driveHistory.length;
    if (totalDrives === 0) {
      return {
        totalDrives: 0,
        averageScore: 100,
        totalDistanceKm: 0,
        totalDurationSeconds: 0,
        rating: 'excellent' as const,
      };
    }

    const sumScores = driveHistory.reduce((sum, s) => sum + s.finalScore, 0);
    const totalDistanceKm = Number(driveHistory.reduce((sum, s) => sum + s.distanceKm, 0).toFixed(1));
    const totalDurationSeconds = driveHistory.reduce((sum, s) => sum + s.durationSeconds, 0);
    
    const averageScore = Math.round(sumScores / totalDrives);
    const rating = calculateRating(averageScore);

    return {
      totalDrives,
      averageScore,
      totalDistanceKm,
      totalDurationSeconds,
      rating,
    };
  },

  /**
   * Hydrate in-memory drive history from local storage for the active user session
   */
  async init(): Promise<void> {
    const user = db.getCurrentUser();
    if (!user) {
      driveHistory = [];
      return;
    }

    try {
      const historyStr = await AsyncStorage.getItem(`@kinetix_drive_history_${user.id}`);
      if (historyStr) {
        driveHistory = JSON.parse(historyStr);
      } else {
        // Pre-populate mock drives for test user profile to keep dashboard visual
        if (user.id === 'usr_01' || user.email.toLowerCase() === 'test@kinetix.ai') {
          driveHistory = [
            {
              id: 'drv_001',
              timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
              durationSeconds: 1240,
              distanceKm: 14.2,
              startScore: 100,
              finalScore: 95,
              rating: 'excellent',
              deductions: { braking: 1, accel: 0, turns: 0, handling: 0 },
              eventLogs: [
                { id: 'ev_001', timestamp: new Date(Date.now() - 48 * 3600 * 1000 + 300000).toISOString(), type: 'braking', points: 5, description: 'Minor harsh deceleration at signal' }
              ]
            },
            {
              id: 'drv_002',
              timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
              durationSeconds: 2450,
              distanceKm: 28.5,
              startScore: 100,
              finalScore: 82,
              rating: 'good',
              deductions: { braking: 2, accel: 1, turns: 1, handling: 0 },
              eventLogs: [
                { id: 'ev_002', timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 200000).toISOString(), type: 'braking', points: 5, description: 'Aggressive braking at intersection' },
                { id: 'ev_003', timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 600000).toISOString(), type: 'acceleration', points: 5, description: 'Rapid acceleration launch' },
                { id: 'ev_004', timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 1200000).toISOString(), type: 'turn', points: 3, description: 'Sharp cornering turn' },
                { id: 'ev_005', timestamp: new Date(Date.now() - 24 * 3600 * 1000 + 1800000).toISOString(), type: 'braking', points: 5, description: 'Aggressive deceleration' },
              ]
            },
            {
              id: 'drv_003',
              timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
              durationSeconds: 840,
              distanceKm: 8.1,
              startScore: 100,
              finalScore: 67,
              rating: 'fair',
              deductions: { braking: 1, accel: 1, turns: 1, handling: 1 },
              eventLogs: [
                { id: 'ev_006', timestamp: new Date(Date.now() - 4 * 3600 * 1000 + 100000).toISOString(), type: 'phone_handling', points: 10, description: 'Device handled during active drive' },
                { id: 'ev_007', timestamp: new Date(Date.now() - 4 * 3600 * 1000 + 300000).toISOString(), type: 'braking', points: 5, description: 'Abrupt speed decrease' },
                { id: 'ev_008', timestamp: new Date(Date.now() - 4 * 3600 * 1000 + 500000).toISOString(), type: 'acceleration', points: 5, description: 'Rapid acceleration launch' },
                { id: 'ev_009', timestamp: new Date(Date.now() - 4 * 3600 * 1000 + 700000).toISOString(), type: 'turn', points: 3, description: 'Sharp cornering turn' },
              ]
            }
          ];
          await AsyncStorage.setItem(`@kinetix_drive_history_${user.id}`, JSON.stringify(driveHistory));
        } else {
          driveHistory = [];
        }
      }
    } catch (e) {
      console.error('[DriveManager] Failed to hydrate drive history from AsyncStorage', e);
      driveHistory = [];
    }
  },

  /**
   * Reset local in-memory history cache (e.g. on logout)
   */
  clearHistory(): void {
    driveHistory = [];
  },
};

export default driveManager;
