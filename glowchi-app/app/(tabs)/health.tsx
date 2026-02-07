import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius, FontSizes, FOOD_CATEGORIES, HEALTH_TARGETS } from '../../constants';
import type { HealthData, FoodLog } from '../../types';

export default function HealthScreen() {
  const [healthData, setHealthData] = useState<HealthData>({
    steps: 0,
    sleepHours: 7,
    waterIntake: 0,
  });

  const [foodLog, setFoodLog] = useState<FoodLog['categories']>({
    dairy: false,
    sugar: false,
    fried: false,
    alcohol: false,
    caffeine: false,
    vegetables: false,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadTodayData();
  }, []);

  async function loadTodayData() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const healthKey = `health:${today}`;
      const foodKey = `food:${today}`;

      const healthStr = await AsyncStorage.getItem(healthKey);
      const foodStr = await AsyncStorage.getItem(foodKey);

      if (healthStr) {
        try {
          setHealthData(JSON.parse(healthStr));
        } catch (parseError) {
          console.error('[Health] Invalid health data:', parseError);
        }
      }

      if (foodStr) {
        try {
          setFoodLog(JSON.parse(foodStr));
        } catch (parseError) {
          console.error('[Health] Invalid food log:', parseError);
        }
      }
    } catch (error) {
      console.error('[Health] Failed to load health data:', error);
    }
  }

  async function saveHealthData() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const healthKey = `health:${today}`;
      const foodKey = `food:${today}`;

      await AsyncStorage.setItem(healthKey, JSON.stringify(healthData));
      await AsyncStorage.setItem(foodKey, JSON.stringify(foodLog));

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save health data:', error);
    }
  }

  function toggleFood(category: keyof typeof foodLog) {
    setFoodLog({ ...foodLog, [category]: !foodLog[category] });
  }

  const stepsTarget = HEALTH_TARGETS.steps.excellent;
  const stepsProgress = Math.min(100, (healthData.steps / stepsTarget) * 100);

  const waterProgress = Math.min(100, (healthData.waterIntake / HEALTH_TARGETS.water.target) * 100);

  return (
    <LinearGradient colors={[...Colors.background.gradient]} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Health Dashboard</Text>
          <Text style={styles.subtitle}>Track your daily wellness</Text>
        </View>

        {/* Steps Input */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconLabel}>
              <Ionicons name="walk" size={24} color={Colors.primary.pink} />
              <Text style={styles.cardTitle}>Steps</Text>
            </View>
            <Text style={styles.targetText}>Goal: {stepsTarget.toLocaleString()}</Text>
          </View>

          <TextInput
            style={styles.input}
            value={healthData.steps.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 0;
              // Bound between 0 and 100,000 steps (reasonable max)
              const bounded = Math.max(0, Math.min(100000, num));
              setHealthData({ ...healthData, steps: bounded });
            }}
            keyboardType="number-pad"
            placeholder="Enter steps"
            placeholderTextColor={Colors.neutral[400]}
            maxLength={6}
          />

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${stepsProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{stepsProgress.toFixed(0)}% of goal</Text>
        </View>

        {/* Sleep Input */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconLabel}>
              <Ionicons name="moon" size={24} color={Colors.primary.purple} />
              <Text style={styles.cardTitle}>Sleep</Text>
            </View>
            <Text style={styles.targetText}>Optimal: 7-9 hours</Text>
          </View>

          <View style={styles.sleepPicker}>
            {[5, 6, 7, 8, 9, 10].map((hours) => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.sleepOption,
                  healthData.sleepHours === hours && styles.sleepOptionActive,
                ]}
                onPress={() => setHealthData({ ...healthData, sleepHours: hours })}
              >
                <Text
                  style={[
                    styles.sleepOptionText,
                    healthData.sleepHours === hours && styles.sleepOptionTextActive,
                  ]}
                >
                  {hours}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {healthData.sleepHours < 6 && (
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={16} color={Colors.warning} />
              <Text style={styles.warningText}>Low sleep may increase breakout risk</Text>
            </View>
          )}
        </View>

        {/* Water Input */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconLabel}>
              <Ionicons name="water" size={24} color="#06B6D4" />
              <Text style={styles.cardTitle}>Water Intake</Text>
            </View>
            <Text style={styles.targetText}>Goal: 8 glasses</Text>
          </View>

          <View style={styles.waterGlasses}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
              <TouchableOpacity
                key={glass}
                onPress={() => setHealthData({ ...healthData, waterIntake: glass })}
              >
                <Ionicons
                  name={glass <= healthData.waterIntake ? 'water' : 'water-outline'}
                  size={32}
                  color={glass <= healthData.waterIntake ? '#06B6D4' : Colors.neutral[300]}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${waterProgress}%`, backgroundColor: '#06B6D4' },
              ]}
            />
          </View>
        </View>

        {/* Food Log */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconLabel}>
              <Ionicons name="restaurant" size={24} color={Colors.primary.rose} />
              <Text style={styles.cardTitle}>What I Ate Today</Text>
            </View>
          </View>

          <Text style={styles.foodSubtitle}>
            Tap what you consumed today to track skin correlations
          </Text>

          <View style={styles.foodGrid}>
            {FOOD_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.foodButton,
                  foodLog[category.id as keyof typeof foodLog] && styles.foodButtonActive,
                ]}
                onPress={() => toggleFood(category.id as keyof typeof foodLog)}
              >
                <Text style={styles.foodEmoji}>{category.emoji}</Text>
                <Text style={styles.foodLabel}>{category.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={saveHealthData}>
          <LinearGradient
            colors={[Colors.primary.pink, Colors.primary.rose]}
            style={styles.saveGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name={saved ? 'checkmark-circle' : 'save'} size={24} color="white" />
            <Text style={styles.saveText}>{saved ? 'Saved! ✓' : 'Save Health Data'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          💡 Your pet will update based on this data on your next check-in!
        </Text>
      </ScrollView>
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
  card: {
    backgroundColor: 'white',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },
  targetText: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
  },
  input: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.pink,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginTop: 4,
    textAlign: 'right',
  },
  sleepPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sleepOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
  },
  sleepOptionActive: {
    backgroundColor: Colors.primary.purple,
  },
  sleepOptionText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  sleepOptionTextActive: {
    color: 'white',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  warningText: {
    fontSize: FontSizes.xs,
    color: '#92400E',
    marginLeft: 6,
  },
  waterGlasses: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  foodSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  foodButtonActive: {
    backgroundColor: Colors.background.soft,
    borderColor: Colors.primary.pink,
  },
  foodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  foodLabel: {
    fontSize: FontSizes.xs,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  saveText: {
    color: 'white',
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
  },
  helpText: {
    textAlign: 'center',
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
});
