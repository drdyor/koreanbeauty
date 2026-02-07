// Pet State Calculation Engine
import type { HealthData, PetState, PetMood, UserProfile } from '../types';
import { HEALTH_TARGETS } from '../constants';

export function calculatePetState(
  health: HealthData,
  currentPet: PetState,
  userProfile?: UserProfile
): PetState {
  let petState = { ...currentPet };

  // Reset daily modifiers
  petState.energy = 50;
  petState.skinClarity = 70;
  petState.breakoutRisk = 30;
  petState.happiness = 50;
  petState.darkCircles = false;

  // ========== STEPS IMPACT ==========
  if (health.steps >= HEALTH_TARGETS.steps.excellent) {
    petState.energy += 30;
    petState.happiness += 20;
    petState.mood = 'happy';
  } else if (health.steps >= HEALTH_TARGETS.steps.good) {
    petState.energy += 15;
    petState.happiness += 10;
  } else if (health.steps < HEALTH_TARGETS.steps.fair) {
    petState.energy -= 20;
    petState.happiness -= 10;
    petState.mood = 'sluggish';
  }

  // ========== SLEEP IMPACT ==========
  const optimalSleep = HEALTH_TARGETS.sleep.optimal;

  if (health.sleepHours >= optimalSleep.min && health.sleepHours <= optimalSleep.max) {
    // Optimal sleep: HUGE skin benefits
    petState.skinClarity += 25;
    petState.breakoutRisk -= 30;
    petState.energy += 20;
    petState.happiness += 15;

    if (petState.mood !== 'happy') {
      petState.mood = 'glowing';
    }
  } else if (health.sleepHours < 6) {
    // Poor sleep: Major skin damage
    petState.skinClarity -= 30;
    petState.breakoutRisk += 50;
    petState.energy -= 25;
    petState.happiness -= 20;
    petState.darkCircles = true;
    petState.mood = 'sluggish';
  } else if (health.sleepHours > 10) {
    // Oversleeping: moderate negative
    petState.energy -= 10;
    petState.skinClarity -= 10;
  }

  // ========== WATER INTAKE ==========
  if (health.waterIntake >= HEALTH_TARGETS.water.target) {
    petState.skinClarity += 15;
    petState.breakoutRisk -= 15;
    petState.happiness += 10;
  } else if (health.waterIntake < 4) {
    petState.skinClarity -= 20;
    petState.breakoutRisk += 20;
  }

  // ========== HRV (STRESS) IMPACT ==========
  if (health.hrv !== undefined) {
    if (health.hrv >= HEALTH_TARGETS.hrv.good) {
      // Low stress = good skin
      petState.skinClarity += 10;
      petState.breakoutRisk -= 15;
      petState.happiness += 15;
    } else if (health.hrv < HEALTH_TARGETS.hrv.fair) {
      // High stress = breakouts incoming
      petState.breakoutRisk += 40;
      petState.skinClarity -= 15;
      petState.mood = 'stressed';
      petState.happiness -= 15;
    }
  }

  // ========== HORMONAL PHASE (if cycle tracking enabled) ==========
  if (userProfile?.cycleDay) {
    const cycleDay = userProfile.cycleDay;

    // Ovulation phase (Day 12-16): Skin glows
    if (cycleDay >= 12 && cycleDay <= 16) {
      petState.skinClarity += 15;
      petState.breakoutRisk -= 20;
      petState.happiness += 10;
    }

    // Pre-menstrual phase (Day 19-28): Breakout window
    if (cycleDay >= 19 && cycleDay <= 28) {
      petState.breakoutRisk += 50;
      petState.skinClarity -= 20;
      petState.mood = 'stressed';
    }

    // Menstrual phase (Day 1-5): Fatigue
    if (cycleDay >= 1 && cycleDay <= 5) {
      petState.energy -= 20;
      petState.happiness -= 10;
    }
  }

  // ========== CLAMP VALUES ==========
  petState.energy = Math.max(0, Math.min(100, petState.energy));
  petState.skinClarity = Math.max(0, Math.min(100, petState.skinClarity));
  petState.breakoutRisk = Math.max(0, Math.min(100, petState.breakoutRisk));
  petState.happiness = Math.max(0, Math.min(100, petState.happiness));

  // ========== DETERMINE FINAL MOOD ==========
  if (!petState.mood || petState.mood === 'neutral') {
    if (petState.happiness >= 70 && petState.energy >= 60) {
      petState.mood = 'glowing';
    } else if (petState.happiness >= 50 && petState.energy >= 50) {
      petState.mood = 'happy';
    } else if (petState.energy < 30) {
      petState.mood = 'sluggish';
    } else if (petState.breakoutRisk >= 70) {
      petState.mood = 'stressed';
    } else {
      petState.mood = 'neutral';
    }
  }

  return petState;
}

export function getPetMessage(pet: PetState): string {
  const { mood, energy, skinClarity, breakoutRisk, darkCircles, shieldActive } = pet;

  if (shieldActive) {
    return "The Shield is active. I'm guarding your attention from the noise. Deep breaths... stay here with me.";
  }

  if (darkCircles) {
    return "I'm tired... 😴 You needed more sleep! Let's rest well tonight.";
  }

  if (breakoutRisk >= 80) {
    return "I sense a storm coming... 🌧️ High breakout risk detected!";
  }

  if (skinClarity >= 85 && energy >= 70) {
    return "We're GLOWING today! ✨✨✨ Keep this up!";
  }

  switch (mood) {
    case 'glowing':
      return "You're radiating today! ✨ This is what optimal health looks like!";
    case 'happy':
      return "Feeling good! 😊 Your healthy choices are showing!";
    case 'sluggish':
      return "I'm feeling a bit stiff... let's do some poses!";
    case 'stressed':
      return "I'm feeling tense... 😰 Let's breathe and hydrate!";
    case 'foggy':
      return "Things feel a bit misty... let's simplify our intentions today. ☁️";
    case 'overwhelmed':
      return "The rain is heavy today. I'm right here with you. 🌧️";
    case 'blocked':
      return "Precision feels grounding today. Let's find a small win. 🐟";
    case 'low-battery':
      return "Your energy is offline. Nothing is wrong. Rest is the work. 😴";
    case 'hidden':
      return "It's okay to be unseen today. Safety is the priority. 🐚";
    case 'spark':
      return "Follow curiosity, not outcomes! What's one tiny interesting thing? ✨";
    case 'clingy':
      return "Connection matters more than independence today. I'm close. 🧲";
    case 'order':
      return "Everything in its place. Precision is your power today. 🧼";
    case 'sick':
      return "Not feeling great... 🤢 Take it easy today!";
    default:
      return "How are we feeling today? Let's check in! 💖";
  }
}

export function calculateExperienceGain(health: HealthData, streak: number): number {
  let xp = 20; // Base XP for checking in

  // Bonus XP for hitting targets
  if (health.steps >= HEALTH_TARGETS.steps.excellent) xp += 15;
  if (health.sleepHours >= 7 && health.sleepHours <= 9) xp += 20;
  if (health.waterIntake >= HEALTH_TARGETS.water.target) xp += 10;

  // Streak multiplier
  if (streak >= 7) xp *= 1.5;
  if (streak >= 30) xp *= 2;

  return Math.floor(xp);
}

export function shouldLevelUp(currentLevel: number, currentXP: number): boolean {
  const xpNeeded = currentLevel * 100;
  return currentXP >= xpNeeded;
}

export function levelUp(pet: PetState): PetState {
  return {
    ...pet,
    level: pet.level + 1,
    experience: pet.experience - (pet.level * 100),
    happiness: Math.min(100, pet.happiness + 10),
  };
}
