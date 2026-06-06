import React from 'react';
import { View, StyleSheet, Text, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const presets = [
  { id: 'racecar', char: '🏎️', label: 'Race Car' },
  { id: 'sedan', char: '🚗', label: 'Sedan' },
  { id: 'suv', char: '🚙', label: 'SUV' },
  { id: 'motorbike', char: '🏍️', label: 'Motorbike' },
  { id: 'lightning', char: '⚡', label: 'Lightning' },
  { id: 'finishflag', char: '🏁', label: 'Finish Flag' },
  { id: 'crown', char: '👑', label: 'Crown' },
  { id: 'shield', char: '🛡️', label: 'Shield' },
  { id: 'rocket', char: '🚀', label: 'Rocket' },
];

interface OnboardingStepAvatarProps {
  selectedAvatar: string;
  onSelectAvatar: (char: string) => void;
  hapticsEnabled?: boolean;
}

export function OnboardingStepAvatar({
  selectedAvatar,
  onSelectAvatar,
  hapticsEnabled = true,
}: OnboardingStepAvatarProps) {
  const cardColor = '#18181B';       // Zinc 900
  const borderColor = '#27272A';     // Zinc 800
  const matrixGreen = '#D4D4D4';     // Light Grey

  const handleSelect = async (char: string) => {
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onSelectAvatar(char);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Avatar</Text>
        <Text style={styles.description}>
          Select a driver icon representing your driving style. This will be shown on your dashboard and profile.
        </Text>
      </View>

      <View style={styles.grid}>
        {presets.map((item) => {
          const isSelected = selectedAvatar === item.char;
          return (
            <Pressable
              key={item.id}
              onPress={() => handleSelect(item.char)}
              style={[
                styles.gridItem,
                { 
                  backgroundColor: cardColor, 
                  borderColor: isSelected ? matrixGreen : borderColor 
                }
              ]}
            >
              <Text style={styles.avatarChar}>{item.char}</Text>
              <Text style={styles.avatarLabel}>{item.label}</Text>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: matrixGreen }]}>
                  <Ionicons name="checkmark" size={10} color="#000000" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 44,
    letterSpacing: -1,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 10,
  },
  avatarChar: {
    fontSize: 28,
    marginBottom: 4,
  },
  avatarLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingStepAvatar;
