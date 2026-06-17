// components/ui/AuthButton.tsx
import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  View,
  Animated,
  Easing,
  ActivityIndicator,
  Pressable,
} from 'react-native';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  variant: 'signin' | 'signup';
  loading?: boolean;
  disabled?: boolean;
}

export default function AuthButton({
  title,
  onPress,
  variant = 'signin',
  loading = false,
  disabled = false,
}: AuthButtonProps) {
  const animValue = useRef(new Animated.Value(0)).current;

  const animateTo = (toValue: number) => {
    Animated.timing(animValue, {
      toValue,
      duration: 450,
      easing: Easing.bezier(0.65, 0, 0.076, 1),
      useNativeDriver: false,
    }).start();
  };

  const bgColor = variant === 'signin' ? '#52D0EB' : '#5FEB52';

  // Circle width interpolation: 3rem (48px) to 100% (192px)
  const circleWidth = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 192],
  });

  // Arrow translate x: starts 0, moves 1rem (16px) right
  const arrowTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  // Arrow shaft line opacity: starts background: none, becomes white background
  const shaftOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Text color: starts #282936, becomes #ffffff
  const textColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#282936', '#ffffff'],
  });

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      // Support mouse hover triggers on Web
      // @ts-ignore: web-only props
      onMouseEnter={() => animateTo(1)}
      // @ts-ignore: web-only props
      onMouseLeave={() => animateTo(0)}
      style={[styles.btnWrapper, (disabled || loading) && styles.disabled]}
      disabled={disabled || loading}
    >
      <View style={styles.button}>
        {/* Background Circle */}
        <Animated.View
          style={[
            styles.circle,
            {
              backgroundColor: bgColor,
              width: circleWidth,
            },
          ]}
        >
          {/* Custom CSS-equivalent Arrow */}
          <Animated.View
            style={[
              styles.arrowContainer,
              { transform: [{ translateX: arrowTranslateX }] },
            ]}
          >
            {/* Shaft (shaftOpacity controls background fade-in) */}
            <Animated.View style={[styles.arrowShaft, { opacity: shaftOpacity }]} />
            {/* Head (Arrow tip) */}
            <View style={styles.arrowHead} />
          </Animated.View>
        </Animated.View>

        {/* Text */}
        <Animated.Text style={[styles.buttonText, { color: textColor }]}>
          {loading ? 'WAIT...' : title}
        </Animated.Text>

        {loading && (
          <ActivityIndicator
            size="small"
            color="#fff"
            style={styles.loader}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btnWrapper: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  button: {
    width: 192, // 12rem
    height: 48, // 3rem
    backgroundColor: 'transparent',
    position: 'relative',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 48, // 3rem
    borderRadius: 26, // 1.625rem
    justifyContent: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    left: 10, // 0.625rem
    width: 18, // 1.125rem
    height: 2, // 0.125rem
    justifyContent: 'center',
  },
  arrowShaft: {
    width: 18,
    height: 2,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  arrowHead: {
    position: 'absolute',
    top: -4, // ~ -0.29rem
    right: 1, // ~ 0.0625rem
    width: 10, // 0.625rem
    height: 10, // 0.625rem
    borderTopWidth: 2, // 0.125rem
    borderRightWidth: 2, // 0.125rem
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  buttonText: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    paddingVertical: 12,
    marginLeft: 30, // 1.85rem indent
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loader: {
    position: 'absolute',
    right: 16,
  },
});