import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/ThemedText';
import { driveManager, type DriveSession } from '@/services/driveManager';
import { settingsManager } from '@/services/settingsManager';
import { ChartBar, type ChartBarProps } from './components/ChartBar';

const haptic = {
  light: () => { if (settingsManager.getSettings().hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); },
  medium: () => { if (settingsManager.getSettings().hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); },
  success: () => { if (settingsManager.getSettings().hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); },
};

// Main Screen
export function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = params.sessionId as string;

  const history = driveManager.getDriveHistory();
  const session: DriveSession | undefined = sessionId
    ? history.find(s => s.id === sessionId)
    : history[0];

  const backgroundColor = '#000000';
  const cardColor = '#18181B';
  const borderColor = '#27272A';
  const matrixGrey = '#D4D4D4';

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#22c55e';
    if (score >= 75) return '#EAB308';
    if (score >= 60) return '#F97316';
    return '#EF4444';
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Score ring animation
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const score = session?.finalScore ?? 0;

  useEffect(() => {
    Animated.spring(scoreAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!session) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <ThemedText style={{ color: '#ffffff' }}>No drive data available</ThemedText>
          <Pressable onPress={() => router.replace('/')} style={[styles.dismissButton, { backgroundColor: matrixGrey }]}>
            <Text style={styles.dismissButtonText}>RETURN HOME</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const scoreColor = getScoreColor(session.finalScore);
  const totalEventsCount = Object.values(session.deductions).reduce((sum, count) => sum + count, 0);

  const pointsLost = {
    braking: session.deductions.braking * 5,
    accel: session.deductions.accel * 5,
    turns: session.deductions.turns * 3,
    handling: session.deductions.handling * 10,
  };

  const maxEvents = Math.max(
    session.deductions.braking,
    session.deductions.accel,
    session.deductions.turns,
    session.deductions.handling,
    1
  );

  const chartData: ChartBarProps[] = [
    {
      label: 'BRAKING',
      value: session.deductions.braking,
      maxValue: maxEvents,
      color: '#ef4444',
      icon: 'trending-down-outline',
      points: pointsLost.braking,
      count: session.deductions.braking,
    },
    {
      label: 'ACCEL',
      value: session.deductions.accel,
      maxValue: maxEvents,
      color: '#f97316',
      icon: 'speedometer-outline',
      points: pointsLost.accel,
      count: session.deductions.accel,
    },
    {
      label: 'TURNS',
      value: session.deductions.turns,
      maxValue: maxEvents,
      color: '#a78bfa',
      icon: 'git-branch-outline',
      points: pointsLost.turns,
      count: session.deductions.turns,
    },
    {
      label: 'PHONE',
      value: session.deductions.handling,
      maxValue: maxEvents,
      color: '#f43f5e',
      icon: 'phone-portrait-outline',
      points: pointsLost.handling,
      count: session.deductions.handling,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Navigation Header */}
        <View style={styles.header}>
          <Pressable onPress={() => { haptic.light(); router.replace('/'); }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>DRIVE SUMMARY</ThemedText>
          <View style={{ width: 44 }} />
        </View>

        {/* Animated Score Ring HUD */}
        <Animated.View style={[styles.scoreContainer, { transform: [{ scale: scoreAnim }] }]}>
          <View style={[styles.scoreRingOuter, { borderColor: `${scoreColor}30` }]}>
            <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
              <View style={styles.scoreInner}>
                <Text style={[styles.scoreValue, { color: scoreColor }]}>{session.finalScore}</Text>
                <Text style={styles.scoreLabel}>SAFETY SCORE</Text>
                <View style={[styles.ratingBadge, { backgroundColor: `${scoreColor}15` }]}>
                  <Text style={[styles.ratingBadgeText, { color: scoreColor }]}>
                    {session.rating.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Session Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="time-outline" size={16} color="#3B82F6" />
            <Text style={styles.statValue}>{formatDuration(session.durationSeconds)}</Text>
            <Text style={styles.statLabel}>DURATION</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="navigate-outline" size={16} color="#3B82F6" />
            <Text style={styles.statValue}>{session.distanceKm} km</Text>
            <Text style={styles.statLabel}>DISTANCE</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="warning-outline" size={16} color={totalEventsCount > 0 ? '#ef4444' : '#22c55e'} />
            <Text style={[styles.statValue, { color: totalEventsCount > 0 ? '#ef4444' : '#22c55e' }]}>
              {totalEventsCount}
            </Text>
            <Text style={styles.statLabel}>ALERTS</Text>
          </View>
        </View>

        {/* Driving Performance Chart */}
        <View style={[styles.chartCard, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.chartHeader}>
            <Ionicons name="bar-chart-outline" size={14} color="#3B82F6" />
            <Text style={styles.cardHeaderText}>INCIDENT BREAKDOWN</Text>
          </View>
          <Text style={styles.chartSubtitle}>
            {totalEventsCount === 0
              ? 'Perfect drive — no incidents recorded!'
              : `${totalEventsCount} total incident${totalEventsCount > 1 ? 's' : ''} across ${Object.values(session.deductions).filter(v => v > 0).length} categor${Object.values(session.deductions).filter(v => v > 0).length > 1 ? 'ies' : 'y'}`}
          </Text>

          {totalEventsCount === 0 ? (
            <View style={styles.perfectDriveBlock}>
              <Ionicons name="checkmark-circle" size={40} color="#22c55e" />
              <Text style={styles.perfectDriveText}>FLAWLESS DRIVE</Text>
              <Text style={styles.perfectDriveSubtext}>No incidents detected this session</Text>
            </View>
          ) : (
            <View style={{ marginTop: 18 }}>
              {chartData.map((bar) => (
                <ChartBar key={bar.label} {...bar} />
              ))}
            </View>
          )}
        </View>

        {/* Itemized Deductions Section */}
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="shield-outline" size={12} color="#71717A" />
          <ThemedText style={styles.sectionHeader}>SAFETY DEDUCTIONS</ThemedText>
        </View>

        <View style={styles.deductionsList}>

          {/* Harsh Braking */}
          <View style={[styles.deductionRow, { backgroundColor: cardColor, borderColor, borderLeftColor: '#ef4444', borderLeftWidth: 3 }]}>
            <View style={[styles.deductionIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <Ionicons name="trending-down-outline" size={18} color="#ef4444" />
            </View>
            <View style={styles.deductionMiddle}>
              <Text style={styles.deductionTitle}>Harsh Braking</Text>
              <Text style={styles.deductionSub}>{session.deductions.braking} occurrence{session.deductions.braking !== 1 ? 's' : ''} · -5 pts each</Text>
            </View>
            <View style={[styles.deductionPill, { backgroundColor: pointsLost.braking > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(39,39,42,0.5)' }]}>
              <Text style={[styles.deductionPoints, { color: pointsLost.braking > 0 ? '#ef4444' : '#52525B' }]}>
                {pointsLost.braking > 0 ? `-${pointsLost.braking}` : '0'} pts
              </Text>
            </View>
          </View>

          {/* Harsh Acceleration */}
          <View style={[styles.deductionRow, { backgroundColor: cardColor, borderColor, borderLeftColor: '#f97316', borderLeftWidth: 3 }]}>
            <View style={[styles.deductionIconBg, { backgroundColor: 'rgba(249, 115, 22, 0.12)' }]}>
              <Ionicons name="speedometer-outline" size={18} color="#f97316" />
            </View>
            <View style={styles.deductionMiddle}>
              <Text style={styles.deductionTitle}>Harsh Acceleration</Text>
              <Text style={styles.deductionSub}>{session.deductions.accel} occurrence{session.deductions.accel !== 1 ? 's' : ''} · -5 pts each</Text>
            </View>
            <View style={[styles.deductionPill, { backgroundColor: pointsLost.accel > 0 ? 'rgba(249,115,22,0.1)' : 'rgba(39,39,42,0.5)' }]}>
              <Text style={[styles.deductionPoints, { color: pointsLost.accel > 0 ? '#f97316' : '#52525B' }]}>
                {pointsLost.accel > 0 ? `-${pointsLost.accel}` : '0'} pts
              </Text>
            </View>
          </View>

          {/* Sharp Turns */}
          <View style={[styles.deductionRow, { backgroundColor: cardColor, borderColor, borderLeftColor: '#a78bfa', borderLeftWidth: 3 }]}>
            <View style={[styles.deductionIconBg, { backgroundColor: 'rgba(167, 139, 250, 0.12)' }]}>
              <Ionicons name="git-branch-outline" size={18} color="#a78bfa" />
            </View>
            <View style={styles.deductionMiddle}>
              <Text style={styles.deductionTitle}>Sharp Turns</Text>
              <Text style={styles.deductionSub}>{session.deductions.turns} occurrence{session.deductions.turns !== 1 ? 's' : ''} · -3 pts each</Text>
            </View>
            <View style={[styles.deductionPill, { backgroundColor: pointsLost.turns > 0 ? 'rgba(167,139,250,0.1)' : 'rgba(39,39,42,0.5)' }]}>
              <Text style={[styles.deductionPoints, { color: pointsLost.turns > 0 ? '#a78bfa' : '#52525B' }]}>
                {pointsLost.turns > 0 ? `-${pointsLost.turns}` : '0'} pts
              </Text>
            </View>
          </View>

          {/* Phone Handling */}
          <View style={[styles.deductionRow, { backgroundColor: cardColor, borderColor, borderLeftColor: '#f43f5e', borderLeftWidth: 3 }]}>
            <View style={[styles.deductionIconBg, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}>
              <Ionicons name="phone-portrait-outline" size={18} color="#f43f5e" />
            </View>
            <View style={styles.deductionMiddle}>
              <Text style={styles.deductionTitle}>Phone Distraction</Text>
              <Text style={styles.deductionSub}>{session.deductions.handling} occurrence{session.deductions.handling !== 1 ? 's' : ''} · -10 pts each</Text>
            </View>
            <View style={[styles.deductionPill, { backgroundColor: pointsLost.handling > 0 ? 'rgba(244,63,94,0.1)' : 'rgba(39,39,42,0.5)' }]}>
              <Text style={[styles.deductionPoints, { color: pointsLost.handling > 0 ? '#f43f5e' : '#52525B' }]}>
                {pointsLost.handling > 0 ? `-${pointsLost.handling}` : '0'} pts
              </Text>
            </View>
          </View>

        </View>

        {/* Total Points Lost */}
        <View style={[styles.totalCard, { backgroundColor: cardColor, borderColor }]}>
          <Text style={styles.totalLabel}>TOTAL POINTS DEDUCTED</Text>
          <Text style={[styles.totalValue, { color: 100 - session.finalScore > 0 ? '#ef4444' : '#22c55e' }]}>
            -{100 - session.finalScore} pts
          </Text>
        </View>

        {/* Dismiss / Return Button */}
        <Pressable
          onPress={() => { haptic.medium(); router.replace('/'); }}
          style={({ pressed }) => [
            styles.dismissButton,
            { backgroundColor: matrixGrey },
            pressed && styles.pressed
          ]}
        >
          <Ionicons name="home-outline" size={16} color="#000000" />
          <Text style={styles.dismissButtonText}>RETURN HOME</Text>
        </Pressable>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },

  // Score Ring
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  scoreRingOuter: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreRing: {
    width: 178,
    height: 178,
    borderRadius: 89,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreInner: {
    alignItems: 'center',
    gap: 4,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 68,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  ratingBadge: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  ratingBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 7,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },

  // Chart Card
  chartCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  cardHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },
  chartSubtitle: {
    fontSize: 11,
    color: '#52525B',
    fontWeight: '600',
    marginBottom: 4,
  },
  perfectDriveBlock: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  perfectDriveText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#22c55e',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  perfectDriveSubtext: {
    fontSize: 11,
    color: '#52525B',
    fontWeight: '600',
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.2,
    fontFamily: 'monospace',
  },

  // Deductions
  deductionsList: {
    gap: 10,
    marginBottom: 20,
  },
  deductionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  deductionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deductionMiddle: {
    flex: 1,
    gap: 2,
  },
  deductionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  deductionSub: {
    fontSize: 10,
    color: '#71717A',
    fontWeight: '500',
  },
  deductionPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  deductionPoints: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
  },

  // Total Card
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
  },

  // Dismiss Button
  dismissButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  dismissButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 32,
  },
  spacer: {
    height: 20,
  },
  pressed: {
    opacity: 0.85,
  },
});

export default DetailsScreen;
