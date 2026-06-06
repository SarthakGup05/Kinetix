import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Text, Animated, TextStyle, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { type DriveSession } from '@/services/driveManager';
import { settingsManager } from '@/services/settingsManager';
import { formatDuration, formatDate, getScoreColor } from '../utils/helpers';
import { RadialHUD } from './RadialHUD';
import { AICoachCard } from './AICoachCard';
import { GreetingsBanner } from './GreetingsBanner';

const haptic = {
  light: () => { if (settingsManager.getSettings().hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); },
  medium: () => { if (settingsManager.getSettings().hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); },
};

interface DashboardTabProps {
  userName: string;
  stats: {
    totalDrives: number;
    totalDistanceKm: number;
    totalDurationSeconds: number;
    averageScore: number;
    rating: string;
  };
  recentDrives: DriveSession[];
  allDrives: DriveSession[];
  onStartDrive: () => void;
}

export function DashboardTab({ userName, stats, recentDrives, allDrives, onStartDrive }: DashboardTabProps) {
  const router = useRouter();

  // Breathing animation for engine start button
  const breatheAnim = useRef(new Animated.Value(1.0)).current;

  useEffect(() => {
    // Start breathing animation loop
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.04, duration: 1500, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 0.98, duration: 1500, useNativeDriver: true }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const cardColor = '#18181B';       // Zinc 900
  const borderColor = '#27272A';     // Zinc 800
  const matrixGreen = '#D4D4D4';     // Light Grey
  const accentCyan = '#3B82F6';      // Cobalt Blue
  const lightGrey = '#94A3B8';       // Slate 400

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
    >
      <GreetingsBanner userName={userName} averageScore={stats.averageScore} />


      {/* Dual-Ring Score HUD */}
      <RadialHUD score={stats.averageScore} rating={stats.rating} />

      {/* Pill-Shaped Start Drive Button */}
      <View style={styles.driveButtonContainer as ViewStyle}>
        <Animated.View style={{ transform: [{ scale: breatheAnim }], width: '100%' }}>
          <Pressable 
            onPress={onStartDrive} 
            style={({ pressed }) => [
              styles.drivePillButton as ViewStyle,
              { backgroundColor: '#D4D4D4', shadowColor: '#D4D4D4' },
              pressed && (styles.pressedPill as ViewStyle)
            ]}
            onPressIn={() => haptic.medium()}
          >
            <Ionicons name="play-circle" size={20} color="#000000" />
            <Text style={styles.drivePillText as TextStyle}>
              START DRIVING
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Lifetime Stats HUD Pillars */}
      <View style={[styles.statsCard, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Ionicons name="car-sport-outline" size={18} color="#10B981" />
            <Text style={styles.gridValue}>{stats.totalDrives}</Text>
            <Text style={styles.gridLabel}>TRIPS</Text>
          </View>
          <View style={styles.gridVerticalDivider} />
          <View style={styles.gridItem}>
            <Ionicons name="map-outline" size={18} color="#F59E0B" />
            <Text style={styles.gridValue}>{stats.totalDistanceKm} km</Text>
            <Text style={styles.gridLabel}>DISTANCE</Text>
          </View>
          <View style={styles.gridVerticalDivider} />
          <View style={styles.gridItem}>
            <Ionicons name="time-outline" size={18} color="#3B82F6" />
            <Text style={styles.gridValue}>{formatDuration(stats.totalDurationSeconds)}</Text>
            <Text style={styles.gridLabel}>TIME</Text>
          </View>
        </View>
      </View>

      {/* AI Driving Coach Card */}
      <Text style={styles.feedHeader}>PILOT AI COACH</Text>
      <AICoachCard stats={stats} allDrives={allDrives} />

      {/* Recent Drives Feed */}
      <View style={styles.feedHeaderRow}>
        <Text style={styles.feedHeader}>RECENT DRIVES</Text>
        <Text style={styles.feedSubheader}>LAST 3 TRIPS</Text>
      </View>

      <View style={styles.feedContainer}>
        {recentDrives.length > 0 ? (
          recentDrives.map((item) => {
            const deductionsCount = Object.values(item.deductions).reduce((sum, v) => sum + v, 0);
            // Alert color pills
            const alertTypes = [
              { key: 'braking', count: item.deductions.braking, color: '#ef4444', icon: 'trending-down-outline' as const },
              { key: 'accel', count: item.deductions.accel, color: '#f97316', icon: 'speedometer-outline' as const },
              { key: 'turns', count: item.deductions.turns, color: '#a78bfa', icon: 'git-branch-outline' as const },
              { key: 'handling', count: item.deductions.handling, color: '#f43f5e', icon: 'phone-portrait-outline' as const },
            ].filter(a => a.count > 0);

            return (
              <Pressable
                key={item.id}
                onPress={() => router.push({ pathname: '/details', params: { sessionId: item.id } })}
                onPressIn={() => haptic.light()}
                style={({ pressed }) => [
                  styles.feedItemCard,
                  { backgroundColor: cardColor, borderColor },
                  pressed && styles.feedItemPressed
                ]}
              >
                <View style={styles.feedItemTop}>
                  <View style={[styles.scoreBadge, { backgroundColor: `${getScoreColor(item.finalScore)}15` }]}>
                    <Text style={[styles.scoreBadgeText, { color: getScoreColor(item.finalScore) }]}>
                      {item.finalScore}
                    </Text>
                  </View>
                  <View style={styles.feedItemDetails}>
                    <Text style={styles.feedItemDate}>{formatDate(item.timestamp)}</Text>
                    <Text style={styles.feedItemMeta}>
                      {item.distanceKm} km · {formatDuration(item.durationSeconds)}
                    </Text>
                    {/* Alert type pills */}
                    {alertTypes.length > 0 ? (
                      <View style={styles.alertPillRow}>
                        {alertTypes.map((a) => (
                          <View key={a.key} style={[styles.alertPill, { backgroundColor: `${a.color}15`, borderColor: `${a.color}40` }]}>
                            <Ionicons name={a.icon} size={8} color={a.color} />
                            <Text style={[styles.alertPillText, { color: a.color }]}>{a.count}</Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.alertPillRow}>
                        <View style={[styles.alertPill, { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }]}>
                          <Ionicons name="checkmark-circle-outline" size={8} color="#22c55e" />
                          <Text style={[styles.alertPillText, { color: '#22c55e' }]}>PERFECT</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={16} color={lightGrey} />
              </Pressable>
            );
          })
        ) : (
          <View style={[styles.emptyFeedCard, { backgroundColor: cardColor, borderColor }]}>
            <Ionicons name="car-outline" size={28} color="#3f3f46" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyFeedText}>No drives recorded yet</Text>
            <Text style={[styles.emptyFeedText, { fontSize: 10, marginTop: 2 }]}>Start your first drive above!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 110,
    gap: 18,
  },
  driveButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  drivePillButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  drivePillText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  pressedPill: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  statsCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  gridLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  gridVerticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#27272A',
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
  },
  feedHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  feedSubheader: {
    fontSize: 8,
    color: '#52525B',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  feedContainer: {
    gap: 10,
  },
  feedItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
  },
  feedItemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  feedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  scoreBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: '900',
  },
  feedItemDetails: {
    gap: 2,
    flex: 1,
    paddingTop: 1,
  },
  feedItemDate: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  feedItemMeta: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '500',
  },
  alertPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  alertPillText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  feedItemPressed: {
    opacity: 0.85,
  },
  emptyFeedCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFeedText: {
    color: '#52525B',
    fontSize: 12,
  },
});
