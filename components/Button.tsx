import React from 'react';
import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface ButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
}

export function Button({ onPress, title, style }: ButtonProps) {
  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.button, 
        pressed && styles.pressed,
        style
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4D4D4',
    borderColor: '#D4D4D4',
  },
  text: {
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#000000',
  },
  pressed: {
    opacity: 0.7,
  },
});

export default Button;
