import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Daily Checklist types
interface ChecklistItem {
  id: string;
  name: string;
  icon: string;
  duration?: number;
  completed: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', name: 'Skincare', icon: '🧴', duration: 5, completed: false },
  { id: '2', name: 'Get dressed', icon: '👕', duration: 3, completed: false },
  { id: '3', name: 'Eat breakfast', icon: '🥣', duration: 10, completed: false },
  { id: '4', name: 'Stretch', icon: '🧘‍♀️', duration: 2, completed: false },
];

const CHECKLIST_STORAGE_KEY = 'glowchi:dailyChecklist';
const CHECKLIST_DATE_KEY = 'glowchi:checklistDate';
import { Colors, Spacing, BorderRadius, FontSizes, MOOD_EMOJIS } from '../../constants';
import { calculatePetState, getPetMessage, calculateExperienceGain, levelUp, shouldLevelUp } from '../../services/petEngine';
import { healthService } from '../../services/healthService';
import { notificationService } from '../../services/notifications';
import type { PetState, HealthData, PetMood } from '../../types';

const { width } = Dimensions.get('window');

const DEFAULT_PET: PetState = {
  mood: 'neutral',
  energy: 50,
  skinClarity: 70,
  breakoutRisk: 30,
  happiness: 50,
  level: 1,
  experience: 0,
  streak: 0,
};

export default function PetScreen() {
  const [pet, setPet] = useState<PetState>(DEFAULT_PET);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [yogaFlowActive, setYogaFlowActive] = useState(false);
  const [yogaStep, setYogaStep] = useState(0);
  const [activeRoutineIdx, setActiveRoutineIdx] = useState<number | null>(null);

  // Daily Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('✅');

  // Breathing animation for the hamster
  const breatheAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle breathing/bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [breatheAnim]);

  useEffect(() => {
    loadPetData();
    initializeHealth();
    initializeNotifications();
    loadChecklist();
  }, []);

  // Load checklist from storage, reset if new day
  async function loadChecklist() {
    try {
      const storedDate = await AsyncStorage.getItem(CHECKLIST_DATE_KEY);
      const today = new Date().toDateString();

      if (storedDate !== today) {
        // New day - reset completion status but keep custom items
        const storedList = await AsyncStorage.getItem(CHECKLIST_STORAGE_KEY);
        if (storedList) {
          const parsed = JSON.parse(storedList) as ChecklistItem[];
          const reset = parsed.map(item => ({ ...item, completed: false }));
          setChecklist(reset);
          await AsyncStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(reset));
        }
        await AsyncStorage.setItem(CHECKLIST_DATE_KEY, today);
      } else {
        // Same day - load saved state
        const storedList = await AsyncStorage.getItem(CHECKLIST_STORAGE_KEY);
        if (storedList) {
          setChecklist(JSON.parse(storedList));
        }
      }
    } catch (error) {
      console.error('Failed to load checklist:', error);
    }
  }

  // Save checklist to storage
  async function saveChecklist(items: ChecklistItem[]) {
    try {
      await AsyncStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(items));
      setChecklist(items);
    } catch (error) {
      console.error('Failed to save checklist:', error);
    }
  }

  // Toggle item completion
  function toggleChecklistItem(id: string) {
    const updated = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveChecklist(updated);
  }

  // Add new item
  function addChecklistItem() {
    if (!newItemName.trim()) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      icon: newItemIcon || '✅',
      completed: false,
    };
    const updated = [...checklist, newItem];
    saveChecklist(updated);
    setNewItemName('');
    setNewItemIcon('✅');
    setShowAddItem(false);
  }

  // Delete item
  function deleteChecklistItem(id: string) {
    Alert.alert('Delete Item', 'Remove this item from your checklist?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = checklist.filter(item => item.id !== id);
          saveChecklist(updated);
        },
      },
    ]);
  }

  // Calculate completion percentage
  const completedCount = checklist.filter(item => item.completed).length;
  const completionPercentage = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;


  async function startYogaFlow() {
    setYogaFlowActive(true);
    setYogaStep(1); // Downward Dog
    
    setTimeout(() => {
      setYogaStep(2); // Plank
      setTimeout(() => {
        setYogaStep(3); // Bridge
        setTimeout(() => {
          setYogaFlowActive(false);
          setYogaStep(0);
          handleYogaComplete();
        }, 3000);
      }, 3000);
    }, 3000);
  }

  async function handleYogaComplete() {
    const updatedPet: PetState = {
      ...pet,
      mood: 'happy',
      energy: Math.min(100, pet.energy + 20),
      happiness: Math.min(100, pet.happiness + 15),
    };
    await savePetData(updatedPet);
    Alert.alert('Amazing! ✨', 'We both feel much better now. Movement is medicine!');
  }

  async function initializeHealth() {
    try {
      const initialized = await healthService.initialize();
      if (initialized) {
        console.log('[Pet] Health service initialized');
        // Auto-sync on app open
        await syncHealthData();
      }
    } catch (error) {
      console.error('[Pet] Failed to initialize health service:', error);
    }
  }

  async function initializeNotifications() {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        console.log('[Pet] Notifications enabled');
        // Schedule daily check-in reminder
        await notificationService.scheduleDailyCheckInReminder();
        await notificationService.scheduleStreakWarning();
      }
    } catch (error) {
      console.error('[Pet] Failed to initialize notifications:', error);
    }
  }

  async function loadPetData() {
    try {
      const petData = await AsyncStorage.getItem('pet:state');
      const checkInData = await AsyncStorage.getItem('pet:lastCheckIn');

      if (petData) {
        try {
          const parsed = JSON.parse(petData);
          setPet(parsed);
        } catch (parseError) {
          console.error('[Pet] Invalid pet data, using default:', parseError);
          setPet(DEFAULT_PET);
        }
      }

      if (checkInData) {
        try {
          const parsedDate = JSON.parse(checkInData);
          setLastCheckIn(new Date(parsedDate));
        } catch (parseError) {
          console.error('[Pet] Invalid check-in date:', parseError);
          setLastCheckIn(null);
        }
      }
    } catch (error) {
      console.error('[Pet] Failed to load pet data:', error);
      setPet(DEFAULT_PET);
    } finally {
      setLoading(false);
    }
  }

  async function savePetData(newPet: PetState) {
    try {
      await AsyncStorage.setItem('pet:state', JSON.stringify(newPet));
      setPet(newPet);
    } catch (error) {
      console.error('Failed to save pet data:', error);
    }
  }

  function canCheckInToday(): boolean {
    if (!lastCheckIn) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCheckInDate = new Date(lastCheckIn);
    lastCheckInDate.setHours(0, 0, 0, 0);

    return today.getTime() > lastCheckInDate.getTime();
  }

  async function syncHealthData() {
    setSyncing(true);
    try {
      const data = await healthService.syncTodayData();

      // Merge with today's saved health data (to preserve water intake)
      const today = new Date().toISOString().split('T')[0];
      const savedHealthStr = await AsyncStorage.getItem(`health:${today}`);

      let savedHealth = {};
      if (savedHealthStr) {
        try {
          savedHealth = JSON.parse(savedHealthStr);
        } catch (parseError) {
          console.error('[Pet] Invalid saved health data:', parseError);
        }
      }

      const mergedData: HealthData = {
        ...data,
        waterIntake: (savedHealth as any).waterIntake || data.waterIntake || 0,
      };

      setHealthData(mergedData);
      setLastSync(new Date());
      console.log('[Pet] Health data synced:', mergedData);

      Alert.alert(
        '✅ Synced!',
        `Steps: ${mergedData.steps}\nSleep: ${mergedData.sleepHours}hrs\nWater: ${mergedData.waterIntake} glasses`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[Pet] Sync failed:', error);
      Alert.alert(
        'Sync Failed',
        'Could not connect to ' + healthService.getPlatformName() + '. Please check permissions.',
        [{ text: 'OK' }]
      );
    } finally {
      setSyncing(false);
    }
  }

  async function handleQuickCheckIn() {
    if (!canCheckInToday()) {
      alert('You already checked in today! Come back tomorrow 💖');
      return;
    }

    // Use real health data if available, otherwise use saved or mock data
    let checkInHealth: HealthData;

    if (healthData) {
      checkInHealth = healthData;
    } else {
      // Fallback to saved health data or defaults
      const today = new Date().toISOString().split('T')[0];
      const savedHealthStr = await AsyncStorage.getItem(`health:${today}`);

      if (savedHealthStr) {
        try {
          checkInHealth = JSON.parse(savedHealthStr);
        } catch (parseError) {
          console.error('[Pet] Invalid health data for check-in:', parseError);
          checkInHealth = {
            steps: 0,
            sleepHours: 7,
            waterIntake: 0,
          };
        }
      } else {
        checkInHealth = {
          steps: 0,
          sleepHours: 7,
          waterIntake: 0,
        };
      }
    }

    const newPetState = calculatePetState(checkInHealth, pet);
    const xpGained = calculateExperienceGain(checkInHealth, pet.streak);

    let updatedPet: PetState = {
      ...newPetState,
      experience: pet.experience + xpGained,
      streak: pet.streak + 1,
      lastFed: new Date(),
    };

    // Check for level up
    const didLevelUp = shouldLevelUp(updatedPet.level, updatedPet.experience);
    if (didLevelUp) {
      updatedPet = levelUp(updatedPet);
      // Send level up notification
      await notificationService.sendLevelUpNotification(updatedPet.level);
    }

    // Send breakout warning if risk is high
    if (updatedPet.breakoutRisk >= 60) {
      await notificationService.scheduleBreakoutWarning(updatedPet.breakoutRisk);
    }

    await savePetData(updatedPet);
    await AsyncStorage.setItem('pet:lastCheckIn', JSON.stringify(new Date().toISOString()));
    setLastCheckIn(new Date());
  }

  const checkedInToday = !canCheckInToday();
  const petEmoji = MOOD_EMOJIS[pet.mood] || '🐱';
  const message = getPetMessage(pet);
  const xpProgress = (pet.experience / (pet.level * 100)) * 100;

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading your pet...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={[...Colors.background.gradient]} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>GlowChi</Text>
            <Text style={styles.subtitle}>Your Wellness Companion • Level {pet.level}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={20} color={Colors.primary.pink} />
            <Text style={styles.streakText}>{pet.streak} day streak</Text>
          </View>
        </View>

        {/* Pet Display */}
        <View style={styles.petContainer}>
          <Animated.View style={[
            styles.petCircle,
            pet.shieldActive && styles.shieldActiveGlow,
            pet.mood === 'sluggish' && !yogaFlowActive && styles.yogaReadyPose,
            yogaStep === 1 && styles.yogaDownwardDog,
            yogaStep === 2 && styles.yogaPlank,
            yogaStep === 3 && styles.yogaBridge,
            // Mood-based glow color
            pet.mood === 'happy' && styles.happyGlow,
            pet.mood === 'stressed' && styles.stressedGlow,
            pet.mood === 'sick' && styles.sickGlow,
            {
              transform: [
                {
                  translateY: breatheAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -6],
                  }),
                },
                {
                  scale: breatheAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.02, 1],
                  }),
                },
              ],
            },
          ]}>
            <Image
              source={require('../../assets/hamster-main.png')}
              style={styles.petImage}
              resizeMode="cover"
            />
          </Animated.View>
          
          <View style={styles.messageContainer}>
            <Text style={styles.petMessage}>
              {yogaFlowActive ? (
                yogaStep === 1 ? 'Downward Dog... feel the stretch' : 
                yogaStep === 2 ? 'Strong Plank... breathe deeply' : 
                'Into the Bridge... opening up'
              ) : (
                pet.mood === 'sluggish' ? "I'm feeling a bit heavy... Let's do some poses?" : message
              )}
            </Text>
          </View>
          
          {pet.mood === 'sluggish' && !yogaFlowActive && (
            <TouchableOpacity style={styles.yogaBtn} onPress={startYogaFlow}>
              <Text style={styles.yogaBtnText}>Let's do some poses 🧘‍♀️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* App Blocker - Android only placeholder */}
        <View style={styles.shieldButton}>
          <View style={styles.shieldContent}>
            <Ionicons
              name="phone-portrait-outline"
              size={24}
              color={Colors.neutral[400]}
            />
            <View style={styles.shieldTextContainer}>
              <Text style={styles.shieldTitle}>Silence Apps</Text>
              <Text style={styles.shieldSubtitle}>
                Block TikTok, Instagram, etc. (Android only • Coming soon)
              </Text>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          </View>
        </View>

        {/* Daily Checklist */}
        <View style={styles.routineSection}>
          <View style={styles.routineHeader}>
            <Text style={styles.sectionLabel}>Daily Checklist</Text>
            <View style={styles.routineTimerInfo}>
              <Text style={styles.estimatedTime}>{completionPercentage}%</Text>
              <Text style={styles.estimatedLabel}>{completedCount}/{checklist.length} done</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.checklistProgress}>
            <View style={[styles.checklistProgressFill, { width: `${completionPercentage}%` }]} />
          </View>

          {checklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.routineItem, item.completed && styles.routineItemCompleted]}
              onPress={() => toggleChecklistItem(item.id)}
              onLongPress={() => deleteChecklistItem(item.id)}
            >
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, item.completed && styles.itemNameCompleted]}>
                  {item.name}
                </Text>
                {item.duration && (
                  <Text style={styles.itemDuration}>{item.duration}m</Text>
                )}
              </View>
              <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
                {item.completed && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.routineFooter}>
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={() => setShowAddItem(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary.purple} />
              <Text style={styles.addItemBtnText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Item Modal */}
        <Modal
          visible={showAddItem}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddItem(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Checklist Item</Text>

              <View style={styles.modalInputRow}>
                <TextInput
                  style={styles.iconInput}
                  value={newItemIcon}
                  onChangeText={setNewItemIcon}
                  placeholder="✅"
                  maxLength={2}
                />
                <TextInput
                  style={styles.nameInput}
                  value={newItemName}
                  onChangeText={setNewItemName}
                  placeholder="Item name..."
                  placeholderTextColor={Colors.text.muted}
                  autoFocus
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowAddItem(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalAddBtn}
                  onPress={addChecklistItem}
                >
                  <Text style={styles.modalAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* XP Progress */}
        <View style={styles.xpContainer}>
          <Text style={styles.xpLabel}>XP to Level {pet.level + 1}</Text>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpProgress}%` }]} />
          </View>
          <Text style={styles.xpText}>{pet.experience} / {pet.level * 100}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatBar label="Energy" value={pet.energy} color={Colors.primary.pink} icon="flash" />
          <StatBar label="Skin Clarity" value={pet.skinClarity} color={Colors.primary.purple} icon="sparkles" />
          <StatBar label="Happiness" value={pet.happiness} color={Colors.primary.rose} icon="heart" />
        </View>

        {/* Breakout Risk Alert */}
        {pet.breakoutRisk >= 60 && (
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={24} color={Colors.warning} />
            <View style={styles.warningText}>
              <Text style={styles.warningTitle}>High Breakout Risk!</Text>
              <Text style={styles.warningSubtitle}>Risk: {pet.breakoutRisk}%</Text>
            </View>
          </View>
        )}

        {/* Health Data Sync */}
        <TouchableOpacity
          style={styles.syncButton}
          onPress={syncHealthData}
          disabled={syncing}
        >
          <View style={styles.syncContent}>
            {syncing ? (
              <ActivityIndicator color={Colors.primary.purple} />
            ) : (
              <Ionicons name="sync" size={20} color={Colors.primary.purple} />
            )}
            <View style={styles.syncTextContainer}>
              <Text style={styles.syncText}>
                {syncing ? 'Syncing...' : `Sync ${healthService.getPlatformName()}`}
              </Text>
              {lastSync && !syncing && (
                <Text style={styles.syncSubtext}>
                  Last: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
              {healthData && !syncing && (
                <Text style={styles.syncSubtext}>
                  {healthData.steps.toLocaleString()} steps • {healthData.sleepHours}h sleep
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Check-in Button */}
        <TouchableOpacity
          style={[styles.checkInButton, checkedInToday && styles.checkInButtonDisabled]}
          onPress={handleQuickCheckIn}
          disabled={checkedInToday}
        >
          <LinearGradient
            colors={checkedInToday ? ['#D1D5DB', '#9CA3AF'] : [Colors.primary.pink, Colors.primary.rose]}
            style={styles.checkInGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name={checkedInToday ? 'checkmark-circle' : 'heart'} size={24} color="white" />
            <Text style={styles.checkInText}>
              {checkedInToday ? 'Checked In Today! ✓' : 'Quick Check-In'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {checkedInToday && (
          <Text style={styles.comeBackText}>Come back tomorrow to check in again! 💖</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function StatBar({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <View style={styles.statBar}>
      <View style={styles.statHeader}>
        <View style={styles.statLabel}>
          <Ionicons name={icon as any} size={16} color={color} />
          <Text style={styles.statLabelText}>{label}</Text>
        </View>
        <Text style={styles.statValue}>{value}%</Text>
      </View>
      <View style={styles.statBarTrack}>
        <View style={[styles.statBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
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
    paddingTop: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: FontSizes['3xl'],
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakText: {
    marginLeft: 4,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  petContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  petCircle: {
    width: Math.min(width * 0.4, 180),
    height: Math.min(width * 0.4, 180),
    borderRadius: Math.min(width * 0.4, 180) / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  happyGlow: {
    shadowColor: '#10B981',
    shadowOpacity: 0.35,
  },
  stressedGlow: {
    shadowColor: '#F59E0B',
    shadowOpacity: 0.35,
  },
  sickGlow: {
    shadowColor: '#EF4444',
    shadowOpacity: 0.35,
  },
  petMessage: {
    fontSize: FontSizes.lg,
    color: Colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  xpContainer: {
    marginBottom: Spacing.xl,
  },
  xpLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  xpBar: {
    height: 12,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpFill: {
    height: '100%',
    backgroundColor: Colors.primary.purple,
  },
  xpText: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    textAlign: 'right',
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statBar: {
    marginBottom: Spacing.lg,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabelText: {
    marginLeft: 8,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statValue: {
    fontSize: FontSizes.base,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  statBarTrack: {
    height: 12,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  warningText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  warningTitle: {
    fontSize: FontSizes.base,
    fontWeight: 'bold',
    color: '#92400E',
  },
  warningSubtitle: {
    fontSize: FontSizes.sm,
    color: '#92400E',
    marginTop: 2,
  },
  syncButton: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary.lavender,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  syncContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncTextContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  syncText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  syncSubtext: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
  },
  checkInButton: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  checkInButtonDisabled: {
    opacity: 0.7,
  },
  checkInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  checkInText: {
    color: 'white',
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
  },
  comeBackText: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  shieldButton: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderStyle: 'dashed',
    opacity: 0.8,
  },
  shieldButtonActive: {
    backgroundColor: Colors.primary.purple,
    borderColor: Colors.primary.purple,
  },
  shieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldTextContainer: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  shieldTitle: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  shieldTitleActive: {
    color: 'white',
  },
  shieldSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  shieldSubtitleActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  comingSoonBadge: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  comingSoonText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  shieldActiveGlow: {
    shadowColor: Colors.primary.purple,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    borderWidth: 4,
    borderColor: Colors.primary.purple,
  },
  yogaBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary.purple,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  yogaBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: FontSizes.sm,
  },
  messageContainer: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  yogaReadyPose: {
    transform: [{ scaleY: 0.9 }, { translateY: 10 }],
  },
  yogaDownwardDog: {
    transform: [{ rotate: '30deg' }, { translateY: 15 }, { scaleX: 1.1 }],
  },
  yogaPlank: {
    transform: [{ scaleY: 0.6 }, { translateY: 10 }, { scaleX: 1.3 }],
  },
  yogaBridge: {
    transform: [{ scaleY: 1.3 }, { translateY: -25 }, { rotate: '-5deg' }],
  },
  routineSection: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routineTimerInfo: {
    alignItems: 'flex-end',
  },
  estimatedTime: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  estimatedLabel: {
    fontSize: 10,
    color: Colors.text.muted,
    textTransform: 'uppercase',
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },
  routineItemCompleted: {
    opacity: 0.6,
  },
  itemIcon: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  itemName: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.text.muted,
  },
  checklistProgress: {
    height: 4,
    backgroundColor: Colors.neutral[100],
    borderRadius: 2,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  checklistProgressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  addItemBtnText: {
    fontSize: FontSizes.sm,
    color: Colors.primary.purple,
    fontWeight: '600',
  },
  itemDuration: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
  },
  playBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnActive: {
    backgroundColor: Colors.primary.purple,
  },
  routineFooter: {
    marginTop: Spacing.md,
    alignItems: 'flex-start',
  },
  rearrangeBtn: {
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.neutral[900],
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  rearrangeBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  iconInput: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    textAlign: 'center',
    fontSize: 24,
  },
  nameInput: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.text.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  modalAddBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary.purple,
    alignItems: 'center',
  },
  modalAddText: {
    fontSize: FontSizes.base,
    color: 'white',
    fontWeight: '600',
  },
});
