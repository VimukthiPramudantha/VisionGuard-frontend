// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

const DEV_MACHINE_IP = '192.168.8.128';

const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://127.0.0.1:8000'
    : `http://${DEV_MACHINE_IP}:8000`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000000000000,
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