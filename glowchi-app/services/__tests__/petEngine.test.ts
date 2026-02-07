import {
  calculatePetState,
  getPetMessage,
  calculateExperienceGain,
  shouldLevelUp,
  levelUp,
} from '../petEngine';
import type { HealthData, PetState } from '../../types';
import { HEALTH_TARGETS } from '../../constants';

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

describe('calculatePetState', () => {
  it('should set mood to sluggish with less than 6 hours sleep', () => {
    const healthData: HealthData = {
      steps: 5000,
      sleepHours: 5,
      waterIntake: 4,
    };

    const result = calculatePetState(healthData, DEFAULT_PET);

    expect(result.mood).toBe('sluggish');
    expect(result.breakoutRisk).toBeGreaterThan(60);
    expect(result.darkCircles).toBe(true);
  });

  it('should set mood to glowing with optimal health', () => {
    const healthData: HealthData = {
      steps: 10000,
      sleepHours: 8,
      waterIntake: 8,
    };

    const result = calculatePetState(healthData, DEFAULT_PET);

    expect(result.mood).toBe('glowing');
    expect(result.energy).toBeGreaterThan(70);
    expect(result.skinClarity).toBeGreaterThan(80);
    expect(result.breakoutRisk).toBeLessThan(30);
  });

  it('should increase energy with high step count', () => {
    const lowSteps: HealthData = {
      steps: 2000,
      sleepHours: 7,
      waterIntake: 6,
    };

    const highSteps: HealthData = {
      steps: 12000,
      sleepHours: 7,
      waterIntake: 6,
    };

    const lowResult = calculatePetState(lowSteps, DEFAULT_PET);
    const highResult = calculatePetState(highSteps, DEFAULT_PET);

    expect(highResult.energy).toBeGreaterThan(lowResult.energy);
  });

  it('should improve skin clarity with good water intake', () => {
    const lowWater: HealthData = {
      steps: 7000,
      sleepHours: 7,
      waterIntake: 2,
    };

    const highWater: HealthData = {
      steps: 7000,
      sleepHours: 7,
      waterIntake: 8,
    };

    const lowResult = calculatePetState(lowWater, DEFAULT_PET);
    const highResult = calculatePetState(highWater, DEFAULT_PET);

    expect(highResult.skinClarity).toBeGreaterThan(lowResult.skinClarity);
    expect(highResult.breakoutRisk).toBeLessThan(lowResult.breakoutRisk);
  });

  it('should increase breakout risk with poor sleep', () => {
    const goodSleep: HealthData = {
      steps: 7000,
      sleepHours: 8,
      waterIntake: 6,
    };

    const poorSleep: HealthData = {
      steps: 7000,
      sleepHours: 4,
      waterIntake: 6,
    };

    const goodResult = calculatePetState(goodSleep, DEFAULT_PET);
    const poorResult = calculatePetState(poorSleep, DEFAULT_PET);

    expect(poorResult.breakoutRisk).toBeGreaterThan(goodResult.breakoutRisk);
    expect(poorResult.skinClarity).toBeLessThan(goodResult.skinClarity);
  });

  it('should handle high stress (low HRV)', () => {
    const highStress: HealthData = {
      steps: 7000,
      sleepHours: 7,
      waterIntake: 6,
      hrv: 25, // Low HRV = high stress
    };

    const result = calculatePetState(highStress, DEFAULT_PET);

    expect(result.breakoutRisk).toBeGreaterThan(50);
    expect(result.mood).toBe('stressed');
  });

  it('should clamp values between 0 and 100', () => {
    const extremeHealth: HealthData = {
      steps: 50000, // Unrealistic
      sleepHours: 2, // Very low
      waterIntake: 0,
    };

    const result = calculatePetState(extremeHealth, DEFAULT_PET);

    expect(result.energy).toBeGreaterThanOrEqual(0);
    expect(result.energy).toBeLessThanOrEqual(100);
    expect(result.skinClarity).toBeGreaterThanOrEqual(0);
    expect(result.skinClarity).toBeLessThanOrEqual(100);
    expect(result.breakoutRisk).toBeGreaterThanOrEqual(0);
    expect(result.breakoutRisk).toBeLessThanOrEqual(100);
    expect(result.happiness).toBeGreaterThanOrEqual(0);
    expect(result.happiness).toBeLessThanOrEqual(100);
  });
});

describe('getPetMessage', () => {
  it('should return dark circles message when tired', () => {
    const pet: PetState = {
      ...DEFAULT_PET,
      darkCircles: true,
      mood: 'sluggish',
    };

    const message = getPetMessage(pet);

    expect(message).toContain('tired');
    expect(message).toContain('sleep');
  });

  it('should return glowing message for high performance', () => {
    const pet: PetState = {
      ...DEFAULT_PET,
      mood: 'glowing',
      energy: 90,
      skinClarity: 90,
    };

    const message = getPetMessage(pet);

    expect(message).toContain('GLOWING');
  });

  it('should warn about high breakout risk', () => {
    const pet: PetState = {
      ...DEFAULT_PET,
      breakoutRisk: 85,
    };

    const message = getPetMessage(pet);

    expect(message).toContain('storm');
    expect(message).toContain('breakout risk');
  });
});

describe('calculateExperienceGain', () => {
  it('should give base XP for checking in', () => {
    const health: HealthData = {
      steps: 0,
      sleepHours: 0,
      waterIntake: 0,
    };

    const xp = calculateExperienceGain(health, 0);

    expect(xp).toBeGreaterThanOrEqual(20); // Base XP
  });

  it('should give bonus XP for hitting targets', () => {
    const lowHealth: HealthData = {
      steps: 2000,
      sleepHours: 5,
      waterIntake: 2,
    };

    const highHealth: HealthData = {
      steps: 10000,
      sleepHours: 8,
      waterIntake: 8,
    };

    const lowXP = calculateExperienceGain(lowHealth, 0);
    const highXP = calculateExperienceGain(highHealth, 0);

    expect(highXP).toBeGreaterThan(lowXP);
  });

  it('should apply streak multiplier for 7+ day streaks', () => {
    const health: HealthData = {
      steps: 10000,
      sleepHours: 8,
      waterIntake: 8,
    };

    const noStreakXP = calculateExperienceGain(health, 0);
    const weekStreakXP = calculateExperienceGain(health, 7);
    const monthStreakXP = calculateExperienceGain(health, 30);

    expect(weekStreakXP).toBeGreaterThan(noStreakXP);
    expect(monthStreakXP).toBeGreaterThan(weekStreakXP);
  });
});

describe('shouldLevelUp', () => {
  it('should return true when XP exceeds requirement', () => {
    const level = 1;
    const xp = 150; // Need 100 for level 2

    expect(shouldLevelUp(level, xp)).toBe(true);
  });

  it('should return false when XP is below requirement', () => {
    const level = 1;
    const xp = 50; // Need 100

    expect(shouldLevelUp(level, xp)).toBe(false);
  });

  it('should scale XP requirement with level', () => {
    expect(shouldLevelUp(1, 99)).toBe(false);
    expect(shouldLevelUp(1, 100)).toBe(true);

    expect(shouldLevelUp(2, 199)).toBe(false);
    expect(shouldLevelUp(2, 200)).toBe(true);
  });
});

describe('levelUp', () => {
  it('should increase level by 1', () => {
    const pet: PetState = {
      ...DEFAULT_PET,
      level: 1,
      experience: 150,
    };

    const result = levelUp(pet);

    expect(result.level).toBe(2);
  });

  it('should carry over excess XP', () => {
    const pet: PetState = {
      ...DEFAULT_PET,
      level: 1,
      experience: 130, // 30 XP over requirement
    };

    const result = levelUp(pet);

    expect(result.experience).toBe(30);
  });

  it('should increase happiness on level up', () => {
    const pet: PetState = {
      ...DEFAULT_PET,
      happiness: 50,
    };

    const result = levelUp(pet);

    expect(result.happiness).toBeGreaterThan(pet.happiness);
    expect(result.happiness).toBeLessThanOrEqual(100); // Shouldn't exceed max
  });
});
