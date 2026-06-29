// components/common/FloatingNavBar.tsx
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Home, Camera, Bell, User } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';

const navItems = [
  { name: 'Dashboard', icon: Home, route: '/(tabs)/dashboard', match: 'dashboard' },
  { name: 'Cameras', icon: Camera, route: '/(tabs)/camaras/Camaras', match: 'camaras' },
  { name: 'Alerts', icon: Bell, route: '/(tabs)/alerts', match: 'alerts' },
  { name: 'Profile', icon: User, route: '/(tabs)/profile', match: 'profile' },
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
          const isActive = pathname === item.route || pathname.includes(item.match);
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
                color="#00000060" 
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
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    elevation: 20,
    
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
        backdropFilter: 'blur(30px) saturate(220%)',
        borderColor: 'rgba(255, 255, 255, 0.28)',
        boxShadow: `
          inset 0 16px 16px -12px rgba(255, 255, 255, 0.4),
          inset 0 2px 3px rgba(255, 255, 255, 0.3),
          inset 0 -2px 3px rgba(0, 0, 0, 0.15),
          0 16px 36px rgba(0, 0, 0, 0.3)
        `,
      } as any,
      default: {
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
      },
    }),
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    
    ...Platform.select({
      web: {
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      } as any,
    }),
  },
  activeNavItem: {
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, #1fb2c5 0%, #1d4585 100%)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
        boxShadow: `
          inset 0 8px 8px -4px rgba(255, 255, 255, 0.45),
          inset 0 1px 2px rgba(255, 255, 255, 0.3),
          0 6px 20px rgba(31, 178, 197, 0.45)
        `,
      } as any,
      default: {
        color:"white",
        backgroundColor: PRIMARY_COLOR,
      },
    }),
  },
  hoveredNavItem: {
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
        borderColor: 'rgba(255, 255, 255, 0.18)',
        boxShadow: 'inset 0 4px 6px -3px rgba(255, 255, 255, 0.25)',
      } as any,
      default: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
      },
    }),
  },
  labelContainer: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        transition: 'max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease, margin-left 0.5s ease',
      } as any,
    }),
  },
  labelContainerVisible: {
    maxWidth: 130,
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
    color: '#000000a2',
  },
  activeLabel: {
    color: '#0000008c',
    fontWeight: '600',
  },
  hoveredLabel: {
    color: '#000000a2',
  },
});