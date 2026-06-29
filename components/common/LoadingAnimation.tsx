// components/common/LoadingAnimation.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

export default function LoadingAnimation() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 2,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['0%', '100%', '0%'],
    extrapolate: 'clamp',
  });

  const barLeft = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['0%', '0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          { width: barWidth, left: barLeft },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 130,
    height: 4,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.15)',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#0071e2',
  },
});