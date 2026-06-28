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
} from 'react-native';
import { Plus, Play, Camera as CameraIcon } from 'lucide-react-native';
import { api } from '../../../services/api';
import FloatingNavBar from '../../../components/common/FloatingNavBar';

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

  const startDetection = (camera: Camera) => {
    Alert.alert(
      "Start Detection",
      `Start vehicle detection on ${camera.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Start", onPress: () => console.log(`Starting detection on ${camera.id}`) }
      ]
    );
  };

  const renderCamera = ({ item }: { item: Camera }) => (
    <View style={styles.cameraCard}>
      <View style={styles.cameraHeader}>
        <View style={styles.iconContainer}>
          <CameraIcon size={28} color="#0ea5e9" />
        </View>
        <View style={styles.cameraInfo}>
          <Text style={styles.cameraName}>{item.name}</Text>
          <Text style={styles.cameraType}>
            {item.type.toUpperCase()} • {item.location || 'Unknown'}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'online' ? '#22c55e' : '#ef4444' }
        ]}>
          <Text style={styles.statusText}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => startDetection(item)}
      >
        <Play size={18} color="#fff" />
        <Text style={styles.startButtonText}>Start Detection</Text>
      </TouchableOpacity>
    </View>
  );

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
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  cameraCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraInfo: {
    flex: 1,
    marginLeft: 14,
  },
  cameraName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e2937',
  },
  cameraType: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: '#0ea5e9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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