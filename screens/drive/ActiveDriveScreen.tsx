import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Text, Animated, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/ThemedText';
import { driveManager, type DriveSession } from '@/services/driveManager';
import { sensorManager, type SensorData } from '@/services/sensorManager';
import { settingsManager } from '@/services/settingsManager';
import { getDriverBadges } from '@/screens/home/utils/badgeHelper';
import { SimulationPanel } from './components/SimulationPanel';
import { EndDriveModal } from './components/EndDriveModal';
import { SuccessModal } from './components/SuccessModal';
import { CelebrationModal } from './components/CelebrationModal';

export function ActiveDriveScreen() {
  const router = useRouter();
  const [session, setSession] = useState<DriveSession | null>(driveManager.getActiveSession());
  const [sensorData, setSensorData] = useState<SensorData>({
    accelerometer: { x: 0, y: 0, z: 1.0, magnitude: 1.0 },
    gyroscope: { x: 0, y: 0, z: 0 },
    vehicle: {
      longitudinal: 0,
      lateral: 0,
      vertical: 0,
      yawRate: 0,
      handlingRate: 0,
      isCalibrated: false,
    },
  });
  const [usingRealSensors, setUsingRealSensors] = useState(false);

  // Modal States
  const [isEndModalVisible, setIsEndModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [savedSessionStats, setSavedSessionStats] = useState<{
    score: number;
    distance: string;
    duration: string;
    id: string;
  } | null>(null);

  // Badge Celebration States
  const [unlockedBadgeQueue, setUnlockedBadgeQueue] = useState<any[]>([]);
  const [currentCelebrationBadge, setCurrentCelebrationBadge] = useState<any | null>(null);

  // Pulse animation for Active indicator
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  // Animated values for telemetry values (smoothed transitions)
  const longitudinalAnim = useRef(new Animated.Value(0)).current;
  const lateralAnim = useRef(new Animated.Value(0)).current;
  const yawAnim = useRef(new Animated.Value(0)).current;
  const handlingAnim = useRef(new Animated.Value(0)).current;
  const verticalAnim = useRef(new Animated.Value(0)).current;

  // 2D G-Force Crosshair Dot Position
  const dotXAnim = useRef(new Animated.Value(50)).current; // 50% start
  const dotYAnim = useRef(new Animated.Value(50)).current; // 50% start

  const wasCalibratedRef = useRef(false);

  const backgroundColor = '#000000'; // Pure Black
  const cardColor = '#18181B';       // Zinc 900
  const borderColor = '#27272A';     // Zinc 800
  const matrixGreen = '#D4D4D4';     // Light Grey
  const accentCyan = '#3B82F6';      // Cobalt Blue
  const lightGrey = '#94A3B8';       // Slate 400

  useEffect(() => {
    // Pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Subscribe to driveManager updates
    const unsubscribeSession = driveManager.subscribeToSession((updatedSession) => {
      setSession(updatedSession);
    });

    // Subscribe to real sensor ticks
    const unsubscribeSensors = sensorManager.subscribe((data) => {
      setSensorData(data);
      setUsingRealSensors(sensorManager.isUsingRealSensors());

      // Trigger calibration success haptic once when it changes from false to true
      if (data.vehicle.isCalibrated && !wasCalibratedRef.current) {
        if (settingsManager.getSettings().hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
        wasCalibratedRef.current = true;
      } else if (!data.vehicle.isCalibrated) {
        wasCalibratedRef.current = false;
      }

      // Max scale settings for dot mapping
      const maxG = 0.6;
      const targetDotX = Math.max(0, Math.min(100, 50 + (data.vehicle.lateral / maxG) * 50));
      const targetDotY = Math.max(0, Math.min(100, 50 - (data.vehicle.longitudinal / maxG) * 50));

      // Smoothly animate the values to match the 100ms update rate
      Animated.parallel([
        Animated.timing(longitudinalAnim, {
          toValue: data.vehicle.longitudinal,
          duration: 90,
          useNativeDriver: false,
        }),
        Animated.timing(lateralAnim, {
          toValue: data.vehicle.lateral,
          duration: 90,
          useNativeDriver: false,
        }),
        Animated.timing(yawAnim, {
          toValue: data.vehicle.yawRate,
          duration: 90,
          useNativeDriver: false,
        }),
        Animated.timing(handlingAnim, {
          toValue: data.vehicle.handlingRate,
          duration: 90,
          useNativeDriver: false,
        }),
        Animated.timing(verticalAnim, {
          toValue: data.vehicle.vertical,
          duration: 90,
          useNativeDriver: false,
        }),
        Animated.timing(dotXAnim, {
          toValue: targetDotX,
          duration: 90,
          useNativeDriver: false,
        }),
        Animated.timing(dotYAnim, {
          toValue: targetDotY,
          duration: 90,
          useNativeDriver: false,
        }),
      ]).start();
    });

    return () => {
      unsubscribeSession();
      unsubscribeSensors();
    };
  }, []);

  const triggerTrophyHaptics = async () => {
    if (!settingsManager.getSettings().hapticsEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 180);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 360);
    } catch {}
  };

  const handleDismissCelebration = async () => {
    if (settingsManager.getSettings().hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    const remainingQueue = [...unlockedBadgeQueue];
    remainingQueue.shift();
    setUnlockedBadgeQueue(remainingQueue);

    if (remainingQueue.length > 0) {
      setCurrentCelebrationBadge(remainingQueue[0]);
      triggerTrophyHaptics();
    } else {
      setCurrentCelebrationBadge(null);
      setIsSuccessModalVisible(true);
    }
  };

  const handleStopDrive = () => {
    if (settingsManager.getSettings().hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setIsEndModalVisible(true);
  };

  const handleConfirmEndDrive = () => {
    setIsEndModalVisible(false);
    try {
      const statsBefore = driveManager.getLifetimeStats();
      const historyBefore = driveManager.getDriveHistory();
      const badgesBefore = getDriverBadges(statsBefore, historyBefore);
      const unlockedBeforeIds = badgesBefore.filter(b => b.isUnlocked).map(b => b.id);

      if (settingsManager.getSettings().hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      const completedSession = driveManager.endDrive();
      
      setSavedSessionStats({
        score: completedSession.finalScore,
        distance: `${completedSession.distanceKm} km`,
        duration: formatTime(completedSession.durationSeconds),
        id: completedSession.id,
      });

      const statsAfter = driveManager.getLifetimeStats();
      const historyAfter = driveManager.getDriveHistory();
      const badgesAfter = getDriverBadges(statsAfter, historyAfter);
      const newlyUnlocked = badgesAfter.filter(b => b.isUnlocked && !unlockedBeforeIds.includes(b.id));

      if (newlyUnlocked.length > 0) {
        setUnlockedBadgeQueue(newlyUnlocked);
        setCurrentCelebrationBadge(newlyUnlocked[0]);
        triggerTrophyHaptics();
      } else {
        setIsSuccessModalVisible(true);
      }
    } catch (e) {
      console.error('[ActiveDrive] Failed to finalize drive session', e);
      router.replace('/');
    }
  };

  const handleViewReport = () => {
    setIsSuccessModalVisible(false);
    if (savedSessionStats) {
      router.replace({ pathname: '/details', params: { sessionId: savedSessionStats.id } });
    } else {
      router.replace('/');
    }
  };

  const triggerSimulation = (type: 'braking' | 'acceleration' | 'turn' | 'phone_handling') => {
    if (settingsManager.getSettings().hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    sensorManager.triggerSimulatedEvent(type);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getStatusColor = () => {
    if (!usingRealSensors) return '#f59e0b'; // Simulation mode
    return sensorData.vehicle.isCalibrated ? matrixGreen : '#38bdf8'; // Calibrated green vs calibrating cyan
  };

  const getStatusText = () => {
    if (!usingRealSensors) return 'DEMO MODE';
    return sensorData.vehicle.isCalibrated ? 'ACTIVE SESSION' : 'CALIBRATING SENSORS...';
  };

  // Passenger Comfort & Smoothness indicators (0.6G represents heavy discomfort limit)
  const maxG = 0.6;
  const longG = sensorData.vehicle.longitudinal;
  const latG = sensorData.vehicle.lateral;
  const gForceMag = Math.sqrt(longG ** 2 + latG ** 2);
  const dotColor = gForceMag > 0.4 ? '#ef4444' : gForceMag > 0.25 ? '#f59e0b' : matrixGreen;

  // Live score / Smoothness index color coding
  const getLiveScoreColor = (score: number) => {
    if (score >= 90) return matrixGreen;
    if (score >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const dynamicSmoothness = Math.max(0, Math.min(100, Math.round((1 - gForceMag / 0.6) * 100)));

  const getSmoothnessRating = (score: number) => {
    if (score >= 90) return 'PERFECT';
    if (score >= 75) return 'SMOOTH';
    if (score >= 50) return 'CAUTION';
    return 'HARSH';
  };

  const smoothnessColor = getLiveScoreColor(dynamicSmoothness);

  // Status rating color helper
  const getStatusColorRating = (status: string) => {
    if (status.includes('HARSH') || status.includes('ALERT') || status.includes('HARD') || status.includes('DISTRACTED')) return '#ef4444';
    if (status.includes('Braking') || status.includes('Turning') || status.includes('Moved') || status.includes('Bumpy') || status.includes('Dip')) return '#f59e0b';
    return matrixGreen;
  };

  // Consumer friendly status text helpers
  const getLongitudinalStatus = (val: number) => {
    if (val > 0.4) return 'HARSH ACCEL!';
    if (val > 0.15) return 'Accelerating';
    if (val < -0.4) return 'HARD BRAKE!';
    if (val < -0.15) return 'Braking';
    return 'Smooth';
  };

  const getLateralStatus = (val: number) => {
    if (val > 0.25) return 'SHARP TURN!';
    if (val > 0.1) return 'Turning Left';
    if (val < -0.25) return 'SHARP TURN!';
    if (val < -0.1) return 'Turning Right';
    return 'Stable';
  };

  const getHandlingStatus = (val: number) => {
    if (val > 0.8) return 'DISTRACTED ALERT!';
    if (val > 0.2) return 'Phone Moved';
    return 'Phone Secure';
  };

  const getVerticalStatus = (val: number) => {
    if (val > 0.3) return 'HARSH BUMP!';
    if (val > 0.1) return 'Bumpy Road';
    if (val < -0.3) return 'HARSH DIP!';
    if (val < -0.1) return 'Road Dip';
    return 'Smooth Road';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Status Header */}
        <View style={styles.statusHeader}>
          <View style={[styles.pulseContainer, { backgroundColor: `${getStatusColor()}10` }]}>
            <Animated.View style={[styles.pulseDot, { backgroundColor: getStatusColor(), opacity: pulseAnim }]} />
            <ThemedText style={[styles.statusText as TextStyle, { color: getStatusColor() }]}>
              {getStatusText()}
            </ThemedText>
          </View>
          
          <View style={styles.badgeRow}>
            {/* Sensor Source Badge */}
            <View style={[
              styles.sensorBadge,
              { backgroundColor: usingRealSensors ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)' },
            ]}>
              <Ionicons
                name={usingRealSensors ? 'hardware-chip-outline' : 'flask-outline'}
                size={12}
                color={usingRealSensors ? accentCyan : '#f59e0b'}
              />
              <Text style={[
                styles.sensorBadgeText,
                { color: usingRealSensors ? accentCyan : '#f59e0b' },
              ]}>
                {usingRealSensors ? 'PHONE SENSORS' : 'DEMO'}
              </Text>
            </View>

            {/* Calibration Status Badge */}
            {usingRealSensors && (
              <View style={[
                styles.sensorBadge,
                { backgroundColor: sensorData.vehicle.isCalibrated ? 'rgba(16, 185, 129, 0.08)' : 'rgba(56, 189, 248, 0.08)' },
              ]}>
                <Ionicons
                  name={sensorData.vehicle.isCalibrated ? 'checkmark-circle-outline' : 'sync-outline'}
                  size={12}
                  color={sensorData.vehicle.isCalibrated ? matrixGreen : '#38bdf8'}
                />
                <Text style={[
                  styles.sensorBadgeText,
                  { color: sensorData.vehicle.isCalibrated ? matrixGreen : '#38bdf8' },
                ]}>
                  {sensorData.vehicle.isCalibrated ? 'READY' : 'CALIBRATING'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Side-by-Side Dual-HUD Meters */}
        <View style={styles.hudRow}>
          
          {/* HUD Left: Smoothness Index */}
          <View style={[styles.hudCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={[styles.hudRing, { borderColor: smoothnessColor }]}>
              <Text style={[styles.hudRingValue, { color: smoothnessColor }]}>
                {dynamicSmoothness}%
              </Text>
              <Text style={[styles.hudRingUnit, { color: smoothnessColor, fontWeight: '900' }]}>
                {getSmoothnessRating(dynamicSmoothness)}
              </Text>
            </View>
            <Text style={styles.hudLabel}>LIVE SMOOTHNESS</Text>
          </View>

          {/* HUD Right: Comfort Zone Balance */}
          <View style={[styles.hudCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={[styles.comfortCircle, { borderColor: borderColor }]}>
              {/* Reference outer ring representing comfort boundary */}
              <View style={[styles.comfortBoundaryRing, { borderColor: dotColor + '40' }]} />
              <View style={styles.comfortCenterDot} />
              
              {/* Dynamic passenger-comfort bubble */}
              <Animated.View style={[
                styles.comfortBubble,
                { 
                  top: dotYAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['8%', '92%'], // keep bubble bounded inside comfort card
                  }), 
                  left: dotXAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['8%', '92%'],
                  }), 
                  backgroundColor: dotColor,
                  shadowColor: dotColor,
                }
              ]} />
            </View>
            <Text style={styles.hudLabel}>DRIVE BALANCE</Text>
          </View>

        </View>

        {/* Glassmorphic Session Grid */}
        <View style={styles.sessionGrid}>
          <View style={[styles.sessionCard, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="time-outline" size={16} color={accentCyan} />
            <Text style={styles.sessionCardValue}>
              {session ? formatTime(session.durationSeconds) : '00:00'}
            </Text>
            <Text style={styles.sessionCardLabel}>DURATION</Text>
          </View>
          <View style={[styles.sessionCard, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="navigate-outline" size={16} color={accentCyan} />
            <Text style={styles.sessionCardValue}>
              {session ? `${session.distanceKm}` : '0.0'}
            </Text>
            <Text style={styles.sessionCardLabel}>DISTANCE (KM)</Text>
          </View>
          <View style={[styles.sessionCard, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color={getLiveScoreColor(session ? session.finalScore : 100)} />
            <Text style={[styles.sessionCardValue, { color: getLiveScoreColor(session ? session.finalScore : 100) }]}>
              {session ? session.finalScore : '100'}
            </Text>
            <Text style={styles.sessionCardLabel}>LIVE SCORE</Text>
          </View>
        </View>

        {/* Aligned Telemetry Card */}
        <View style={[styles.telemetryCard, { backgroundColor: cardColor, borderColor }]}>
          <Text style={styles.cardHeader}>LIVE DRIVING DYNAMICS</Text>

          {/* Acceleration & Braking */}
          <View style={styles.telemetryRow}>
            <View style={styles.metricHeader}>
              <View style={styles.metricLabelRow}>
                <Ionicons name="speedometer-outline" size={13} color={accentCyan} />
                <Text style={[styles.metricTitle, { color: accentCyan }]}>ACCELERATION & BRAKING</Text>
              </View>
              <Text style={[styles.metricValue, { color: getStatusColorRating(getLongitudinalStatus(sensorData.vehicle.longitudinal)) }]}>
                {getLongitudinalStatus(sensorData.vehicle.longitudinal)}
              </Text>
            </View>
            <View style={styles.biBarTrack}>
              <View style={styles.centerDivider} />
              <Animated.View style={[
                styles.biBarFill,
                {
                  left: '50%',
                  width: longitudinalAnim.interpolate({
                    inputRange: [0, 0.6],
                    outputRange: ['0%', '50%'],
                    extrapolate: 'clamp',
                  }),
                  backgroundColor: matrixGreen, 
                }
              ]} />
              <Animated.View style={[
                styles.biBarFill,
                {
                  right: '50%',
                  width: longitudinalAnim.interpolate({
                    inputRange: [-0.6, 0],
                    outputRange: ['50%', '0%'],
                    extrapolate: 'clamp',
                  }),
                  backgroundColor: '#ef4444', 
                }
              ]} />
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleText}>BRAKING</Text>
              <Text style={styles.scaleText}>ACCELERATION</Text>
            </View>
          </View>

          {/* Steering & Cornering */}
          <View style={[styles.telemetryRow, { marginTop: 14 }]}>
            <View style={styles.metricHeader}>
              <View style={styles.metricLabelRow}>
                <Ionicons name="git-branch-outline" size={13} color="#a78bfa" />
                <Text style={[styles.metricTitle, { color: '#a78bfa' }]}>STEERING & CORNERING</Text>
              </View>
              <Text style={[styles.metricValue, { color: getStatusColorRating(getLateralStatus(sensorData.vehicle.lateral)) }]}>
                {getLateralStatus(sensorData.vehicle.lateral)}
              </Text>
            </View>
            <View style={styles.biBarTrack}>
              <View style={styles.centerDivider} />
              <Animated.View style={[
                styles.biBarFill,
                {
                  left: '50%',
                  width: lateralAnim.interpolate({
                    inputRange: [0, 0.4],
                    outputRange: ['0%', '50%'],
                    extrapolate: 'clamp',
                  }),
                  backgroundColor: '#a78bfa',
                }
              ]} />
              <Animated.View style={[
                styles.biBarFill,
                {
                  right: '50%',
                  width: lateralAnim.interpolate({
                    inputRange: [-0.4, 0],
                    outputRange: ['50%', '0%'],
                    extrapolate: 'clamp',
                  }),
                  backgroundColor: '#a78bfa',
                }
              ]} />
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleText}>RIGHT TURN</Text>
              <Text style={styles.scaleText}>LEFT TURN</Text>
            </View>
          </View>

          {/* Phone Distraction */}
          <View style={[styles.telemetryRow, { marginTop: 14 }]}>
            <View style={styles.metricHeader}>
              <View style={styles.metricLabelRow}>
                <Ionicons name="phone-portrait-outline" size={13} color="#f43f5e" />
                <Text style={[styles.metricTitle, { color: '#f43f5e' }]}>PHONE DISTRACTION</Text>
              </View>
              <Text style={[styles.metricValue, { color: getStatusColorRating(getHandlingStatus(sensorData.vehicle.handlingRate)) }]}>
                {getHandlingStatus(sensorData.vehicle.handlingRate)}
              </Text>
            </View>
            <View style={styles.uniBarTrack}>
              <Animated.View style={[
                styles.uniBarFill,
                {
                  width: handlingAnim.interpolate({
                    inputRange: [0, 1.0],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
                  backgroundColor: sensorData.vehicle.handlingRate > 0.8 ? '#ef4444' : matrixGreen,
                }
              ]} />
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleText}>MOUNTED</Text>
              <Text style={styles.scaleText}>HANDHELD WARNING</Text>
            </View>
          </View>

          {/* Road Bumps & Dips */}
          <View style={[styles.telemetryRow, { marginTop: 14 }]}>
            <View style={styles.metricHeader}>
              <View style={styles.metricLabelRow}>
                <Ionicons name="swap-vertical-outline" size={13} color="#06b6d4" />
                <Text style={[styles.metricTitle, { color: '#06b6d4' }]}>ROAD BUMPS & DIPS</Text>
              </View>
              <Text style={[styles.metricValue, { color: getStatusColorRating(getVerticalStatus(sensorData.vehicle.vertical)) }]}>
                {getVerticalStatus(sensorData.vehicle.vertical)}
              </Text>
            </View>
            <View style={styles.biBarTrack}>
              <View style={styles.centerDivider} />
              <Animated.View style={[
                styles.biBarFill,
                {
                  left: '50%',
                  width: verticalAnim.interpolate({
                    inputRange: [0, 0.5],
                    outputRange: ['0%', '50%'],
                    extrapolate: 'clamp',
                  }),
                  backgroundColor: '#06b6d4',
                }
              ]} />
              <Animated.View style={[
                styles.biBarFill,
                {
                  right: '50%',
                  width: verticalAnim.interpolate({
                    inputRange: [-0.5, 0],
                    outputRange: ['50%', '0%'],
                    extrapolate: 'clamp',
                  }),
                  backgroundColor: '#06b6d4',
                }
              ]} />
            </View>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleText}>DIPS</Text>
              <Text style={styles.scaleText}>BUMPS</Text>
            </View>
          </View>
        </View>

        {/* Event Feed Timeline */}
        <View style={[styles.eventFeedCard, { backgroundColor: cardColor, borderColor }]}>
          <Text style={styles.cardHeader}>DRIVING ALERTS</Text>
          
          {/* Alert Legend Row */}
          <View style={styles.alertLegendRow}>
            <View style={styles.alertLegendItem}>
              <View style={[styles.alertLegendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.alertLegendText}>BRAKING</Text>
            </View>
            <View style={styles.alertLegendItem}>
              <View style={[styles.alertLegendDot, { backgroundColor: '#f97316' }]} />
              <Text style={styles.alertLegendText}>ACCEL</Text>
            </View>
            <View style={styles.alertLegendItem}>
              <View style={[styles.alertLegendDot, { backgroundColor: '#a78bfa' }]} />
              <Text style={styles.alertLegendText}>TURNS</Text>
            </View>
            <View style={styles.alertLegendItem}>
              <View style={[styles.alertLegendDot, { backgroundColor: '#f43f5e' }]} />
              <Text style={styles.alertLegendText}>PHONE</Text>
            </View>
          </View>

          {session && session.eventLogs.length > 0 ? (
            <View style={styles.timelineContainer}>
              <View style={styles.timelineLine} />
              {session.eventLogs.slice(0, 5).map((event) => {
                // Distinct color per event type
                const nodeColor = 
                  event.type === 'braking' ? '#ef4444' :
                  event.type === 'acceleration' ? '#f97316' :
                  event.type === 'turn' ? '#a78bfa' : '#f43f5e';
                const iconName = 
                  event.type === 'phone_handling' ? 'phone-portrait-outline' :
                  event.type === 'braking' ? 'trending-down-outline' :
                  event.type === 'acceleration' ? 'speedometer-outline' : 
                  event.type === 'turn' ? 'git-branch-outline' : 'warning-outline';
                const iconColor = event.type === 'turn' ? '#1a0040' : '#ffffff';
                return (
                  <View key={event.id} style={styles.timelineRow}>
                    <View style={[styles.timelineNode, { backgroundColor: nodeColor, shadowColor: nodeColor }]}>
                      <Ionicons name={iconName} size={10} color={iconColor} />
                    </View>
                    <View style={[styles.eventDetailsCard, { borderColor: `${nodeColor}40`, borderLeftColor: nodeColor, borderLeftWidth: 3 }]}>
                      <Text style={styles.eventTitle}>{event.description}</Text>
                      <Text style={[styles.eventPoints, { color: nodeColor }]}>-{event.points} pts deduction</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyFeed}>
              <Ionicons name="checkmark-circle-outline" size={28} color="#22c55e" style={{ marginBottom: 6 }} />
              <Text style={styles.emptyText}>No harsh driving events logged</Text>
              <Text style={[styles.emptyText, { fontSize: 10, marginTop: 2 }]}>Keep it smooth! 🎯</Text>
            </View>
          )}
        </View>

        {/* Solid Stop Button */}
        <Pressable
          onPress={handleStopDrive}
          style={({ pressed }) => [
            styles.stopButton, 
            { backgroundColor: '#ef4444' }, 
            pressed && styles.pressed
          ]}
        >
          <Ionicons name="stop-circle" size={20} color="#ffffff" />
          <Text style={styles.stopButtonText}>STOP DRIVING</Text>
        </Pressable>

        {/* Simulation Panel */}
        <SimulationPanel onTrigger={triggerSimulation} />

        {/* Modals */}
        <EndDriveModal
          visible={isEndModalVisible}
          onConfirm={handleConfirmEndDrive}
          onCancel={() => setIsEndModalVisible(false)}
        />

        <SuccessModal
          visible={isSuccessModalVisible}
          onDismiss={handleViewReport}
          stats={savedSessionStats}
        />

        <CelebrationModal
          visible={!!currentCelebrationBadge}
          onDismiss={handleDismissCelebration}
          badge={currentCelebrationBadge}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 16,
  },

  // Header
  statusHeader: {
    alignItems: 'center',
    gap: 8,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  sensorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  sensorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Dual HUD row
  hudRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    width: '100%',
  },
  hudCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
  },
  hudLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 1.2,
  },

  // Left HUD Ring
  hudRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E0E14',
    position: 'relative',
  },
  hudRingValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  hudRingUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: '#71717A',
    marginTop: -2,
  },

  // Right HUD Comfort Zone Plot
  comfortCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    backgroundColor: '#0E0E14',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comfortBoundaryRing: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  comfortCenterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#27272A',
  },
  comfortBubble: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    marginTop: -7,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },

  // Session stats grid
  sessionGrid: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  sessionCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  sessionCardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  sessionCardLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 0.5,
  },

  // Telemetry Card
  telemetryCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    marginBottom: 14,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  telemetryRow: {
    gap: 6,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  biBarTrack: {
    height: 8,
    backgroundColor: '#27272A',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  biBarFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4,
  },
  centerDivider: {
    position: 'absolute',
    left: '50%',
    width: 2,
    height: '100%',
    backgroundColor: '#3f3f46',
    zIndex: 1,
  },
  uniBarTrack: {
    height: 8,
    backgroundColor: '#27272A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  uniBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  scaleText: {
    fontSize: 8,
    color: '#52525B',
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },

  // Event feed timeline
  eventFeedCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
  },
  alertLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  alertLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  alertLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertLegendText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#52525B',
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 20,
    gap: 14,
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 6,
    bottom: 6,
    width: 2,
    backgroundColor: '#27272A',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  timelineNode: {
    position: 'absolute',
    left: -20,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 3,
  },
  eventDetailsCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'rgba(39, 39, 42, 0.2)',
  },
  eventTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  eventPoints: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyFeed: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#52525B',
    fontSize: 13,
    textAlign: 'center',
  },

  // Stop button
  stopButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  pressed: { opacity: 0.8 },
});

export default ActiveDriveScreen;
