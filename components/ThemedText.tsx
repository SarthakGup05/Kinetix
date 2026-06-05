import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'title' | 'mono' | 'muted';
};

export function ThemedText({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'default',
  ...rest 
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, variant === 'muted' ? 'muted' : 'text');
  
  return (
    <Text 
      style={[
        { color }, 
        styles.base,
        variant === 'title' && styles.title,
        variant === 'mono' && styles.mono,
        variant === 'muted' && styles.muted,
        style
      ]} 
      {...rest} 
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  mono: {
    fontFamily: 'Platform' === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  muted: {
    fontSize: 14,
  },
});

export default ThemedText;
