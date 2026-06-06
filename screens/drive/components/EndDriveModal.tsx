import React from 'react';
import { View, StyleSheet, Pressable, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EndDriveModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EndDriveModal({ visible, onConfirm, onCancel }: EndDriveModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalDismissOverlay} onPress={onCancel} />
        <View style={styles.modalCard}>
          <View style={styles.modalIconCircle}>
            <Ionicons name="alert-circle-outline" size={28} color="#ffffff" />
          </View>
          <Text style={styles.modalTitle}>STOP DRIVING?</Text>
          <Text style={styles.modalDescription}>
            Are you sure you want to stop tracking? Your live safety score and telemetry data will be finalized and saved.
          </Text>
          <View style={styles.modalButtonStack}>
            <Pressable 
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalPrimaryBtn,
                pressed && { opacity: 0.85 }
              ]}
            >
              <Text style={styles.modalPrimaryBtnText}>FINALIZE & SAVE</Text>
            </Pressable>
            <Pressable 
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalSecondaryBtn,
                pressed && { opacity: 0.85 }
              ]}
            >
              <Text style={styles.modalSecondaryBtnText}>CONTINUE DRIVING</Text>
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
  modalSecondaryBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#27272A',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalSecondaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
});
