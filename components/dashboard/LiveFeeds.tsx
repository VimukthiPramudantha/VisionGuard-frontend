// components/dashboard/LiveFeeds.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Video, MapPin } from 'lucide-react-native';
import MjpegFeed from '../common/MjpegFeed';
import { CameraItem } from './types';
import { api } from '../../services/api';

const BASE_URL = api.defaults.baseURL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000');
const WS_BASE_URL = BASE_URL.replace(/^http/, 'ws');

interface Props {
  cameras: CameraItem[];
  loading: boolean;
  isWeb: boolean;
  onAddCamera: () => void;
}

export default function LiveFeeds({ cameras, loading, isWeb, onAddCamera }: Props) {
  const renderCard = (camera: CameraItem) => {
    const isOnline = camera.status === 'online';
    const feedUri = `${WS_BASE_URL}/cameras/${encodeURIComponent(camera.id)}/ws`;
    return (
      <View key={camera.id} style={isWeb ? styles.cardWeb : styles.card}>
        <View style={styles.feedBox}>
          <MjpegFeed uri={feedUri} style={styles.feedImg} resizeMode="cover" />
          <View style={[styles.badge, isOnline ? styles.badgeOn : styles.badgeOff]}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>{isOnline ? 'LIVE' : 'OFFLINE'}</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.name}>{camera.name}</Text>
          <View style={styles.locationRow}>
            <MapPin size={11} color="#94a3b8" />
            <Text numberOfLines={1} style={styles.location}>
              {camera.location || 'Local'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator size="small" color="#94a3b8" />
        <Text style={styles.placeholderText}>Loading feeds...</Text>
      </View>
    );
  }

  if (cameras.length === 0) {
    return (
      <View style={styles.placeholder}>
        <Video size={32} color="#cbd5e1" strokeWidth={1.5} />
        <Text style={styles.placeholderTitle}>No cameras connected</Text>
        <Text style={styles.placeholderText}>Add a camera to start monitoring</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAddCamera}>
          <Text style={styles.addBtnText}>Add Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isWeb) {
    return (
      <View style={styles.grid}>
        {cameras.map(renderCard)}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {cameras.map(renderCard)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardWeb: {
    flex: 1,
    minWidth: 300,
    maxWidth: '49%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  card: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  scroll: {
    paddingRight: 20,
    gap: 14,
  },
  feedBox: {
    height: 170,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  feedImg: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  badgeOn: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  badgeOff: {
    backgroundColor: 'rgba(100, 116, 139, 0.85)',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  info: {
    padding: 14,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  placeholder: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
  },
  placeholderText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#1fb2c5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 14,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
