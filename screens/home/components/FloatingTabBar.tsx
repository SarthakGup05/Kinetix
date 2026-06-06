import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_MARGIN = 20;
const TAB_BAR_PADDING = 6;
const TAB_BAR_WIDTH = SCREEN_WIDTH - TAB_BAR_MARGIN * 2;
const TAB_WIDTH = (TAB_BAR_WIDTH - TAB_BAR_PADDING * 2) / 4;

type TabType = 'dashboard' | 'history' | 'profile' | 'settings';

interface FloatingTabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  hapticsEnabled: boolean;
}

export function FloatingTabBar({ activeTab, onChangeTab, hapticsEnabled }: FloatingTabBarProps) {
  const tabIndexAnim = useRef(new Animated.Value(
    activeTab === 'dashboard' ? 0 : activeTab === 'history' ? 1 : activeTab === 'profile' ? 2 : 3
  )).current;

  // Scaling animations for the 4 tabs
  const dashboardScale = tabIndexAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1.08, 0.92, 0.92, 0.92],
  });

  const historyScale = tabIndexAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0.92, 1.08, 0.92, 0.92],
  });

  const profileScale = tabIndexAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0.92, 0.92, 1.08, 0.92],
  });

  const settingsScale = tabIndexAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0.92, 0.92, 0.92, 1.08],
  });

  // Slide translation animation
  const translateXAnim = tabIndexAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, TAB_WIDTH, TAB_WIDTH * 2, TAB_WIDTH * 3],
  });

  useEffect(() => {
    const targetIndex = 
      activeTab === 'dashboard' ? 0 : 
      activeTab === 'history' ? 1 : 
      activeTab === 'profile' ? 2 : 3;
    Animated.spring(tabIndexAnim, {
      toValue: targetIndex,
      useNativeDriver: true,
      tension: 60,
      friction: 9,
    }).start();
  }, [activeTab]);

  const handleTabPress = async (tab: TabType) => {
    if (hapticsEnabled) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onChangeTab(tab);
  };

  const matrixGreen = '#D4D4D4';     // Light Grey
  const lightGrey = '#94A3B8';       // Slate 400

  return (
    <View style={styles.floatingTabBar}>
      {/* Sliding Capsule Background */}
      <Animated.View 
        style={[
          styles.tabIndicatorCapsule, 
          {
            transform: [{ translateX: translateXAnim }]
          }
        ]} 
      />

      {/* Dashboard Tab */}
      <Pressable 
        onPress={() => handleTabPress('dashboard')} 
        style={styles.tabButton}
      >
        <Animated.View style={{ transform: [{ scale: dashboardScale }], alignItems: 'center' }}>
          <Ionicons 
            name={activeTab === 'dashboard' ? 'speedometer' : 'speedometer-outline'} 
            size={20} 
            color={activeTab === 'dashboard' ? matrixGreen : lightGrey} 
          />
          <Text style={[
            styles.tabLabel, 
            { color: activeTab === 'dashboard' ? matrixGreen : lightGrey }
          ]}>
            Console
          </Text>
        </Animated.View>
      </Pressable>

      {/* History Tab */}
      <Pressable 
        onPress={() => handleTabPress('history')} 
        style={styles.tabButton}
      >
        <Animated.View style={{ transform: [{ scale: historyScale }], alignItems: 'center' }}>
          <Ionicons 
            name={activeTab === 'history' ? 'time' : 'time-outline'} 
            size={20} 
            color={activeTab === 'history' ? matrixGreen : lightGrey} 
          />
          <Text style={[
            styles.tabLabel, 
            { color: activeTab === 'history' ? matrixGreen : lightGrey }
          ]}>
            History
          </Text>
        </Animated.View>
      </Pressable>

      {/* Profile Tab */}
      <Pressable 
        onPress={() => handleTabPress('profile')} 
        style={styles.tabButton}
      >
        <Animated.View style={{ transform: [{ scale: profileScale }], alignItems: 'center' }}>
          <Ionicons 
            name={activeTab === 'profile' ? 'person' : 'person-outline'} 
            size={20} 
            color={activeTab === 'profile' ? matrixGreen : lightGrey} 
          />
          <Text style={[
            styles.tabLabel, 
            { color: activeTab === 'profile' ? matrixGreen : lightGrey }
          ]}>
            Profile
          </Text>
        </Animated.View>
      </Pressable>

      {/* Settings Tab */}
      <Pressable 
        onPress={() => handleTabPress('settings')} 
        style={styles.tabButton}
      >
        <Animated.View style={{ transform: [{ scale: settingsScale }], alignItems: 'center' }}>
          <Ionicons 
            name={activeTab === 'settings' ? 'settings' : 'settings-outline'} 
            size={20} 
            color={activeTab === 'settings' ? matrixGreen : lightGrey} 
          />
          <Text style={[
            styles.tabLabel, 
            { color: activeTab === 'settings' ? matrixGreen : lightGrey }
          ]}>
            Settings
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingTabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#27272A',
    backgroundColor: 'rgba(24, 24, 27, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  tabIndicatorCapsule: {
    position: 'absolute',
    left: 6,
    width: TAB_WIDTH,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212, 212, 212, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(212, 212, 212, 0.35)',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    gap: 2,
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});
