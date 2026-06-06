import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { db } from '@/services/db';
import { settingsManager } from '@/services/settingsManager';
import { driveManager } from '@/services/driveManager';
import { getDriverBadges } from '../utils/badgeHelper';
import { getScoreColor, getScoreGrade } from '../utils/helpers';
import { ProfileEditModal } from './ProfileEditModal';

interface ProfileTabProps {
  user: any;
  stats: {
    totalDrives: number;
    totalDistanceKm: number;
    totalDurationSeconds: number;
    averageScore: number;
    rating: string;
  };
  onUserUpdated: () => void;
}

export function ProfileTab({ user, stats, onUserUpdated }: ProfileTabProps) {
  // Vehicle Form States
  const [editBrand, setEditBrand] = useState(user?.vehicleBrand || '');
  const [editModel, setEditModel] = useState(user?.vehicleModel || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Profile Form States
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);

  const hapticsEnabled = settingsManager.getSettings().hapticsEnabled;

  useEffect(() => {
    // Keep local form inputs in sync with user prop updates
    setEditBrand(user?.vehicleBrand || '');
    setEditModel(user?.vehicleModel || '');
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
  }, [user]);

  const handleSaveVehicle = async () => {
    setFormError('');
    setSaveSuccess(false);

    if (!editBrand.trim() || !editModel.trim()) {
      setFormError('Both brand and model are required');
      if (hapticsEnabled) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {}
      }
      return;
    }

    db.updateUserVehicle(editBrand, editModel);
    onUserUpdated();
    setSaveSuccess(true);
    setIsEditingVehicle(false);
    if (hapticsEnabled) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    setProfileSuccess(false);

    if (!editName.trim() || !editEmail.trim()) {
      setProfileError('Both name and email are required');
      if (hapticsEnabled) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {}
      }
      return;
    }

    const res = await db.updateUserProfile(editName, editEmail);
    if (res.success) {
      onUserUpdated();
      setProfileSuccess(true);
      if (hapticsEnabled) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }
      setTimeout(() => {
        setProfileSuccess(false);
        setIsEditingProfile(false);
      }, 1000);
    } else {
      setProfileError(res.error || 'Failed to update profile');
      if (hapticsEnabled) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch {}
      }
    }
  };

  const handleCancelProfileEdit = async () => {
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setProfileError('');
    setProfileSuccess(false);
    setIsEditingProfile(false);
  };

  const initials = user?.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) 
    : 'TP';

  const cardColor = '#18181B';       // Zinc 900
  const borderColor = '#27272A';     // Zinc 800
  const matrixGreen = '#D4D4D4';     // Light Grey
  const accentCyan = '#3B82F6';      // Cobalt Blue
  const lightGrey = '#94A3B8';       // Slate 400

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
    >
      {/* Driver Profile Metadata Card */}
      <View style={[styles.profileCard, { backgroundColor: cardColor, borderColor }]}>
        <View style={styles.profileHeader}>
          <View style={{ position: 'relative' }}>
            <View style={[styles.avatarCircleLarge, { borderColor: getScoreColor(stats.averageScore) }]}>
              {user?.avatarUrl ? (
                <Text style={{ fontSize: 28 }}>{user.avatarUrl}</Text>
              ) : (
                <Text style={[styles.avatarTextLarge, { color: getScoreColor(stats.averageScore) }]}>{initials}</Text>
              )}
            </View>
            <Pressable 
              onPress={async () => {
                if (hapticsEnabled) {
                  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                }
                setEditName(user?.name || '');
                setEditEmail(user?.email || '');
                setProfileError('');
                setProfileSuccess(false);
                setIsEditingProfile(true);
              }}
              style={styles.avatarEditBadge}
            >
              <Ionicons name="pencil" size={10} color="#ffffff" />
            </Pressable>
          </View>
          <View style={{ gap: 4, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.profilePilotName}>{user?.name || 'Test Driver'}</Text>
              <Pressable 
                onPress={async () => {
                  if (hapticsEnabled) {
                    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  }
                  setEditName(user?.name || '');
                  setEditEmail(user?.email || '');
                  setProfileError('');
                  setProfileSuccess(false);
                  setIsEditingProfile(true);
                }}
                style={styles.nameEditBtn}
              >
                <Ionicons name="pencil-outline" size={14} color={lightGrey} />
              </Pressable>
            </View>
            <Text style={styles.profilePilotEmail}>{user?.email || 'driver@kinetix.ai'}</Text>
          </View>
        </View>
        
        <View style={styles.profileDivider} />
        
        <View style={styles.profileStatRow}>
          <View>
            <Text style={styles.profileStatLabel}>DRIVER RANKING</Text>
            <Text style={[styles.profileStatValue, { color: getScoreColor(stats.averageScore) }]}>
              {stats.rating.toUpperCase()}
            </Text>
          </View>
          <View style={styles.verticalProfileDivider} />
          <View>
            <Text style={styles.profileStatLabel}>SAFETY RATING</Text>
            <Text style={styles.profileStatValue}>GRADE {getScoreGrade(stats.averageScore)}</Text>
          </View>
        </View>
      </View>

      {/* Garage Setup Form */}
      <Text style={styles.feedHeader}>VEHICLE DETAILS</Text>
      {user?.vehicleBrand && user?.vehicleModel && !isEditingVehicle ? (
        <View style={[styles.profileCard, { backgroundColor: cardColor, borderColor, gap: 12 }]}>
          <View style={styles.vehicleInfoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleInfoLabel}>BRAND</Text>
              <Text style={styles.vehicleInfoValue}>{user.vehicleBrand.toUpperCase()}</Text>
            </View>
            <View style={styles.vehicleInfoDivider} />
            <View style={{ flex: 1, paddingLeft: 16 }}>
              <Text style={styles.vehicleInfoLabel}>MODEL</Text>
              <Text style={styles.vehicleInfoValue}>{user.vehicleModel.toUpperCase()}</Text>
            </View>
          </View>
          
          <Pressable 
            onPress={() => {
              if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setIsEditingVehicle(true);
            }}
            style={({ pressed }) => [
              styles.editVehicleBtn,
              pressed && styles.pressedPill
            ]}
          >
            <Ionicons name="pencil-outline" size={14} color="#ffffff" />
            <Text style={styles.editVehicleBtnText}>EDIT VEHICLE</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.profileCard, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>VEHICLE BRAND</Text>
            <TextInput
              style={[styles.textInput, { borderColor }]}
              value={editBrand}
              onChangeText={(text) => {
                setEditBrand(text);
                setFormError('');
              }}
              placeholder="e.g. Porsche, Tesla"
              placeholderTextColor="#52525B"
              autoCapitalize="words"
            />
          </View>

          <View style={[styles.inputGroup, { marginTop: 14 }]}>
            <Text style={styles.inputLabel}>VEHICLE MODEL</Text>
            <TextInput
              style={[styles.textInput, { borderColor }]}
              value={editModel}
              onChangeText={(text) => {
                setEditModel(text);
                setFormError('');
              }}
              placeholder="e.g. 911 GT3, Model 3"
              placeholderTextColor="#52525B"
              autoCapitalize="words"
            />
          </View>

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
          {saveSuccess ? <Text style={styles.successText}>VEHICLE DETAILS SAVED</Text> : null}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            {user?.vehicleBrand && user?.vehicleModel && (
              <Pressable 
                onPress={() => {
                  if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setEditBrand(user.vehicleBrand || '');
                  setEditModel(user.vehicleModel || '');
                  setIsEditingVehicle(false);
                }}
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed && styles.pressedPill
                ]}
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </Pressable>
            )}
            <Pressable 
              onPress={handleSaveVehicle}
              style={({ pressed }) => [
                styles.saveButton,
                { backgroundColor: '#D4D4D4', flex: 1, marginTop: 0 },
                pressed && styles.pressedPill
              ]}
            >
              <Ionicons name="save-outline" size={16} color="#000000" />
              <Text style={styles.saveButtonText}>SAVE VEHICLE</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Driver Achievements / Badges Grid */}
      <Text style={styles.feedHeader}>DRIVER ACHIEVEMENTS</Text>
      <View style={{ gap: 12 }}>
        {(() => {
          const driveHistory = driveManager.getDriveHistory();
          const badges = getDriverBadges(stats, driveHistory);
          const badgeRows = [];
          for (let i = 0; i < badges.length; i += 2) {
            badgeRows.push(badges.slice(i, i + 2));
          }
          
          return badgeRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.badgeRow}>
              {row.map((badge) => {
                const borderCol = badge.isUnlocked ? matrixGreen : '#27272A';
                const opacity = badge.isUnlocked ? 1.0 : 0.45;
                return (
                  <View 
                    key={badge.id} 
                    style={[
                      styles.badgeCard, 
                      { 
                        backgroundColor: cardColor, 
                        borderColor: borderCol,
                        opacity 
                      }
                    ]}
                  >
                    <View style={styles.badgeCardHeader}>
                      <Ionicons 
                        name={badge.icon} 
                        size={20} 
                        color={badge.isUnlocked ? matrixGreen : lightGrey} 
                      />
                      {!badge.isUnlocked && (
                        <Ionicons name="lock-closed" size={12} color={lightGrey} />
                      )}
                      {badge.isUnlocked && (
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      )}
                    </View>
                    
                    <View style={{ marginTop: 8, flex: 1, justifyContent: 'center' }}>
                      <Text style={styles.badgeName}>{badge.name}</Text>
                      <Text style={styles.badgeDesc}>{badge.description}</Text>
                    </View>

                    <View style={styles.badgeProgressContainer}>
                      <View style={styles.badgeProgressBarBg}>
                        <View 
                          style={[
                            styles.badgeProgressBar, 
                            { 
                              width: `${badge.progress * 100}%`,
                              backgroundColor: badge.isUnlocked ? matrixGreen : '#52525B'
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.badgeProgressText}>{badge.progressText}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ));
        })()}
      </View>

      {/* Nest the Profile Edit Modal */}
      <ProfileEditModal
        visible={isEditingProfile}
        editName={editName}
        editEmail={editEmail}
        onChangeName={(text) => {
          setEditName(text);
          setProfileError('');
        }}
        onChangeEmail={(text) => {
          setEditEmail(text);
          setProfileError('');
        }}
        profileSuccess={profileSuccess}
        profileError={profileError}
        onSave={handleSaveProfile}
        onCancel={handleCancelProfileEdit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 110,
    gap: 18,
  },
  profileCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 18,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarCircleLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextLarge: {
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#18181B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  nameEditBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePilotName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  profilePilotEmail: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  profileDivider: {
    height: 1,
    backgroundColor: '#27272A',
    marginVertical: 14,
  },
  profileStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  profileStatLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  profileStatValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  verticalProfileDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#27272A',
  },
  feedHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  textInput: {
    height: 44,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#ffffff',
    backgroundColor: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  successText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  saveButton: {
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  pressedPill: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    minHeight: 125,
    justifyContent: 'space-between',
  },
  badgeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeName: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  badgeDesc: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 12,
  },
  badgeProgressContainer: {
    marginTop: 8,
    gap: 4,
  },
  badgeProgressBarBg: {
    height: 4,
    backgroundColor: '#27272A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  badgeProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  badgeProgressText: {
    fontSize: 8,
    color: '#71717A',
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  vehicleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  vehicleInfoLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  vehicleInfoValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  vehicleInfoDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#27272A',
  },
  editVehicleBtn: {
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#27272A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  editVehicleBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  cancelBtn: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  cancelBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
});
