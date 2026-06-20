// components/ui/AuthCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AuthInput from './AuthInput';
import AuthButton from './AuthButton';

interface AuthCardProps {
  type?: 'login' | 'signup';
  email?: string;
  setEmail?: (text: string) => void;
  password?: string;
  setPassword?: (text: string) => void;
  fullName?: string;
  setFullName?: (text: string) => void;
  loading?: boolean;
  onSubmit?: () => void;
  onSwitch?: () => void;
  children?: React.ReactNode;
}

export default function AuthCard({
  type,
  email,
  setEmail,
  password,
  setPassword,
  fullName = '',
  setFullName,
  loading = false,
  onSubmit,
  onSwitch,
  children,
}: AuthCardProps) {
  return (
    <View style={styles.card}>
      {children ? (
        children
      ) : (
        <>
          <Text style={styles.title}>
            {type === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {type === 'login'
              ? 'Sign in to continue to VisionGuard'
              : 'Join VisionGuard to secure your cameras'}
          </Text>

          {type === 'signup' && setFullName && (
            <AuthInput
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              icon="email"
            />
          )}

          {setEmail && (
            <AuthInput
              label="Email"
              placeholder="Enter your email"
              value={email ?? ''}
              onChangeText={setEmail}
              icon="email"
            />
          )}

          {setPassword && (
            <AuthInput
              label="Password"
              placeholder="Enter your password"
              value={password ?? ''}
              onChangeText={setPassword}
              secureTextEntry
              icon="password"
            />
          )}

          {type === 'login' && (
            <View style={styles.flexRow}>
              <TouchableOpacity style={styles.rememberMe}>
                <View style={styles.checkbox} />
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          )}

          {onSubmit && (
            <AuthButton
              title={type === 'login' ? 'Sign In' : 'Sign Up'}
              variant={type === 'login' ? 'signin' : 'signup'}
              onPress={onSubmit}
              loading={loading}
            />
          )}

          {onSwitch && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {type === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={onSwitch}>
                <Text style={styles.switchText}>
                  {type === 'login' ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 28,
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#151717',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
  },
  rememberText: {
    fontSize: 14,
    color: '#555',
  },
  forgotText: {
    color: '#2d79f3',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#555',
    fontSize: 14,
  },
  switchText: {
    color: '#2d79f3',
    fontWeight: '600',
    fontSize: 14,
  },
});