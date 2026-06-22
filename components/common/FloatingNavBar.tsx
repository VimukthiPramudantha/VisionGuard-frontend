// components/common/FloatingNavBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Home, Camera, Bell, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';

const navItems = [
  { name: 'Dashboard', icon: Home, route: '/(tabs)/dashboard' },
  { name: 'Cameras', icon: Camera, route: '/(tabs)/cameras' },
  { name: 'Alerts', icon: Bell, route: '/(tabs)/alerts' },
  { name: 'Profile', icon: User, route: '/(tabs)/profile' },
];

export default function FloatingNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.wrapper}>
      <View style={styles.nav}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.route || 
                          (pathname.includes('dashboard') && item.name === 'Dashboard');

          return (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => router.replace(item.route)}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <item.icon 
                  size={24} 
                  color={isActive ? "#ffffff" : "#94a3b8"} 
                  strokeWidth={2.2}
                />
              </View>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  nav: {
    flexDirection: 'row',
    backgroundColor: '#0a2f4a',
    borderRadius: 999,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    minWidth: 70,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 999,
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: '#00a6f4',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
});