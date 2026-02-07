# Binaural Beat & Self-Hypnosis Integration for Guardian

**Analysis of uploaded repositories and integration recommendations**

---

## Repositories Analyzed

1. **binural_generator_with_read-main** - Simple HTML binaural generator with TTS
2. **hypno-main** - Next.js app with 3D models (not relevant)
3. **self-hypnosis-app-main** - Comprehensive therapeutic app with React + Flask

---

## Key Features We Can Use from Self-Hypnosis App

### 1. Light Frequency Therapy (Binaural Beats)

**Source**: `self-hypnosis-app-main/self-hypnosis-app/src/components/LightFrequencyTherapy.jsx`

**What It Does**:
- Generates therapeutic light frequencies using **WebGL shaders** (memory-efficient)
- Multiple brainwave patterns: Delta, Theta, Alpha, Beta, Gamma
- Solfeggio frequencies (396 Hz, 528 Hz, 741 Hz)
- Custom therapeutic frequencies (anxiety relief, confidence boost)

**Frequencies Available**:

| Pattern | Frequency | Purpose | Guardian Use Case |
|---------|-----------|---------|-------------------|
| **Delta** | 0.5-4 Hz | Deep sleep, healing | Menstrual phase rest |
| **Theta** | 4-8 Hz | Meditation, creativity | Hypnosis background, luteal introspection |
| **Alpha** | 8-12 Hz | Relaxation, flow state | Heart coherence breathing, follicular creativity |
| **Beta (Low)** | 12-15 Hz | Relaxed focus | Daily work, ovulation productivity |
| **Beta (Mid)** | 15-20 Hz | Active engagement | Follicular phase tasks |
| **Gamma** | 30-50 Hz | Higher cognition | Advanced users only |
| **Schumann** | 7.83 Hz | Earth's resonance | Grounding, all phases |
| **Solfeggio 396** | 396 Hz | Liberation from fear | Anxiety reset sessions |
| **Solfeggio 528** | 528 Hz | Love, DNA repair | Heart coherence, self-compassion |
| **Solfeggio 741** | 741 Hz | Awakening intuition | Ovulation phase, decision-making |

**Implementation**:
```javascript
// WebGL shader generates visual frequency pulsing
class LightFrequencyEngine {
  patterns = {
    alpha: { frequency: 10, color: [0.2, 0.6, 1.0], intensity: 0.7 },
    theta: { frequency: 6, color: [0.8, 0.2, 1.0], intensity: 0.6 },
    delta: { frequency: 2, color: [0.1, 0.3, 0.8], intensity: 0.5 },
    // ... more patterns
  }

  // Renders pulsing light at specific frequency
  render() {
    // WebGL shader creates wave at exact Hz
    const wave = sin(time * frequency * 6.28318);
    // Radial gradient for visual comfort
    const brightness = wave * radialGradient * intensity;
    gl_FragColor = vec4(color * brightness, 1.0);
  }
}
```

**How to Integrate into Guardian**:

1. **During Breathwork**:
   - Box breathing → Alpha frequency (10 Hz) background
   - 4-7-8 sleep → Delta frequency (2 Hz) pulsing
   - Heart coherence → Schumann resonance (7.83 Hz)
   - Bilateral EMDR → Theta frequency (6 Hz) for deeper processing

2. **During Hypnosis**:
   - Theta (4-8 Hz) background during all hypnosis sessions
   - User can toggle binaural beats on/off in settings
   - Visual light pulsing in background (optional, can disable)

3. **Cycle-Phase Auto-Selection**:
   ```javascript
   if (cyclePhase === 'menstrual') {
     suggestFrequency('delta'); // Deep rest
   } else if (cyclePhase === 'luteal') {
     suggestFrequency('alpha'); // Calm introspection
   } else if (cyclePhase === 'follicular') {
     suggestFrequency('beta_low'); // Focused creativity
   } else if (cyclePhase === 'ovulation') {
     suggestFrequency('solfeggio_741'); // Intuition peak
   }
   ```

**Code to Extract**:
- `/utils/lightFrequencyEngine.js` - WebGL frequency generator (entire file)
- `/components/LightFrequencyTherapy.jsx` - React component (lines 1-300)

---

### 2. Polyvagal Theory Exercises

**Source**: `self-hypnosis-app-main/self-hypnosis-app/src/components/PolyvagalExercises.jsx`

**What It Does**:
- Nervous system state tracking (Ventral Vagal, Sympathetic, Dorsal Vagal)
- Guided exercises to shift between states
- Vagal toning (humming, vocal vibrations)
- Orienting exercises (environmental scanning for safety)
- Social connection visualization

**Nervous System States** (Porges' Polyvagal Theory):

1. **Ventral Vagal** (Safe & Social) ✅
   - Calm, connected, curious, compassionate
   - **Guardian State**: Bright & Observing, Nearby & Alert
   - **Cycle**: All phases when regulated

2. **Sympathetic** (Fight/Flight) ⚠️
   - Alert, energized, anxious, reactive
   - **Guardian State**: Close & Quiet (responding to storm)
   - **Cycle**: Ovulation (can harness), PMS (manage)

3. **Dorsal Vagal** (Freeze/Shutdown) 🔻
   - Withdrawn, numb, disconnected, exhausted
   - **Guardian State**: Distant & Resting
   - **Cycle**: Menstrual phase (rest is OK here)

**Exercises Available**:

| Exercise | Duration | Purpose | Guardian Integration |
|----------|----------|---------|---------------------|
| **Vagal Toning** | 8 min | Humming to stimulate vagus nerve | Add to breathwork screen as 5th pattern |
| **Orienting** | 6 min | Slow environmental scan for safety | Anxiety reset quick tool |
| **Social Connection** | 10 min | Visualize safe relationships | Hypnosis script for loneliness |
| **Bilateral Stimulation** | 5 min | Left-right sensations | Already in our breathwork! |
| **Self-Compassion** | 12 min | Body-based self-soothing | Luteal/menstrual phase script |

**How to Integrate**:

1. **Map Guardian States to Polyvagal States**:
   ```javascript
   function getGuardianStateFromPolyvagal(polyvagalState, atmosphere, cyclePhase) {
     if (polyvagalState === 'VENTRAL_VAGAL' && atmosphere === 'sunny') {
       return 'bright_observing'; // Default, regulated
     } else if (polyvagalState === 'SYMPATHETIC' && atmosphere === 'storm') {
       return 'close_quiet'; // Guardian moves close to soothe
     } else if (polyvagalState === 'DORSAL_VAGAL' && cyclePhase === 'menstrual') {
       return 'distant_resting'; // Permission to shut down
     }
     // ... more mappings
   }
   ```

2. **Add Vagal Toning to Breathwork**:
   - 5th breathwork pattern: "Vagal Toning (Humming)"
   - Instructions: "Make a long 'Mmmmm' sound on exhale"
   - Frequency: 5-second inhale, 10-second hum exhale
   - Benefits: Directly stimulates vagus nerve (calms faster than breathing alone)

3. **Use Orienting Exercise for Anxiety Interrupts**:
   - When user selects "⛈️ Storm" atmosphere
   - Guardian suggests: "Would you like a 90-second orienting exercise?"
   - Guides user through 5-4-3-2-1 senses grounding

**Code to Extract**:
- `/components/PolyvagalExercises.jsx` - Exercise library (entire file)
- `/types.js` - NERVOUS_SYSTEM_STATES enum

---

### 3. Enhanced Sleep/Wake Modes

**Source**:
- `self-hypnosis-app-main/self-hypnosis-app/src/components/EnhancedSleepMode.jsx`
- `self-hypnosis-app-main/self-hypnosis-app/src/components/EnhancedWakeMode.jsx`

**Sleep Mode Features**:
- Delta wave (0.5-4 Hz) binaural beats
- Progressive muscle relaxation script
- Subliminal affirmations during sleep
- Sleep quality tracking
- Circadian rhythm optimization

**Wake Mode Features**:
- Beta wave (15-20 Hz) stimulation
- Morning affirmations
- Energy-boosting visualizations
- Goal-setting prompts

**Guardian Integration**:

1. **Sleep Mode** (for Luteal/Menstrual phases):
   - Triggered at 9 PM if user logged "storm" or "cloudy" today
   - Offers: "Your luteal phase needs rest. Try 10-min sleep induction?"
   - Script: Delta wave + 4-7-8 breathing + body scan
   - Tracks: Did user fall asleep? Sleep quality 1-10?

2. **Wake Mode** (for Follicular/Ovulation phases):
   - Triggered at 7 AM if user in follicular phase
   - Offers: "Your energy is high today. Morning activation?"
   - Script: Beta wave + box breathing + visualization
   - Tracks: Morning energy level, ready for day?

**Code to Extract**:
- `/components/EnhancedSleepMode.jsx` (lines 1-200, sleep scripts)
- `/components/EnhancedWakeMode.jsx` (lines 1-150, wake scripts)

---

### 4. Dopamine Chart (Gamification)

**Source**: `self-hypnosis-app-main/self-hypnosis-app/src/components/DopamineChart.jsx`

**What It Does**:
- Achievement tracking dashboard
- Goal management with progress bars
- Points system for completed goals
- Streak tracking
- Motivation trend visualization (weekly chart)

**Why Guardian Doesn't Need This**:
- We already have **Thread/Knitting** metaphor (better than points)
- Habit streak is already visualized
- Adding points would make it feel "gamified" (against Guardian philosophy)

**What We CAN Use**:
- **Motivation Trend Chart**: Show weekly atmosphere (sunny vs cloudy vs storm)
- **Streak Visualization**: Already using stitches, but could add "Don't break the chain" emphasis
- **Goal Progress Bars**: Could add for long-term identity shift ("80% toward 'someone who moves daily'")

**Integration Idea**:
- Instead of "Dopamine Chart", call it **"Rhythm Report"**
- Shows:
  - Atmosphere trends (more sunny days = upward trend)
  - Habit consistency (stitches completed)
  - Cycle alignment (are you resting during menstrual? moving during follicular?)
  - NOT points/badges (too extrinsic)

---

### 5. Audio Engine (Subliminal Affirmations)

**Source**: `self-hypnosis-app-main/self-hypnosis-app/src/utils/audioEngine.js` (not read yet, but referenced)

**Expected Features**:
- Text-to-speech affirmations
- Subliminal layering (affirmations under binaural beats)
- Volume balancing
- Loop control

**Guardian Use Case**:
- During hypnosis: Layer user's recorded voice OVER binaural beat background
- During sleep: Subliminal affirmations (very low volume) with delta waves
- During breathwork: Optional affirmations on exhale ("I am safe", "I am grounded")

**Integration**:
```javascript
class GuardianAudioEngine {
  layers = {
    binauralBeat: new Audio(), // Theta frequency
    userVoice: new Audio(),     // Recorded hypnosis script
    affirmations: new Audio()   // Subliminal layer
  };

  playHypnosisSession(scriptId, binauralFrequency) {
    // Layer 1: Binaural beat (20% volume, background)
    this.layers.binauralBeat.volume = 0.2;
    this.layers.binauralBeat.play();

    // Layer 2: User's voice (80% volume, foreground)
    this.layers.userVoice.volume = 0.8;
    this.layers.userVoice.play();

    // Layer 3: Subliminal affirmations (5% volume, barely audible)
    if (userSettings.subliminalEnabled) {
      this.layers.affirmations.volume = 0.05;
      this.layers.affirmations.play();
    }
  }
}
```

---

## Technical Implementation Recommendations

### Architecture: Modular Layers

```
Guardian App
├── Core Features (already designed)
│   ├── Main Screen (cycle tracking, habit)
│   ├── Hypnosis Screen (TTS + user voice)
│   ├── Breathwork Screen (4 patterns + arrows)
│   ├── Progress Screen (knitting grid)
│   └── Settings Screen
│
├── NEW: Audio Layer (from self-hypnosis-app)
│   ├── LightFrequencyEngine.js (WebGL binaural beats)
│   ├── AudioMixer.js (layer voice + beats + affirmations)
│   └── FrequencyPatterns.js (all Hz presets)
│
├── NEW: Polyvagal Layer
│   ├── NervousSystemTracker.js (detect state)
│   ├── PolyvagalExercises.js (vagal toning, orienting)
│   └── StateMapper.js (map to Guardian states)
│
└── NEW: Enhanced Modes
    ├── SleepMode.js (delta waves + 4-7-8 + PMR)
    └── WakeMode.js (beta waves + morning activation)
```

### Step-by-Step Integration Plan

**Phase 1: Extract Core Utils (1-2 days)**
1. Copy `lightFrequencyEngine.js` → `/guardian-app/src/utils/`
2. Test WebGL shader rendering in isolation
3. Create React hook: `useBinauralBeats(frequency, intensity)`
4. Add to Settings: "Binaural Beats" toggle (default: ON)

**Phase 2: Integrate into Breathwork (1 day)**
1. Update `05-breathwork-screen.html` to use `useBinauralBeats()`
2. Map breathing patterns to frequencies:
   - Box → Alpha (10 Hz)
   - 4-7-8 → Delta (2 Hz)
   - Coherence → Schumann (7.83 Hz)
   - Bilateral → Theta (6 Hz)
3. Add visual frequency pulsing in background (subtle)

**Phase 3: Integrate into Hypnosis (2 days)**
1. Update `02-hypnosis-screen.html` to layer audio:
   - User voice recording (80% volume)
   - Theta binaural beat (20% volume)
   - Optional: Subliminal affirmations (5% volume)
2. Add "Background Frequency" dropdown in settings
3. Test with headphones (required for binaural effect)

**Phase 4: Add Polyvagal Tracking (2 days)**
1. Copy `PolyvagalExercises.jsx` → `/guardian-app/src/components/`
2. Add nervous system state to user profile
3. Map Guardian states to Polyvagal states
4. Add "Vagal Toning" as 5th breathwork pattern
5. Add "Orienting Exercise" to anxiety interrupt flow

**Phase 5: Sleep/Wake Modes (2-3 days)**
1. Copy `EnhancedSleepMode.jsx` and `EnhancedWakeMode.jsx`
2. Create new screen: "06-sleep-mode.html"
3. Trigger at 9 PM (luteal/menstrual) and 7 AM (follicular)
4. Track sleep quality and morning energy

**Total Estimated Time**: 8-10 days

---

## Files to Extract from self-hypnosis-app

### High Priority (Must Have)

```
src/utils/
├── lightFrequencyEngine.js          # WebGL binaural beat generator
└── audioEngine.js                   # Audio layering/mixing

src/components/
├── LightFrequencyTherapy.jsx        # React component (lines 1-300)
├── PolyvagalExercises.jsx           # Vagal toning, orienting (entire file)
└── EnhancedSleepMode.jsx            # Sleep scripts (lines 1-200)

src/types.js                         # NERVOUS_SYSTEM_STATES enum
```

### Medium Priority (Nice to Have)

```
src/components/
├── EnhancedWakeMode.jsx             # Morning activation
└── SomaticExperiencing.jsx          # Body-based trauma release

src/hooks/
└── useAudioPlayback.js              # Custom audio hook
```

### Low Priority (Optional)

```
src/components/
├── DopamineChart.jsx                # For "Rhythm Report" adaptation
└── IFSJournaling.jsx                # Internal Family Systems journaling
```

---

## Cycle-Phase Integration

**Auto-Suggest Frequencies Based on Cycle**:

| Phase | Days | Frequencies | Purpose |
|-------|------|-------------|---------|
| **Menstrual** | 1-5 | Delta (2 Hz), Alpha (10 Hz) | Deep rest, self-compassion |
| **Follicular** | 6-13 | Beta Low (12 Hz), Schumann (7.83 Hz) | Focused creativity, grounding |
| **Ovulation** | 14 | Solfeggio 741 Hz, Beta Mid (18 Hz) | Intuition peak, communication |
| **Luteal** | 15-28 | Alpha (10 Hz), Theta (6 Hz) | Introspection, calm |

**Implementation**:
```javascript
function getRecommendedFrequency(cycleDay) {
  if (cycleDay <= 5) return 'delta'; // Menstrual
  if (cycleDay <= 13) return 'beta_low'; // Follicular
  if (cycleDay === 14) return 'solfeggio_741'; // Ovulation
  if (cycleDay <= 28) return 'alpha'; // Luteal
}
```

---

## Safety & User Education

**Important Notes to Add to Settings**:

1. **Headphones Required**:
   - "⚠️ Binaural beats only work with stereo headphones. Built-in speakers won't create the effect."

2. **Photosensitivity Warning** (for light frequency therapy):
   - "⚠️ If you have epilepsy or photosensitivity, disable visual light pulsing in Settings."

3. **Volume Recommendations**:
   - "🔊 Keep binaural beat volume low (20-30%). It's background ambiance, not primary audio."

4. **Frequency Selection**:
   - "✅ Guardian auto-selects frequencies based on your cycle phase. You can override in Advanced Settings."

5. **Scientific Disclaimer**:
   - "📊 Binaural beat effectiveness varies between individuals. Research is ongoing. Use as complementary tool, not medical treatment."

---

## Summary: What to Build

### Immediate Wins (Phase 1-2):
1. ✅ Extract `lightFrequencyEngine.js`
2. ✅ Add binaural beats to breathwork (background audio)
3. ✅ Add toggle in Settings
4. ✅ Test with headphones

### Medium-Term (Phase 3-4):
5. ✅ Layer binaural beats into hypnosis sessions
6. ✅ Add Polyvagal state tracking
7. ✅ Map Guardian states to nervous system states
8. ✅ Add Vagal Toning breathwork pattern

### Long-Term (Phase 5+):
9. ✅ Sleep/Wake modes
10. ✅ Subliminal affirmation layer (optional)
11. ✅ Rhythm Report (weekly atmosphere trends)

---

## Next Steps

1. **Review this document** - Does this integration align with Guardian's vision?
2. **Prioritize features** - Which phases do you want to tackle first?
3. **Test binaural generator** - I can extract the engine and create a standalone test
4. **Update design mockups** - Add binaural beat toggle to settings screen

Want me to start extracting the audio engine code and creating a working prototype?
