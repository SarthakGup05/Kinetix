import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';

export function DetailsScreen() {
  const router = useRouter();
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Telemetry Output Panel */}
      <View style={[styles.consoleCard, { backgroundColor: cardColor, borderColor }]}>
        <ThemedText variant="mono" style={styles.consoleTitle}>
          TELEMETRY_LOGS // SESSION_01
        </ThemedText>
        <View style={styles.divider} />
        
        <View style={styles.metricsRow}>
          <ThemedText variant="mono" style={styles.metricLabel}>FREQ:</ThemedText>
          <ThemedText variant="mono" style={[styles.metricValue, { color: tintColor }]}>60.00 Hz</ThemedText>
        </View>

        <View style={styles.metricsRow}>
          <ThemedText variant="mono" style={styles.metricLabel}>GAIN:</ThemedText>
          <ThemedText variant="mono" style={[styles.metricValue, { color: tintColor }]}>+12.4 dB</ThemedText>
        </View>

        <View style={styles.metricsRow}>
          <ThemedText variant="mono" style={styles.metricLabel}>STAT:</ThemedText>
          <ThemedText variant="mono" style={[styles.metricValue, { color: tintColor }]}>OPTIMAL</ThemedText>
        </View>
      </View>

      <Button 
        title="Exit Terminal" 
        onPress={() => router.back()} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 32,
  },
  consoleCard: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 20,
    gap: 16,
  },
  consoleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default DetailsScreen;
