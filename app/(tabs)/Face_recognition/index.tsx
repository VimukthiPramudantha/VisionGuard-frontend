// app/(tabs)/Face_recognition/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { api } from '../../../services/api';
import { 
  Upload, 
  RefreshCw, 
  Users, 
  Camera, 
  Trash2, 
  UserCheck, 
  Database, 
  ScanLine, 
  ScanFace 
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import FloatingNavBar from '../../../components/common/FloatingNavBar';

type TabType = 'identify' | 'register' | 'database' | 'compare';

interface RegisteredFace {
  id: string;
  name: string;
  image_url: string;
  file_path: string;
}

export default function FaceRecognitionScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('identify');
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<{
    similarity: number;
    match: boolean;
    message: string;
  } | null>(null);

  const [singleImage, setSingleImage] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifyResult, setIdentifyResult] = useState<{
    match: boolean;
    name?: string;
    similarity_percentage?: number;
    message: string;
  } | null>(null);

  const [registerName, setRegisterName] = useState('');
  const [registerImage, setRegisterImage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const [dbFaces, setDbFaces] = useState<RegisteredFace[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  useEffect(() => {
    if (activeTab === 'database') {
      fetchRegisteredFaces();
    }
  }, [activeTab]);

  const fetchRegisteredFaces = async () => {
    setIsLoadingDb(true);
    try {
      const response = await api.get('/face/registered');
      setDbFaces(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const getBaseURL = () => {
    return api.defaults.baseURL || '';
  };

  const requestPickerCameraPermission = async () => {
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

  const pickImage = async (type: 'image1' | 'image2' | 'single' | 'register', source: 'library' | 'camera') => {
    let result;
    
    if (source === 'camera') {
      const hasPermission = await requestPickerCameraPermission();
      if (!hasPermission) return;
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
      const uri = result.assets[0].uri;
      if (type === 'image1') {
        setImage1(uri);
        setResult(null);
      } else if (type === 'image2') {
        setImage2(uri);
        setResult(null);
      } else if (type === 'single') {
        setSingleImage(uri);
        setIdentifyResult(null);
      } else if (type === 'register') {
        setRegisterImage(uri);
      }
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
        setResult({
          similarity: response.data.similarity_percentage,
          match: response.data.match,
          message: response.data.message || (response.data.match ? "Faces match successfully!" : "Faces do not match. plz try again"),
        });
      } else {
        throw new Error(response.data?.message || 'Face verification failed');
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.detail || error.message || 'Verification failed';
      alertOrToast('Error', errMsg);
    } finally {
      setIsComparing(false);
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

  const deleteFace = async (faceId: string) => {
    const performDelete = async () => {
      try {
        await api.delete(`/face/registered/${faceId}`);
        setDbFaces(dbFaces.filter(face => face.id !== faceId));
        alertOrToast('Deleted', 'Profile deleted successfully');
      } catch (error: any) {
        alertOrToast('Error', 'Failed to delete profile');
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this profile?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Face Profile',
        'Are you sure you want to delete this profile from the database?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  const appendImageToFormData = async (formData: FormData, key: string, uri: string) => {
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

  const alertOrToast = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ScanFace size={38} color="#1e40af" />
          <Text style={styles.title}>Face Recognition</Text>
          <Text style={styles.subtitle}>VisionGuard Intelligent Profile DB</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'identify' && styles.activeTabButton]}
            onPress={() => setActiveTab('identify')}
          >
            <ScanLine size={18} color={activeTab === 'identify' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'identify' && styles.activeTabText]}>Identify</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'register' && styles.activeTabButton]}
            onPress={() => setActiveTab('register')}
          >
            <UserCheck size={18} color={activeTab === 'register' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>Add Face</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'database' && styles.activeTabButton]}
            onPress={() => setActiveTab('database')}
          >
            <Database size={18} color={activeTab === 'database' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'database' && styles.activeTabText]}>Database</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'compare' && styles.activeTabButton]}
            onPress={() => setActiveTab('compare')}
          >
            <Users size={18} color={activeTab === 'compare' ? '#ffffff' : '#64748b'} />
            <Text style={[styles.tabText, activeTab === 'compare' && styles.activeTabText]}>Compare</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content: Identify */}
        {activeTab === 'identify' && (
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>Identify Person</Text>
            <Text style={styles.cardDescription}>
              Upload or snap a photo of a face to check if they are in the database.
            </Text>

            <TouchableOpacity 
              style={styles.singleImageUpload}
              onPress={() => pickImage('single', 'library')}
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
                onPress={() => pickImage('single', 'camera')}
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
        )}

        {/* Tab Content: Register Face */}
        {activeTab === 'register' && (
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
        )}

        {/* Tab Content: Database */}
        {activeTab === 'database' && (
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>Registered Face Profiles</Text>
            <Text style={styles.cardDescription}>
              All individuals recognized by VisionGuard system (stored securely as facial vectors).
            </Text>

            {isLoadingDb ? (
              <ActivityIndicator style={{ marginVertical: 30 }} size="large" color="#1e40af" />
            ) : dbFaces.length === 0 ? (
              <View style={styles.emptyDbState}>
                <Database size={48} color="#94a3b8" />
                <Text style={styles.emptyDbText}>No registered profiles in database</Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {dbFaces.map((item) => (
                  <View key={item.id} style={styles.faceListItem}>
                    <View style={styles.faceListAvatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {item.name ? item.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                      </Text>
                    </View>
                    <View style={styles.faceListInfo}>
                      <Text style={styles.faceListName}>{item.name}</Text>
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => deleteFace(item.id)}
                      >
                        <Trash2 size={16} color="#ef4444" />
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Tab Content: Compare (Original View) */}
        {activeTab === 'compare' && (
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
                  onPress={() => pickImage('image1', 'library')}
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
                  onPress={() => pickImage('image1', 'camera')}
                >
                  <Camera size={14} color="#64748b" />
                  <Text style={styles.smallCameraText}>Snap</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.imageBox}>
                <Text style={styles.imageLabel}>Image 2</Text>
                <TouchableOpacity 
                  style={styles.imageUpload}
                  onPress={() => pickImage('image2', 'library')}
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
                  onPress={() => pickImage('image2', 'camera')}
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
        )}
      </ScrollView>

      <FloatingNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingBottom: 120 },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1e40af', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    marginHorizontal: 16,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#1e40af',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },

  contentCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 18,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 16,
  },

  singleImageUpload: {
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cameraRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#1e40af',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
  },
  cameraButtonText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '600',
  },

  actionButton: {
    backgroundColor: '#1e40af',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  imageContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  imageBox: {
    flex: 1,
  },
  imageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    textAlign: 'center',
  },
  imageUpload: {
    height: 140,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
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
    gap: 8,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  smallCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  smallCameraText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },

  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 10,
  },
  resetText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },

  resultCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  matchCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  noMatchCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  matchDetails: {
    alignItems: 'center',
    marginVertical: 8,
  },
  matchName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#166534',
  },
  matchSimilarity: {
    fontSize: 14,
    color: '#15803d',
    marginTop: 2,
    fontWeight: '600',
  },
  similarityText: {
    fontSize: 15,
    marginBottom: 4,
    color: '#334155',
  },
  similarityValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e40af',
  },
  resultMessage: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },

  emptyDbState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyDbText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  gridContainer: {
    gap: 12,
  },
  faceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  faceListAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#1e40af',
    fontSize: 20,
    fontWeight: '700',
  },
  faceListInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faceListName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  cameraContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  cameraPreview: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  captureButtonInline: {
    position: 'absolute',
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  captureButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  retakeText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  mobileOnlyContainer: {
    padding: 24,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  mobileOnlyText: {
    color: '#1e40af',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 16,
  },
  permissionText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});