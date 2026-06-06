import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SimulationPanelProps {
  onTrigger: (type: 'braking' | 'acceleration' | 'turn' | 'phone_handling') => void;
}

export function SimulationPanel({ onTrigger }: SimulationPanelProps) {
  return (
    <View style={styles.simulationPanel}>
      <Text style={styles.simLabel}>SIMULATE EVENT (QA):</Text>
      <View style={styles.simRow}>
        {(['braking', 'acceleration', 'turn', 'phone_handling'] as const).map((type) => (
          <Pressable 
            key={type} 
            onPress={() => onTrigger(type)} 
            style={styles.simBtn}
          >
            <Ionicons
              name={
                type === 'braking' ? 'trending-down-outline' :
                type === 'acceleration' ? 'speedometer-outline' :
                type === 'turn' ? 'git-branch-outline' : 'phone-portrait-outline'
              }
              size={14}
              color="#A1A1AA"
            />
            <Text style={styles.simBtnText}>
              {type === 'phone_handling' ? 'Phone' :
               type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  simulationPanel: {
    marginTop: 20,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#27272A',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#18181B',
  },
  simLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#71717A',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  simRow: {
    flexDirection: 'row',
    gap: 8,
  },
  simBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: '#27272A',
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  simBtnText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
});
