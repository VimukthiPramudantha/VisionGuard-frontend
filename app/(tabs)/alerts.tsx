// app/(tabs)/alerts.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  RefreshControl,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';
import FloatingNavBar from '../../components/common/FloatingNavBar';
import {
  Bell,
  CheckCircle,
  Eye,
  Clock,
  Video,
  AlertTriangle,
  X,
  ShieldAlert,
} from 'lucide-react-native';

interface AlertItem {
  id: string;
  user_id: string;
  camera_id: string;
  detection_event_id?: string;
  snapshot_url?: string;
  detection_type?: string;
  confidence?: number;
  status: 'read' | 'unread';
  created_at?: string;
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUserAndAlerts = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          setUserId(user.id);
          const response = await api.get(`/alerts?user_id=${user.id}`);
          setAlerts(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to load user or alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserAndAlerts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserAndAlerts();
  };

  const handleAlertPress = async (alert: AlertItem) => {
    setSelectedAlert(alert);
    setModalVisible(true);

    if (alert.status === 'unread') {
      try {
        await api.patch(`/alerts/${alert.id}/read`);
        
        setAlerts((prevAlerts) =>
          prevAlerts.map((item) =>
            item.id === alert.id ? { ...item, status: 'read' as const } : item
          )
        );
      } catch (error) {
        console.error('Failed to mark alert as read:', error);
      }
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderAlertItem = ({ item }: { item: AlertItem }) => {
    const isUnread = item.status === 'unread';

    return (
      <TouchableOpacity
        style={[
          styles.alertCard,
          isUnread ? styles.alertCardUnread : styles.alertCardRead,
        ]}
        onPress={() => handleAlertPress(item)}
      >
        <View style={styles.alertHeader}>
          <View style={styles.alertTypeRow}>
            <View style={[styles.indicatorDot, isUnread ? styles.dotUnread : styles.dotRead]} />
            <Text style={styles.alertTypeText}>
              {(item.detection_type || 'Unknown').toUpperCase()} DETECTION
            </Text>
          </View>
          <Text style={styles.alertTime}>{formatTime(item.created_at)}</Text>
        </View>

        <View style={styles.alertBody}>
          {item.snapshot_url ? (
            <Image source={{ uri: item.snapshot_url }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Video size={20} color="#94a3b8" />
            </View>
          )}
          <View style={styles.alertDetails}>
            <Text style={styles.cameraName}>Channel: {item.camera_id}</Text>
            <Text style={styles.alertText}>
              Confidence Score: {item.confidence ? `${(item.confidence * 100).toFixed(1)}%` : 'N/A'}
            </Text>
            <View style={styles.dateRow}>
              <Clock size={12} color="#64748b" style={{ marginRight: 4 }} />
              <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandName}>VISIONGUARD</Text>
        <Text style={styles.title}>Incident Alerts</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1fb2c5" />
          <Text style={styles.loadingText}>Fetching active alerts...</Text>
        </View>
      ) : alerts.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1fb2c5" />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <View style={styles.emptyIconCircle}>
                <CheckCircle size={40} color="#10b981" />
              </View>
              <Text style={styles.emptyTitle}>Everything is Secure</Text>
              <Text style={styles.emptySub}>No alert notifications have been raised yet.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlertItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1fb2c5" />
          }
        />
      )}

      {/* Alert Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <ShieldAlert size={20} color="#e11d48" style={{ marginRight: 6 }} />
                <Text style={styles.modalTitle}>Intrusion Snapshot</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <X size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>

            {selectedAlert && (
              <View style={styles.modalBody}>
                {selectedAlert.snapshot_url ? (
                  <Image source={{ uri: selectedAlert.snapshot_url }} style={styles.modalImage} resizeMode="contain" />
                ) : (
                  <View style={styles.modalImagePlaceholder}>
                    <AlertTriangle size={48} color="#94a3b8" />
                    <Text style={styles.placeholderText}>Snapshot image unavailable</Text>
                  </View>
                )}

                <View style={styles.modalInfoCard}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.infoLabel}>Detection Type</Text>
                    <Text style={styles.infoValue}>
                      {selectedAlert.detection_type ? selectedAlert.detection_type.toUpperCase() : 'Unknown'}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.infoLabel}>Channel/Camera ID</Text>
                    <Text style={styles.infoValue}>{selectedAlert.camera_id}</Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.infoLabel}>Confidence Level</Text>
                    <Text style={styles.infoValue}>
                      {selectedAlert.confidence ? `${(selectedAlert.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.infoLabel}>Timestamp</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(selectedAlert.created_at)} at {formatTime(selectedAlert.created_at)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <FloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 15,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1fb2c5',
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  alertCardUnread: {
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#1fb2c5',
  },
  alertCardRead: {
    borderColor: '#f1f5f9',
    opacity: 0.85,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotUnread: {
    backgroundColor: '#1fb2c5',
  },
  dotRead: {
    backgroundColor: '#94a3b8',
  },
  alertTypeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  alertTime: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  alertBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertDetails: {
    flex: 1,
    marginLeft: 16,
  },
  cameraName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  alertText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dateText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    marginBottom: 16,
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  modalInfoCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
});
