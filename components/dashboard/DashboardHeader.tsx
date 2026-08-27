// components/dashboard/DashboardHeader.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = (): string => {
  return new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

interface Props {
  userName: string;
  isOnline: boolean;
}

export default function DashboardHeader({ userName, isOnline }: Props) {
  const firstName = userName ? userName.split(' ')[0] : '';

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/VG_Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>VisionGuard</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, isOnline ? styles.dotGreen : styles.dotRed]} />
          <Text style={styles.statusLabel}>
            {isOnline ? 'System Online' : 'Offline'}
          </Text>
        </View>
      </View>
      <View style={styles.greetingRow}>
        <Text style={styles.greeting}>
          {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
        </Text>
        <Text style={styles.dateText}>{formatDate()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 28 : 48,
    paddingBottom: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  greetingRow: {
    marginTop: 18,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.4,
  },
  dateText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 7,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
      },
    }),
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: {
    backgroundColor: '#10b981',
  },
  dotRed: {
    backgroundColor: '#ef4444',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
});
