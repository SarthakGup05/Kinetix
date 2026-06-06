import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingStepThreeProps {
  brand: string;
  onChangeBrand: (val: string) => void;
  model: string;
  onChangeModel: (val: string) => void;
  brandError?: string;
  modelError?: string;
}

export function OnboardingStepThree({
  brand,
  onChangeBrand,
  model,
  onChangeModel,
  brandError,
  modelError,
}: OnboardingStepThreeProps) {
  const [isBrandFocused, setIsBrandFocused] = useState(false);
  const [isModelFocused, setIsModelFocused] = useState(false);

  const cardColor = '#18181B';       // Zinc 900
  const borderColor = '#27272A';     // Zinc 800
  const matrixGreen = '#D4D4D4';     // Light Grey

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vehicle Profile</Text>
        <Text style={styles.description}>
          Add your vehicle details below to customize your driving analytics experience.
        </Text>
      </View>

      <View style={styles.form}>
        {/* Car Brand Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Car Brand</Text>
          <View style={[
            styles.inputFieldContainer,
            { 
              backgroundColor: cardColor,
              borderColor: brandError ? '#ef4444' : isBrandFocused ? matrixGreen : borderColor 
            }
          ]}>
            <Ionicons name="car-outline" size={20} color="#71717A" style={styles.inputIcon} />
            <TextInput
              value={brand}
              onChangeText={onChangeBrand}
              placeholder="e.g. Tesla, Ford, Toyota"
              placeholderTextColor="#71717A"
              style={styles.textInput}
              onFocus={() => setIsBrandFocused(true)}
              onBlur={() => setIsBrandFocused(false)}
            />
          </View>
          {brandError ? <Text style={styles.errorText}>{brandError}</Text> : null}
        </View>

        {/* Car Model Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Car Model</Text>
          <View style={[
            styles.inputFieldContainer,
            { 
              backgroundColor: cardColor,
              borderColor: modelError ? '#ef4444' : isModelFocused ? matrixGreen : borderColor 
            }
          ]}>
            <Ionicons name="options-outline" size={20} color="#71717A" style={styles.inputIcon} />
            <TextInput
              value={model}
              onChangeText={onChangeModel}
              placeholder="e.g. Model 3, Mustang, RAV4"
              placeholderTextColor="#71717A"
              style={styles.textInput}
              onFocus={() => setIsModelFocused(true)}
              onBlur={() => setIsModelFocused(false)}
            />
          </View>
          {modelError ? <Text style={styles.errorText}>{modelError}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff', // White Title
    lineHeight: 44,
    letterSpacing: -1,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#A1A1AA', // Grey description
    fontWeight: '500',
  },
  form: {
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff', // White input label
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderWidth: 1.5,
    borderRadius: 27,
    paddingHorizontal: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#ffffff', // White input text
    fontSize: 15,
    fontWeight: '600',
    height: '100%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 12,
  },
});

export default OnboardingStepThree;
