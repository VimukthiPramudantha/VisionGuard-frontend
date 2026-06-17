// components/ui/Button.tsx
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
import { ArrowRight } from 'lucide-react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: any;
}

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: ButtonProps) {
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleHover = (isHovered: boolean) => {
    Animated.timing(hoverAnim, {
      toValue: isHovered ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const arrowTranslateX = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  });

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const isPrimary = variant === 'primary';
  const themeColor = isPrimary ? '#000000' : '#1e40af';
  const bgColor = isPrimary ? '#ffffff' : '#f8fafc';
  const borderColor = isPrimary ? '#000000' : '#e2e8f0';

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      // @ts-ignore
      onMouseEnter={() => handleHover(true)}
      // @ts-ignore
      onMouseLeave={() => handleHover(false)}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btnWrapper,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: bgColor,
            borderColor: borderColor,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={themeColor} size="small" />
        ) : (
          <>
            <Text style={[styles.text, { color: themeColor }]}>{title}</Text>
            
            <Animated.View
              style={[
                styles.arrowCircle,
                {
                  borderColor: themeColor,
                  transform: [{ translateX: arrowTranslateX }],
                },
              ]}
            >
              <ArrowRight size={16} color={themeColor} strokeWidth={2.5} />
            </Animated.View>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    borderWidth: 1.5,
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'System',
  },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});