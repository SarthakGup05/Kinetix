import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { type DriveSession } from '@/services/driveManager';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  isUnlocked: boolean;
  progress: number;
  progressText: string;
}

export function getDriverBadges(stats: any, history: DriveSession[]): Badge[] {
  const totalDrives = stats.totalDrives || 0;
  const totalDistanceKm = stats.totalDistanceKm || 0;
  const averageScore = stats.averageScore || 0;
  const rating = stats.rating || 'poor';

  // 1. FIRST MILESTONE
  const firstDriveUnlocked = totalDrives >= 1;
  const firstDriveProgress = firstDriveUnlocked ? 1 : 0;
  const firstDriveProgressText = `${Math.min(1, totalDrives)} / 1 drive`;

  // 2. ROAD WARRIOR
  const roadWarriorUnlocked = totalDistanceKm >= 50;
  const roadWarriorProgress = Math.min(1.0, totalDistanceKm / 50);
  const roadWarriorProgressText = `${Math.min(50, totalDistanceKm).toFixed(1)} / 50 km`;

  // 3. SMOOTH DRIVER
  const smoothDriverUnlocked = totalDrives >= 3 && averageScore >= 90;
  let smoothDriverProgress = 0;
  let smoothDriverProgressText = '';
  if (totalDrives < 3) {
    smoothDriverProgress = totalDrives / 3;
    smoothDriverProgressText = `${totalDrives} / 3 drives`;
  } else {
    smoothDriverProgress = Math.min(1.0, averageScore / 90);
    smoothDriverProgressText = `Avg Score: ${averageScore}`;
  }

  // 4. ZEN DRIVER
  const hasPerfect = history.some(session => session.finalScore === 100 && session.distanceKm > 0);
  const perfectProgress = hasPerfect ? 1.0 : 0.0;
  const perfectProgressText = hasPerfect ? "1 / 1" : "0 / 1";

  // 5. PHONE FREE STREAK
  let currentStreak = 0;
  let maxStreak = 0;
  const sortedHistory = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  for (const session of sortedHistory) {
    if (session.deductions.handling === 0) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }
  const phoneFreeUnlocked = maxStreak >= 3;
  const phoneFreeProgress = Math.min(1.0, maxStreak / 3);
  const phoneFreeProgressText = `${Math.min(3, maxStreak)} / 3 streak`;

  // 6. SAFETY MASTER
  const safetyMasterUnlocked = totalDrives >= 5 && rating === 'excellent';
  let safetyMasterProgress = 0;
  let safetyMasterProgressText = '';
  if (totalDrives < 5) {
    safetyMasterProgress = totalDrives / 5;
    safetyMasterProgressText = `${totalDrives} / 5 drives`;
  } else {
    safetyMasterProgress = rating === 'excellent' ? 1.0 : 0.8;
    safetyMasterProgressText = rating === 'excellent' ? 'Rating: EXCELLENT' : `Rating: ${rating.toUpperCase()}`;
  }

  // 7. NIGHT RIDER
  const hasNightSafe = history.some(session => {
    if (session.finalScore < 90) return false;
    const date = new Date(session.timestamp);
    const hour = date.getHours();
    return hour >= 22 || hour < 5;
  });
  const nightRiderProgress = hasNightSafe ? 1.0 : 0.0;
  const nightRiderProgressText = hasNightSafe ? "Completed" : "Not yet";

  // 8. CENTURY CLUB
  const maxSingleDistance = history.reduce((max, session) => {
    if (session.finalScore >= 85 && session.distanceKm > max) {
      return session.distanceKm;
    }
    return max;
  }, 0);
  const centuryClubUnlocked = maxSingleDistance >= 15;
  const centuryClubProgress = Math.min(1.0, maxSingleDistance / 15);
  const centuryClubProgressText = `${Math.min(15, maxSingleDistance).toFixed(1)} / 15 km`;

  return [
    {
      id: 'first_drive',
      name: 'FIRST MILESTONE',
      description: 'Complete your first driving session',
      icon: 'car-sport-outline',
      isUnlocked: firstDriveUnlocked,
      progress: firstDriveProgress,
      progressText: firstDriveProgressText
    },
    {
      id: 'road_warrior',
      name: 'ROAD WARRIOR',
      description: 'Drive a total of 50 km overall',
      icon: 'map-outline',
      isUnlocked: roadWarriorUnlocked,
      progress: roadWarriorProgress,
      progressText: roadWarriorProgressText
    },
    {
      id: 'smooth_operator',
      name: 'SMOOTH DRIVER',
      description: 'Avg score 90+ (min 3 drives)',
      icon: 'shield-checkmark-outline',
      isUnlocked: smoothDriverUnlocked,
      progress: smoothDriverProgress,
      progressText: smoothDriverProgressText
    },
    {
      id: 'perfect_run',
      name: 'ZEN DRIVER',
      description: 'Score 100 on any drive session',
      icon: 'star-outline',
      isUnlocked: hasPerfect,
      progress: perfectProgress,
      progressText: perfectProgressText
    },
    {
      id: 'phone_free',
      name: 'PHONE FREE',
      description: '3 consecutive drives with 0 handling',
      icon: 'phone-portrait-outline',
      isUnlocked: phoneFreeUnlocked,
      progress: phoneFreeProgress,
      progressText: phoneFreeProgressText
    },
    {
      id: 'safety_master',
      name: 'SAFETY MASTER',
      description: 'Excellent overall rating (min 5 drives)',
      icon: 'trophy-outline',
      isUnlocked: safetyMasterUnlocked,
      progress: safetyMasterProgress,
      progressText: safetyMasterProgressText
    },
    {
      id: 'night_rider',
      name: 'NIGHT RIDER',
      description: 'Safe drive (score 90+) at night',
      icon: 'moon-outline',
      isUnlocked: hasNightSafe,
      progress: nightRiderProgress,
      progressText: nightRiderProgressText
    },
    {
      id: 'century_club',
      name: 'CENTURY CLUB',
      description: 'Drive 15+ km with score 85+',
      icon: 'speedometer-outline',
      isUnlocked: centuryClubUnlocked,
      progress: centuryClubProgress,
      progressText: centuryClubProgressText
    }
  ];
}
