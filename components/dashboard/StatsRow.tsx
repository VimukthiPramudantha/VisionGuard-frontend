// components/dashboard/StatsRow.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Camera, Wifi, Bell } from 'lucide-react-native';

interface Props {
  totalCameras: number;
  onlineCameras: number;
  unreadAlerts: number;
}

export default function StatsRow({ totalCameras, onlineCameras, unreadAlerts }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <View style={[styles.icon, { backgroundColor: '#f0f9ff' }]}>
          <Camera size={18} color="#0ea5e9" />
        </View>
        <Text style={styles.value}>{totalCameras}</Text>
        <Text style={styles.label}>Total Cameras</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.icon, { backgroundColor: '#f0fdf4' }]}>
          <Wifi size={18} color="#10b981" />
        </View>
        <Text style={styles.value}>{onlineCameras}</Text>
        <Text style={styles.label}>Online</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.icon, { backgroundColor: '#fef2f2' }]}>
          <Bell size={18} color="#ef4444" />
        </View>
        <Text style={styles.value}>{unreadAlerts}</Text>
        <Text style={styles.label}>Unread Alerts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
});
