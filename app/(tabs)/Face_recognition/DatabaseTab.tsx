// app/(tabs)/Face_recognition/DatabaseTab.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Database, Trash2 } from 'lucide-react-native';
import { api } from '../../../services/api';
import { RegisteredFace } from './types';
import { styles } from './styles';
import { alertOrToast } from './utils';

export default function DatabaseTab() {
  const [dbFaces, setDbFaces] = useState<RegisteredFace[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  useEffect(() => {
    fetchRegisteredFaces();
  }, []);

  const fetchRegisteredFaces = async () => {
    setIsLoadingDb(true);
    try {
      const response = await api.get('/face/registered');
      setDbFaces(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const deleteFace = async (faceId: string) => {
    const performDelete = async () => {
      try {
        await api.delete(`/face/registered/${faceId}`);
        setDbFaces(dbFaces.filter(face => face.id !== faceId));
        alertOrToast('Deleted', 'Profile deleted successfully');
      } catch (error: any) {
        alertOrToast('Error', 'Failed to delete profile');
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this profile?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Face Profile',
        'Are you sure you want to delete this profile from the database?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  return (
    <View style={styles.contentCard}>
      <Text style={styles.cardTitle}>Registered Face Profiles</Text>
      <Text style={styles.cardDescription}>
        All individuals recognized by VisionGuard system (stored securely as facial vectors).
      </Text>

      {isLoadingDb ? (
        <ActivityIndicator style={{ marginVertical: 30 }} size="large" color="#1e40af" />
      ) : dbFaces.length === 0 ? (
        <View style={styles.emptyDbState}>
          <Database size={48} color="#94a3b8" />
          <Text style={styles.emptyDbText}>No registered profiles in database</Text>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {dbFaces.map((item) => (
            <View key={item.id} style={styles.faceListItem}>
              <View style={styles.faceListAvatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.name ? item.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                </Text>
              </View>
              <View style={styles.faceListInfo}>
                <Text style={styles.faceListName}>{item.name}</Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteFace(item.id)}
                >
                  <Trash2 size={16} color="#ef4444" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
