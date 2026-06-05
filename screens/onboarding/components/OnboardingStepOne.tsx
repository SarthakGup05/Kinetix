import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function OnboardingStepOne() {
  return (
    <View style={styles.container}>
      {/* Visual Icon Row */}
      <View style={styles.iconRow}>
        <View style={styles.iconContainer}>
          <Ionicons name="speedometer-outline" size={32} color="#ffffff" />
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={32} color="#ffffff" />
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="trophy-outline" size={32} color="#ffffff" />
        </View>
      </View>

      <Text style={styles.title}>
        Track your driving.{"\n"}
        Prove you're safe.{"\n"}
        Earn your score.
      </Text>
      <Text style={styles.description}>
        Kinetix uses your device's motion sensors to analyze every trip — braking, acceleration, turns, and phone handling — delivering a real-time safety score you can be proud of.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff', // White Text
    lineHeight: 44,
    letterSpacing: -1,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#A1A1AA', // Muted Gray/White
    fontWeight: '500',
  },
});

export default OnboardingStepOne;
