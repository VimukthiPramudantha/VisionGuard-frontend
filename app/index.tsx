import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative background glows */}
      <View style={[styles.glowRing, styles.glowPrimary]} />
      <View style={[styles.glowRing, styles.glowSecondary]} />

      <View style={styles.contentContainer}>
        {/* Logo/Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>VISIONGUARD v2.0</Text>
        </View>

        {/* Hero Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Hello World</Text>
          <Text style={styles.subtitle}>
            Welcome to the new clean-slate VisionGuard. We've purged all boilerplate templates and design files to build our custom platform from scratch.
          </Text>
          
          <View style={styles.divider} />

          {/* Action indicator */}
          <View style={styles.infoRow}>
            <View style={styles.statusDot} />
            <Text style={styles.infoText}>Clean architecture ready</Text>
          </View>
        </View>

        {/* Start button */}
        <TouchableOpacity style={styles.button} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090B11', // Sleek deep space background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 999,
    filter: 'blur(80px)', // Beautiful blurred aura (supported in modern RN/web)
    opacity: 0.15,
  },
  glowPrimary: {
    width: 300,
    height: 300,
    backgroundColor: '#3B82F6', // Vibrant blue glow
    top: '10%',
    left: '-10%',
  },
  glowSecondary: {
    width: 250,
    height: 250,
    backgroundColor: '#8B5CF6', // Purple aura glow
    bottom: '15%',
    right: '-10%',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: 24,
  },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    boxShadow: '0px 12px 20px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981', // Emerald active status
  },
  infoText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    width: '100%',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 12px rgba(59, 130, 246, 0.3)',
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
