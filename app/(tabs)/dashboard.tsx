// app/(tabs)/dashboard.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';
import FloatingNavBar from '../../components/common/FloatingNavBar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsRow from '../../components/dashboard/StatsRow';
import LiveFeeds from '../../components/dashboard/LiveFeeds';
import RecentAlerts from '../../components/dashboard/RecentAlerts';
import SectionHeader from '../../components/dashboard/SectionHeader';
import { CameraItem, AlertItem } from '../../components/dashboard/types';
import {
  Camera,
  Bell,
  Settings,
  Users,
} from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  const [userName, setUserName] = useState('');
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loadingCams, setLoadingCams] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  const fetchCameras = async () => {
    try {
      const response = await api.get('/cameras');
      setCameras(response.data);
    } catch (error) {
      console.error('Failed to load cameras:', error);
    } finally {
      setLoadingCams(false);
    }
  };

  const fetchAlerts = async (uid: string) => {
    try {
      setLoadingAlerts(true);
      const response = await api.get(`/alerts?user_id=${encodeURIComponent(uid)}`);
      setAlerts(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          setUserName(user.full_name || user.email || '');
          fetchAlerts(user.id);
        }
      }
    } catch (e) {
      console.error('Error loading user:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCameras();
      loadUser();
    }, [])
  );

  const onlineCams = cameras.filter(c => c.status === 'online').length;
  const unreadAlerts = alerts.filter(a => a.status === 'unread').length;

  const quickActions = [
    {
      label: 'Cameras',
      icon: Camera,
      color: '#0ea5e9',
      bg: '#f0f9ff',
      route: '/(tabs)/camaras/Camaras',
    },
    {
      label: 'Alerts',
      icon: Bell,
      color: '#ef4444',
      bg: '#fef2f2',
      route: '/(tabs)/alerts',
    },
    {
      label: 'Face Recog',
      icon: Users,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      route: '/(tabs)/Face_recognition',
    },
    {
      label: 'Settings',
      icon: Settings,
      color: '#64748b',
      bg: '#f8fafc',
      route: '/(tabs)/Settings/settings',
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          userName={userName}
          isOnline={onlineCams > 0}
        />

        <View style={isWeb ? styles.contentWeb : styles.contentMobile}>
          {/* Stats */}
          <StatsRow
            totalCameras={cameras.length}
            onlineCameras={onlineCams}
            unreadAlerts={unreadAlerts}
          />

          {/* Quick Actions */}
          <View style={styles.quickSection}>
            <Text style={styles.quickTitle}>Quick Actions</Text>
            <View style={styles.quickRow}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={styles.quickCard}
                  // @ts-ignore
                  onPress={() => router.replace(action.route)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickIcon, { backgroundColor: action.bg }]}>
                    <action.icon size={20} color={action.color} />
                  </View>
                  <Text style={styles.quickLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Live Feeds */}
          <View style={styles.section}>
            <SectionHeader
              title="Live Feeds"
              onViewAll={() => router.replace('/(tabs)/camaras/Camaras')}
            />
            <LiveFeeds
              cameras={cameras}
              loading={loadingCams}
              isWeb={isWeb}
              onAddCamera={() => router.replace('/(tabs)/camaras/Camaras')}
            />
          </View>

          {/* Recent Alerts */}
          <View style={styles.section}>
            <SectionHeader
              title="Recent Alerts"
              onViewAll={() => router.replace('/(tabs)/alerts')}
            />
            <RecentAlerts
              alerts={alerts}
              loading={loadingAlerts}
              onViewAlert={() => router.replace('/(tabs)/alerts')}
            />
          </View>
        </View>
      </ScrollView>
      <FloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scroll: {
    paddingBottom: 120,
  },
  contentWeb: {
    paddingHorizontal: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 28,
  },

  // Quick Actions
  quickSection: {
    marginTop: 24,
  },
  quickTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        cursor: 'pointer',
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
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
});
