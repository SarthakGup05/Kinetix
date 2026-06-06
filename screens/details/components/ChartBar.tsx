import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ChartBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  points: number;
  count: number;
}

export function ChartBar({ label, value, maxValue, color, icon, points, count }: ChartBarProps) {
  const barAnim = useRef(new Animated.Value(0)).current;
  const fillRatio = maxValue > 0 ? value / maxValue : 0;

  useEffect(() => {
    Animated.spring(barAnim, {
      toValue: fillRatio,
      friction: 8,
      tension: 60,
      useNativeDriver: false,
    }).start();
  }, [fillRatio]);

  return (
    <View style={chartStyles.barRow}>
      <View style={chartStyles.barLabelCol}>
        <View style={[chartStyles.barIconBg, { backgroundColor: `${color}18` }]}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
        <Text style={chartStyles.barLabel} numberOfLines={1}>{label}</Text>
      </View>

      <View style={chartStyles.barTrackContainer}>
        <View style={chartStyles.barTrack}>
          <Animated.View
            style={[
              chartStyles.barFill,
              {
                width: barAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: color,
                shadowColor: color,
              },
            ]}
          />
          {[0.25, 0.5, 0.75].map((tick) => (
            <View
              key={tick}
              style={[chartStyles.tickMark, { left: `${tick * 100}%` as any }]}
            />
          ))}
        </View>
        <View style={chartStyles.barMeta}>
          <Text style={[chartStyles.barCount, { color }]}>
            {count} event{count !== 1 ? 's' : ''}
          </Text>
          <Text style={chartStyles.barPoints}>
            {points > 0 ? `-${points} pts` : '0 pts'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  barLabelCol: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barIconBg: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
    flex: 1,
  },
  barTrackContainer: {
    flex: 1,
    gap: 4,
  },
  barTrack: {
    height: 10,
    backgroundColor: '#1C1C1F',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  tickMark: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#27272A',
    zIndex: 2,
  },
  barMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barCount: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  barPoints: {
    fontSize: 9,
    fontWeight: '700',
    color: '#52525B',
    fontFamily: 'monospace',
  },
});
