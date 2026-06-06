import React from 'react';
import { View, ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { type DriveSession } from '@/services/driveManager';
import { settingsManager } from '@/services/settingsManager';
import { formatDuration, formatDate, getScoreColor } from '../utils/helpers';

const haptic = {
  light: () => { if (settingsManager.getSettings().hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); },
};

interface HistoryTabProps {
  stats: {
    totalDrives: number;
    totalDistanceKm: number;
    totalDurationSeconds: number;
    averageScore: number;
    rating: string;
  };
  allDrives: DriveSession[];
}

export function HistoryTab({ stats, allDrives }: HistoryTabProps) {
  const router = useRouter();

  const cardColor = '#18181B';       // Zinc 900
  const borderColor = '#27272A';     // Zinc 800
  const accentCyan = '#3B82F6';      // Cobalt Blue
  const lightGrey = '#94A3B8';       // Slate 400

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
    >
      {/* Historical Ride Stats HUD */}
      <View style={[styles.statsCard, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <Ionicons name="shield-checkmark-outline" size={18} color={getScoreColor(stats.averageScore)} />
            <Text style={[styles.gridValue, { color: getScoreColor(stats.averageScore) }]}>{stats.averageScore}</Text>
            <Text style={styles.gridLabel}>AVG SCORE</Text>
          </View>
          <View style={styles.gridVerticalDivider} />
          <View style={styles.gridItem}>
            <Ionicons name="car-sport-outline" size={18} color={accentCyan} />
            <Text style={styles.gridValue}>{allDrives.length}</Text>
            <Text style={styles.gridLabel}>TOTAL RIDES</Text>
          </View>
          <View style={styles.gridVerticalDivider} />
          <View style={styles.gridItem}>
            <Ionicons name="navigate-outline" size={18} color={accentCyan} />
            <Text style={styles.gridValue}>{stats.totalDistanceKm} km</Text>
            <Text style={styles.gridLabel}>ACCUMULATED</Text>
          </View>
        </View>
      </View>

      <View style={styles.feedHeaderRow}>
        <Text style={styles.feedHeader}>DRIVE HISTORY</Text>
        <Text style={styles.feedSubheader}>ALL SAVED TRIPS</Text>
      </View>

      <View style={styles.feedContainer}>
        {allDrives.length > 0 ? (
          allDrives.map((item) => {
            const deductionsCount = Object.values(item.deductions).reduce((sum, v) => sum + v, 0);
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
                <View style={styles.feedItemLeft}>
                  <View style={[styles.scoreBadge, { backgroundColor: `${getScoreColor(item.finalScore)}15` }]}>
                    <Text style={[styles.scoreBadgeText, { color: getScoreColor(item.finalScore) }]}>
                      {item.finalScore}
                    </Text>
                  </View>
                  <View style={styles.feedItemDetails}>
                    <Text style={styles.feedItemDate}>{formatDate(item.timestamp)}</Text>
                    <Text style={styles.feedItemMeta}>
                      {item.distanceKm} km · {formatDuration(item.durationSeconds)} · {deductionsCount === 0 ? 'Smooth ride' : `${deductionsCount} deduction${deductionsCount > 1 ? 's' : ''}`}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={16} color={lightGrey} />
              </Pressable>
            );
          })
        ) : (
          <View style={[styles.emptyFeedCard, { backgroundColor: cardColor, borderColor }]}>
            <Text style={styles.emptyFeedText}>No drives logged</Text>
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
  feedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  scoreBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
  feedItemPressed: {
    opacity: 0.85,
  },
  emptyFeedCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFeedText: {
    color: '#52525B',
    fontSize: 12,
  },
});
