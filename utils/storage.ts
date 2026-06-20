// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem('authToken', token);
};

export const getAuthToken = async () => {
  return await AsyncStorage.getItem('authToken');
};

export const removeAuthToken = async () => {
  await AsyncStorage.removeItem('authToken');
};

export const setUser = async (user: any) => {
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

export const getUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};