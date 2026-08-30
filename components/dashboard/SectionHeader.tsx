// components/dashboard/SectionHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface Props {
  title: string;
  onViewAll: () => void;
}

export default function SectionHeader({ title, onViewAll }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity style={styles.btn} onPress={onViewAll} activeOpacity={0.6}>
        <Text style={styles.btnText}>View All</Text>
        <ChevronRight size={14} color="#1fb2c5" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  btnText: {
    fontSize: 13,
    color: '#1fb2c5',
    fontWeight: '600',
  },
});
