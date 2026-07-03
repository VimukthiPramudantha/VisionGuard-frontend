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
} from 'react-native';
import { User, Settings, Shield, Camera, LogOut, ChevronRight, Edit2 } from 'lucide-react-native';
import FloatingNavBar from '../../../components/common/FloatingNavBar';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveSnapshots, setAutoSaveSnapshots] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [alertSensitivity, setAlertSensitivity] = useState(45);

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing will be available soon.");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => console.log("Logged out") }
    ]);
  };

  const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
    <View style={styles.sectionHeaderContainer}>
      {icon}
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* ==================== MAIN PROFILE SECTION ==================== */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleEditProfile}>
            <View style={styles.avatar}>
              <User size={55} color="#fff" />
            </View>
            <View style={styles.editBadge}>
              <Edit2 size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@email.com</Text>
          <Text style={styles.userRole}>Administrator</Text>
          <Text style={styles.accountDate}>Member since: March 15, 2025</Text>

          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ==================== ACCOUNT SETTINGS ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Account Settings" icon={<Settings size={22} color="#64748b" />} />

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Change Password</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Email Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#cbd5e1', true: '#0ea5e9' }}
            />
          </TouchableOpacity>
        </View>

        {/* ==================== SECURITY & PRIVACY ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Security & Privacy" icon={<Shield size={22} color="#64748b" />} />

          <View style={styles.option}>
            <Text style={styles.optionText}>Two-Factor Authentication</Text>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: '#cbd5e1', true: '#0ea5e9' }}
            />
          </View>

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Login History</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Logout from all devices</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* ==================== CAMERA SETTINGS ==================== */}
        <View style={styles.section}>
          <SectionHeader title="Camera Settings" icon={<Camera size={22} color="#64748b" />} />

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Default Detection Confidence</Text>
            <Text style={styles.optionValue}>{alertSensitivity}%</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.option}>
            <Text style={styles.optionText}>Auto-save Snapshots</Text>
            <Switch
              value={autoSaveSnapshots}
              onValueChange={setAutoSaveSnapshots}
              trackColor={{ false: '#cbd5e1', true: '#0ea5e9' }}
            />
          </View>

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Alert Sensitivity</Text>
            <Text style={styles.optionValue}>Medium</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <FloatingNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingBottom: 100 },

  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#0f172a',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#0ea5e9',
    padding: 6,
    borderRadius: 999,
  },
  userName: { fontSize: 26, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  userEmail: { color: '#94a3b8', fontSize: 16 },
  userRole: { color: '#60a5fa', fontSize: 15, marginTop: 6, fontWeight: '500' },
  accountDate: { color: '#64748b', fontSize: 14, marginTop: 8 },

  editProfileButton: {
    marginTop: 24,
    backgroundColor: '#1e40af',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  editProfileText: { color: 'white', fontWeight: '600', fontSize: 16 },

  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e2937',
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionText: { flex: 1, fontSize: 16, color: '#334155' },
  optionValue: { color: '#64748b', marginRight: 10, fontWeight: '500' },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 18,
    borderRadius: 16,
    gap: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 17,
    fontWeight: '600',
  },
});