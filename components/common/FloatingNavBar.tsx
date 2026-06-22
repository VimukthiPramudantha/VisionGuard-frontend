// components/common/FloatingNavBar.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Home, Camera, Bell, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';

const navItems = [
  { name: 'Dashboard', icon: Home, route: '/(tabs)/dashboard' },
  { name: 'Cameras', icon: Camera, route: '/(tabs)/cameras' },
  { name: 'Alerts', icon: Bell, route: '/(tabs)/alerts' },
  { name: 'Profile', icon: User, route: '/(tabs)/profile' },
];

const PRIMARY_COLOR = '#1fb2c5';

export default function FloatingNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <View style={styles.wrapper}>
      <View style={styles.nav}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.route || 
                          (pathname.includes('dashboard') && item.name === 'Dashboard');
          const isHovered = hoveredIndex === index;
          const showLabel = isActive || isHovered;

          return (
            <Pressable
              key={index}
              style={[
                styles.navItem,
                isActive && styles.activeNavItem,
                isHovered && !isActive && styles.hoveredNavItem,
              ]}
              onPress={() => router.replace(item.route)}
              // @ts-ignore
              onMouseEnter={() => setHoveredIndex(index)}
              // @ts-ignore
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <item.icon 
                size={20} 
                color={isActive ? "#ffffff" : "#cbd5e1"} 
                strokeWidth={2.2}
              />
              <View style={[
                styles.labelContainer,
                showLabel ? styles.labelContainerVisible : styles.labelContainerHidden
              ]}>
                <Text 
                  numberOfLines={1}
                  style={[styles.label, isActive ? styles.activeLabel : styles.hoveredLabel]}
                >
                  {item.name}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 35, 
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  nav: {
    flexDirection: 'row',
    // Ultra glossy translucent background
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.85)',
    // @ts-ignore
    backdropFilter: Platform.OS === 'web' ? 'blur(30px) saturate(210%)' : undefined,
    borderWidth: 1,
    // Lighter, more reflecting border for glass effect
    borderColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginHorizontal: 4,
    // Add transition effect on web
    ...Platform.select({
      web: {
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      } as any,
    }),
  },
  activeNavItem: {
    backgroundColor: PRIMARY_COLOR,
    // Subtle inner shadow glow
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(31, 178, 197, 0.35)',
      } as any,
    }),
  },
  hoveredNavItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  labelContainer: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin-left 0.3s ease',
      } as any,
    }),
  },
  labelContainerVisible: {
    maxWidth: 100, // Safe maximum width for item names
    opacity: 1,
    marginLeft: 8,
  },
  labelContainerHidden: {
    maxWidth: 0,
    opacity: 0,
    marginLeft: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  activeLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
  hoveredLabel: {
    color: '#ffffff',
  },
});