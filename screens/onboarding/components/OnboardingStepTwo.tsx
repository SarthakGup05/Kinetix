import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function OnboardingStepTwo() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        We need access.{"\n"}
        No hidden tracking.
      </Text>
      
      <View style={styles.accessList}>
        {/* Motion & Fitness Access */}
        <View style={styles.accessItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="fitness" size={24} color="#ffffff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>Motion & Fitness</Text>
            <Text style={styles.itemDescription}>
              Detects braking, acceleration, and turns via accelerometer & gyroscope.
            </Text>
          </View>
        </View>

        {/* Location Access */}
        <View style={styles.accessItem}>
          <View style={styles.iconContainer}>
            <Ionicons name="compass-outline" size={24} color="#ffffff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>Location</Text>
            <Text style={styles.itemDescription}>
              Used only during active drives. Never tracked in background without consent.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff', // White Text
    lineHeight: 44,
    letterSpacing: -1,
  },
  accessList: {
    gap: 24,
  },
  accessItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff', // White Title
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#A1A1AA', // Grey description
    fontWeight: '500',
  },
});

export default OnboardingStepTwo;
