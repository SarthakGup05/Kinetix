import React, { useState } from 'react';
import { View, TextInput as RNTextInput, StyleSheet, Text, type TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface TextInputStyleProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextInput({ label, error, style, onFocus, onBlur, ...rest }: TextInputStyleProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isFocused ? tintColor : mutedColor }]}>
        {label}
      </Text>
      <RNTextInput
        style={[
          styles.input,
          {
            backgroundColor,
            color: textColor,
            borderColor: error ? '#ef4444' : isFocused ? tintColor : borderColor,
          },
          style,
        ]}
        placeholderTextColor={mutedColor + '80'}
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default TextInput;
