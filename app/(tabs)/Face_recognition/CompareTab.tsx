// app/(tabs)/Face_recognition/CompareTab.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Upload, Camera, RefreshCw } from 'lucide-react-native';
import { api } from '../../../services/api';
import { CompareResult } from './types';
import { styles } from './styles';
import { pickImageFromSource, appendImageToFormData, alertOrToast } from './utils';

export default function CompareTab() {
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);

  const handlePickImage = async (slot: 'image1' | 'image2', source: 'library' | 'camera') => {
    const uri = await pickImageFromSource(source);
    if (uri) {
      if (slot === 'image1') {
        setImage1(uri);
      } else {
        setImage2(uri);
      }
      setResult(null);
    }
  };

  const compareFaces = async () => {
    if (!image1 || !image2) {
      alertOrToast('Error', 'Please upload both images');
      return;
    }

    setIsComparing(true);
    setResult(null);

    try {
      const formData = new FormData();
      await appendImageToFormData(formData, 'image1', image1);
      await appendImageToFormData(formData, 'image2', image2);

      const response = await api.post('/face/compare', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.success) {
        const similarity = response.data.similarity_percentage;
        const match = response.data.match;
        const msg = response.data.message || (match ? "Faces match successfully!" : "Faces do not match. plz try again");
        setResult({
          similarity: similarity,
          match: match,
          message: msg,
        });

        if (match) {
          alertOrToast('Match Found', `Faces match successfully! (Similarity: ${similarity}%)`, 'success');
        } else {
          alertOrToast('No Match', `Faces do not match. (Similarity: ${similarity}%)`, 'error');
        }
      } else {
        throw new Error(response.data?.message || 'Face verification failed');
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.detail || error.message || 'Verification failed';
      alertOrToast('Error', errMsg, 'error');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <View style={styles.contentCard}>
      <Text style={styles.cardTitle}>Compare 1 vs 1</Text>
      <Text style={styles.cardDescription}>
        Verify if the face on two separate images belongs to the same person.
      </Text>

      <View style={styles.imageContainer}>
        <View style={styles.imageBox}>
          <Text style={styles.imageLabel}>Image 1</Text>
          <TouchableOpacity 
            style={styles.imageUpload}
            onPress={() => handlePickImage('image1', 'library')}
          >
            {image1 ? (
              <Image source={{ uri: image1 }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholder}>
                <Upload size={32} color="#94a3b8" />
                <Text style={styles.placeholderText}>Upload</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.smallCameraButton}
            onPress={() => handlePickImage('image1', 'camera')}
          >
            <Camera size={14} color="#64748b" />
            <Text style={styles.smallCameraText}>Snap</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageBox}>
          <Text style={styles.imageLabel}>Image 2</Text>
          <TouchableOpacity 
            style={styles.imageUpload}
            onPress={() => handlePickImage('image2', 'library')}
          >
            {image2 ? (
              <Image source={{ uri: image2 }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholder}>
                <Upload size={32} color="#94a3b8" />
                <Text style={styles.placeholderText}>Upload</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.smallCameraButton}
            onPress={() => handlePickImage('image2', 'camera')}
          >
            <Camera size={14} color="#64748b" />
            <Text style={styles.smallCameraText}>Snap</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.actionButton, (!image1 || !image2) && styles.disabledButton]}
        onPress={compareFaces}
        disabled={!image1 || !image2 || isComparing}
      >
        {isComparing ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.actionButtonText}>Compare Faces</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={() => {
        setImage1(null);
        setImage2(null);
        setResult(null);
      }}>
        <RefreshCw size={18} color="#64748b" />
        <Text style={styles.resetText}>Reset Images</Text>
      </TouchableOpacity>

      {result && (
        <View style={[styles.resultCard, result.match ? styles.matchCard : styles.noMatchCard]}>
          <Text style={styles.resultTitle}>
            {result.match ? "✅ Match Found" : "❌ No Match"}
          </Text>
          <Text style={styles.similarityText}>
            Similarity: <Text style={styles.similarityValue}>{result.similarity}%</Text>
          </Text>
          <Text style={styles.resultMessage}>{result.message}</Text>
        </View>
      )}
    </View>
  );
}
