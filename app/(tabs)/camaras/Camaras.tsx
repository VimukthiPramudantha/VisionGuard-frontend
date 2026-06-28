// app/(tabs)/Camaras.tsx
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
import { Plus, Camera as CameraIcon } from 'lucide-react-native';
import { api } from '../../../services/api';
import FloatingNavBar from '../../../components/common/FloatingNavBar';

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

  const fetchCameras = async () => {
    try {
      const response = await api.get('/cameras');
      setCameras(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load cameras');
    } finally {
      setLoading(false);
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
    // Generate a unique cache buster for feed reloads
    const feedUri = `${BASE_URL}/cameras/${item.id}/feed?t=${Date.now()}`;

    return (
      <View style={styles.cameraCard}>
        <View style={styles.feedPreview}>
          <Image
            source={{ uri: feedUri }}
            style={styles.feedImage}
            resizeMode="cover"
          />
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'online' ? '#22c55e' : '#ef4444' }
          ]}>
            <Text style={styles.statusText}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cameraInfo}>
          <Text numberOfLines={1} style={styles.cameraName}>{item.name}</Text>
          <Text numberOfLines={1} style={styles.cameraType}>
            {item.type.toUpperCase()} • {item.location || 'Unknown'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cameras</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cameras}
        keyExtractor={(item) => item.id}
        renderItem={renderCamera}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No cameras added yet</Text>
            <Text style={styles.emptySubtext}>Add your first camera</Text>
          </View>
        }
      />

      <FloatingNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  addButton: {
    backgroundColor: '#0ea5e9',
    padding: 10,
    borderRadius: 999,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  cameraCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    flex: 1,
    maxWidth: '31.3%',
    marginHorizontal: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  feedPreview: {
    height: 110,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    position: 'relative',
    marginBottom: 12,
    overflow: 'hidden',
  },
  feedImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  cameraInfo: {
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  cameraName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cameraType: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#94a3b8',
    marginTop: 8,
  },
});