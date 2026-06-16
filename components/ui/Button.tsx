// components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
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
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            color={variant === 'primary' ? '#000' : '#1e40af'} 
            size="small" 
          />
        ) : (
          <>
            <Text
              style={[
                styles.text,
                variant === 'secondary' && styles.secondaryText,
              ]}
            >
              {title}
            </Text>

            <ArrowRight
              size={26}
              color={variant === 'primary' ? '#000' : '#1e40af'}
              style={styles.arrow}
            />
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  primary: {
    backgroundColor: '#85ECFF',
    borderWidth: 1,
    borderColor: '#85ECFF',
  },

  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginRight: 10,
  },

  secondaryText: {
    color: '#1e40af',
  },

  arrow: {
  },

  disabled: {
    opacity: 0.6,
  },
});