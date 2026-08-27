// app/(tabs)/camaras/Camaras.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Plus, Video, Radio, Shield, MapPin, RefreshCw, Maximize2, PenTool, Trash2, Save, AlertTriangle } from 'lucide-react-native';
import { api } from '../../../services/api';
import FloatingNavBar from '../../../components/common/FloatingNavBar';
import LoadingAnimation from '../../../components/common/LoadingAnimation';
import InfoTooltip from '../../../components/common/InfoTooltip';
import MjpegFeed from '../../../components/common/MjpegFeed';
import { alertOrToast } from '../Face_recognition/utils';

interface ZonePoint {
  x: number; 
  y: number; 
}

const BASE_URL = api.defaults.baseURL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://127.0.0.1:8000');
const WS_BASE_URL = BASE_URL.replace(/^http/, 'ws');

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
  const [modalVisible, setModalVisible] = useState(false);
  const [newCamName, setNewCamName] = useState('');
  const [newCamUrl, setNewCamUrl] = useState('');
  const [newCamLocation, setNewCamLocation] = useState('');
  const [adding, setAdding] = useState(false);
  const [selectedCameraForFullView, setSelectedCameraForFullView] = useState<Camera | null>(null);
  const [fullscreenUri, setFullscreenUri] = useState<string>('');
  const [activeCameraIndex, setActiveCameraIndex] = useState<number>(0);

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [zonePoints, setZonePoints] = useState<ZonePoint[]>([]);
  const [savedZone, setSavedZone] = useState<ZonePoint[] | null>(null);
  const [zoneAlert, setZoneAlert] = useState<{ label: string; timestamp: string } | null>(null);
  const feedContainerRef = useRef<View>(null);
  const fullscreenWsRef = useRef<WebSocket | null>(null);

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

  useEffect(() => {
    if (!selectedCameraForFullView) {
      if (fullscreenWsRef.current) {
        fullscreenWsRef.current.close();
        fullscreenWsRef.current = null;
      }
      setIsDrawingMode(false);
      setZonePoints([]);
      setZoneAlert(null);
      return;
    }

    const wsUrl = `${WS_BASE_URL}/cameras/${selectedCameraForFullView.id}/ws`;
    
    const ws = new WebSocket(wsUrl);
    fullscreenWsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'zone_alert') {
          const names = data.intruders.map((i: any) => i.label).join(', ');
          setZoneAlert({
            label: names,
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      } catch {
      }
    };

    (async () => {
      try {
        const res = await api.get(`/cameras/${selectedCameraForFullView.id}/zone`);
        if (res.data?.points && res.data.points.length >= 3) {
          setSavedZone(res.data.points);
        } else {
          setSavedZone(null);
        }
      } catch {
        setSavedZone(null);
      }
    })();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [selectedCameraForFullView]);

  useEffect(() => {
    if (!zoneAlert) return;
    const t = setTimeout(() => setZoneAlert(null), 4000);
    return () => clearTimeout(t);
  }, [zoneAlert]);

  const handleFeedClick = useCallback(
    (event: any) => {
      if (!isDrawingMode || Platform.OS !== 'web') return;

      const rect = (event.target as HTMLElement)?.closest?.('[data-zone-canvas]')?.getBoundingClientRect?.();
      if (!rect) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      if (x < 0 || x > 1 || y < 0 || y > 1) return;

      setZonePoints((prev) => [...prev, { x, y }]);
    },
    [isDrawingMode],
  );

  const saveZone = useCallback(async () => {
    if (!selectedCameraForFullView || zonePoints.length < 3) {
      alertOrToast('Error', 'Draw at least 3 points to define a zone', 'error');
      return;
    }

    try {
      await api.post(`/cameras/${selectedCameraForFullView.id}/zone`, {
        points: zonePoints,
      });
      setSavedZone([...zonePoints]);
      setZonePoints([]);
      setIsDrawingMode(false);
      alertOrToast('Success', 'Detection zone saved! Intrusions will be captured automatically.', 'success');
    } catch (err) {
      console.error(err);
      alertOrToast('Error', 'Failed to save zone', 'error');
    }
  }, [selectedCameraForFullView, zonePoints]);

  const clearZone = useCallback(async () => {
    if (!selectedCameraForFullView) return;

    try {
      await api.delete(`/cameras/${selectedCameraForFullView.id}/zone`);
      setSavedZone(null);
      setZonePoints([]);
      setIsDrawingMode(false);
      alertOrToast('Info', 'Detection zone removed', 'success');
    } catch (err) {
      console.error(err);
      alertOrToast('Error', 'Failed to clear zone', 'error');
    }
  }, [selectedCameraForFullView]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCameras();
  };

  const handleAddCamera = async () => {
    if (!newCamName.trim() || !newCamUrl.trim()) {
      alertOrToast('Error', 'Please fill in both Name and Connection Link', 'error');
      return;
    }

    setAdding(true);
    try {
      await api.post('/cameras', {
        name: newCamName.trim(),
        type: newCamUrl.trim().toLowerCase().startsWith('rtsp') ? 'rtsp' : 'network',
        url: newCamUrl.trim(),
        location: newCamLocation.trim() || 'Custom Location'
      });
      alertOrToast('Success', 'Camera connected successfully', 'success');
      setModalVisible(false);
      setNewCamName('');
      setNewCamUrl('');
      setNewCamLocation('');
      fetchCameras();
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || 'Failed to add camera';
      alertOrToast('Error', errorMsg, 'error');
    } finally {
      setAdding(false);
    }
  };

  const renderCamera = ({ item }: { item: Camera }) => {
    const isOnline = item.status === 'online';
    const isFullView = selectedCameraForFullView?.id === item.id;
    const feedUri = `${WS_BASE_URL}/cameras/${item.id}/ws`;

    return (
      <View style={[styles.cameraCard, isOnline ? styles.cardOnline : styles.cardOffline]}>

        <View style={styles.feedContainer}>
          {isOnline && !isFullView ? (
            <MjpegFeed
              uri={feedUri}
              style={styles.feedImage}
              resizeMode="cover"
            />
          ) : isFullView ? (
            <View style={[styles.feedImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }]}>
              <Video size={24} color="#64748b" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>Active in Full View</Text>
            </View>
          ) : (
            <View style={[styles.feedImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }]}>
              <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: '600' }}>Offline</Text>
            </View>
          )}

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
            {isOnline && (
              <TouchableOpacity
                style={styles.fullscreenIconContainer}
                onPress={() => {
                  setSelectedCameraForFullView(item);
                  setFullscreenUri(`${WS_BASE_URL}/cameras/${item.id}/ws`);
                }}
              >
                <Maximize2 size={12} color="#fff" />
              </TouchableOpacity>
            )}
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
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Plus size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

           {cameras.length > 0 ? (
              <View style={styles.singleFeedLayout}>
                {/* Active Camera View */}
                {(() => {
                  const activeCam = cameras[activeCameraIndex] || cameras[0];
                  if (!activeCam) return null;
                  const isOnline = activeCam.status === 'online';
                  const isFullView = selectedCameraForFullView?.id === activeCam.id;
                  const feedUri = `${WS_BASE_URL}/cameras/${activeCam.id}/ws`;

                  return (
                    <View style={styles.activeFeedCard}>
                      <View style={styles.activeFeedContainer}>
                        {isOnline && !isFullView ? (
                          <MjpegFeed
                            key={activeCam.id}
                            uri={feedUri}
                            style={styles.activeFeedImage}
                            resizeMode="contain"
                          />
                        ) : isFullView ? (
                          <View style={[styles.activeFeedImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }]}>
                            <Video size={36} color="#64748b" style={{ marginBottom: 12 }} />
                            <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>Active in Full View</Text>
                          </View>
                        ) : (
                          <View style={[styles.activeFeedImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }]}>
                            <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '600' }}>Offline</Text>
                          </View>
                        )}

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
                            <Text style={styles.typeText}>{activeCam.type.toUpperCase()}</Text>
                          </View>
                        </View>

                        <View style={styles.feedOverlay}>
                          <View style={styles.locationContainer}>
                            <MapPin size={12} color="#ffffffcc" />
                            <Text numberOfLines={1} style={styles.overlayLocationText}>
                              {activeCam.location || 'Local Host'}
                            </Text>
                          </View>
                          {isOnline && (
                            <TouchableOpacity
                              style={styles.fullscreenIconContainer}
                              onPress={() => {
                                setSelectedCameraForFullView(activeCam);
                                setFullscreenUri(`${WS_BASE_URL}/cameras/${activeCam.id}/ws`);
                              }}
                            >
                              <Maximize2 size={14} color="#fff" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      <View style={styles.activeCardDetails}>
                        <View style={styles.activeTitleRow}>
                          <Text numberOfLines={1} style={styles.activeCameraName}>
                            {activeCam.name}
                          </Text>
                          <Shield size={18} color={isOnline ? '#1fb2c5' : '#94a3b8'} />
                        </View>
                        <Text style={styles.activeLastActiveText}>
                          {isOnline ? 'Active & monitoring system inputs' : 'Disconnected / Unreachable'}
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                {/* Bottom Navigation Buttons */}
                <View style={styles.selectorContainer}>
                  <Text style={styles.selectorLabel}>Switch Camera Feed</Text>
                  <View style={styles.selectorButtonsRow}>
                    {cameras.map((cam, idx) => {
                      const isActive = idx === activeCameraIndex;
                      const isCamOnline = cam.status === 'online';
                      return (
                        <TouchableOpacity
                          key={cam.id}
                          style={[
                            styles.selectorButton,
                            isActive && styles.selectorButtonActive,
                          ]}
                          onPress={() => setActiveCameraIndex(idx)}
                        >
                          <View style={[styles.selectorStatusDot, isCamOnline ? styles.dotOnline : styles.dotOffline]} />
                          <Text style={[
                            styles.selectorButtonText,
                            isActive && styles.selectorButtonTextActive,
                          ]}>
                            {cam.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Video size={44} color="#64748b" strokeWidth={1.5} />
                <Text style={styles.emptyText}>No Cameras Connected</Text>
                <Text style={styles.emptySubtext}>Connect a local webcam or add a camera feed to get started.</Text>
                <View style={styles.emptyTooltipRow}>
                  <InfoTooltip message="No cameras are currently connected. Please connect a webcam or configure a camera feed and refresh." />
                </View>
              </View>
            )}

          <FloatingNavBar />

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Connect Security Camera</Text>

                <Text style={styles.inputLabel}>Camera Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Front Gate CCTV"
                  value={newCamName}
                  onChangeText={setNewCamName}
                  placeholderTextColor="#94a3b8"
                />

                <Text style={styles.inputLabel}>IP / RTSP URL Link *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="rtsp://admin:password@192.168.1.6:554/avstream"
                  value={newCamUrl}
                  onChangeText={newText => setNewCamUrl(newText)}
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Text style={styles.inputLabel}>Location (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Outdoor Yard"
                  value={newCamLocation}
                  onChangeText={setNewCamLocation}
                  placeholderTextColor="#94a3b8"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                    disabled={adding}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.connectButton]}
                    onPress={handleAddCamera}
                    disabled={adding}
                  >
                    <Text style={styles.connectButtonText}>
                      {adding ? 'Connecting...' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="fade"
            transparent={true}
            visible={selectedCameraForFullView !== null}
            onRequestClose={() => setSelectedCameraForFullView(null)}
          >
            <View style={styles.fullScreenOverlay}>
              <View style={styles.fullScreenContent}>
                {selectedCameraForFullView && (
                  <>
                    <View style={styles.fullScreenHeader}>
                      <View>
                        <Text style={styles.fullScreenTitle}>{selectedCameraForFullView.name}</Text>
                        <Text style={styles.fullScreenSubtitle}>{selectedCameraForFullView.location || 'Local Host'}</Text>
                      </View>
                      <View style={styles.fullScreenHeaderActions}>
                        <TouchableOpacity
                          style={[
                            styles.zoneButton,
                            isDrawingMode && styles.zoneButtonActive,
                          ]}
                          onPress={() => {
                            if (isDrawingMode) {
                              setIsDrawingMode(false);
                              setZonePoints([]);
                            } else {
                              setIsDrawingMode(true);
                              setZonePoints([]);
                            }
                          }}
                        >
                          <PenTool size={14} color={isDrawingMode ? '#0f172a' : '#fff'} />
                          <Text style={[
                            styles.zoneButtonText,
                            isDrawingMode && styles.zoneButtonTextActive,
                          ]}>
                            {isDrawingMode ? 'Cancel' : 'Draw Zone'}
                          </Text>
                        </TouchableOpacity>

                        {isDrawingMode && zonePoints.length >= 3 && (
                          <TouchableOpacity
                            style={[styles.zoneButton, styles.zoneButtonSave]}
                            onPress={saveZone}
                          >
                            <Save size={14} color="#fff" />
                            <Text style={styles.zoneButtonText}>Save Zone</Text>
                          </TouchableOpacity>
                        )}

                        {savedZone && !isDrawingMode && (
                          <TouchableOpacity
                            style={[styles.zoneButton, styles.zoneButtonClear]}
                            onPress={clearZone}
                          >
                            <Trash2 size={14} color="#fff" />
                            <Text style={styles.zoneButtonText}>Clear Zone</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={styles.closeFullScreenButton}
                          onPress={() => setSelectedCameraForFullView(null)}
                        >
                          <Text style={styles.closeFullScreenText}>Close</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {isDrawingMode && (
                      <View style={styles.drawingBanner}>
                        <PenTool size={14} color="#f59e0b" />
                        <Text style={styles.drawingBannerText}>
                          Click on the video to place polygon points ({zonePoints.length} placed)
                          {zonePoints.length >= 3 ? ' — Ready to save!' : ' — Need at least 3'}
                        </Text>
                      </View>
                    )}

                    {/* Zone alert banner */}
                    {zoneAlert && (
                      <View style={styles.alertBanner}>
                        <AlertTriangle size={16} color="#ef4444" />
                        <Text style={styles.alertBannerText}>
                          ⚠️ Intrusion detected: {zoneAlert.label} entered the zone!
                        </Text>
                      </View>
                    )}

                    <View style={styles.fullScreenFeedContainer}>
                      <MjpegFeed
                        uri={fullscreenUri}
                        style={styles.fullScreenFeedImage}
                        resizeMode="contain"
                      />

                      {Platform.OS === 'web' && (isDrawingMode || savedZone) && (
                        React.createElement('div', {
                          'data-zone-canvas': 'true',
                          onClick: handleFeedClick,
                          style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            cursor: isDrawingMode ? 'crosshair' : 'default',
                            zIndex: 10,
                          },
                        },
                          React.createElement('svg', {
                            style: {
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              pointerEvents: 'none',
                            },
                            viewBox: '0 0 1 1',
                            preserveAspectRatio: 'none',
                          },
                            savedZone && !isDrawingMode && savedZone.length >= 3 && React.createElement('polygon', {
                              key: 'saved-zone',
                              points: savedZone.map(p => `${p.x},${p.y}`).join(' '),
                              fill: 'rgba(0, 200, 255, 0.15)',
                              stroke: '#00c8ff',
                              strokeWidth: '0.003',
                              strokeDasharray: '0.01,0.006',
                            }),

                            isDrawingMode && zonePoints.length >= 2 && React.createElement('polyline', {
                              key: 'drawing-lines',
                              points: zonePoints.map(p => `${p.x},${p.y}`).join(' '),
                              fill: 'none',
                              stroke: '#f59e0b',
                              strokeWidth: '0.003',
                            }),

                            isDrawingMode && zonePoints.length >= 3 && React.createElement('line', {
                              key: 'closing-line',
                              x1: zonePoints[zonePoints.length - 1].x,
                              y1: zonePoints[zonePoints.length - 1].y,
                              x2: zonePoints[0].x,
                              y2: zonePoints[0].y,
                              stroke: '#f59e0b',
                              strokeWidth: '0.002',
                              strokeDasharray: '0.008,0.004',
                              opacity: 0.6,
                            }),

                            isDrawingMode && zonePoints.length >= 3 && React.createElement('polygon', {
                              key: 'drawing-fill',
                              points: zonePoints.map(p => `${p.x},${p.y}`).join(' '),
                              fill: 'rgba(245, 158, 11, 0.12)',
                              stroke: 'none',
                            }),

                            isDrawingMode && zonePoints.map((p, i) =>
                              React.createElement('circle', {
                                key: `pt-${i}`,
                                cx: p.x,
                                cy: p.y,
                                r: '0.008',
                                fill: i === 0 ? '#10b981' : '#f59e0b',
                                stroke: '#fff',
                                strokeWidth: '0.002',
                              })
                            ),

                            savedZone && !isDrawingMode && savedZone.map((p, i) =>
                              React.createElement('circle', {
                                key: `sz-${i}`,
                                cx: p.x,
                                cy: p.y,
                                r: '0.006',
                                fill: '#00c8ff',
                                stroke: '#fff',
                                strokeWidth: '0.002',
                              })
                            ),
                          ),
                        )
                      )}

                      {savedZone && !isDrawingMode && (
                        <View style={styles.zoneLabelBadge}>
                          <View style={styles.zoneLabelDot} />
                          <Text style={styles.zoneLabelText}>Detection Zone Active</Text>
                        </View>
                      )}
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
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
    maxWidth: Platform.OS === 'web' ? '48%' : '100%',
    marginHorizontal: Platform.OS === 'web' ? '1%' : '0%',
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
    height: Platform.OS === 'web' ? 380 : 250,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullscreenIconContainer: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
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
  emptyTooltipRow: {
    marginTop: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  connectButton: {
    backgroundColor: '#1fb2c5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    display: 'flex',
    flexDirection: 'column',
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  fullScreenTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  fullScreenSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  closeFullScreenButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  closeFullScreenText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  fullScreenFeedContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullScreenFeedImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  singleFeedLayout: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 110,
    justifyContent: 'flex-start',
  },
  activeFeedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  activeFeedContainer: {
    height: Platform.OS === 'web' ? 680 : 420,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  activeFeedImage: {
    width: '100%',
    height: '100%',
  },
  activeCardDetails: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  activeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeCameraName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
    marginRight: 10,
  },
  activeLastActiveText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  selectorContainer: {
    marginTop: 8,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.0,
    marginBottom: 10,
  },
  selectorButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  selectorButtonActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  selectorStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  selectorButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  selectorButtonTextActive: {
    color: '#ffffff',
  },

  zoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  zoneButtonActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  zoneButtonSave: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  zoneButtonClear: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  zoneButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  zoneButtonTextActive: {
    color: '#0f172a',
  },
  drawingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.3)',
  },
  drawingBannerText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: '600',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.3)',
  },
  alertBannerText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  zoneLabelBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 200, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 255, 0.4)',
    zIndex: 20,
  },
  zoneLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00c8ff',
  },
  zoneLabelText: {
    color: '#00c8ff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});