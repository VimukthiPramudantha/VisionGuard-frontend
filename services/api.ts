// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const FALLBACK_DEV_IP = '192.168.0.196';

function getBaseUrl(): string {
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:8000';
  }

  const debuggerHost = Constants.expoConfig?.hostUri
    ?? Constants.manifest2?.extra?.expoGo?.debuggerHost
    ?? Constants.manifest?.debuggerHost;

  const devIp = debuggerHost?.split(':')[0] || FALLBACK_DEV_IP;
  return `http://${devIp}:8000`;
}

const API_BASE_URL = getBaseUrl();
console.log('[VisionGuard] API base URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;