import React, { useState } from 'react';
import { View, ScrollView, Text, Pressable, TextInput, Switch, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { db } from '@/services/db';
import { settingsManager } from '@/services/settingsManager';
import { driveManager } from '@/services/driveManager';
import { DeleteAccountModal } from './DeleteAccountModal';

interface SettingsTabProps {
  onLogout: () => void;
  onSettingsChanged: () => void;
}

export function SettingsTab({ onLogout, onSettingsChanged }: SettingsTabProps) {
  // Preference Settings States
  const [hapticsEnabled, setHapticsEnabled] = useState(settingsManager.getSettings().hapticsEnabled);
  const [demoModeEnabled, setDemoModeEnabled] = useState(settingsManager.getSettings().demoModeEnabled);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settingsManager.getSettings().notificationsEnabled);

  // Groq API States
  const [groqApiKey, setGroqApiKey] = useState(settingsManager.getSettings().groqApiKey || '');
  const [groqModel, setGroqModel] = useState(settingsManager.getSettings().groqModel || 'llama-3.3-70b-versatile');
  const [saveKeySuccess, setSaveKeySuccess] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleToggleHaptics = async (value: boolean) => {
    setHapticsEnabled(value);
    await settingsManager.updateSettings({ hapticsEnabled: value });
    if (value) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
    onSettingsChanged();
  };

  const handleToggleDemoMode = async (value: boolean) => {
    setDemoModeEnabled(value);
    await settingsManager.updateSettings({ demoModeEnabled: value });
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onSettingsChanged();
  };

  const handleSaveGroqSettings = async () => {
    await settingsManager.updateSettings({
      groqApiKey: groqApiKey.trim(),
      groqModel: groqModel
    });
    setSaveKeySuccess(true);
    if (hapticsEnabled) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
    setTimeout(() => {
      setSaveKeySuccess(false);
    }, 2000);
    onSettingsChanged();
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await settingsManager.updateSettings({ notificationsEnabled: value });
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onSettingsChanged();
  };

  const handleDeleteAccount = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeleteModalVisible(false);
    if (hapticsEnabled) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
    }
    driveManager.clearHistory();
    const res = await db.deleteAccount();
    if (res.success) {
      try {
        await Promise.all([
          AsyncStorage.removeItem('@kinetix_has_shown_splash'),
          AsyncStorage.removeItem('@kinetix_has_completed_onboarding')
        ]);
      } catch {}
      onLogout();
    } else {
      Alert.alert('Error', res.error || 'Failed to delete account');
    }
  };

  const handleTermsPress = async () => {
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    Alert.alert('Terms & Privacy', 'Kinetix is an on-device driving safety telematics app. No raw sensor or location data is sent to external servers. All computations are performed locally.');
  };

  const cardColor = '#18181B';       // Zinc 900
  const borderColor = '#27272A';     // Zinc 800
  const matrixGreen = '#D4D4D4';     // Light Grey
  const accentCyan = '#3B82F6';      // Cobalt Blue

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
    >
      {/* App Preferences */}
      <Text style={styles.feedHeader}>PREFERENCES</Text>
      <View style={[styles.profileCard, { backgroundColor: cardColor, borderColor, gap: 14 }]}>
        {/* Toggle Haptics */}
        <View style={styles.preferenceRow}>
          <View style={styles.prefLeft}>
            <View style={[styles.prefIconBg, { backgroundColor: 'rgba(212, 212, 212, 0.1)' }]}>
              <Ionicons name="finger-print-outline" size={18} color={matrixGreen} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.prefTitle}>Tactile Haptics</Text>
              <Text style={styles.prefDesc}>Vibrate device on key interactions</Text>
            </View>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={handleToggleHaptics}
            trackColor={{ false: '#27272A', true: `${matrixGreen}50` }}
            thumbColor={hapticsEnabled ? matrixGreen : '#94A3B8'}
          />
        </View>

        <View style={styles.prefDivider} />

        {/* Toggle Demo Mode */}
        <View style={styles.preferenceRow}>
          <View style={styles.prefLeft}>
            <View style={[styles.prefIconBg, { backgroundColor: 'rgba(212, 212, 212, 0.1)' }]}>
              <Ionicons name="flask-outline" size={18} color={matrixGreen} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.prefTitle}>Force Demo Mode</Text>
              <Text style={styles.prefDesc}>Simulate driving sensor data for QA</Text>
            </View>
          </View>
          <Switch
            value={demoModeEnabled}
            onValueChange={handleToggleDemoMode}
            trackColor={{ false: '#27272A', true: `${matrixGreen}50` }}
            thumbColor={demoModeEnabled ? matrixGreen : '#94A3B8'}
          />
        </View>

        <View style={styles.prefDivider} />

        {/* Toggle Notifications */}
        <View style={styles.preferenceRow}>
          <View style={styles.prefLeft}>
            <View style={[styles.prefIconBg, { backgroundColor: 'rgba(212, 212, 212, 0.1)' }]}>
              <Ionicons name="notifications-outline" size={18} color={matrixGreen} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.prefTitle}>Weekly Summaries</Text>
              <Text style={styles.prefDesc}>Receive weekly driver safety reports</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#27272A', true: `${matrixGreen}50` }}
            thumbColor={notificationsEnabled ? matrixGreen : '#94A3B8'}
          />
        </View>
      </View>

      {/* Groq API Config */}
      <Text style={styles.feedHeader}>AI ASSISTANT SETUP</Text>
      <View style={[styles.profileCard, { backgroundColor: cardColor, borderColor, gap: 14 }]}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>GROQ API KEY</Text>
          <TextInput
            style={[styles.textInput, { borderColor }]}
            value={groqApiKey}
            onChangeText={setGroqApiKey}
            placeholder="gsk_..."
            placeholderTextColor="#52525B"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>MODEL CHOICE</Text>
          <View style={styles.modelRow}>
            {(['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'] as const).map((model) => {
              const isSelected = groqModel === model;
              return (
                <Pressable
                  key={model}
                  onPress={async () => {
                    setGroqModel(model);
                    if (hapticsEnabled) {
                      try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                    }
                  }}
                  style={[
                    styles.modelOptionBtn,
                    { 
                      borderColor: isSelected ? matrixGreen : '#27272A',
                      backgroundColor: isSelected ? 'rgba(212, 212, 212, 0.1)' : 'transparent'
                    }
                  ]}
                >
                  <Text style={[styles.modelOptionText, { color: isSelected ? '#ffffff' : '#94A3B8' }]}>
                    {model.split('-').slice(0, 3).join('-')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {saveKeySuccess ? <Text style={styles.successText}>AI ASSISTANT SETTINGS SAVED</Text> : null}

        <Pressable 
          onPress={handleSaveGroqSettings}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: '#D4D4D4' },
            pressed && styles.pressedPill
          ]}
        >
          <Ionicons name="cloud-upload-outline" size={16} color="#000000" />
          <Text style={styles.saveButtonText}>SAVE AI SETTINGS</Text>
        </Pressable>
      </View>

      {/* App Info */}
      <Text style={styles.feedHeader}>APPLICATION</Text>
      <View style={[styles.profileCard, { backgroundColor: cardColor, borderColor, paddingVertical: 14, gap: 14 }]}>
        <View style={styles.appInfoRow}>
          <View style={styles.appInfoLeft}>
            <Ionicons name="information-circle-outline" size={18} color="#94A3B8" />
            <Text style={styles.appInfoLabel}>App Version</Text>
          </View>
          <Text style={styles.appInfoValue}>1.4.0 (Stable)</Text>
        </View>
        <View style={styles.prefDivider} />
        <Pressable onPress={handleTermsPress} style={styles.appInfoRow}>
          <View style={styles.appInfoLeft}>
            <Ionicons name="shield-outline" size={18} color="#94A3B8" />
            <Text style={styles.appInfoLabel}>Terms & Privacy Policies</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={14} color="#94A3B8" />
        </Pressable>
      </View>

      {/* Settings & Actions */}
      <Text style={styles.feedHeader}>SETTINGS</Text>
      <View style={[styles.profileCard, { backgroundColor: cardColor, borderColor, gap: 12 }]}>
        <Pressable 
          onPress={onLogout}
          style={({ pressed }) => [
            styles.logoutActionBtn,
            { borderColor: '#94A3B8' },
            pressed && styles.pressed
          ]}
        >
          <Ionicons name="log-out-outline" size={16} color="#94A3B8" />
          <Text style={[styles.logoutActionText, { color: '#94A3B8' }]}>LOG OUT</Text>
        </Pressable>

        <Pressable 
          onPress={handleDeleteAccount}
          style={({ pressed }) => [
            styles.logoutActionBtn,
            { borderColor: '#ef4444' },
            pressed && styles.pressed
          ]}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
          <Text style={styles.logoutActionText}>DELETE ACCOUNT</Text>
        </Pressable>
      </View>

      <DeleteAccountModal
        visible={isDeleteModalVisible}
        onConfirm={handleConfirmDeleteAccount}
        onCancel={() => setIsDeleteModalVisible(false)}
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
  feedHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717A',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  prefIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  prefDesc: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 1,
  },
  prefDivider: {
    height: 1,
    backgroundColor: '#27272A',
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  appInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  appInfoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  logoutActionBtn: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutActionText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  pressed: {
    opacity: 0.8,
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
  modelRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  modelOptionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelOptionText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  successText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
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
    marginTop: 8,
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
});
