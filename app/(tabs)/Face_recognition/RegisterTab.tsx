// app/(tabs)/Face_recognition/RegisterTab.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { api } from '../../../services/api';
import { styles } from './styles';
import { appendImageToFormData, alertOrToast } from './utils';

export default function RegisterTab() {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [registerName, setRegisterName] = useState('');
  const [registerImage, setRegisterImage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const registerFace = async () => {
    if (!registerName.trim()) {
      alertOrToast('Error', 'Please enter a name');
      return;
    }
    if (!registerImage) {
      alertOrToast('Error', 'Please upload or capture a photo');
      return;
    }

    setIsRegistering(true);

    try {
      const formData = new FormData();
      formData.append('name', registerName.trim());
      await appendImageToFormData(formData, 'image', registerImage);

      const response = await api.post('/face/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.success) {
        alertOrToast('Success', 'Face registered in the database successfully!');
        setRegisterName('');
        setRegisterImage(null);
      } else {
        throw new Error(response.data?.message || 'Failed to register face');
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.detail || error.message || 'Registration failed';
      alertOrToast('Error', errMsg);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <View style={styles.contentCard}>
      <Text style={styles.cardTitle}>Register New Face</Text>
      <Text style={styles.cardDescription}>
        Add a person to the database by capturing a clear photo of their face directly inside the app.
      </Text>

      {Platform.OS === 'web' ? (
        <View style={styles.mobileOnlyContainer}>
          <Text style={styles.mobileOnlyText}>
            📱 Registration is only available on mobile devices to ensure safe and direct in-app camera capture.
          </Text>
        </View>
      ) : !cameraPermission ? (
        <ActivityIndicator size="large" color="#1e40af" style={{ marginVertical: 20 }} />
      ) : !cameraPermission.granted ? (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera permission is required to capture faces inside the app.
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={requestCameraPermission}>
            <Text style={styles.actionButtonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. John Doe, Mom, Office Staff"
            placeholderTextColor="#94a3b8"
            value={registerName}
            onChangeText={setRegisterName}
          />

          {registerImage ? (
            <View style={styles.cameraContainer}>
              <Image source={{ uri: registerImage }} style={styles.cameraPreview} />
              <TouchableOpacity 
                style={styles.retakeButton} 
                onPress={() => setRegisterImage(null)}
              >
                <RefreshCw size={16} color="#64748b" />
                <Text style={styles.retakeText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraContainer}>
              <CameraView
                style={styles.cameraPreview}
                facing="front"
                ref={cameraRef}
              />
              <TouchableOpacity 
                style={styles.captureButtonInline} 
                onPress={async () => {
                  if (cameraRef.current) {
                    try {
                      const photo = await cameraRef.current.takePictureAsync({
                        quality: 0.8,
                      });
                      if (photo && photo.uri) {
                        setRegisterImage(photo.uri);
                      }
                    } catch (err: any) {
                      alertOrToast('Error', 'Failed to capture photo: ' + err.message);
                    }
                  }
                }}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.actionButton, (!registerImage || !registerName) && styles.disabledButton]}
            onPress={registerFace}
            disabled={!registerImage || !registerName || isRegistering}
          >
            {isRegistering ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.actionButtonText}>Add to Database</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
