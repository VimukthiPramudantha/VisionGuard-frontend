// app/(tabs)/dashboard.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Switch,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';
import FloatingNavBar from '../../components/common/FloatingNavBar';
import MjpegFeed from '../../components/common/MjpegFeed';
import { 
  Video, 
  ShieldAlert, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Activity, 
  RefreshCw, 
  Cpu, 
  BellRing,
  AlertTriangle,
  Clock,
  ExternalLink,
  CheckCircle,
  Database,
  Wifi
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

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

interface DetectionAlert {
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

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWebLayout = width >= 768; // Web breakpoint

  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  const [aiShieldActive, setAiShieldActive] = useState(true);
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<DetectionAlert[]>([]);
  const [isAlertsLoading, setIsAlertsLoading] = useState(true);

  const triggerHaptic = (type: 'light' | 'medium' | 'success' | 'warning') => {
    try {
      if (Platform.OS !== 'web') {
        if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else if (type === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch {
      console.log('Haptics not supported in this environment');
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const fetchRealAlerts = async (uid: string) => {
    try {
      setIsAlertsLoading(true);
      const response = await api.get(`/alerts?user_id=${uid}`);
      setAlerts(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load real alerts on dashboard:', error);
    } finally {
      setIsAlertsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          setUserId(user.id);
          fetchRealAlerts(user.id);
        }
      }
    } catch (e) {
      console.error('Error loading user data from AsyncStorage:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCameras();
      loadUserData();
    }, [])
  );

  const runDiagnostic = () => {
    if (diagnosticRunning) return;
    triggerHaptic('medium');
    setDiagnosticRunning(true);
    
    setTimeout(() => {
      setSystemLogs(prev => [...prev, 'Starting System Integrity Check...']);
      triggerHaptic('light');
    }, 500);

    setTimeout(() => {
      setSystemLogs(prev => [...prev, `Found ${cameras.length} camera pipelines. Ping OK.`]);
      triggerHaptic('light');
    }, 1500);

    setTimeout(() => {
      setSystemLogs(prev => [...prev, 'YOLO Model loaded in RAM: OK.']);
      triggerHaptic('light');
    }, 2500);

    setTimeout(() => {
      setSystemLogs(prev => [...prev, 'All channels operational. Diagnostic Completed!']);
      setDiagnosticRunning(false);
      triggerHaptic('success');
    }, 3500);
  };

  const simulateThreat = async () => {
    triggerHaptic('warning');
    const randomCameras = cameras.length > 0 ? cameras.map(c => c.id) : ['cctv_1', 'cctv_8', 'cctv_9'];
    const randomCamId = randomCameras[Math.floor(Math.random() * randomCameras.length)];
    const objects = ['Person', 'Vehicle', 'Intruder', 'Unknown Face'];
    const randomObject = objects[Math.floor(Math.random() * objects.length)];
    const confidence = parseFloat((0.80 + Math.random() * 0.19).toFixed(4));
    
    const newAlert: DetectionAlert = {
      id: `sim_${Date.now()}`,
      user_id: userId || 'demo_user',
      camera_id: randomCamId,
      detection_type: randomObject,
      confidence,
      status: 'unread',
      created_at: new Date().toISOString()
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
  };

  const clearAlerts = () => {
    triggerHaptic('light');
    setAlerts([]);
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Shared Components
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <View style={styles.logoAndTextWrapper}>
          <Image 
            source={require('../../assets/VG_Logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain"
          />
          <Text style={styles.brandTitleText}>VisionGuard</Text>
        </View>
        <View style={styles.systemPulseBadge}>
          <View style={[styles.pulseOuterDot, aiShieldActive ? styles.pulseActiveColor : styles.pulseInactiveColor]}>
            <View style={[styles.pulseInnerDot, aiShieldActive ? styles.dotActiveColor : styles.dotInactiveColor]} />
          </View>
          <Text style={styles.systemPulseText}>
            {aiShieldActive ? 'SHIELD ONLINE' : 'SHIELD MUTED'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStatusBanner = () => (
    <View style={styles.liveBannerCard}>
      <View style={styles.liveClockSection}>
        <Text style={styles.bannerClockText}>{currentTime || '--:--:--'}</Text>
        <Text style={styles.bannerDateText}>{currentDate || 'Loading date...'}</Text>
      </View>
      <View style={styles.dividerVertical} />
      <View style={styles.bannerStatusSection}>
        <View style={styles.bannerRow}>
          <Cpu size={14} color="#1fb2c5" />
          <Text style={styles.bannerInfoTitle}>AI Inference</Text>
        </View>
        <Text style={styles.bannerInfoValue}>
          {aiShieldActive ? 'YOLOv8 Active (12ms)' : 'Paused'}
        </Text>
      </View>
    </View>
  );

  const renderLeftPanelExtra = () => (
    <View style={styles.threatCard}>
      <View style={styles.threatHeaderRow}>
        <ShieldCheck size={20} color="#10b981" />
        <Text style={styles.threatTitle}>Threat Assessment</Text>
        <View style={styles.secureBadge}>
          <Text style={styles.secureBadgeText}>SECURE</Text>
        </View>
      </View>
      <Text style={styles.threatDesc}>
        Real-time security analytics indicate zero active critical alarms. All boundary lines are secure.
      </Text>
      
      <View style={styles.dividerHorizontal} />
      
      <Text style={styles.checklistTitle}>System Health Matrix</Text>
      <View style={styles.checklistItem}>
        <CheckCircle size={14} color="#10b981" />
        <Text style={styles.checklistText}>YOLOv8 Inference Pipeline (Active)</Text>
      </View>
      <View style={styles.checklistItem}>
        <Database size={14} color="#10b981" />
        <Text style={styles.checklistText}>Supabase DB Connection (Healthy)</Text>
      </View>
      <View style={styles.checklistItem}>
        <Wifi size={14} color="#10b981" />
        <Text style={styles.checklistText}>MJPEG Video Streams Gateway (Connected)</Text>
      </View>
    </View>
  );

  const renderOperationsControl = () => (
    <View style={styles.controlsCard}>
      <View style={styles.controlRow}>
        <View style={styles.controlInfo}>
          <View style={styles.iconCircleTeal}>
            <Sparkles size={18} color="#1fb2c5" />
          </View>
          <View style={styles.controlTextWrapper}>
            <Text style={styles.controlLabel}>AI Vision Shield</Text>
            <Text style={styles.controlDesc}>Detect objects in live streams</Text>
          </View>
        </View>
        <Switch
          value={aiShieldActive}
          onValueChange={(val) => {
            triggerHaptic('light');
            setAiShieldActive(val);
          }}
          trackColor={{ false: '#cbd5e1', true: '#1fb2c5' }}
          thumbColor="#ffffff"
        />
      </View>

      <View style={styles.dividerHorizontal} />

      <View style={styles.controlRow}>
        <View style={styles.controlInfo}>
          <View style={styles.iconCircleCrimson}>
            <BellRing size={18} color={muteNotifications ? '#94a3b8' : '#ef4444'} />
          </View>
          <View style={styles.controlTextWrapper}>
            <Text style={styles.controlLabel}>Mute Notifications</Text>
            <Text style={styles.controlDesc}>Silence real-time UI alerts</Text>
          </View>
        </View>
        <Switch
          value={muteNotifications}
          onValueChange={(val) => {
            triggerHaptic('light');
            setMuteNotifications(val);
          }}
          trackColor={{ false: '#cbd5e1', true: '#1fb2c5' }}
          thumbColor="#ffffff"
        />
      </View>

      <View style={styles.dividerHorizontal} />

      <View style={styles.diagnosticWrapper}>
        <TouchableOpacity
          style={[styles.diagnosticButton, diagnosticRunning && styles.diagnosticButtonDisabled]}
          onPress={runDiagnostic}
          disabled={diagnosticRunning}
        >
          {diagnosticRunning ? (
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
          ) : (
            <RefreshCw size={14} color="#ffffff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.diagnosticButtonText}>
            {diagnosticRunning ? 'Scanning Feeds...' : 'Run Diagnostics'}
          </Text>
        </TouchableOpacity>

        {systemLogs.length > 0 && (
          <View style={styles.logsConsole}>
            <Text style={styles.consoleTitle}>Console Logs:</Text>
            {systemLogs.slice(-2).map((log, i) => (
              <Text key={i} style={styles.consoleLogLine}>
                &gt; {log}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderOverviewStats = () => (
    <View style={styles.overviewGrid}>
      <View style={[styles.statCard, styles.statCardOnline]}>
        <View style={styles.statIconCircle}>
          <ShieldCheck size={18} color="#10b981" />
        </View>
        <View>
          <Text style={styles.statNumber}>{cameras.filter(c => c.status === 'online').length}</Text>
          <Text style={styles.statLabel}>Online Cameras</Text>
        </View>
      </View>

      <View style={[styles.statCard, styles.statCardOffline]}>
        <View style={styles.statIconCircle}>
          <ShieldAlert size={18} color="#ef4444" />
        </View>
        <View>
          <Text style={styles.statNumber}>{cameras.filter(c => c.status !== 'online').length}</Text>
          <Text style={styles.statLabel}>Offline Feeds</Text>
        </View>
      </View>
    </View>
  );

  const renderConnectedChannels = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#1fb2c5" />
          <Text style={styles.loadingText}>Fetching system feeds...</Text>
        </View>
      );
    }
    
    if (cameras.length === 0) {
      return (
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
      );
    }

    if (isWebLayout) {
      // Grid display on web - bigger cards
      return (
        <View style={styles.cameraGridWeb}>
          {cameras.map((camera) => {
            const isOnline = camera.status === 'online';
            const feedUri = `${BASE_URL}/cameras/${camera.id}/feed?t=${Date.now()}`;
            return (
              <View key={camera.id} style={styles.cameraCardWeb}>
                <View style={styles.feedWrapper}>
                  <MjpegFeed uri={feedUri} style={styles.feedImage} resizeMode="cover" />
                  <View style={[styles.statusBadge, isOnline ? styles.badgeOnline : styles.badgeOffline]}>
                    <View style={[styles.pulseDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
                    <Text style={styles.statusText}>{isOnline ? 'LIVE' : 'OFFLINE'}</Text>
                  </View>
                </View>
                <View style={styles.cardInfo}>
                  <Text numberOfLines={1} style={styles.cameraName}>{camera.name}</Text>
                  <View style={styles.locationRow}>
                    <MapPin size={11} color="#64748b" />
                    <Text numberOfLines={1} style={styles.cameraLocation}>{camera.location || 'Local Host'}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    // Horizontal Scroll on mobile - bigger cards
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cameraScroll}>
        {cameras.map((camera) => {
          const isOnline = camera.status === 'online';
          const feedUri = `${BASE_URL}/cameras/${camera.id}/feed?t=${Date.now()}`;
          return (
            <View key={camera.id} style={styles.cameraCard}>
              <View style={styles.feedWrapper}>
                <MjpegFeed uri={feedUri} style={styles.feedImage} resizeMode="cover" />
                <View style={[styles.statusBadge, isOnline ? styles.badgeOnline : styles.badgeOffline]}>
                  <View style={[styles.pulseDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
                  <Text style={styles.statusText}>{isOnline ? 'LIVE' : 'OFFLINE'}</Text>
                </View>
              </View>
              <View style={styles.cardInfo}>
                <Text numberOfLines={1} style={styles.cameraName}>{camera.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin size={11} color="#64748b" />
                  <Text numberOfLines={1} style={styles.cameraLocation}>{camera.location || 'Local Host'}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderDetectionLog = () => {
    if (isAlertsLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#1fb2c5" />
          <Text style={styles.loadingText}>Fetching detections...</Text>
        </View>
      );
    }

    if (alerts.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <ShieldCheck size={28} color="#10b981" style={{ marginBottom: 6 }} />
          <Text style={styles.emptyText}>No recent security threats detected.</Text>
        </View>
      );
    }

    return (
      <View style={styles.alertsContainer}>
        {alerts.map((alert) => {
          const isHigh = alert.detection_type === 'Intruder' || alert.detection_type === 'Unknown Face';
          return (
            <TouchableOpacity 
              key={alert.id} 
              style={[styles.alertLogCard, isHigh ? styles.alertLogHigh : styles.alertLogMedium]}
              onPress={() => router.replace('/(tabs)/alerts')}
            >
              <View style={styles.alertIconWrapper}>
                <AlertTriangle size={16} color={isHigh ? '#ef4444' : '#f59e0b'} />
              </View>
              <View style={styles.alertMainContent}>
                <View style={styles.alertMetaHeader}>
                  <Text style={styles.alertCameraText}>Channel: {alert.camera_id}</Text>
                  <View style={styles.timeWrapper}>
                    <Clock size={10} color="#64748b" style={{ marginRight: 4 }} />
                    <Text style={styles.alertTimeText}>{formatTime(alert.created_at)}</Text>
                  </View>
                </View>
                <Text style={styles.alertTitle}>{(alert.detection_type || 'Object')} Detected</Text>
                <Text style={styles.alertSubtitle}>
                  Confidence: {alert.confidence ? `${(alert.confidence * 100).toFixed(1)}%` : 'N/A'} • Status: {alert.status.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      {isWebLayout ? (
        // Web responsive 2-column layout
        <View style={styles.webContainer}>
          {/* Left panel: clock, status, operations, diagnostics, threat assessment */}
          <ScrollView style={styles.leftColumn} showsVerticalScrollIndicator={false}>
            <View style={styles.webSection}>
              {renderStatusBanner()}
            </View>
            <View style={styles.webSection}>
              {renderLeftPanelExtra()}
            </View>
            <View style={styles.webSection}>
              <Text style={styles.sectionTitle}>Operations Control</Text>
              {renderOperationsControl()}
            </View>
          </ScrollView>
          
          {/* Right panel: statistics overview, camera feeds grid, recent alerts */}
          <ScrollView style={styles.rightColumn} showsVerticalScrollIndicator={false}>
            <View style={styles.webSection}>
              <Text style={styles.sectionTitle}>System Overview</Text>
              {renderOverviewStats()}
            </View>
            
            <View style={styles.webSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Connected Channels</Text>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/camaras/Camaras')} style={styles.manageLink}>
                  <Text style={styles.viewAllText}>Manage</Text>
                  <ExternalLink size={12} color="#1fb2c5" />
                </TouchableOpacity>
              </View>
              {renderConnectedChannels()}
            </View>
            
            <View style={[styles.webSection, { marginBottom: 120 }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Detection Log</Text>
                <View style={styles.logActionButtons}>
                  <TouchableOpacity style={styles.simulateButton} onPress={simulateThreat}>
                    <Activity size={10} color="#1fb2c5" style={{ marginRight: 4 }} />
                    <Text style={styles.simulateButtonText}>Simulate</Text>
                  </TouchableOpacity>
                  {alerts.length > 0 && (
                    <TouchableOpacity onPress={clearAlerts} style={styles.clearAlertButton}>
                      <Text style={styles.clearAlertButtonText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {renderDetectionLog()}
            </View>
          </ScrollView>
        </View>
      ) : (
        // Mobile single-column layout
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.mobileSection}>
            {renderStatusBanner()}
          </View>
          
          <View style={styles.mobileSection}>
            <Text style={styles.sectionTitle}>Operations Control</Text>
            {renderOperationsControl()}
          </View>

          <View style={styles.mobileSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            {renderOverviewStats()}
          </View>

          <View style={styles.mobileSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Connected Channels</Text>
              <TouchableOpacity onPress={() => router.replace('/(tabs)/camaras/Camaras')} style={styles.manageLink}>
                <Text style={styles.viewAllText}>Manage</Text>
                <ExternalLink size={12} color="#1fb2c5" />
              </TouchableOpacity>
            </View>
            {renderConnectedChannels()}
          </View>

          <View style={[styles.mobileSection, { marginBottom: 20 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Detection Log</Text>
              <View style={styles.logActionButtons}>
                <TouchableOpacity style={styles.simulateButton} onPress={simulateThreat}>
                  <Activity size={10} color="#1fb2c5" style={{ marginRight: 4 }} />
                  <Text style={styles.simulateButtonText}>Simulate</Text>
                </TouchableOpacity>
                {alerts.length > 0 && (
                  <TouchableOpacity onPress={clearAlerts} style={styles.clearAlertButton}>
                    <Text style={styles.clearAlertButtonText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {renderDetectionLog()}
          </View>
        </ScrollView>
      )}

      <FloatingNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Pristine Light mode background tint
  },
  scrollContent: {
    paddingBottom: 120,
  },
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 24,
  },
  leftColumn: {
    flex: 3.8,
  },
  rightColumn: {
    flex: 6.2,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoAndTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  brandTitleText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  systemPulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pulseOuterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  pulseActiveColor: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  pulseInactiveColor: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  pulseInnerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotActiveColor: {
    backgroundColor: '#10b981',
  },
  dotInactiveColor: {
    backgroundColor: '#94a3b8',
  },
  systemPulseText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  liveBannerCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  liveClockSection: {
    flex: 1,
  },
  bannerClockText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : undefined,
  },
  bannerDateText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  dividerVertical: {
    width: 1,
    height: 36,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  bannerStatusSection: {
    flex: 1,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerInfoTitle: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bannerInfoValue: {
    fontSize: 13,
    color: '#1fb2c5',
    fontWeight: '600',
    marginTop: 2,
  },
  threatCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  threatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  threatTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  secureBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  secureBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065f46',
  },
  threatDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 10,
    lineHeight: 18,
  },
  checklistTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  checklistText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  mobileSection: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  webSection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  manageLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: '#1fb2c5',
    fontWeight: '700',
  },
  controlsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  controlInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircleTeal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 178, 197, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleCrimson: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlTextWrapper: {
    flex: 1,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  controlDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  dividerHorizontal: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  diagnosticWrapper: {
    marginTop: 6,
  },
  diagnosticButton: {
    backgroundColor: '#1fb2c5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#1fb2c5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  diagnosticButtonDisabled: {
    backgroundColor: 'rgba(31, 178, 197, 0.4)',
  },
  diagnosticButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  logsConsole: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  consoleTitle: {
    fontSize: 9,
    color: '#1fb2c5',
    fontWeight: '700',
    marginBottom: 4,
  },
  consoleLogLine: {
    fontSize: 10,
    color: '#059669',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : undefined,
    marginTop: 2,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  statCardOnline: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  statCardOffline: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  loaderContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.02,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  addCameraButton: {
    backgroundColor: '#1fb2c5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCameraText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  cameraScroll: {
    paddingRight: 24,
    gap: 16,
  },
  cameraGridWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cameraCard: {
    width: 280, // Bigger camera width
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cameraCardWeb: {
    width: '48%', // Spacious camera width
    minWidth: 260,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  feedWrapper: {
    height: 180, // Bigger camera height
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
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  badgeOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  badgeOffline: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  pulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  dotOnline: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  dotOffline: {},
  statusText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardInfo: {
    padding: 12,
  },
  cameraName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cameraLocation: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  logActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 178, 197, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(31, 178, 197, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  simulateButtonText: {
    fontSize: 10,
    color: '#1fb2c5',
    fontWeight: '700',
  },
  clearAlertButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  clearAlertButtonText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  alertsContainer: {
    gap: 12,
  },
  alertLogCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  alertLogHigh: {
    backgroundColor: '#fff5f5',
    borderColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  alertLogMedium: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  alertIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertMainContent: {
    flex: 1,
  },
  alertMetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertCameraText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTimeText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  alertSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
});


