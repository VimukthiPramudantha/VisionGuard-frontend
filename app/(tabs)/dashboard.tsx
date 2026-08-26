// app/(tabs)/dashboard.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { api } from '../../services/api';
import FloatingNavBar from '../../components/common/FloatingNavBar';
import MjpegFeed from '../../components/common/MjpegFeed';
import { Video, ShieldAlert, ShieldCheck, MapPin } from 'lucide-react-native';

const BASE_URL = api.defaults.baseURL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000');

interface Camera {
  id: string;
  name: string;
  type: string;
  url?: string;
  status: string;
  location?: string;
  last_active?: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCameras = async () => {
    try {
      const response = await api.get('/cameras');
      setCameras(response.data);
    } catch (error) {
      console.error('Failed to load cameras on dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCameras();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>VisionGuard</Text>
          <Text style={styles.greeting}>Welcome back, User 👋</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.statCard}>
              <ShieldCheck size={28} color="#1fb2c5" />
              <Text style={styles.statNumber}>{cameras.filter(c => c.status === 'online').length}</Text>
              <Text style={styles.statLabel}>Cameras Online</Text>
            </View>
            <View style={styles.statCard}>
              <ShieldAlert size={28} color="#ef4444" />
              <Text style={styles.statNumber}>{cameras.filter(c => c.status !== 'online').length}</Text>
              <Text style={styles.statLabel}>Cameras Offline</Text>
            </View>
          </View>
        </View>

        {/* Camera Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connected Cameras</Text>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/camaras/Camaras')}>
              <Text style={styles.viewAllText}>Manage All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#1fb2c5" />
              <Text style={styles.loadingText}>Fetching system feeds...</Text>
            </View>
          ) : cameras.length === 0 ? (
            <View style={styles.emptyCamerasCard}>
              <Video size={36} color="#94a3b8" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No Cameras Connected</Text>
              <Text style={styles.emptySub}>Connect a local webcam or network camera to start monitoring.</Text>
              <TouchableOpacity
                style={styles.addCameraButton}
                onPress={() => router.replace('/(tabs)/camaras/Camaras')}
              >
                <Text style={styles.addCameraText}>Add Camera</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cameraScroll}
            >
              {cameras.map((camera) => {
                const isOnline = camera.status === 'online';
                // Add cache-busting timestamp to update feed live
                const feedUri = `${BASE_URL}/cameras/${camera.id}/feed?t=${Date.now()}`;

                return (
                  <View key={camera.id} style={styles.cameraCard}>
                    <View style={styles.feedWrapper}>
                      <MjpegFeed
                        uri={feedUri}
                        style={styles.feedImage}
                        resizeMode="cover"
                      />
                      <View style={[
                        styles.statusBadge,
                        isOnline ? styles.badgeOnline : styles.badgeOffline
                      ]}>
                        <View style={[styles.pulseDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
                        <Text style={styles.statusText}>{isOnline ? 'LIVE' : 'OFFLINE'}</Text>
                      </View>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text numberOfLines={1} style={styles.cameraName}>
                        {camera.name}
                      </Text>
                      <View style={styles.locationRow}>
                        <MapPin size={10} color="#94a3b8" />
                        <Text numberOfLines={1} style={styles.cameraLocation}>
                          {camera.location || 'Local Host'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Detections</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recent security threats detected.</Text>
          </View>
        </View>
      </ScrollView>

      <FloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 13,
    color: '#1fb2c5',
    fontWeight: '700',
  },
  loaderContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyCamerasCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  addCameraButton: {
    backgroundColor: '#1fb2c5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCameraText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cameraScroll: {
    paddingRight: 24,
    gap: 16,
  },
  cameraCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  feedWrapper: {
    height: 130,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  feedImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  badgeOnline: {
    backgroundColor: 'rgba(24, 50, 42, 0.85)',
  },
  badgeOffline: {
    backgroundColor: 'rgba(80, 20, 20, 0.85)',
  },
  pulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotOnline: {
    backgroundColor: '#10b981',
  },
  dotOffline: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
  cardInfo: {
    padding: 12,
  },
  cameraName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  cameraLocation: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
});