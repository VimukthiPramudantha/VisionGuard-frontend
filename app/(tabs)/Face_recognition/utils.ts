// app/(tabs)/Face_recognition/utils.ts
import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

let goeyToast: any = null;
if (Platform.OS === 'web') {
  try {
    goeyToast = require('goey-toast').goeyToast;
  } catch (e) {
    console.warn('goey-toast failed to load in face recognition utils', e);
  }
}

export const alertOrToast = (title: string, message: string, type: 'success' | 'error' = 'error') => {
  if (Platform.OS === 'web') {
    if (goeyToast) {
      if (type === 'success') {
        goeyToast.success(title, { description: message });
      } else {
        goeyToast.error(title, { description: message });
      }
    } else {
      alert(`${title}: ${message}`);
    }
  } else {
    Alert.alert(title, message);
  }
};

export const requestPickerCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
      return false;
    }
    return true;
  }
  return true;
};

export const pickImageFromSource = async (
  source: 'library' | 'camera'
): Promise<string | null> => {
  let result;

  if (source === 'camera') {
    const hasPermission = await requestPickerCameraPermission();
    if (!hasPermission) return null;
    result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  } else {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  }

  if (!result.canceled && result.assets[0]) {
    return result.assets[0].uri;
  }
  return null;
};

export const appendImageToFormData = async (
  formData: FormData,
  key: string,
  uri: string
) => {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append(key, blob, `${key}.jpg`);
  } else {
    const filename = uri.split('/').pop() || `${key}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    formData.append(key, {
      uri,
      name: filename,
      type: type,
    } as any);
  }
};
