import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedSplashScreenProps {
  onComplete: () => void;
}

export function AnimatedSplashScreen({ onComplete }: AnimatedSplashScreenProps) {
  const [logText, setLogText] = useState('Loading...');

  // Reanimated Shared Values
  const iconY = useSharedValue(-400); // Start off-screen
  const textOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  
  // Screen exit shared values
  const screenScale = useSharedValue(1);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Text fades in smoothly
    textOpacity.value = withTiming(1, { duration: 800 });

    // 2. Icon drops down with a physics-based spring bounce
    iconY.value = withDelay(
      300,
      withSpring(
        0,
        {
          damping: 12,
          stiffness: 90,
          mass: 1,
        },
        (finished) => {
          if (finished) {
            // 3. Subtitle fades in right after the icon settles
            subtitleOpacity.value = withTiming(1, { duration: 400 });
          }
        }
      )
    );

    // 4. Educational/System loading text sequence
    const logTimer1 = setTimeout(() => setLogText('Preparing drive profile...'), 1200);
    const logTimer2 = setTimeout(() => setLogText('Safe drive checks active'), 2200);

    // 5. Zoom away and complete
    const completeTimer = setTimeout(() => {
      screenScale.value = withTiming(1.3, {
        duration: 600,
        easing: Easing.inOut(Easing.ease),
      });
      screenOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          // runOnJS is required to call external React functions from the UI thread
          runOnJS(onComplete)();
        }
      });
    }, 3600);

    return () => {
      clearTimeout(logTimer1);
      clearTimeout(logTimer2);
      clearTimeout(completeTimer);
    };
  }, []);

  // --- Animated Styles ---
  
  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ scale: screenScale.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconY.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const animatedSubtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedScreenStyle]}>
      <View style={styles.centerWrapper}>
        
        {/* Dropping and Bouncing Icon */}
        <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
          <View style={styles.iconBackground}>
            <Ionicons name="car-sport" size={54} color="#0B0C10" />
          </View>
        </Animated.View>

        {/* Main Brand Text */}
        <Animated.View style={[styles.textContainer, animatedTextStyle]}>
          <Text style={styles.splashText}>Kinetix</Text>
        </Animated.View>

        {/* Educational Subtitle / Logs */}
        <Animated.View style={[styles.subtitleContainer, animatedSubtitleStyle]}>
          <Text style={styles.subtitleText}>{logText}</Text>
        </Animated.View>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A', // Slate 900
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  centerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: 24,
    zIndex: 2, 
  },
  iconBackground: {
    backgroundColor: '#10B981', // Emerald Green
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  splashText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF', // Pure White
    letterSpacing: 1.5,
  },
  subtitleContainer: {
    height: 30,
    justifyContent: 'center',
    marginTop: 4,
  },
  subtitleText: {
    color: '#10B981', // Emerald Green for the sub-text
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default AnimatedSplashScreen;