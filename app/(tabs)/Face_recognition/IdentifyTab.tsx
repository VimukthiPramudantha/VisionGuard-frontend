// app/(tabs)/Face_recognition/IdentifyTab.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Upload, Camera } from 'lucide-react-native';
import { api } from '../../../services/api';
import { IdentifyResult } from './types';
import { styles } from './styles';
import { pickImageFromSource, appendImageToFormData, alertOrToast } from './utils';

export default function IdentifyTab() {
  const [singleImage, setSingleImage] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifyResult, setIdentifyResult] = useState<IdentifyResult | null>(null);

  const handlePickImage = async (source: 'library' | 'camera') => {
    const uri = await pickImageFromSource(source);
    if (uri) {
      setSingleImage(uri);
      setIdentifyResult(null);
    }
  };

  const identifyFace = async () => {
    if (!singleImage) {
      alertOrToast('Error', 'Please upload or capture a photo first');
      return;
    }

    setIsIdentifying(true);
    setIdentifyResult(null);

    try {
      const formData = new FormData();
      await appendImageToFormData(formData, 'image', singleImage);

      const response = await api.post('/face/identify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIdentifyResult(response.data);
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.detail || error.message || 'Identification failed';
      alertOrToast('Error', errMsg);
    } finally {
      setIsIdentifying(false);
    }
  };

  return (
    <View style={styles.contentCard}>
      <Text style={styles.cardTitle}>Identify Person</Text>
      <Text style={styles.cardDescription}>
        Upload or snap a photo of a face to check if they are in the database.
      </Text>

      <TouchableOpacity 
        style={styles.singleImageUpload}
        onPress={() => handlePickImage('library')}
      >
        {singleImage ? (
          <Image source={{ uri: singleImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <Upload size={40} color="#94a3b8" />
            <Text style={styles.placeholderText}>Choose from Library</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.cameraRow}>
        <TouchableOpacity 
          style={styles.cameraButton} 
          onPress={() => handlePickImage('camera')}
        >
          <Camera size={20} color="#1e40af" />
          <Text style={styles.cameraButtonText}>Take a Photo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.actionButton, !singleImage && styles.disabledButton]}
        onPress={identifyFace}
        disabled={!singleImage || isIdentifying}
      >
        {isIdentifying ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.actionButtonText}>Identify Face</Text>
        )}
      </TouchableOpacity>

      {identifyResult && (
        <View style={[
          styles.resultCard, 
          identifyResult.match ? styles.matchCard : styles.noMatchCard
        ]}>
          <Text style={styles.resultTitle}>
            {identifyResult.match ? `✅ Match Found` : `❌ No Match`}
          </Text>
          {identifyResult.match && (
            <View style={styles.matchDetails}>
              <Text style={styles.matchName}>{identifyResult.name}</Text>
              <Text style={styles.matchSimilarity}>
                Confidence: {identifyResult.similarity_percentage}%
              </Text>
            </View>
          )}
          <Text style={styles.resultMessage}>{identifyResult.message}</Text>
        </View>
      )}
    </View>
  );
}
