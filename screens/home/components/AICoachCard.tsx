import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { type DriveSession } from '@/services/driveManager';
import { settingsManager } from '@/services/settingsManager';
import { generateAICoachingReport } from '@/services/aiCoach';

interface AICoachCardProps {
  stats: {
    totalDrives: number;
    totalDistanceKm: number;
    totalDurationSeconds: number;
    averageScore: number;
    rating: string;
  };
  allDrives: DriveSession[];
}

export function AICoachCard({ stats, allDrives }: AICoachCardProps) {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const cardColor = '#18181B';       // Zinc 900
  const borderColor = '#27272A';     // Zinc 800
  const matrixGreen = '#D4D4D4';     // Light Grey

  useEffect(() => {
    const initCoach = async () => {
      try {
        const report = await generateAICoachingReport(stats, allDrives);
        setAiReport(report);
      } catch {}
    };
    initCoach();
  }, [allDrives]);

  const handleReanalyze = async () => {
    if (isLoadingAI) return;
    setIsLoadingAI(true);
    
    const hapticsEnabled = settingsManager.getSettings().hapticsEnabled;

    const steps = [
      "PARSING TELEMETRY...",
      "ANALYZING DEDUCTIONS...",
      "COMPUTING G-FORCE TRENDS...",
      "EVALUATING DISTRACTION RISK..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i]);
      if (hapticsEnabled) {
        try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const report = await generateAICoachingReport(stats, allDrives, true);
      setAiReport(report);
      if (hapticsEnabled) {
        try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      }
    } catch (e) {
      setAiReport("Failed to generate coach advice. Please check your network connection and API key.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <View style={[styles.statsCard, { backgroundColor: cardColor, borderColor, gap: 12 }]}>
      <View style={styles.aiCoachHeader}>
        <View style={styles.aiCoachLeft}>
          <View style={[styles.aiCoachIconBg, { backgroundColor: 'rgba(212,212,212,0.1)' }]}>
            <Ionicons name="sparkles" size={16} color={matrixGreen} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiCoachTitle}>KINETIX PILOT AI</Text>
            <Text style={styles.aiCoachSub}>Real-Time Driving Safety Advisor</Text>
          </View>
        </View>
      </View>

      <View style={styles.aiCoachDivider} />

      {isLoadingAI ? (
        <View style={styles.aiCoachLoadingContainer}>
          <Text style={styles.aiCoachLoadingText}>{loadingStep}</Text>
          <View style={styles.aiCoachProgressBarBg}>
            <View style={[styles.aiCoachProgressBar, { backgroundColor: matrixGreen }]} />
          </View>
        </View>
      ) : (
        <>
          <Text style={styles.aiCoachText}>
            {aiReport || "Press Re-Analyze to generate personalized driving habit feedback."}
          </Text>
          <Pressable 
            onPress={handleReanalyze} 
            style={({ pressed }) => [
              styles.reanalyzeBtn,
              pressed && styles.pressedBtn
            ]}
          >
            <Ionicons name="sparkles-outline" size={13} color="#000000" />
            <Text style={styles.reanalyzeBtnText}>RE-ANALYZE TELEMETRY</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  aiCoachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiCoachLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiCoachIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiCoachTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  aiCoachSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#71717A',
    marginTop: 2,
  },
  reanalyzeBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4D4D4',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  reanalyzeBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  pressedBtn: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  aiCoachDivider: {
    height: 1,
    backgroundColor: '#27272A',
  },
  aiCoachText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    fontWeight: '600',
  },
  aiCoachLoadingContainer: {
    paddingVertical: 4,
    gap: 8,
  },
  aiCoachLoadingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#71717A',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  aiCoachProgressBarBg: {
    height: 4,
    backgroundColor: '#27272A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  aiCoachProgressBar: {
    height: '100%',
    width: '45%',
    borderRadius: 2,
  },
});
