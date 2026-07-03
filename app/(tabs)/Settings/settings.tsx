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
import { User, Shield, Camera, LogOut, ChevronRight } from 'lucide-react-native';
import FloatingNavBar from '../../../components/common/FloatingNavBar';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveSnapshots, setAutoSaveSnapshots] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => console.log("User logged out") }
      ]
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={50} color="#fff" />
            </View>
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@email.com</Text>
          <Text style={styles.userRole}>Administrator</Text>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <SectionHeader title="Settings" />
          
          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Language</Text>
            <Text style={styles.optionValue}>English</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.option}>
            <Text style={styles.optionText}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#cbd5e1', true: '#0ea5e9' }}
            />
          </View>
        </View>

        {/* Security and Privacy */}
        <View style={styles.section}>
          <SectionHeader title="Security & Privacy" />

          <TouchableOpacity style={styles.option}>
            <Shield size={22} color="#64748b" />
            <Text style={styles.optionText}>Change Password</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.option}>
            <Text style={styles.optionText}>Two-Factor Authentication</Text>
            <Switch value={false} trackColor={{ false: '#cbd5e1', true: '#0ea5e9' }} />
          </View>

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Login History</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Camera Settings */}
        <View style={styles.section}>
          <SectionHeader title="Camera Settings" />

          <View style={styles.option}>
            <Text style={styles.optionText}>Auto-save Snapshots</Text>
            <Switch
              value={autoSaveSnapshots}
              onValueChange={setAutoSaveSnapshots}
              trackColor={{ false: '#cbd5e1', true: '#0ea5e9' }}
            />
          </View>

          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Default Confidence Threshold</Text>
            <Text style={styles.optionValue}>45%</Text>
            <ChevronRight size={20} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.option}>
            <Text style={styles.optionText}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#cbd5e1', true: '#0ea5e9' }}
            />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <FloatingNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#0f172a',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 16,
  },
  userRole: {
    color: '#60a5fa',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#1e40af',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e2937',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#334155',
  },
  optionValue: {
    color: '#64748b',
    marginRight: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    gap: 10,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 17,
    fontWeight: '600',
  },
});