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
import { Shield, Eye, Bell, Cpu } from 'lucide-react-native';
import { api } from '../../services/api';
import AuthCard from '../../components/ui/AuthCard';
import AuthInput from '../../components/ui/AuthInput';
import AuthButton from '../../components/ui/AuthButton';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === 'web' && width >= 800;

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
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
      Alert.alert('Success', 'Account created successfully! Please sign in.');
      router.push('/login');
    } catch (error: any) {
      console.error(error);
      Alert.alert(
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
      <View style={styles.brandContainer}>
        <View style={styles.logoWrapper}>
          <Shield size={40} color="#5FEB52" />
        </View>
        <Text style={styles.brandTitle}>VisionGuard</Text>
        <Text style={styles.brandSubtitle}>
          Enterprise Intelligent Security & Camera Analytics
        </Text>
      </View>

      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Cpu size={22} color="#5FEB52" />
          </View>
          <View style={styles.featureTexts}>
            <Text style={styles.featureTitle}>Real-time AI Detection</Text>
            <Text style={styles.featureDescription}>
              Instant intelligent processing of video streams for unauthorized access and hazards.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Bell size={22} color="#5FEB52" />
          </View>
          <View style={styles.featureTexts}>
            <Text style={styles.featureTitle}>Instant Notifications</Text>
            <Text style={styles.featureDescription}>
              Immediate push alerts with localized visual frames directly to your dashboard.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Eye size={22} color="#5FEB52" />
          </View>
          <View style={styles.featureTexts}>
            <Text style={styles.featureTitle}>Centralized Control</Text>
            <Text style={styles.featureDescription}>
              Manage multiple security networks and device configurations from a single workspace.
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.copyright}>
        © {new Date().getFullYear()} VisionGuard. All rights reserved.
      </Text>
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
        <TouchableOpacity onPress={handleSwitchToLogin}>
          <Text style={styles.switchText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </AuthCard>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
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
            <Shield size={48} color="#5FEB52" />
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
    backgroundColor: '#f8fafc',
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    backgroundColor: '#0b1329',
    padding: 60,
    justifyContent: 'space-between',
  },
  brandContainer: {
    marginTop: 20,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(95, 235, 82, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
    fontWeight: '400',
  },
  featuresList: {
    gap: 32,
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(95, 235, 82, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  featureTexts: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 20,
  },
  copyright: {
    fontSize: 13,
    color: '#475569',
  },
  rightPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  mobileBrand: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mobileTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0b1329',
    marginTop: 12,
  },
  mobileSubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#151717',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
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
