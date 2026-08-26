import React, { useState, useEffect, useRef } from 'react';
import { Platform, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';

interface MjpegFeedProps {
  uri: string;
  style?: ViewStyle | ImageStyle | (ViewStyle | ImageStyle)[];
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  refreshIntervalMs?: number; 
}

export default function MjpegFeed({
  uri,
  style,
  resizeMode = 'cover',
  refreshIntervalMs = 1000,
}: MjpegFeedProps) {
  if (Platform.OS === 'web') {
    return React.createElement('img', {
      src: uri,
      style: Object.assign(
        { width: '100%', height: '100%', objectFit: resizeMode, display: 'block', backgroundColor: '#000' },
        StyleSheet.flatten(style) || {}
      ),
    });
  }

  const [frameUri, setFrameUri] = useState(uri + '&_t=' + Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setFrameUri(uri + '&_t=' + Date.now());
    }, refreshIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [uri, refreshIntervalMs]);

  return (
    <Image
      source={{ uri: frameUri }}
      style={style as ImageStyle}
      resizeMode={resizeMode}
    />
  );
}
