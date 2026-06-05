import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';

export function HomeScreen() {
  const router = useRouter();
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Console Status Panel */}
      <View style={[styles.consoleCard, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.headerRow}>
          <View style={[styles.statusIndicator, { backgroundColor: tintColor }]} />
          <ThemedText variant="mono" style={styles.consoleTitle}>
            KINETIX_OS // READY
          </ThemedText>
        </View>
        <ThemedText variant="muted" style={styles.consoleLogs}>
          Initializing interface modules...{'\n'}
          System status: nominal.{'\n'}
          Ready for telemetry input.
        </ThemedText>
      </View>

      <Button 
        title="Enter Terminal" 
        onPress={() => router.push('/details')} 
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
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  consoleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  consoleLogs: {
    fontSize: 12,
    lineHeight: 18,
  },
});

export default HomeScreen;
