import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onValueChange: (checked: boolean) => void;
  label: string;
}

export function Checkbox({ checked, onValueChange, label }: CheckboxProps) {
  const matrixGreen = '#39FF14';

  return (
    <Pressable 
      onPress={() => onValueChange(!checked)} 
      style={styles.checkboxContainer}
    >
      <View style={[
        styles.checkbox, 
        { 
          borderColor: checked ? matrixGreen : '#71717A', 
          backgroundColor: checked ? matrixGreen : 'transparent' 
        }
      ]}>
        {checked && <Ionicons name="checkmark" size={12} color="#000000" />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '500',
  },
});

export default Checkbox;
