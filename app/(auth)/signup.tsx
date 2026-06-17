// app/(auth)/signup.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  useWindowDimensions,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Shield, Eye, Bell, Cpu, ArrowRight } from 'lucide-react-native';
import { api } from '../../services/api';
import AuthCard from '../../components/ui/AuthCard';
import AuthInput from '../../components/ui/AuthInput';
import AuthButton from '../../components/ui/AuthButton';

let goeyToast: any = null;
if (Platform.OS === 'web') {
  try {
    goeyToast = require('goey-toast').goeyToast;
  } catch (e) {
    console.warn('goey-toast failed to load in signup page', e);
  }
}

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === 'web' && width >= 800;

  const triggerToast = (type: 'success' | 'error', title: string, message?: string) => {
    if (Platform.OS === 'web' && goeyToast) {
      if (type === 'success') {
        goeyToast.success(title, message ? { description: message } : undefined);
      } else {
        goeyToast.error(title, message ? { description: message } : undefined);
      }
    } else {
      Alert.alert(title, message || '');
    }
  };

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      triggerToast('error', 'Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      triggerToast('error', 'Error', 'Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      triggerToast('error', 'Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        role: 'user',
      });
      console.log('Registration successful:', response.data);
      triggerToast('success', 'Success', 'Account created successfully! Please sign in.');
      router.push('/login');
    } catch (error: any) {
      console.error(error);
      triggerToast(
        'error',
        'Registration Failed',
        error.response?.data?.detail || 'Failed to create account'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    router.push('/login');
  };

  const renderLeftPanel = () => (
    <View style={styles.leftPanel}>
      {/* Decorative Glow Blobs */}
      <View style={[styles.glowBlob, styles.blob1]} />
      <View style={[styles.glowBlob, styles.blob2]} />

      <View style={styles.brandContainer}>
        <View style={styles.logoWrapper}>
          <Shield size={38} color="#5FEB52" />
          <View style={styles.logoGlow} />
        </View>
        <Text style={styles.brandTitle}>VisionGuard</Text>
        <Text style={styles.brandSubtitle}>
          Next-generation AI video analytics and real-time surveillance defense.
        </Text>
      </View>

      <View style={styles.featuresList}>
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: 'rgba(82, 208, 235, 0.1)' }]}>
            <Cpu size={20} color="#52D0EB" />
          </View>
          <View style={styles.featureTexts}>
            <Text style={styles.featureTitle}>Cognitive AI Core</Text>
            <Text style={styles.featureDescription}>
              Instantly flags suspicious actions, perimeter breaches, and safety hazards.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: 'rgba(95, 235, 82, 0.1)' }]}>
            <Bell size={20} color="#5FEB52" />
          </View>
          <View style={styles.featureTexts}>
            <Text style={styles.featureTitle}>Zero-latency Alerts</Text>
            <Text style={styles.featureDescription}>
              Receive rich notifications with live-frame captures and immediate telemetry.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: 'rgba(255, 178, 54, 0.1)' }]}>
            <Shield size={20} color="#FFB236" />
          </View>
          <View style={styles.featureTexts}>
            <Text style={styles.featureTitle}>Secured Integrations</Text>
            <Text style={styles.featureDescription}>
              Connect network video recorders and IP feeds directly with end-to-end encryption.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footerBranding}>
        <Text style={styles.copyright}>
          VisionGuard Platform v1.2 • Secure System
        </Text>
      </View>
    </View>
  );

  const renderCardContent = () => (
    <AuthCard>
      <Text style={styles.cardTitle}>Create Account</Text>
      <Text style={styles.cardSubtitle}>Join VisionGuard to secure your cameras</Text>

      <View style={styles.formGap}>
        <AuthInput
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          icon="email"
        />

        <AuthInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          icon="email"
        />

        <AuthInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          icon="password"
        />

        <AuthInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          icon="password"
        />
      </View>

      <View style={styles.btnSpacing} />

      <AuthButton
        title="Sign Up"
        variant="signup"
        onPress={handleSignup}
        loading={loading}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={handleSwitchToLogin} style={styles.switchButton}>
          <Text style={styles.switchText}>Sign In</Text>
          <ArrowRight size={14} color="#2d79f3" />
        </TouchableOpacity>
      </View>
    </AuthCard>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Background Decorative Glows for the Form Area */}
      <View style={[styles.ambientGlow, styles.ambient1]} />
      <View style={[styles.ambientGlow, styles.ambient2]} />

      {isDesktop ? (
        <View style={styles.desktopLayout}>
          {renderLeftPanel()}
          <View style={styles.rightPanel}>
            {renderCardContent()}
          </View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mobileBrand}>
            <View style={styles.mobileLogoWrapper}>
              <Shield size={36} color="#5FEB52" />
              <View style={styles.mobileLogoGlow} />
            </View>
            <Text style={styles.mobileTitle}>VisionGuard</Text>
            <Text style={styles.mobileSubtitle}>Create security account</Text>
          </View>
          {renderCardContent()}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9fc',
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1.1,
    backgroundColor: '#05070c',
    padding: 60,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
    width: 300,
    height: 300,
  },
  blob1: {
    backgroundColor: '#2d79f3',
    top: -50,
    left: -50,
  },
  blob2: {
    backgroundColor: '#5FEB52',
    bottom: -50,
    right: -50,
  },
  brandContainer: {
    marginTop: 20,
    zIndex: 2,
  },
  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(95, 235, 82, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(95, 235, 82, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#5FEB52',
    borderRadius: 20,
    opacity: 0.2,
    zIndex: -1,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.8,
  },
  brandSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 10,
    fontWeight: '400',
    lineHeight: 24,
  },
  featuresList: {
    gap: 20,
    marginVertical: 40,
    zIndex: 2,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 20,
    borderRadius: 18,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  featureTexts: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  featureDescription: {
    fontSize: 13.5,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 19,
  },
  footerBranding: {
    zIndex: 2,
  },
  copyright: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  rightPanel: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 2,
  },
  mobileBrand: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mobileLogoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(95, 235, 82, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(95, 235, 82, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mobileLogoGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    backgroundColor: '#5FEB52',
    borderRadius: 22,
    opacity: 0.1,
    zIndex: -1,
  },
  mobileTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#05070c',
    marginTop: 16,
    letterSpacing: -0.5,
  },
  mobileSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14.5,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 28,
  },
  formGap: {
    gap: 16,
  },
  btnSpacing: {
    height: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  switchText: {
    color: '#2d79f3',
    fontWeight: '700',
    fontSize: 14,
  },
  ambientGlow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.4,
    width: 400,
    height: 400,
    zIndex: 1,
  },
  ambient1: {
    backgroundColor: 'rgba(82, 208, 235, 0.08)',
    top: '10%',
    right: '-10%',
  },
  ambient2: {
    backgroundColor: 'rgba(95, 235, 82, 0.08)',
    bottom: '5%',
    left: '30%',
  },
});
