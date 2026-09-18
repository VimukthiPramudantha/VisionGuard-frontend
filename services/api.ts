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
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pollingApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const attachAuth = async (config: any) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachAuth);
pollingApi.interceptors.request.use(attachAuth);

const handleResponseError = (error: any) => {
  const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
  const isNetworkError = !error.response && !isTimeout;
  if (isTimeout || isNetworkError) {
    console.warn('API Warning:', error.message);
  } else {
    console.error('API Error:', error.response?.data || error.message);
  }
  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, handleResponseError);
pollingApi.interceptors.response.use((response) => response, handleResponseError);

export default api;