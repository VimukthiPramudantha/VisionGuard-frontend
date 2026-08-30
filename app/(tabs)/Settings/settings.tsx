// app/(tabs)/Settings/settings.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import {
  User,
  Settings,
  Shield,
  Camera,
  LogOut,
  ChevronDown,
  Edit2,
  Lock,
  Bell,
  Clock,
  Monitor,
  Sliders,
  Save,
  Smartphone,
  Users,
} from 'lucide-react-native';
import FloatingNavBar from '../../../components/common/FloatingNavBar';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { getUser, setUser } from '../../../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

let goeyToast: any = null;
try {
  goeyToast = require('goey-toast').goeyToast;
} catch (e) {
  console.warn('goey-toast failed to load in settings page', e);
}

const PRIMARY = '#1fb2c5';
const DARK = '#0f172a';
const DARK_CARD = '#1e293b';
const SURFACE = '#ffffff';
const BG = '#f1f5f9';
const TEXT_PRIMARY = '#0f172a';
const TEXT_SECONDARY = '#475569';
const TEXT_MUTED = '#94a3b8';
const BORDER = '#e2e8f0';
const DANGER = '#ef4444';

const ANIM_CONFIG = { duration: 350, easing: Easing.bezier(0.4, 0, 0.2, 1) };

type SectionKey = 'account' | 'security' | 'camera';

function AccordionBody({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, ANIM_CONFIG);
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => {
    const height = interpolate(progress.value, [0, 1], [0, contentHeight || 300]);
    const opacity = interpolate(progress.value, [0, 0.3, 1], [0, 0, 1]);

    return {
      height,
      opacity,
      overflow: 'hidden' as const,
    };
  });

  const innerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [-10, 0]);
    return { transform: [{ translateY }] };
  });

  const onLayout = useCallback((e: any) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setContentHeight(h);
  }, []);

  return (
    <Animated.View style={animatedStyle}>
      <Animated.View style={innerStyle}>
        <View
          onLayout={onLayout}
          style={contentHeight === 0 ? { position: 'absolute', opacity: 0 } : undefined}
        >
          {children}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveSnapshots, setAutoSaveSnapshots] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [alertSensitivity, setAlertSensitivity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [detectionConfidence, setDetectionConfidence] = useState(45);

  const [user, setUserData] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fetchUserDataAndSettings = async () => {
    try {
      const cachedUser = await getUser();
      if (cachedUser) {
        setUserData(cachedUser);
        setNewName(cachedUser.full_name || '');
      }

      if (cachedUser?.email) {
        const userRes = await api.get('/auth/me', { params: { email: cachedUser.email } });
        if (userRes.data) {
          setUserData(userRes.data);
          setNewName(userRes.data.full_name || '');
          await setUser(userRes.data);
        }
      }

      const settingsRes = await api.get('/auth/settings');
      if (settingsRes.data) {
        const s = settingsRes.data;
        setNotificationsEnabled(s.notifications_enabled);
        setTwoFactorEnabled(s.two_factor_enabled);
        setDetectionConfidence(Math.round(s.detection_confidence * 100));
        setAutoSaveSnapshots(s.auto_save_snapshots);
        setAlertSensitivity(s.alert_sensitivity);
      }
    } catch (err) {
      console.error('Failed to fetch settings/user details:', err);
    }
  };

  useEffect(() => {
    fetchUserDataAndSettings();
  }, []);

  const accountChevron = useSharedValue(0);
  const securityChevron = useSharedValue(0);
  const cameraChevron = useSharedValue(0);

  const chevronMap: Record<SectionKey, SharedValue<number>> = {
    account: accountChevron,
    security: securityChevron,
    camera: cameraChevron,
  };

  const toggleSection = (key: SectionKey) => {
    const allKeys: SectionKey[] = ['account', 'security', 'camera'];

    if (openSection === key) {
      chevronMap[key].value = withTiming(0, ANIM_CONFIG);
      setOpenSection(null);
    } else {
      allKeys.forEach((k) => {
        chevronMap[k].value = withTiming(k === key ? 1 : 0, ANIM_CONFIG);
      });
      setOpenSection(key);
    }
  };

  const handleEditProfile = () => {
    if (user) {
      setNewName(user.full_name || '');
      setIsEditModalOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    setIsSavingProfile(true);
    try {
      const response = await api.put('/auth/me', null, {
        params: {
          email: user.email,
          full_name: newName.trim(),
        },
      });
      if (response.data) {
        setUserData(response.data);
        await setUser(response.data);
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    const performLogout = async () => {
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');

        if (Platform.OS === 'web' && goeyToast) {
          goeyToast.success('Logged Out', { description: 'You have been logged out successfully' });
        } else {
          Alert.alert('Success', 'You have been logged out successfully');
        }

        router.replace('/(auth)/login');
      } catch (err) {
        console.error('Failed to log out:', err);
      }
    };

    if (Platform.OS === 'web') {
      const confirm = window.confirm('Are you sure you want to logout?');
      if (confirm) {
        performLogout();
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };

  const toggleNotifications = async (val: boolean) => {
    setNotificationsEnabled(val);
    try {
      await api.put('/auth/settings', { notifications_enabled: val });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTwoFactor = async (val: boolean) => {
    setTwoFactorEnabled(val);
    try {
      await api.put('/auth/settings', { two_factor_enabled: val });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAutoSave = async (val: boolean) => {
    setAutoSaveSnapshots(val);
    try {
      await api.put('/auth/settings', { auto_save_snapshots: val });
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfidenceChange = async (newVal: number) => {
    setDetectionConfidence(newVal);
    try {
      await api.put('/auth/settings', { detection_confidence: newVal / 100 });
    } catch (err) {
      console.error(err);
    }
  };

  const cycleAlertSensitivity = async () => {
    let next: 'Low' | 'Medium' | 'High' = 'Medium';
    if (alertSensitivity === 'Low') next = 'Medium';
    else if (alertSensitivity === 'Medium') next = 'High';
    else next = 'Low';

    setAlertSensitivity(next);
    try {
      await api.put('/auth/settings', { alert_sensitivity: next });
    } catch (err) {
      console.error(err);
    }
  };

  const sensitivityColor: Record<string, string> = {
    Low: '#22c55e',
    Medium: '#f59e0b',
    High: '#ef4444',
  };

  const OptionRow = ({
    label,
    icon,
    description,
    value,
    onPress,
    rightElement,
    isLast,
  }: {
    label: string;
    icon: React.ReactNode;
    description?: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    isLast?: boolean;
  }) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      style={[styles.optionRow, isLast && styles.optionRowLast]}
    >
      <View style={styles.optionIcon}>{icon}</View>
      <View style={styles.optionTextBlock}>
        <Text style={styles.optionLabel}>{label}</Text>
        {description && <Text style={styles.optionDescription}>{description}</Text>}
      </View>
      {value && <Text style={styles.optionValue}>{value}</Text>}
      {rightElement}
    </TouchableOpacity>
  );

  const AccordionHeader = ({
    sectionKey,
    title,
    subtitle,
    icon,
    iconBg,
  }: {
    sectionKey: SectionKey;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    iconBg: string;
  }) => {
    const isOpen = openSection === sectionKey;
    const chevronStyle = useAnimatedStyle(() => {
      const rotate = interpolate(chevronMap[sectionKey].value, [0, 1], [0, 180]);
      return { transform: [{ rotate: `${rotate}deg` }] };
    });

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleSection(sectionKey)}
        style={[styles.accordionHeader, isOpen && styles.accordionHeaderOpen]}
      >
        <View style={[styles.accordionIconPill, { backgroundColor: iconBg + '15' }]}>
          {icon}
        </View>
        <View style={styles.accordionTextBlock}>
          <Text style={styles.accordionTitle}>{title}</Text>
          <Text style={styles.accordionSubtitle}>{subtitle}</Text>
        </View>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={20} color={TEXT_MUTED} strokeWidth={2.2} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const ConfidenceStepper = () => (
    <View style={styles.stepperContainer}>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => handleConfidenceChange(Math.max(10, detectionConfidence - 5))}
        >
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.stepperValueContainer}>
          <Text style={styles.stepperValue}>{detectionConfidence}%</Text>
          <View style={styles.stepperBar}>
            <View style={[styles.stepperBarFill, { width: `${detectionConfidence}%` }]} />
          </View>
        </View>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => handleConfidenceChange(Math.min(100, detectionConfidence + 5))}
        >
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.profileHeader}>
          <View style={styles.headerDecorArc1} />
          <View style={styles.headerDecorArc2} />

          <View style={styles.profileContent}>
            <TouchableOpacity style={styles.avatarOuter} onPress={handleEditProfile}>
              <View style={styles.avatarGlowRing}>
                <View style={styles.avatar}>
                  <User size={44} color="#fff" strokeWidth={1.8} />
                </View>
              </View>
              <View style={styles.editBadge}>
                <Edit2 size={12} color="#fff" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>{user?.full_name || 'Loading...'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Loading...'}</Text>

            <View style={styles.roleBadge}>
              <Shield size={12} color={PRIMARY} strokeWidth={2.5} />
              <Text style={styles.roleText}>{user?.role || 'User'}</Text>
            </View>

            <Text style={styles.memberSince}>
              {user?.created_at
                ? `Member since ${new Date(user.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}`
                : 'Loading...'}
            </Text>

            <TouchableOpacity style={styles.editProfileBtn} onPress={handleEditProfile}>
              <Edit2 size={14} color="#fff" strokeWidth={2.2} />
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.accordionZone}>

          <View style={styles.accordionCard}>
            <AccordionHeader
              sectionKey="account"
              title="Account Settings"
              subtitle="Notifications, preferences & app config"
              icon={<Settings size={20} color={PRIMARY} strokeWidth={2} />}
              iconBg={PRIMARY}
            />
            <AccordionBody isOpen={openSection === 'account'}>
              <View style={styles.accordionBody}>
                <OptionRow
                  label="Notifications"
                  icon={<Bell size={16} color={TEXT_SECONDARY} />}
                  description="Push alerts, reports & updates"
                  rightElement={
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={toggleNotifications}
                      trackColor={{ false: '#cbd5e1', true: PRIMARY }}
                      thumbColor={notificationsEnabled ? '#fff' : '#f8fafc'}
                    />
                  }
                />
                <OptionRow
                  label="App Settings"
                  icon={<Smartphone size={16} color={TEXT_SECONDARY} />}
                  description="Language, theme & display"
                  onPress={() => Alert.alert('App Settings', 'Coming soon.')}
                  isLast
                />
              </View>
            </AccordionBody>
          </View>

          <View style={styles.accordionCard}>
            <AccordionHeader
              sectionKey="security"
              title="Security & Privacy"
              subtitle="Authentication, sessions & access control"
              icon={<Shield size={20} color="#8b5cf6" strokeWidth={2} />}
              iconBg="#8b5cf6"
            />
            <AccordionBody isOpen={openSection === 'security'}>
              <View style={styles.accordionBody}>
                <OptionRow
                  label="Face Recognition"
                  icon={<Users size={16} color={TEXT_SECONDARY} />}
                  description="Manage face recognition profiles"
                  onPress={() => router.push('/(tabs)/Face_recognition')}
                />
                <OptionRow
                  label="Two-Factor Authentication"
                  icon={<Lock size={16} color={TEXT_SECONDARY} />}
                  description={twoFactorEnabled ? 'Enabled — authenticator app' : 'Disabled — tap to enable'}
                  rightElement={
                    <Switch
                      value={twoFactorEnabled}
                      onValueChange={toggleTwoFactor}
                      trackColor={{ false: '#cbd5e1', true: '#8b5cf6' }}
                      thumbColor={twoFactorEnabled ? '#fff' : '#f8fafc'}
                    />
                  }
                />
                <OptionRow
                  label="Login History"
                  icon={<Clock size={16} color={TEXT_SECONDARY} />}
                  description="View recent account activity"
                  onPress={() => Alert.alert('Login History', 'Coming soon.')}
                />
                <OptionRow
                  label="Logout from All Devices"
                  icon={<Monitor size={16} color={TEXT_SECONDARY} />}
                  description="End all other active sessions"
                  onPress={() =>
                    Alert.alert('Logout All', 'Are you sure?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Confirm', style: 'destructive' },
                    ])
                  }
                  isLast
                />
              </View>
            </AccordionBody>
          </View>

          <View style={styles.accordionCard}>
            <AccordionHeader
              sectionKey="camera"
              title="Camera Settings"
              subtitle="Detection, snapshots & alert tuning"
              icon={<Camera size={20} color="#f59e0b" strokeWidth={2} />}
              iconBg="#f59e0b"
            />
            <AccordionBody isOpen={openSection === 'camera'}>
              <View style={styles.accordionBody}>
                <View style={styles.optionRow}>
                  <View style={styles.optionIcon}>
                    <Sliders size={16} color={TEXT_SECONDARY} />
                  </View>
                  <View style={styles.optionTextBlock}>
                    <Text style={styles.optionLabel}>Detection Confidence</Text>
                    <Text style={styles.optionDescription}>Minimum score to trigger an alert</Text>
                  </View>
                </View>
                <ConfidenceStepper />

                <OptionRow
                  label="Auto-save Snapshots"
                  icon={<Save size={16} color={TEXT_SECONDARY} />}
                  description="Save frames on detection events"
                  rightElement={
                    <Switch
                      value={autoSaveSnapshots}
                      onValueChange={toggleAutoSave}
                      trackColor={{ false: '#cbd5e1', true: '#f59e0b' }}
                      thumbColor={autoSaveSnapshots ? '#fff' : '#f8fafc'}
                    />
                  }
                />
                <OptionRow
                  label="Alert Sensitivity"
                  icon={<Bell size={16} color={TEXT_SECONDARY} />}
                  description="How aggressively detections are reported"
                  onPress={cycleAlertSensitivity}
                  rightElement={
                    <View style={styles.sensitivityChip}>
                      <View
                        style={[
                          styles.sensitivityDot,
                          { backgroundColor: sensitivityColor[alertSensitivity] },
                        ]}
                      />
                      <Text
                        style={[
                          styles.sensitivityText,
                          { color: sensitivityColor[alertSensitivity] },
                        ]}
                      >
                        {alertSensitivity}
                      </Text>
                    </View>
                  }
                  isLast
                />
              </View>
            </AccordionBody>
          </View>

          <TouchableOpacity
            style={styles.logoutCard}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View style={styles.logoutIconBg}>
              <LogOut size={20} color={DANGER} strokeWidth={2.2} />
            </View>
            <View>
              <Text style={styles.logoutTitle}>Logout</Text>
              <Text style={styles.logoutSub}>End your current session</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.footerText}>VisionGuard • v1.0.0</Text>
        </View>
      </ScrollView>

      <Modal
        visible={isEditModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalSub}>Update your display name</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Full Name"
              placeholderTextColor={TEXT_MUTED}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setIsEditModalOpen(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
              >
                <Text style={styles.modalBtnSaveText}>
                  {isSavingProfile ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FloatingNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  profileHeader: {
    backgroundColor: DARK,
    paddingTop: 56,
    paddingBottom: 44,
    overflow: 'hidden',
    position: 'relative',
  },
  headerDecorArc1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: PRIMARY,
    opacity: 0.06,
  },
  headerDecorArc2: {
    position: 'absolute',
    bottom: -50,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#8b5cf6',
    opacity: 0.05,
  },
  profileContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  avatarOuter: {
    position: 'relative',
    marginBottom: 18,
  },
  avatarGlowRing: {
    padding: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: PRIMARY + '50',
    ...Platform.select({
      web: {
        boxShadow: `0 0 28px ${PRIMARY}40, 0 0 6px ${PRIMARY}25`,
      } as any,
      default: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: DARK_CARD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PRIMARY + '30',
  },
  editBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: PRIMARY,
    padding: 7,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: DARK,
    ...Platform.select({
      web: {
        boxShadow: `0 2px 8px ${PRIMARY}50`,
      } as any,
      default: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY + '15',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 6,
    borderWidth: 1,
    borderColor: PRIMARY + '25',
  },
  roleText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  memberSince: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 12,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: PRIMARY,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 999,
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow: `0 4px 16px ${PRIMARY}40`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      } as any,
      default: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
      },
    }),
  },
  editProfileBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  accordionZone: {
    marginTop: -18,
    paddingHorizontal: 16,
  },

  accordionCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.04)',
      } as any,
      default: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  accordionHeaderOpen: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  accordionIconPill: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  accordionTextBlock: {
    flex: 1,
    marginRight: 8,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  accordionSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 16,
  },
  accordionBody: {
    paddingTop: 4,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9',
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextBlock: {
    flex: 1,
    marginRight: 8,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  optionDescription: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
    lineHeight: 16,
  },
  optionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginRight: 4,
  },

  sensitivityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 6,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sensitivityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sensitivityText: {
    fontSize: 13,
    fontWeight: '700',
  },

  stepperContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    lineHeight: 22,
  },
  stepperValueContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  stepperBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  stepperBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },

  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(239,68,68,0.08)',
      } as any,
      default: {
        shadowColor: DANGER,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  logoutIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DANGER,
    marginBottom: 2,
  },
  logoutSub: {
    fontSize: 12,
    color: TEXT_MUTED,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: TEXT_MUTED,
    paddingVertical: 10,
    letterSpacing: 0.3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: BORDER,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      } as any,
      default: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT_PRIMARY,
    backgroundColor: '#f8fafc',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: BORDER,
  },
  modalBtnCancelText: {
    color: TEXT_SECONDARY,
    fontWeight: '600',
    fontSize: 14,
  },
  modalBtnSave: {
    backgroundColor: PRIMARY,
  },
  modalBtnSaveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});