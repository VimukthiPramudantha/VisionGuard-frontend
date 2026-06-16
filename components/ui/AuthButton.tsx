// components/ui/AuthButton.tsx
import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const circleWidth = useRef(new Animated.Value(48)).current; 

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(circleWidth, {
        toValue: 220, 
        duration: 450,
        easing: Easing.cubic,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(circleWidth, {
        toValue: 48,
        duration: 450,
        easing: Easing.cubic,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const bgColor = variant === 'signin' ? '#52D0EB' : '#5FEB52';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      style={styles.wrapper}
    >
      <Animated.View
        style={[
          styles.button,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >

        <Animated.View
          style={[
            styles.circle,
            {
              backgroundColor: bgColor,
              width: circleWidth,
            },
          ]}
        >
          <View style={styles.arrowContainer}>
            <ArrowRight size={18} color="#fff" strokeWidth={3} />
          </View>
        </Animated.View>

        <Text style={[styles.text, { color: loading ? '#666' : '#282936' }]}>
          {loading ? 'Please wait...' : title}
        </Text>

        {loading && (
          <ActivityIndicator
            size="small"
            color="#fff"
            style={styles.loader}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  button: {
    width: 220, 
    height: 58,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 48,
    height: 48,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    zIndex: 2,
  },
  loader: {
    position: 'absolute',
    right: 20,
  },
});