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

  const circleWidth = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 192],
  });

  const arrowTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  const shaftOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

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
      // @ts-ignore: web-only props
      onMouseEnter={() => animateTo(1)}
      // @ts-ignore: web-only props
      onMouseLeave={() => animateTo(0)}
      style={[styles.btnWrapper, (disabled || loading) && styles.disabled]}
      disabled={disabled || loading}
    >
      <View style={styles.button}>
        <Animated.View
          style={[
            styles.circle,
            {
              backgroundColor: bgColor,
              width: circleWidth,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.arrowContainer,
              { transform: [{ translateX: arrowTranslateX }] },
            ]}
          >
            <Animated.View style={[styles.arrowShaft, { opacity: shaftOpacity }]} />
            <View style={styles.arrowHead} />
          </Animated.View>
        </Animated.View>

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
    width: 192, 
    height: 48, 
    backgroundColor: 'transparent',
    position: 'relative',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 48, 
    borderRadius: 26,
    justifyContent: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    left: 10, 
    width: 18, 
    height: 2, 
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
    top: -4, 
    right: 1,
    width: 10,
    height: 10,
    borderTopWidth: 2, 
    borderRightWidth: 2,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
  },
  buttonText: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    paddingVertical: 12,
    marginLeft: 30, 
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