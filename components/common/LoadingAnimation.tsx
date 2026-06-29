// components/common/LoadingAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function LoadingAnimation() {
  const bar1 = useRef(new Animated.Value(0.2)).current;
  const bar2 = useRef(new Animated.Value(0.4)).current;
  const bar3 = useRef(new Animated.Value(0.6)).current;
  const bar4 = useRef(new Animated.Value(0.8)).current;
  const bar5 = useRef(new Animated.Value(1)).current;
  const ball = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateBars = () => {
      Animated.loop(
        Animated.parallel([
            Animated.sequence([
            Animated.timing(bar1, { toValue: 1, duration: 2000, useNativeDriver: true }),
            Animated.timing(bar1, { toValue: 0.2, duration: 2000, useNativeDriver: true }),
          ]),
            Animated.sequence([
            Animated.timing(bar2, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
            Animated.timing(bar2, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
          ]),
            Animated.sequence([
            Animated.timing(bar4, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
            Animated.timing(bar4, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
          ]),
            Animated.sequence([
            Animated.timing(bar5, { toValue: 0.2, duration: 2000, useNativeDriver: true }),
            Animated.timing(bar5, { toValue: 1, duration: 2000, useNativeDriver: true }),
          ]),
        ])
      ).start();
    };

    const animateBall = () => {
      Animated.loop(
          Animated.sequence([
          Animated.timing(ball, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(ball, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    };

    animateBars();
    animateBall();
  }, []);

  const ballPosition = ball.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [0, 8, 15, 23, 30, 38, 45, 53, 60, 45, 0],
  });

  const ballY = ball.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [0, -14, -10, -24, -20, -34, -30, -44, -40, -30, 0],
  });

  return (
    <View style={styles.loader}>
      <Animated.View style={[styles.bar, styles.bar1, { transform: [{ scaleY: bar1 }] }]} />
      <Animated.View style={[styles.bar, styles.bar2, { transform: [{ scaleY: bar2 }] }]} />
      <Animated.View style={[styles.bar, styles.bar3, { transform: [{ scaleY: bar3 }] }]} />
      <Animated.View style={[styles.bar, styles.bar4, { transform: [{ scaleY: bar4 }] }]} />
      <Animated.View style={[styles.bar, styles.bar5, { transform: [{ scaleY: bar5 }] }]} />

      <Animated.View
        style={[
          styles.ball,
          {
            transform: [
              { translateX: ballPosition },
              { translateY: ballY },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    width: 150,
    height: 250,
    position: 'relative',
    alignSelf: 'center',
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    width: 10,
    height: 60,
    backgroundColor: '#000',
    borderRadius: 2,
    transformOrigin: 'bottom',
  },
  bar1: { left: 0 },
  bar2: { left: 17 },
  bar3: { left: 34 },
  bar4: { left: 51 },
  bar5: { left: 68 },
  ball: {
    position: 'absolute',
    bottom: 12,
    width: 11,
    height: 11,
    backgroundColor: '#2c8fff',
    borderRadius: 50,
  },
});