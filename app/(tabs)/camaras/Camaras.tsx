// app/(tabs)/camaras/Camaras.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Plus, Video, Radio, Shield, MapPin, RefreshCw } from 'lucide-react-native';
import { api } from '../../../services/api';
import FloatingNavBar from '../../../components/common/FloatingNavBar';
import LoadingAnimation from '../../../components/common/LoadingAnimation';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000';

interface Camera {
  id: string;
  name: string;
  type: string;
  url?: string;
  status: string;
  location?: string;
  last_active?: string;
}

export default function CamarasScreen() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [fetchDone, setFetchDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeDone(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimeDone && fetchDone && cameras.length > 0) {
      setLoading(false);
    }
  }, [minTimeDone, fetchDone, cameras]);

  const fetchCameras = async () => {
    try {
      const response = await api.get('/cameras');
      setCameras(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load cameras');
    } finally {
      setFetchDone(true);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCameras();
  };

  const renderCamera = ({ item }: { item: Camera }) => {
    const isOnline = item.status === 'online';
    const feedUri = `${BASE_URL}/cameras/${item.id}/feed?t=${Date.now()}`;

    return (
      <View style={[styles.cameraCard, isOnline ? styles.cardOnline : styles.cardOffline]}>
        
        <View style={styles.feedContainer}>
          <Image
            source={{ uri: feedUri }}
            style={styles.feedImage}
            resizeMode="cover"
          />
          
          <View style={styles.badgeRow}>
            <View style={[
              styles.statusBadge,
              isOnline ? styles.badgeOnline : styles.badgeOffline
            ]}>
              <View style={[styles.pulseDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
              <Text style={styles.statusText}>
                {isOnline ? 'LIVE' : 'OFFLINE'}
              </Text>
            </View>

            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.feedOverlay}>
            <View style={styles.locationContainer}>
              <MapPin size={11} color="#ffffffcc" />
              <Text numberOfLines={1} style={styles.overlayLocationText}>
                {item.location || 'Local Host'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={styles.cameraName}>
              {item.name}
            </Text>
            <Shield size={14} color={isOnline ? '#1fb2c5' : '#94a3b8'} />
          </View>
          <Text style={styles.lastActiveText}>
            {isOnline ? 'Active & monitoring' : 'Disconnected'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingAnimation />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View>
              <Text style={styles.subtitle}>System Feeds</Text>
              <Text style={styles.title}>Camera Network</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <RefreshCw size={18} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton}>
                <Plus size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={cameras}
            keyExtractor={(item) => item.id}
            renderItem={renderCamera}
            numColumns={3}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor="#1fb2c5"
                colors={['#1fb2c5']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Video size={44} color="#64748b" strokeWidth={1.5} />
                <Text style={styles.emptyText}>No Active Feeds Found</Text>
                <Text style={styles.emptySubtext}>Please connect a local webcam or refresh to search for feeds.</Text>
              </View>
            }
          />

          <FloatingNavBar />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1fb2c5', 
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refreshButton: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  addButton: {
    backgroundColor: '#1fb2c5',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#1fb2c5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 110,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  cameraCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12, 
    marginBottom: 16,
    flex: 1,
    maxWidth: '31.3%',
    marginHorizontal: '1%',
    borderWidth: 1, 
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardOnline: {
    borderColor: '#e2e8f0', 
  },
  cardOffline: {
    borderColor: '#fca5a5', 
  },
  feedContainer: {
    height: 250, 
    backgroundColor: '#f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  feedImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  badgeRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeOnline: {
    backgroundColor: 'rgba(24, 50, 42, 0.8)',
    borderWidth: 0.5,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  badgeOffline: {
    backgroundColor: 'rgba(80, 20, 20, 0.8)',
    borderWidth: 0.5,
    borderColor: 'rgba(248, 113, 113, 0.4)',
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotOnline: {
    backgroundColor: '#10b981',
  },
  dotOffline: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typeText: {
    color: '#cbd5e1',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  feedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', 
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  overlayLocationText: {
    color: '#f8fafc',
    fontSize: 10,
    fontWeight: '600',
  },
  cardDetails: {
    padding: 10,
    backgroundColor: '#ffffff',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cameraName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 6,
  },
  lastActiveText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});