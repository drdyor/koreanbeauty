/**
 * Skin Diary - Photo tracking for skin progress
 * - Camera only (no gallery import, no filters)
 * - Perfect for cosmetic procedures, acne tracking
 * - Can't cheat with filters
 */
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 3;

interface SkinPhoto {
  id: string;
  uri: string;
  timestamp: string;
  note?: string;
}

const PHOTOS_STORAGE_KEY = 'glowchi:skinPhotos';
const PHOTOS_DIR = `${FileSystem.documentDirectory}skin_photos/`;

export default function SkinDiaryScreen() {
  const [photos, setPhotos] = useState<SkinPhoto[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedPhoto, setSelectedPhoto] = useState<SkinPhoto | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    loadPhotos();
    ensurePhotoDirectory();
  }, []);

  async function ensurePhotoDirectory() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to create photo directory:', error);
    }
  }

  async function loadPhotos() {
    try {
      const stored = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SkinPhoto[];
        // Filter out photos that no longer exist
        const existing = await Promise.all(
          parsed.map(async (photo) => {
            const info = await FileSystem.getInfoAsync(photo.uri);
            return info.exists ? photo : null;
          })
        );
        setPhotos(existing.filter(Boolean) as SkinPhoto[]);
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  }

  async function savePhotos(newPhotos: SkinPhoto[]) {
    try {
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(newPhotos));
      setPhotos(newPhotos);
    } catch (error) {
      console.error('Failed to save photos:', error);
    }
  }

  async function takePhoto() {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true, // No processing/filters
      });

      if (!photo?.uri) return;

      // Save to app directory
      const filename = `skin_${Date.now()}.jpg`;
      const newUri = `${PHOTOS_DIR}${filename}`;
      await FileSystem.moveAsync({ from: photo.uri, to: newUri });

      const newPhoto: SkinPhoto = {
        id: Date.now().toString(),
        uri: newUri,
        timestamp: new Date().toISOString(),
      };

      const updated = [newPhoto, ...photos];
      await savePhotos(updated);
      setShowCamera(false);
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  }

  async function deletePhoto(photo: SkinPhoto) {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(photo.uri, { idempotent: true });
              const updated = photos.filter((p) => p.id !== photo.id);
              await savePhotos(updated);
              setSelectedPhoto(null);
            } catch (error) {
              console.error('Failed to delete photo:', error);
            }
          },
        },
      ]
    );
  }

  function formatDate(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Permission not granted yet
  if (!permission) {
    return (
      <LinearGradient colors={[...Colors.background.gradient]} style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Camera View
  if (showCamera) {
    if (!permission.granted) {
      return (
        <LinearGradient colors={[...Colors.background.gradient]} style={styles.container}>
          <View style={styles.centered}>
            <Ionicons name="camera-outline" size={64} color={Colors.primary.purple} />
            <Text style={styles.permissionTitle}>Camera Access Needed</Text>
            <Text style={styles.permissionText}>
              To track your skin progress, we need access to your camera.
              No filters, no imports - just honest progress tracking.
            </Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Grant Camera Access</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          {/* Camera UI Overlay */}
          <View style={styles.cameraOverlay}>
            {/* Top bar */}
            <View style={styles.cameraTopBar}>
              <TouchableOpacity
                style={styles.cameraCloseBtn}
                onPress={() => setShowCamera(false)}
              >
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>Skin Photo</Text>
              <TouchableOpacity
                style={styles.cameraFlipBtn}
                onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Face guide */}
            <View style={styles.faceGuide}>
              <View style={styles.faceGuideOval} />
              <Text style={styles.faceGuideText}>Position your face in the oval</Text>
            </View>

            {/* Bottom bar */}
            <View style={styles.cameraBottomBar}>
              <Text style={styles.cameraNote}>No filters. Just you.</Text>
              <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
              <Text style={styles.cameraDate}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // Main Gallery View
  return (
    <LinearGradient colors={[...Colors.background.gradient]} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Skin Diary</Text>
          <Text style={styles.subtitle}>Track your skin journey</Text>
        </View>

        {/* Take Photo Button */}
        <TouchableOpacity
          style={styles.takePhotoBtn}
          onPress={() => setShowCamera(true)}
          activeOpacity={0.8}
        >
          <View style={styles.takePhotoBtnIcon}>
            <Ionicons name="camera" size={32} color={Colors.primary.purple} />
          </View>
          <View style={styles.takePhotoBtnText}>
            <Text style={styles.takePhotoBtnTitle}>Take Today's Photo</Text>
            <Text style={styles.takePhotoBtnSubtitle}>
              No filters, no imports - just honest tracking
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.neutral[400]} />
        </TouchableOpacity>

        {/* Stats */}
        {photos.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{photos.length}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {photos.length > 1
                  ? Math.ceil(
                      (Date.now() - new Date(photos[photos.length - 1].timestamp).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0}
              </Text>
              <Text style={styles.statLabel}>Days Tracked</Text>
            </View>
          </View>
        )}

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <View style={styles.photoGrid}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.gridContainer}>
              {photos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.photoThumb}
                  onPress={() => setSelectedPhoto(photo)}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                  <View style={styles.photoDateBadge}>
                    <Text style={styles.photoDateText}>
                      {formatDate(photo.timestamp).split(',')[0]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={Colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No photos yet</Text>
            <Text style={styles.emptyText}>
              Start tracking your skin journey by taking your first photo
            </Text>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Why Skin Diary?</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📸</Text>
            <Text style={styles.infoText}>Document cosmetic procedure progress</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🔍</Text>
            <Text style={styles.infoText}>Track acne changes over time</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⚠️</Text>
            <Text style={styles.infoText}>Document issues if something goes wrong</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🚫</Text>
            <Text style={styles.infoText}>No filters = honest progress</Text>
          </View>
        </View>
      </ScrollView>

      {/* Photo Detail Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPhoto && (
              <>
                <Image
                  source={{ uri: selectedPhoto.uri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <View style={styles.modalInfo}>
                  <Text style={styles.modalDate}>
                    {formatDate(selectedPhoto.timestamp)}
                  </Text>
                  <Text style={styles.modalTime}>
                    {formatTime(selectedPhoto.timestamp)}
                  </Text>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedPhoto(null)}
                  >
                    <Text style={styles.modalCloseBtnText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalDeleteBtn}
                    onPress={() => deletePhoto(selectedPhoto)}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    marginTop: 4,
  },

  // Take Photo Button
  takePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  takePhotoBtnIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.lavender,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  takePhotoBtnText: {
    flex: 1,
  },
  takePhotoBtnTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  takePhotoBtnSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSizes['2xl'],
    fontWeight: 'bold',
    color: Colors.primary.purple,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },

  // Photo Grid
  photoGrid: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumb: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.neutral[100],
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoDateBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  photoDateText: {
    fontSize: 9,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    maxWidth: 280,
  },

  // Info Card
  infoCard: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
    width: 28,
    textAlign: 'center',
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    flex: 1,
  },

  // Permission
  permissionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  permissionText: {
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: Colors.primary.purple,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  permissionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: FontSizes.base,
  },
  cancelBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  cancelBtnText: {
    color: Colors.text.muted,
    fontSize: FontSizes.base,
  },

  // Camera
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
  },
  cameraCloseBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: 'white',
  },
  cameraFlipBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    alignItems: 'center',
  },
  faceGuideOval: {
    width: 200,
    height: 280,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
  faceGuideText: {
    marginTop: Spacing.md,
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSizes.sm,
  },
  cameraBottomBar: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  cameraNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  cameraDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FontSizes.xs,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral[900],
  },
  modalInfo: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  modalDate: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: 'white',
  },
  modalTime: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  modalCloseBtn: {
    backgroundColor: 'white',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  modalCloseBtnText: {
    color: Colors.text.primary,
    fontWeight: '600',
    fontSize: FontSizes.base,
  },
  modalDeleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
