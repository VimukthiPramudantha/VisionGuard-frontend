// app/(tabs)/dashboard.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import FloatingNavBar from '../../components/common/FloatingNavBar';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>VisionGuard</Text>
          <Text style={styles.greeting}>Welcome back, User 👋</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Detections</Text>
        </View>
      </ScrollView>

      <FloatingNavBar />
    </SafeAreaView>
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
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  greeting: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e2937',
    marginBottom: 12,
  },
});