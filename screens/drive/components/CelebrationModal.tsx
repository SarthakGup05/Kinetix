import React from 'react';
import { View, StyleSheet, Pressable, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CelebrationModalProps {
  visible: boolean;
  onDismiss: () => void;
  badge: {
    name: string;
    description: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    progressText: string;
  } | null;
}

export function CelebrationModal({ visible, onDismiss, badge }: CelebrationModalProps) {
  const matrixGreen = '#D4D4D4';
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { borderColor: matrixGreen }]}>
          <View style={[styles.badgeCelebrateOutlineCircle, { borderColor: matrixGreen }]}>
            <View style={[styles.badgeCelebrateInnerCircle, { backgroundColor: '#18181B', borderColor: matrixGreen }]}>
              {badge && (
                <Ionicons 
                  name={badge.icon} 
                  size={36} 
                  color={matrixGreen} 
                />
              )}
            </View>
          </View>
          
          <View style={styles.achievementBadgeTag}>
            <Ionicons name="trophy" size={10} color="#000000" />
            <Text style={styles.achievementBadgeTagText}>ACHIEVEMENT UNLOCKED</Text>
          </View>

          <Text style={[styles.modalTitle, { fontSize: 16, marginTop: 12 }]}>
            {badge?.name}
          </Text>
          
          <Text style={[styles.modalDescription, { marginBottom: 18 }]}>
            {badge?.description}
          </Text>

          <View style={[styles.modalStatsCard, { paddingVertical: 10, paddingHorizontal: 14, marginBottom: 24, gap: 8, flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 9, fontFamily: 'monospace', color: '#94A3B8', fontWeight: '800' }}>COMPLETED STATUS</Text>
              <Text style={{ fontSize: 9, fontFamily: 'monospace', color: matrixGreen, fontWeight: '800' }}>{badge?.progressText}</Text>
            </View>
            <View style={{ height: 6, backgroundColor: '#27272A', borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: '100%', backgroundColor: matrixGreen }} />
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
              <Text style={styles.modalPrimaryBtnText}>AWESOME</Text>
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
    backgroundColor: '#000000',
    borderColor: '#27272A',
    borderWidth: 1.5,
    borderRadius: 12,
    width: '100%',
  },
  badgeCelebrateOutlineCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#000000',
  },
  badgeCelebrateInnerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementBadgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D4D4D4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  achievementBadgeTagText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
