// app/(tabs)/Settings/settings.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import {
  User,
  Settings,
  Shield,
  Camera,
  LogOut,
  ChevronRight,
  Edit2,
  Lock,
  Bell,
  Clock,
  Monitor,
  Sliders,
  Save,
  Info,
} from 'lucide-react-native';
import FloatingNavBar from '../../../components/common/FloatingNavBar';

const PRIMARY = '#1fb2c5';
const PRIMARY_DARK = '#178a99';
const DARK = '#0f172a';
const DARK_CARD = '#1e293b';
const SURFACE = '#ffffff';
const BG = '#f1f5f9';
const TEXT_PRIMARY = '#0f172a';
const TEXT_SECONDARY = '#475569';
const TEXT_MUTED = '#94a3b8';
const BORDER = '#e2e8f0';
const DANGER = '#ef4444';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveSnapshots, setAutoSaveSnapshots] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [alertSensitivity, setAlertSensitivity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [detectionConfidence, setDetectionConfidence] = useState(45);

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be available soon.');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => console.log('Logged out') },
    ]);
  };

  const cycleAlertSensitivity = () => {
    setAlertSensitivity((prev) => {
      if (prev === 'Low') return 'Medium';
      if (prev === 'Medium') return 'High';
      return 'Low';
    });
  };

  const sensitivityColor = {
    Low: '#22c55e',
    Medium: '#f59e0b',
    High: '#ef4444',
  };

  /* ─── Sub-components ─── */

  const SectionHeader = ({
    title,
    icon,
    iconBg,
  }: {
    title: string;
    icon: React.ReactNode;
    iconBg: string;
  }) => (
    <View style={styles.sectionHeaderRow}>
      <View style={[styles.sectionIconPill, { backgroundColor: iconBg + '18' }]}>{icon}</View>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const OptionRow = ({
    label,
    value,
    onPress,
    rightElement,
    icon,
    description,
  }: {
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    icon?: React.ReactNode;
    description?: string;
  }) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      style={styles.optionRow}
    >
      <View style={styles.optionLeft}>
        {icon && <View style={styles.optionIcon}>{icon}</View>}
        <View style={styles.optionTextBlock}>
          <Text style={styles.optionLabel}>{label}</Text>
          {description && <Text style={styles.optionDescription}>{description}</Text>}
        </View>
      </View>
      <View style={styles.optionRight}>
        {value && <Text style={styles.optionValue}>{value}</Text>}
        {rightElement}
        {onPress && !rightElement && <ChevronRight size={18} color={TEXT_MUTED} />}
      </View>
    </TouchableOpacity>
  );

  /* ─── Confidence Stepper ─── */

  const ConfidenceStepper = () => (
    <View style={styles.stepperContainer}>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => setDetectionConfidence((p) => Math.max(10, p - 5))}
        >
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>

        <View style={styles.stepperValueContainer}>
          <Text style={styles.stepperValue}>{detectionConfidence}%</Text>
          <View style={styles.stepperBar}>
            <View
              style={[
                styles.stepperBarFill,
                { width: `${detectionConfidence}%` },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={() => setDetectionConfidence((p) => Math.min(100, p + 5))}
        >
          <Text style={styles.stepperBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ─── RENDER ─── */

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ═══════════ PROFILE HEADER ═══════════ */}
        <View style={styles.profileHeader}>
          {/* Decorative arcs */}
          <View style={styles.headerDecorArc1} />
          <View style={styles.headerDecorArc2} />

          <View style={styles.profileContent}>
            <TouchableOpacity style={styles.avatarOuter} onPress={handleEditProfile}>
              <View style={styles.avatarGlowRing}>
                <View style={styles.avatar}>
                  <User size={48} color="#fff" strokeWidth={1.8} />
                </View>
              </View>
              <View style={styles.editBadge}>
                <Edit2 size={13} color="#fff" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john.doe@email.com</Text>

            <View style={styles.roleBadge}>
              <Shield size={12} color={PRIMARY} strokeWidth={2.5} />
              <Text style={styles.roleText}>Administrator</Text>
            </View>

            <Text style={styles.memberSince}>Member since March 15, 2025</Text>

            <TouchableOpacity style={styles.editProfileBtn} onPress={handleEditProfile}>
              <Edit2 size={14} color="#fff" strokeWidth={2.2} />
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* spacer between dark header and cards */}
        <View style={styles.cardZone}>
          {/* ═══════════ ACCOUNT SETTINGS ═══════════ */}
          <View style={styles.sectionCard}>
            <SectionHeader
              title="Account Settings"
              icon={<Settings size={18} color={PRIMARY} strokeWidth={2.2} />}
              iconBg={PRIMARY}
            />

            <OptionRow
              label="Change Password"
              icon={<Lock size={16} color={TEXT_SECONDARY} />}
              description="Last changed 30 days ago"
              onPress={() => {}}
            />
            <OptionRow
              label="Email Notifications"
              icon={<Bell size={16} color={TEXT_SECONDARY} />}
              description="Alerts, reports & updates"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#cbd5e1', true: PRIMARY }}
                  thumbColor={notificationsEnabled ? '#fff' : '#f8fafc'}
                />
              }
            />
          </View>

          {/* ═══════════ SECURITY & PRIVACY ═══════════ */}
          <View style={styles.sectionCard}>
            <SectionHeader
              title="Security & Privacy"
              icon={<Shield size={18} color="#8b5cf6" strokeWidth={2.2} />}
              iconBg="#8b5cf6"
            />

            <OptionRow
              label="Two-Factor Authentication"
              icon={<Shield size={16} color={TEXT_SECONDARY} />}
              description={twoFactorEnabled ? 'Enabled — authenticator app' : 'Disabled — enable for extra security'}
              rightElement={
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={setTwoFactorEnabled}
                  trackColor={{ false: '#cbd5e1', true: '#8b5cf6' }}
                  thumbColor={twoFactorEnabled ? '#fff' : '#f8fafc'}
                />
              }
            />
            <OptionRow
              label="Login History"
              icon={<Clock size={16} color={TEXT_SECONDARY} />}
              description="View recent account activity"
              onPress={() => {}}
            />
            <OptionRow
              label="Logout from All Devices"
              icon={<Monitor size={16} color={TEXT_SECONDARY} />}
              description="End all other active sessions"
              onPress={() => {}}
            />
          </View>

          {/* ═══════════ CAMERA SETTINGS ═══════════ */}
          <View style={styles.sectionCard}>
            <SectionHeader
              title="Camera & Detection"
              icon={<Camera size={18} color="#f59e0b" strokeWidth={2.2} />}
              iconBg="#f59e0b"
            />

            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <View style={styles.optionIcon}>
                  <Sliders size={16} color={TEXT_SECONDARY} />
                </View>
                <View style={styles.optionTextBlock}>
                  <Text style={styles.optionLabel}>Detection Confidence</Text>
                  <Text style={styles.optionDescription}>
                    Minimum score to trigger an alert
                  </Text>
                </View>
              </View>
            </View>
            <ConfidenceStepper />

            <OptionRow
              label="Auto-save Snapshots"
              icon={<Save size={16} color={TEXT_SECONDARY} />}
              description="Save frames when detections occur"
              rightElement={
                <Switch
                  value={autoSaveSnapshots}
                  onValueChange={setAutoSaveSnapshots}
                  trackColor={{ false: '#cbd5e1', true: '#f59e0b' }}
                  thumbColor={autoSaveSnapshots ? '#fff' : '#f8fafc'}
                />
              }
            />
            <OptionRow
              label="Alert Sensitivity"
              icon={<Bell size={16} color={TEXT_SECONDARY} />}
              description="How aggressively detections are reported"
              value={alertSensitivity}
              onPress={cycleAlertSensitivity}
              rightElement={
                <View style={styles.sensitivityRow}>
                  <View
                    style={[
                      styles.sensitivityDot,
                      { backgroundColor: sensitivityColor[alertSensitivity] },
                    ]}
                  />
                  <Text
                    style={[styles.optionValue, { color: sensitivityColor[alertSensitivity] }]}
                  >
                    {alertSensitivity}
                  </Text>
                  <ChevronRight size={18} color={TEXT_MUTED} />
                </View>
              }
            />
          </View>

          {/* ═══════════ ABOUT ═══════════ */}
          <View style={styles.sectionCard}>
            <SectionHeader
              title="About"
              icon={<Info size={18} color={TEXT_MUTED} strokeWidth={2.2} />}
              iconBg={TEXT_MUTED}
            />
            <OptionRow
              label="App Version"
              icon={<Info size={16} color={TEXT_SECONDARY} />}
              value="1.0.0"
            />
            <OptionRow
              label="Terms of Service"
              icon={<ChevronRight size={16} color={TEXT_SECONDARY} />}
              onPress={() => {}}
            />
            <OptionRow
              label="Privacy Policy"
              icon={<Shield size={16} color={TEXT_SECONDARY} />}
              onPress={() => {}}
            />
          </View>

          {/* ═══════════ LOGOUT ═══════════ */}
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

          {/* Footer */}
          <Text style={styles.footerText}>VisionGuard • v1.0.0</Text>
        </View>
      </ScrollView>

      <FloatingNavBar />
    </View>
  );
}

/* ═══════════════════════════════════════════
 *  STYLES
 * ═══════════════════════════════════════════ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  /* ─── Profile Header ─── */
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
    width: 92,
    height: 92,
    borderRadius: 46,
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

  /* ─── Card Zone ─── */
  cardZone: {
    marginTop: -18,
    paddingHorizontal: 16,
  },

  /* ─── Section Cards ─── */
  sectionCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    marginBottom: 16,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
    gap: 10,
  },
  sectionIconPill: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.2,
  },

  /* ─── Option Rows ─── */
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
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
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionValue: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginRight: 4,
  },

  /* ─── Sensitivity ─── */
  sensitivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sensitivityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* ─── Confidence Stepper ─── */
  stepperContainer: {
    paddingHorizontal: 18,
    paddingBottom: 16,
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

  /* ─── Logout ─── */
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

  /* ─── Footer ─── */
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: TEXT_MUTED,
    paddingVertical: 10,
    letterSpacing: 0.3,
  },
});