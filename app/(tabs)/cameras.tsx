import React, { useState, useEffect, useRef } from 'react';
import Constants from 'expo-constants';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Camera {
  id: number;
  name: string;
  type: 'webcam' | 'ip';
  url: string;
  status: 'online' | 'offline' | 'added';
}

const CameraStream = ({ camera, isActive, isDark }: { camera: Camera; isActive: boolean; isDark: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Web: Access local webcam
    if (camera.type === 'webcam' && isActive && Platform.OS === 'web') {
      let isMounted = true;
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (isMounted && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((err) => console.log('Video play error:', err));
            streamRef.current = stream;
          } else {
            stream.getTracks().forEach((track) => track.stop());
          }
        })
        .catch((err) => {
          console.error('Error accessing local webcam:', err);
        });

      return () => {
        isMounted = false;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };
    }
  }, [isActive, camera.type]);

  if (!isActive) {
    return (
      <View style={styles.feedInactive}>
        <IconSymbol size={48} name="video.fill" color={isDark ? '#48484A' : '#D1D1D6'} />
        <Text style={[styles.feedInactiveText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
          Detection Standby
        </Text>
      </View>
    );
  }

  if (camera.type === 'webcam') {
    if (Platform.OS === 'web') {
      return (
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          muted
          playsInline
        />
      );
    } else {
      return (
        <View style={styles.feedInactive}>
          <Text style={[styles.feedInactiveText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>
            Live Webcam (Preview is available on PC Web)
          </Text>
        </View>
      );
    }
  }

  // IP Camera / Phone MJPEG Stream
  if (camera.type === 'ip') {
    if (Platform.OS === 'web') {
      return (
        <img
          src={camera.url}
          style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
          alt={camera.name}
          onError={(e) => {
            // Fallback for RTSP or invalid image feeds (browsers can't display RTSP natively)
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fallbackEl = document.createElement('div');
              fallbackEl.style.cssText = 'display:flex;flex-direction:column;justify-content:center;align-items:center;height:100%;color:#8E8E93;padding:20px;text-align:center;';
              fallbackEl.innerHTML = `
                <span style="font-size:24px;">⚠️</span>
                <span style="margin-top:8px;font-size:12px;font-weight:500;">Browser cannot render RTSP stream natively.</span>
                <span style="font-size:11px;opacity:0.7;margin-top:4px;">Stream URL: ${camera.url} is forwarding to YOLO backend.</span>
              `;
              parent.appendChild(fallbackEl);
            }
          }}
        />
      );
    } else {
      return (
        <Image
          source={{ uri: camera.url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
        />
      );
    }
  }

  return null;
};

export default function CameraDashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768; // Grid layout for tablet/PC web

  const [cameras, setCameras] = useState<Camera[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [newCamName, setNewCamName] = useState('');
  const [newCamUrl, setNewCamUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Real-time detection simulation states
  const [activeDetections, setActiveDetections] = useState<Record<number, boolean>>({});

  // Dynamic API Base URL resolution
  const getApiBase = () => {
    // 1. Web browser client
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const apiHost = hostname === 'localhost' || hostname === '127.0.0.1' || !hostname ? 'localhost' : hostname;
        return `http://${apiHost}:8000`;
      }
      return 'http://localhost:8000';
    }

    // 2. Native mobile app - parse the developer PC's IP from hostUri in Expo Go
    const hostUri = Constants.expoConfig?.hostUri; // e.g. "10.82.39.x:8081"
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip) {
        return `http://${ip}:8000`;
      }
    }

    // 3. Fallbacks
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000'; // Android Emulator
    }
    return 'http://localhost:8000'; // iOS Simulator / Local fallback
  };

  const API_BASE = getApiBase();

  const fetchCameras = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await fetch(`${API_BASE}/cameras/all`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data: Camera[] = await response.json();
      setCameras(data);
    } catch (error) {
      console.error('Failed to fetch cameras:', error);
      setErrorMsg('Failed to connect to VisionGuard backend. Is the FastAPI service running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddIPCamera = async () => {
    setValidationError('');
    const name = newCamName.trim();
    let url = newCamUrl.trim();

    if (!name) {
      setValidationError('Camera name is required.');
      return;
    }
    if (!url) {
      setValidationError('RTSP or HTTP stream URL is required.');
      return;
    }

    // Auto-prefix http:// if no protocol scheme is defined
    if (!url.includes('://')) {
      url = `http://${url}`;
    }

    if (!url.startsWith('rtsp://') && !url.startsWith('http://') && !url.startsWith('https://')) {
      setValidationError('URL must start with rtsp://, http://, or https://');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE}/cameras/ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rtsp_url: url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to add IP camera');
      }

      setNewCamName('');
      setNewCamUrl('');
      setModalVisible(false);
      fetchCameras();
    } catch (error: any) {
      setValidationError(error.message || 'Failed to add camera.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDetection = (camera: Camera) => {
    setActiveDetections((prev) => ({
      ...prev,
      [camera.id]: !prev[camera.id],
    }));
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCameras();
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const renderCameraCard = ({ item }: { item: Camera }) => {
    const isDetecting = !!activeDetections[item.id];
    
    return (
      <View style={[styles.cameraCard, isDark ? styles.cardDark : styles.cardLight, isLargeScreen && styles.cardLarge]}>
        {/* Camera Header */}
        <View style={styles.cardHeader}>
          <View>
            <ThemedText style={styles.cameraName} type="defaultSemiBold">
              {item.name}
            </ThemedText>
            <Text style={[styles.typeText, { color: isDark ? '#9BA1A6' : '#687076' }]}>
              {item.type.toUpperCase()} • {item.url}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: item.status === 'online' || item.status === 'added' ? '#10B981' : '#F59E0B' }]} />
            <Text style={[styles.statusText, { color: item.status === 'online' || item.status === 'added' ? '#10B981' : '#F59E0B' }]}>
              {item.status === 'online' || item.status === 'added' ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        {/* Video stream container showing live footage */}
        <View style={styles.streamMockContainer}>
          <CameraStream camera={item} isActive={isDetecting} isDark={isDark} />
          
          {isDetecting && (
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              {/* Pulse LIVE badge overlayed on top */}
              <View style={styles.liveIndicator}>
                <View style={styles.livePulseDot} />
                <Text style={styles.liveText}>REC • LIVE FEED</Text>
              </View>
              
              {/* YOLO Bounding Box Overlay */}
              <View style={styles.detectionBoxCar}>
                <Text style={styles.detectionLabel}>Car [94%]</Text>
              </View>
              <View style={styles.detectionBoxBus}>
                <Text style={styles.detectionLabel}>Bus [88%]</Text>
              </View>
              <Text style={styles.gridOverlayText}>VisionGuard YOLO v11 Active</Text>
            </View>
          )}
        </View>

        {/* Action button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.detectButton,
            isDetecting ? styles.detectButtonActive : styles.detectButtonInactive,
          ]}
          onPress={() => toggleDetection(item)}
        >
          <IconSymbol
            size={18}
            name={isDetecting ? 'stop.fill' : 'play.fill'}
            color="#FFFFFF"
          />
          <Text style={styles.detectButtonText}>
            {isDetecting ? 'Stop Detection' : 'Start YOLO Detection'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#151718' : '#F4F5F6' }]} edges={['top']}>
      <View style={styles.mainContainer}>
        {/* App Title & Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.title} type="title">
              VisionGuard
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Monitor connected video feeds and run real-time YOLO object detection.
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => {
              setValidationError('');
              setModalVisible(true);
            }}
          >
            <IconSymbol size={20} name="plus" color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add IP Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Error panel if backend fails */}
        {errorMsg && (
          <View style={styles.errorContainer}>
            <IconSymbol size={24} name="exclamationmark.triangle.fill" color="#EF4444" />
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Backend Connection Error</Text>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCameras}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Camera List */}
        {loading && cameras.length === 0 ? (
          <View style={styles.centerSpinner}>
            <ActivityIndicator size="large" color="#0A7EA4" />
            <Text style={[styles.spinnerText, { color: isDark ? '#ECEDEE' : '#11181C' }]}>
              Detecting cameras...
            </Text>
          </View>
        ) : (
          <FlatList
            data={cameras}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCameraCard}
            contentContainerStyle={[styles.listContainer, isLargeScreen && styles.listContainerLarge]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A7EA4']} />
            }
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyContainer}>
                  <IconSymbol size={64} name="video.slash.fill" color={isDark ? '#3A3A3C' : '#D1D1D6'} />
                  <Text style={[styles.emptyTitle, { color: isDark ? '#ECEDEE' : '#11181C' }]}>No Cameras Connected</Text>
                  <Text style={[styles.emptySubtitle, { color: isDark ? '#9BA1A6' : '#687076' }]}>
                    Ensure your local webcams are connected or click "Add IP Camera" to register an RTSP link.
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* Add Camera Modal Overlay */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismissArea} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#11181C' }]}>
                Add IP Camera
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconSymbol size={24} name="xmark.circle.fill" color={isDark ? '#48484A' : '#D1D1D6'} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: isDark ? '#ECEDEE' : '#11181C' }]}>Camera Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                  },
                ]}
                placeholder="e.g. Traffic Corner A"
                placeholderTextColor={isDark ? '#8E8E93' : '#AEAEB2'}
                value={newCamName}
                onChangeText={setNewCamName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: isDark ? '#ECEDEE' : '#11181C' }]}>RTSP / HTTP Stream URL</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    color: isDark ? '#FFFFFF' : '#000000',
                    borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                  },
                ]}
                placeholder="e.g. 10.82.39.209:8080 (or RTSP)"
                placeholderTextColor={isDark ? '#8E8E93' : '#AEAEB2'}
                value={newCamUrl}
                onChangeText={setNewCamUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {validationError ? <Text style={styles.errorTextTip}>{validationError}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handleAddIPCamera}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Add Camera</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 16,
  },
  title: {
    fontFamily: Fonts?.rounded || 'System',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
    maxWidth: 600,
  },
  addButton: {
    backgroundColor: '#0A7EA4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#0A7EA4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    color: '#991B1B',
    fontWeight: '600',
    fontSize: 14,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  centerSpinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  spinnerText: {
    fontSize: 15,
  },
  listContainer: {
    paddingBottom: 40,
    gap: 20,
  },
  listContainerLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cameraCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
    borderColor: '#2C2C2E',
  },
  cardLarge: {
    width: '48%', // Show cards in columns on desktop
    minWidth: 320,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cameraName: {
    fontSize: 18,
  },
  typeText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  streamMockContainer: {
    height: 180,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  feedInactive: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  feedInactiveText: {
    fontSize: 13,
    fontWeight: '500',
  },
  feedActive: {
    flex: 1,
    backgroundColor: '#1E1E24',
    position: 'relative',
  },
  liveIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 6,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  detectionBoxCar: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#10B981',
    top: 50,
    left: 40,
    width: 100,
    height: 70,
    borderRadius: 4,
  },
  detectionBoxBus: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#3B82F6',
    top: 40,
    right: 50,
    width: 140,
    height: 100,
    borderRadius: 4,
  },
  detectionLabel: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    fontSize: 9,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  gridOverlayText: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontFamily: Fonts?.mono || 'monospace',
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  detectButtonInactive: {
    backgroundColor: '#10B981',
  },
  detectButtonActive: {
    backgroundColor: '#EF4444',
  },
  detectButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    padding: 24,
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  errorTextTip: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {},
  modalButtonSubmit: {
    backgroundColor: '#0A7EA4',
  },
  cancelBtnText: {
    fontWeight: '600',
    fontSize: 15,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
