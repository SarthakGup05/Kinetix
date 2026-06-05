import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function SocialLoginButtons() {
  const cardColor = '#18181B';
  const borderColor = '#27272A';

  return (
    <View style={styles.thirdPartyContainer}>
      <Pressable style={[styles.socialButton, { backgroundColor: cardColor, borderColor }]}>
        <Ionicons name="logo-apple" size={20} color="#ffffff" style={styles.socialIcon} />
        <Text style={styles.socialButtonText}>Apple</Text>
      </Pressable>
      <Pressable style={[styles.socialButton, { backgroundColor: cardColor, borderColor }]}>
        <Ionicons name="logo-google" size={20} color="#EA4335" style={styles.socialIcon} />
        <Text style={styles.socialButtonText}>Google</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  thirdPartyContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderWidth: 1.5,
    borderRadius: 26,
    gap: 8,
  },
  socialIcon: {
    marginRight: 4,
  },
  socialButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SocialLoginButtons;
