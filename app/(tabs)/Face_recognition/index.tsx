// app/(tabs)/Face_recognition/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { 
  ScanLine, 
  UserCheck, 
  Database, 
  Users, 
  ScanFace 
} from 'lucide-react-native';
import FloatingNavBar from '../../../components/common/FloatingNavBar';
import { TabType } from './types';
import { styles } from './styles';
import IdentifyTab from './IdentifyTab';
import RegisterTab from './RegisterTab';
import DatabaseTab from './DatabaseTab';
import CompareTab from './CompareTab';

export default function FaceRecognitionScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('identify');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ScanFace size={38} color="#1e40af" />
          <Text style={styles.title}>Face Recognition</Text>
          <Text style={styles.subtitle}>VisionGuard Intelligent Profile DB</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'identify' && styles.activeTabButton]}
            onPress={() => setActiveTab('identify')}
          >
            <ScanLine size={18} color={activeTab === 'identify' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'identify' && styles.activeTabText]}>Identify</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'register' && styles.activeTabButton]}
            onPress={() => setActiveTab('register')}
          >
            <UserCheck size={18} color={activeTab === 'register' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>Add Face</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'database' && styles.activeTabButton]}
            onPress={() => setActiveTab('database')}
          >
            <Database size={18} color={activeTab === 'database' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'database' && styles.activeTabText]}>Database</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'compare' && styles.activeTabButton]}
            onPress={() => setActiveTab('compare')}
          >
            <Users size={18} color={activeTab === 'compare' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'compare' && styles.activeTabText]}>Compare</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'identify' && <IdentifyTab />}
        {activeTab === 'register' && <RegisterTab />}
        {activeTab === 'database' && <DatabaseTab />}
        {activeTab === 'compare' && <CompareTab />}
      </ScrollView>

      <FloatingNavBar />
    </View>
  );
}