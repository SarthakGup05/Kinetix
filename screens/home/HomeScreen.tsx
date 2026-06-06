import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { db } from '@/services/db';
import { driveManager, type DriveSession } from '@/services/driveManager';
import { launchManager } from '@/services/launchManager';
import { settingsManager } from '@/services/settingsManager';

// Import Modular Tab Components
import { DashboardTab } from './components/DashboardTab';
import { HistoryTab } from './components/HistoryTab';
import { ProfileTab } from './components/ProfileTab';
import { SettingsTab } from './components/SettingsTab';
import { FloatingTabBar } from './components/FloatingTabBar';

type TabType = 'dashboard' | 'history' | 'profile' | 'settings';

export function HomeScreen() {
  const router = useRouter();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modal State
  const [isStartModalVisible, setIsStartModalVisible] = useState(false);

  // Database States
  const [user, setUser] = useState(db.getCurrentUser());
  const [stats, setStats] = useState(driveManager.getLifetimeStats());
  const [allDrives, setAllDrives] = useState<DriveSession[]>([]);
  const [recentDrives, setRecentDrives] = useState<DriveSession[]>([]);

  // Settings State for tab transitions
  const [hapticsEnabled, setHapticsEnabled] = useState(settingsManager.getSettings().hapticsEnabled);

  const refreshData = () => {
    const currentUser = db.getCurrentUser();
    setUser(currentUser);
    setStats(driveManager.getLifetimeStats());
    
    const history = driveManager.getDriveHistory();
    setAllDrives(history);
    setRecentDrives(history.slice(0, 3));
    
    // Refresh local haptics settings
    setHapticsEnabled(settingsManager.getSettings().hapticsEnabled);
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const handleStartDrive = async () => {
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    setIsStartModalVisible(true);
  };

  const handleConfirmStartDrive = async () => {
    setIsStartModalVisible(false);
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
    driveManager.startDrive();
    router.push('/active-drive');
  };

  const handleLogout = async () => {
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
    driveManager.clearHistory();
    await db.logout();
    try {
      await Promise.all([
        AsyncStorage.removeItem('@kinetix_has_shown_splash'),
        AsyncStorage.removeItem('@kinetix_has_completed_onboarding')
      ]);
      launchManager.resetLaunchStatus();
    } catch (e) {
      console.error('[Home] Failed to clear launch settings on logout', e);
    }
    router.replace('/');
  };

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) 
    : 'TP';

  const vehicleLinked = !!(user?.vehicleBrand && user?.vehicleModel);
  const carName = vehicleLinked 
    ? `${user.vehicleBrand} ${user.vehicleModel}`.toUpperCase() 
    : 'NO VEHICLE LINKED';

  const backgroundColor = '#000000'; // Pure Black
  const borderColor = '#27272A';     // Sleek zinc border
  const matrixGreen = '#D4D4D4';     // Light Grey

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <View style={{ flex: 1, position: 'relative' }}>
        
        {/* ── Driver & Vehicle Static Header ── */}
        <View style={styles.headerContainer}>
          <View style={styles.pilotCard}>
            <View style={[styles.avatarCircle, { borderColor }]}>
              {user?.avatarUrl ? (
                <Text style={{ fontSize: 18 }}>{user.avatarUrl}</Text>
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View>
              <ThemedText variant="muted" style={styles.welcomeLabel}>ACTIVE DRIVER</ThemedText>
              <ThemedText style={styles.userName}>{user?.name || 'Test Driver'}</ThemedText>
            </View>
          </View>
          <View style={[styles.headerStatusIndicator, { borderColor: vehicleLinked ? matrixGreen : '#f59e0b' }]}>
            <Text style={[styles.headerStatusText, { color: vehicleLinked ? matrixGreen : '#f59e0b' }]}>
              {vehicleLinked ? 'CONNECTED' : 'NO VEHICLE LINKED'}
            </Text>
          </View>
        </View>

        {/* Tab Subviews */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            userName={user?.name || 'Test Driver'}
            stats={stats}
            recentDrives={recentDrives}
            allDrives={allDrives}
            vehicleLinked={vehicleLinked}
            carName={carName}
            onStartDrive={handleStartDrive}
          />
        )}
        {activeTab === 'history' && (
          <HistoryTab
            stats={stats}
            allDrives={allDrives}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileTab
            user={user}
            stats={stats}
            onUserUpdated={refreshData}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab
            onLogout={handleLogout}
            onSettingsChanged={refreshData}
          />
        )}

        {/* Custom floating tabs navigation bar */}
        <FloatingTabBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          hapticsEnabled={hapticsEnabled}
        />
        
        {/* Start Drive Confirmation Modal */}
        <Modal
          visible={isStartModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsStartModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <Pressable style={styles.modalDismissOverlay} onPress={() => setIsStartModalVisible(false)} />
            <View style={styles.modalCard}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="key-outline" size={28} color="#ffffff" />
              </View>
              <Text style={styles.modalTitle}>INITIATE SESSION?</Text>
              <Text style={styles.modalDescription}>
                This will start recording real-time vehicle telemetry, passenger comfort, and phone distractions.
              </Text>
              <View style={styles.modalButtonStack}>
                <Pressable 
                  onPress={handleConfirmStartDrive}
                  style={({ pressed }) => [
                    styles.modalPrimaryBtn,
                    pressed && { opacity: 0.85 }
                  ]}
                >
                  <Text style={styles.modalPrimaryBtnText}>START ENGINE</Text>
                </Pressable>
                <Pressable 
                  onPress={() => { 
                    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setIsStartModalVisible(false);
                  }}
                  style={({ pressed }) => [
                    styles.modalSecondaryBtn,
                    pressed && { opacity: 0.85 }
                  ]}
                >
                  <Text style={styles.modalSecondaryBtnText}>CANCEL</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalDismissOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#18181B', // Zinc 900
    borderColor: '#27272A',     // Zinc 800
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#000000',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 12,
    color: '#94A3B8', // Slate 400
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    fontWeight: '600',
  },
  modalButtonStack: {
    width: '100%',
    gap: 12,
  },
  modalPrimaryBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D4D4D4',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalPrimaryBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  modalSecondaryBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#27272A',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalSecondaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#18181B',
  },
  headerStatusIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
  },
  headerStatusText: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  pilotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  welcomeLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#71717A',
  },
  userName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
});

export default HomeScreen;
