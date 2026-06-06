import React from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileEditModalProps {
  visible: boolean;
  editName: string;
  editEmail: string;
  onChangeName: (text: string) => void;
  onChangeEmail: (text: string) => void;
  profileSuccess: boolean;
  profileError: string;
  onSave: () => void;
  onCancel: () => void;
}

export function ProfileEditModal({
  visible,
  editName,
  editEmail,
  onChangeName,
  onChangeEmail,
  profileSuccess,
  profileError,
  onSave,
  onCancel,
}: ProfileEditModalProps) {
  const cardColor = '#18181B';       // Zinc 900
  const borderColor = '#27272A';     // Zinc 800
  const matrixGreen = '#D4D4D4';     // Light Grey

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalBackdrop}
      >
        <Pressable style={styles.modalDismissOverlay} onPress={onCancel} />
        
        <View style={[styles.modalCard, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>EDIT ACCOUNT DETAILS</Text>
            <Pressable onPress={onCancel} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={20} color="#94A3B8" />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={[styles.textInput, { borderColor }]}
                value={editName}
                onChangeText={onChangeName}
                placeholder="e.g. Jane Doe"
                placeholderTextColor="#52525B"
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputGroup, { marginTop: 14 }]}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={[styles.textInput, { borderColor }]}
                value={editEmail}
                onChangeText={onChangeEmail}
                placeholder="e.g. driver@kinetix.ai"
                placeholderTextColor="#52525B"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
            {profileSuccess ? <Text style={styles.successText}>ACCOUNT DETAILS SAVED</Text> : null}

            <View style={styles.modalButtonRow}>
              <Pressable 
                onPress={onCancel}
                style={[styles.modalBtn, styles.modalCancelBtn]}
              >
                <Text style={styles.modalCancelBtnText}>CANCEL</Text>
              </Pressable>
              <Pressable 
                onPress={onSave}
                style={[styles.modalBtn, { backgroundColor: '#D4D4D4' }]}
              >
                <Ionicons name="checkmark-circle-outline" size={14} color="#000000" />
                <Text style={styles.modalSaveBtnText}>SAVE</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScrollContent: {
    gap: 4,
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
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  modalCancelBtn: {
    borderWidth: 1.5,
    borderColor: '#27272A',
    backgroundColor: 'transparent',
  },
  modalCancelBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  modalSaveBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
});
