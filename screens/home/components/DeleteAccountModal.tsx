import React from 'react';
import { View, StyleSheet, Pressable, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeleteAccountModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteAccountModal({ visible, onConfirm, onCancel }: DeleteAccountModalProps) {
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
            <Ionicons name="trash-outline" size={28} color="#ef4444" />
          </View>
          <Text style={styles.modalTitle}>DELETE ACCOUNT?</Text>
          <Text style={styles.modalDescription}>
            Are you sure you want to permanently delete your Kinetix account and clear all drive history? This action cannot be undone.
          </Text>
          <View style={styles.modalButtonStack}>
            <Pressable 
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalPrimaryBtn,
                pressed && { opacity: 0.85 }
              ]}
            >
              <Text style={styles.modalPrimaryBtnText}>DELETE PERMANENTLY</Text>
            </Pressable>
            <Pressable 
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalSecondaryBtn,
                pressed && { opacity: 0.85 }
              ]}
            >
              <Text style={styles.modalSecondaryBtnText}>KEEP ACCOUNT</Text>
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
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
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
