import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GreetingsBannerProps {
  userName: string;
  averageScore: number;
}

export function GreetingsBanner({ userName, averageScore }: GreetingsBannerProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'GOOD MORNING', icon: 'sunny-outline' as const, color: '#f59e0b' };
    if (hour < 17) return { text: 'GOOD AFTERNOON', icon: 'cloudy-night-outline' as const, color: '#3b82f6' };
    if (hour < 22) return { text: 'GOOD EVENING', icon: 'moon-outline' as const, color: '#a78bfa' };
    return { text: 'GOOD NIGHT', icon: 'moon-outline' as const, color: '#a78bfa' };
  };

  const getSubText = (score: number) => {
    if (score >= 90) return "Your telematics are excellent. Smooth ride ahead! 🏆";
    if (score >= 75) return "Your score is solid. Keep driving smooth to reach 90+! 🎯";
    return "Caution: Passenger comfort index is low. Watch your G-Force levels today. 🛡️";
  };

  const greeting = getGreeting();
  const subText = getSubText(averageScore);
  const firstName = userName ? userName.split(' ')[0].toUpperCase() : 'PILOT';

  return (
    <View style={styles.bannerContainer}>
      <View style={[styles.accentBar, { backgroundColor: greeting.color }]} />
      <View style={styles.content}>
        <View style={styles.textColumn}>
          <Text style={styles.greetingText}>{greeting.text}, {firstName}</Text>
          <Text style={styles.subText}>{subText}</Text>
        </View>
        <View style={[styles.iconWrapper, { borderColor: `${greeting.color}40`, backgroundColor: `${greeting.color}12` }]}>
          <Ionicons name={greeting.icon} size={20} color={greeting.color} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#18181B', // Zinc 900
    borderWidth: 1.5,
    borderColor: '#27272A',     // Zinc 800
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  textColumn: {
    flex: 1,
    gap: 3,
  },
  greetingText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'monospace',
    letterSpacing: 1.2,
  },
  subText: {
    fontSize: 11,
    color: '#94A3B8', // Slate 400
    fontWeight: '600',
    lineHeight: 15,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
