import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { getScoreColor, getScoreGrade } from '../utils/helpers';

interface RadialHUDProps {
  score: number;
  rating: string;
}

export function RadialHUD({ score, rating }: RadialHUDProps) {
  const scoreColor = getScoreColor(score);
  return (
    <View style={styles.hudWrapper}>
      <View style={[styles.radialHUDRingOuter, { borderColor: `${scoreColor}25` }]}>
        <View style={[styles.radialHUDBorder, { borderColor: scoreColor }]}>
          <View style={styles.hudInnerCircle}>
            <Text style={[styles.hudScoreValue, { color: scoreColor }]}>
              {score}
            </Text>
            <Text style={styles.hudScoreLabel}>LIFETIME SCORE</Text>
            <View style={[styles.gradePill, { backgroundColor: `${scoreColor}15` }]}>
              <Text style={[styles.gradeText, { color: scoreColor }]}>
                GRADE {getScoreGrade(score)} — {rating.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hudWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  radialHUDRingOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radialHUDBorder: {
    width: 155,
    height: 155,
    borderRadius: 78,
    borderWidth: 4,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudInnerCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  hudScoreValue: {
    fontSize: 44,
    fontWeight: '900',
    textAlign: 'center',
  },
  hudScoreLabel: {
    fontSize: 8,
    color: '#71717A',
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: -2,
    marginBottom: 4,
  },
  gradePill: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  gradeText: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
});
