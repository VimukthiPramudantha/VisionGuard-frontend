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
import { ChevronRight } from 'lucide-react-native';

// Imported modular components
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatsRow from '../../components/dashboard/StatsRow';
import LiveFeeds from '../../components/dashboard/LiveFeeds';
import RecentAlerts from '../../components/dashboard/RecentAlerts';
import { CameraItem, AlertItem } from '../../components/dashboard/types';

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

  const SectionHeader = ({ title, onViewAll }: { title: string; onViewAll: () => void }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity style={styles.viewAllBtn} onPress={onViewAll} activeOpacity={0.6}>
        <Text style={styles.viewAllText}>View All</Text>
        <ChevronRight size={14} color="#1fb2c5" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader userName={userName} isOnline={onlineCams > 0} />

        <View style={isWeb ? styles.contentWeb : styles.contentMobile}>
          <StatsRow 
            totalCameras={cameras.length} 
            onlineCameras={onlineCams} 
            unreadAlerts={unreadAlerts} 
          />

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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    color: '#1fb2c5',
    fontWeight: '600',
  },
});
