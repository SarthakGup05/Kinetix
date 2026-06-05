import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AuthSegmentedTabsProps {
  isLogin: boolean;
  onToggle: (isLogin: boolean) => void;
}

export function AuthSegmentedTabs({ isLogin, onToggle }: AuthSegmentedTabsProps) {
  const cardColor = '#1E293B';
  const brandGreen = '#10B981';

  return (
    <View style={[styles.tabContainer, { backgroundColor: cardColor }]}>
      <Pressable 
        onPress={() => onToggle(true)}
        style={[styles.tabButton, isLogin ? { backgroundColor: brandGreen } : null]}
      >
        <Text style={[styles.tabButtonText, { color: isLogin ? '#000000' : '#ffffff' }]}>
          Login
        </Text>
      </Pressable>
      <Pressable 
        onPress={() => onToggle(false)}
        style={[styles.tabButton, !isLogin ? { backgroundColor: brandGreen } : null]}
      >
        <Text style={[styles.tabButtonText, { color: !isLogin ? '#000000' : '#ffffff' }]}>
          Sign Up
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 26,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AuthSegmentedTabs;
