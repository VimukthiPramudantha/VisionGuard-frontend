// components/dashboard/RecentAlerts.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { AlertItem } from './types';

const formatAlertTime = (iso?: string): string => {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

interface Props {
  alerts: AlertItem[];
  loading: boolean;
  onViewAlert: () => void;
}

export default function RecentAlerts({ alerts, loading, onViewAlert }: Props) {
  if (loading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator size="small" color="#94a3b8" />
        <Text style={styles.placeholderText}>Loading alerts...</Text>
      </View>
    );
  }

  if (alerts.length === 0) {
    return (
      <View style={styles.allClear}>
        <ShieldCheck size={28} color="#10b981" />
        <Text style={styles.allClearTitle}>All clear</Text>
        <Text style={styles.allClearSub}>No recent threats detected</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {alerts.map((alert) => {
        const isHigh = alert.detection_type === 'Intruder' || alert.detection_type === 'Unknown Face';
        return (
          <TouchableOpacity
            key={alert.id}
            style={styles.item}
            onPress={onViewAlert}
            activeOpacity={0.7}
          >
            <View style={[styles.stripe, isHigh ? styles.stripeRed : styles.stripeAmber]} />
            <View style={[styles.icon, isHigh ? styles.iconRed : styles.iconAmber]}>
              <AlertTriangle size={14} color={isHigh ? '#ef4444' : '#f59e0b'} />
            </View>
            <View style={styles.content}>
              <Text style={styles.type}>
                {alert.detection_type || 'Object'} Detected
              </Text>
              <Text style={styles.meta}>
                {alert.camera_id} · {alert.confidence ? `${(alert.confidence * 100).toFixed(0)}%` : 'N/A'}
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.time}>{formatAlertTime(alert.created_at)}</Text>
              {alert.status === 'unread' && <View style={styles.unreadDot} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingRight: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'transform 0.15s ease',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  stripe: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  stripeRed: {
    backgroundColor: '#ef4444',
  },
  stripeAmber: {
    backgroundColor: '#f59e0b',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  iconRed: {
    backgroundColor: '#fef2f2',
  },
  iconAmber: {
    backgroundColor: '#fffbeb',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  meta: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1fb2c5',
  },
  placeholder: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  placeholderText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  allClear: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      },
    }),
  },
  allClearTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
  },
  allClearSub: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 2,
  },
});
