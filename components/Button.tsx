import React from 'react';
import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface ButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
}

export function Button({ onPress, title, style }: ButtonProps) {
  const tintColor = useThemeColor({}, 'tint');
  
  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.button, 
        { borderColor: tintColor }, 
        pressed && styles.pressed,
        style
      ]}
    >
      <Text style={[styles.text, { color: tintColor }]}>{title}</Text>
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
    backgroundColor: 'transparent',
  },
  text: {
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default Button;
