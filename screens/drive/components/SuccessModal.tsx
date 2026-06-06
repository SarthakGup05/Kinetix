import React from 'react';
import { View, StyleSheet, Pressable, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuccessModalProps {
  visible: boolean;
  onDismiss: () => void;
  stats: {
    score: number;
    distance: string;
    duration: string;
  } | null;
}

export function SuccessModal({ visible, onDismiss, stats }: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalDismissOverlay} onPress={onDismiss} />
        <View style={styles.modalCard}>
          <View style={styles.modalIconCircle}>
            <Ionicons name="checkmark-circle-outline" size={28} color="#ffffff" />
          </View>
          <Text style={styles.modalTitle}>DRIVE SECURED</Text>
          <Text style={styles.modalDescription}>
            Your driving analytics session has been uploaded to your profile successfully.
          </Text>

          <View style={styles.modalStatsCard}>
            <View style={styles.modalStatCol}>
              <Text style={styles.modalStatVal}>{stats?.score}</Text>
              <Text style={styles.modalStatLbl}>SCORE</Text>
            </View>
            <View style={styles.modalStatDivider} />
            <View style={styles.modalStatCol}>
              <Text style={styles.modalStatVal}>{stats?.distance}</Text>
              <Text style={styles.modalStatLbl}>DISTANCE</Text>
            </View>
            <View style={styles.modalStatDivider} />
            <View style={styles.modalStatCol}>
              <Text style={styles.modalStatVal}>{stats?.duration}</Text>
              <Text style={styles.modalStatLbl}>DURATION</Text>
            </View>
          </View>

          <View style={styles.modalButtonStack}>
            <Pressable 
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.modalPrimaryBtn,
                pressed && { opacity: 0.85 }
              ]}
            >
              <Text style={styles.modalPrimaryBtnText}>VIEW REPORT</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalDismissOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#18181B',
    borderColor: '#27272A',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#000000',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    fontWeight: '600',
  },
  modalButtonStack: {
    width: '100%',
    gap: 12,
  },
  modalPrimaryBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D4D4D4',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalPrimaryBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  modalStatsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    borderColor: '#27272A',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    width: '100%',
    marginBottom: 24,
  },
  modalStatCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  modalStatVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  modalStatLbl: {
    fontSize: 8,
    fontWeight: '700',
    color: '#71717A',
    letterSpacing: 0.5,
  },
  modalStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#27272A',
  },
});
