// app/(tabs)/Face_recognition/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Upload, RefreshCw, Users } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import FloatingNavBar from '../../../components/common/FloatingNavBar';

export default function FaceRecognitionScreen() {
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<{
    similarity: number;
    match: boolean;
    message: string;
  } | null>(null);

  const pickImage = async (side: 'left' | 'right') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (side === 'left') {
        setImage1(result.assets[0].uri);
      } else {
        setImage2(result.assets[0].uri);
      }
      setResult(null); // Reset previous result
    }
  };

  const compareFaces = async () => {
    if (!image1 || !image2) {
      Alert.alert('Error', 'Please upload both images');
      return;
    }

    setIsComparing(true);

    // TODO: Connect to DeepFace backend later
    setTimeout(() => {
      const similarity = Math.random() * 40 + 60; // Simulated 60-100%
      const match = similarity > 75;

      setResult({
        similarity: Math.round(similarity),
        match,
        message: match 
          ? "Faces match successfully!" 
          : "Faces do not match.",
      });
      setIsComparing(false);
    }, 1800);
  };

  const resetImages = () => {
    setImage1(null);
    setImage2(null);
    setResult(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Users size={32} color="#1e40af" />
          <Text style={styles.title}>Face Recognition</Text>
          <Text style={styles.subtitle}>Compare two faces using DeepFace</Text>
        </View>

        <View style={styles.imageContainer}>
          {/* Left Image */}
          <View style={styles.imageBox}>
            <Text style={styles.imageLabel}>Image 1 (Reference)</Text>
            <TouchableOpacity 
              style={styles.imageUpload}
              onPress={() => pickImage('left')}
            >
              {image1 ? (
                <Image source={{ uri: image1 }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholder}>
                  <Upload size={40} color="#94a3b8" />
                  <Text style={styles.placeholderText}>Upload Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Right Image */}
          <View style={styles.imageBox}>
            <Text style={styles.imageLabel}>Image 2 (Compare)</Text>
            <TouchableOpacity 
              style={styles.imageUpload}
              onPress={() => pickImage('right')}
            >
              {image2 ? (
                <Image source={{ uri: image2 }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholder}>
                  <Upload size={40} color="#94a3b8" />
                  <Text style={styles.placeholderText}>Upload Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.compareButton, (!image1 || !image2) && styles.disabledButton]}
            onPress={compareFaces}
            disabled={!image1 || !image2 || isComparing}
          >
            <Text style={styles.compareButtonText}>
              {isComparing ? "Comparing Faces..." : "Compare Faces"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={resetImages}>
            <RefreshCw size={20} color="#64748b" />
            <Text style={styles.resetText}>Reset Images</Text>
          </TouchableOpacity>
        </View>

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
      </ScrollView>

      <FloatingNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingBottom: 100 },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e40af', marginTop: 12 },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 6 },

  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  imageBox: { flex: 1 },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    textAlign: 'center',
  },
  imageUpload: {
    height: 220,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '500',
  },

  actionContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    gap: 12,
  },
  compareButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  compareButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  resetText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '500',
  },

  resultCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  matchCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  noMatchCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fda4af',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  similarityText: {
    fontSize: 18,
    marginBottom: 6,
  },
  similarityValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e40af',
  },
  resultMessage: {
    textAlign: 'center',
    color: '#475569',
    marginTop: 8,
  },
});