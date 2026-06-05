import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export function AuthBrandingHeader() {
  const brandGreen = '#10B981';
  
  return (
    <View style={styles.brandingHeader}>
      <ThemedText style={styles.brandingLogoText}>Kinetix</ThemedText>
      <View style={[styles.brandingBadge, { backgroundColor: brandGreen }]}>
        <ThemedText style={styles.brandingBadgeText}>SAFETY</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 28,
  },
  brandingLogoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  brandingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  brandingBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
  },
});

export default AuthBrandingHeader;
