import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { driveManager, type DriveSession } from '@/services/driveManager';

export function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = params.sessionId as string;

  // Retrieve matching session, or fallback to the most recent drive session
  const history = driveManager.getDriveHistory();
  const session: DriveSession | undefined = sessionId 
    ? history.find(s => s.id === sessionId) 
    : history[0];

  const backgroundColor = '#0F172A'; // Slate 900
  const cardColor = '#1E293B';       // Slate 800
  const borderColor = '#334155';     // Slate 700
  const matrixGreen = '#10B981';     // Emerald Green

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Green (Excellent)
    if (score >= 75) return '#EAB308'; // Yellow (Good)
    if (score >= 60) return '#F97316'; // Orange (Fair)
    return '#EF4444'; // Red (Poor)
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (!session) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <ThemedText style={{ color: '#ffffff' }}>No drive data available</ThemedText>
          <Pressable onPress={() => router.replace('/')} style={[styles.dismissButton, { backgroundColor: matrixGreen }]}>
            <Text style={styles.dismissButtonText}>RETURN HOME</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const scoreColor = getScoreColor(session.finalScore);

  // Total events logged
  const totalEventsCount = Object.values(session.deductions).reduce((sum, count) => sum + count, 0);

  // Calculation deductions points
  const pointsLost = {
    braking: session.deductions.braking * 5,
    accel: session.deductions.accel * 5,
    turns: session.deductions.turns * 3,
    handling: session.deductions.handling * 10,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Navigation Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>DRIVE SUMMARY</ThemedText>
          <View style={{ width: 44 }} />
        </View>

        {/* Score Ring HUD */}
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>{session.finalScore}</Text>
            <Text style={styles.scoreLabel}>SAFETY SCORE</Text>
          </View>
          <Text style={[styles.ratingText, { color: scoreColor }]}>
            RATING: {session.rating.toUpperCase()}
          </Text>
        </View>

        {/* Summary Details Grid */}
        <View style={[styles.detailsCard, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <ThemedText variant="muted" style={styles.gridLabel}>DURATION</ThemedText>
              <ThemedText style={styles.gridValue}>{formatDuration(session.durationSeconds)}</ThemedText>
            </View>
            <View style={styles.gridItem}>
              <ThemedText variant="muted" style={styles.gridLabel}>DISTANCE</ThemedText>
              <ThemedText style={styles.gridValue}>{session.distanceKm} km</ThemedText>
            </View>
            <View style={styles.gridItem}>
              <ThemedText variant="muted" style={styles.gridLabel}>EVENTS</ThemedText>
              <ThemedText style={[styles.gridValue, { color: totalEventsCount > 0 ? '#ef4444' : matrixGreen }]}>
                {totalEventsCount}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Itemized Deductions Section */}
        <ThemedText style={styles.sectionHeader}>SAFETY DEDUCTIONS</ThemedText>

        <View style={styles.deductionsList}>
          
          {/* Harsh Braking */}
          <View style={[styles.deductionRow, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.deductionLeft}>
              <Ionicons name="trending-down-outline" size={20} color={pointsLost.braking > 0 ? '#ef4444' : '#71717A'} />
              <View>
                <Text style={styles.deductionTitle}>Harsh Braking</Text>
                <Text style={styles.deductionSub}>{session.deductions.braking} occurrences (-5 pts each)</Text>
              </View>
            </View>
            <Text style={[styles.deductionPoints, pointsLost.braking > 0 ? { color: '#ef4444' } : { color: '#71717A' }]}>
              {pointsLost.braking > 0 ? `-${pointsLost.braking} pts` : '0 pts'}
            </Text>
          </View>

          {/* Harsh Acceleration */}
          <View style={[styles.deductionRow, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.deductionLeft}>
              <Ionicons name="speedometer-outline" size={20} color={pointsLost.accel > 0 ? '#ef4444' : '#71717A'} />
              <View>
                <Text style={styles.deductionTitle}>Harsh Acceleration</Text>
                <Text style={styles.deductionSub}>{session.deductions.accel} occurrences (-5 pts each)</Text>
              </View>
            </View>
            <Text style={[styles.deductionPoints, pointsLost.accel > 0 ? { color: '#ef4444' } : { color: '#71717A' }]}>
              {pointsLost.accel > 0 ? `-${pointsLost.accel} pts` : '0 pts'}
            </Text>
          </View>

          {/* Sharp Turns */}
          <View style={[styles.deductionRow, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.deductionLeft}>
              <Ionicons name="warning-outline" size={20} color={pointsLost.turns > 0 ? '#ef4444' : '#71717A'} />
              <View>
                <Text style={styles.deductionTitle}>Sharp Turns</Text>
                <Text style={styles.deductionSub}>{session.deductions.turns} occurrences (-3 pts each)</Text>
              </View>
            </View>
            <Text style={[styles.deductionPoints, pointsLost.turns > 0 ? { color: '#ef4444' } : { color: '#71717A' }]}>
              {pointsLost.turns > 0 ? `-${pointsLost.turns} pts` : '0 pts'}
            </Text>
          </View>

          {/* Phone Handling */}
          <View style={[styles.deductionRow, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.deductionLeft}>
              <Ionicons name="phone-portrait-outline" size={20} color={pointsLost.handling > 0 ? '#ef4444' : '#71717A'} />
              <View>
                <Text style={styles.deductionTitle}>Phone Handling</Text>
                <Text style={styles.deductionSub}>{session.deductions.handling} occurrences (-10 pts each)</Text>
              </View>
            </View>
            <Text style={[styles.deductionPoints, pointsLost.handling > 0 ? { color: '#ef4444' } : { color: '#71717A' }]}>
              {pointsLost.handling > 0 ? `-${pointsLost.handling} pts` : '0 pts'}
            </Text>
          </View>

        </View>

        {/* Dismiss / Return Button */}
        <Pressable 
          onPress={() => router.replace('/')}
          style={({ pressed }) => [
            styles.dismissButton, 
            { backgroundColor: matrixGreen },
            pressed && styles.pressed
          ]}
        >
          <Text style={styles.dismissButtonText}>DISMISS</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1.5,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
    gap: 16,
  },
  scoreRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1.5,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  detailsCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
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
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 1,
    marginBottom: 16,
  },
  deductionsList: {
    gap: 12,
    marginBottom: 32,
  },
  deductionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
  },
  deductionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  deductionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  deductionSub: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
    marginTop: 2,
  },
  deductionPoints: {
    fontSize: 14,
    fontWeight: '800',
  },
  dismissButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  dismissButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 32,
  },
  spacer: {
    height: 40,
  },
  pressed: {
    opacity: 0.85,
  },
});

export default DetailsScreen;
