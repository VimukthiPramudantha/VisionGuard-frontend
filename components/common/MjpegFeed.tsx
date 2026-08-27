import React, { useState, useEffect, useRef } from 'react';
import { Platform, Image, StyleSheet, View, Text, ViewStyle, ImageStyle } from 'react-native';

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
  const isWs = uri.startsWith('ws://') || uri.startsWith('wss://');

  // For Web (HTML native support)
  if (Platform.OS === 'web') {
    if (isWs) {
      return <WebSocketImage uri={uri} style={style} resizeMode={resizeMode} />;
    }
    return React.createElement('img', {
      src: uri,
      style: Object.assign(
        { width: '100%', height: '100%', objectFit: resizeMode, display: 'block', backgroundColor: '#000' },
        StyleSheet.flatten(style) || {}
      ),
    });
  }

  // If it's a websocket stream (ideal for Mobile real-time update)
  if (isWs) {
    return <WebSocketImage uri={uri} style={style} resizeMode={resizeMode} />;
  }

  // Fallback to legacy polling HTTP Mjpeg feed for standard urls
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

// WebSocket connection handler component using Double Buffering to prevent flickering
function WebSocketImage({
  uri,
  style,
  resizeMode,
}: {
  uri: string;
  style?: any;
  resizeMode: any;
}) {
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [nextFrame, setNextFrame] = useState<string | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let active = true;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      if (!active) return;
      setStatus('connecting');

      const ws = new WebSocket(uri);
      wsRef.current = ws;

      ws.onopen = () => {
        if (active) setStatus('connected');
      };

      ws.onmessage = (event) => {
        if (active && event.data) {
          const frameData = `data:image/jpeg;base64,${event.data}`;
          if (Platform.OS === 'web') {
            setCurrentFrame(frameData);
          } else {
            setNextFrame(frameData);
          }
        }
      };

      ws.onerror = (e) => {
        console.warn('[WS Feed] Connection error:', e);
        if (active) setStatus('error');
      };

      ws.onclose = () => {
        if (active) {
          setStatus('connecting');
          reconnectTimer = setTimeout(connect, 2000);
        }
      };
    }

    connect();

    return () => {
      active = false;
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [uri]);

  const handleLoadEnd = () => {
    if (nextFrame) {
      setCurrentFrame(nextFrame);
    }
  };

  const flattenedStyle = StyleSheet.flatten(style) || {};

  if (Platform.OS === 'web') {
    return (
      <div style={Object.assign(
        { width: '100%', height: '100%', position: 'relative', backgroundColor: '#000', overflow: 'hidden' },
        flattenedStyle
      )}>
        {currentFrame && (
          <img
            src={currentFrame}
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                const container = img.closest('[data-fullscreen-container]');
                if (container) {
                  container.setAttribute('data-video-aspect-ratio', (img.naturalWidth / img.naturalHeight).toString());
                }
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: resizeMode,
              display: 'block'
            }}
          />
        )}
      </div>
    );
  }

  return (
    <View style={[flattenedStyle, { backgroundColor: '#000', overflow: 'hidden' }]}>
      {currentFrame && (
        <Image
          source={{ uri: currentFrame }}
          style={[StyleSheet.absoluteFillObject]}
          resizeMode={resizeMode}
        />
      )}

      {nextFrame && (
        <Image
          source={{ uri: nextFrame }}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0.01 }}
          onLoadEnd={handleLoadEnd}
        />
      )}

      {!currentFrame && (
        <View style={[StyleSheet.absoluteFillObject, styles.placeholder]}>
          <Text style={styles.placeholderText}>
            {status === 'connecting' ? 'Connecting stream...' : 'Feed connection error'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
});
