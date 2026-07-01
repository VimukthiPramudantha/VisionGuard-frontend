// components/common/InfoTooltip.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface InfoTooltipProps {
  message?: string;
}

export default function InfoTooltip({
  message = 'There are no cameras connected',
}: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const show = () => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -8,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  };

  const toggle = () => {
    if (visible) {
      hide();
    } else {
      show();
    }
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.tooltip,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <Text style={styles.tooltipText}>{message}</Text>
      </Animated.View>

      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.8}
        style={styles.iconButton}
        accessibilityLabel={message}
        accessibilityRole="button"
      >
        <Svg
          viewBox="0 0 320 512"
          width={16}
          height={16}
          fill="#06b6d4"
        >
          <Path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    backgroundColor: '#e2e8f0',
    padding: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 10,
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 220,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
  },
  tooltipText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
