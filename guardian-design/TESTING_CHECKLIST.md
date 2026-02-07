# Guardian App - Testing Checklist
**Date**: January 3, 2026
**Goal**: Find and fix all bugs before sharing with friends

---

## 🎧 HOUR 1 RESULTS: Audio Generation ✅

**Status**: COMPLETE
**Time**: 32 minutes
**Cost**: $0

**Generated Files**:
- ✅ luteal_grounding.wav (7 min, 5.3 MB)
- ✅ sleep_induction.wav (10 min, 8.7 MB)
- ✅ habit_installation.wav (5 min, 6.2 MB)
- ✅ anxiety_reset.wav (90 sec, 2.9 MB)
- ✅ body_acceptance.wav (7 min, 8.3 MB)

**Quality**: Piper TTS (calm female voice, open-source)

---

## 📋 HOUR 2: COMPREHENSIVE TESTING

### Test URLs
```
Main Hub:     http://localhost:8001/index.html
Audio Test:   http://localhost:8001/test-audio.html
Main Screen:  http://localhost:8001/01-main-screen.html
Hypnosis:     http://localhost:8001/02-hypnosis-screen.html
Progress:     http://localhost:8001/03-progress-screen.html
Settings:     http://localhost:8001/04-settings-screen.html
Breathwork:   http://localhost:8001/05-breathwork-screen.html
Sleep Mode:   http://localhost:8001/06-sleep-mode.html
The Nest:     http://localhost:8001/07-cat-hangout.html
```

---

## 🧪 SCREEN-BY-SCREEN TEST PLAN

### 1. Audio Test Page ✅
**URL**: `http://localhost:8001/test-audio.html`

**Test**:
- [ ] All 5 audio players visible
- [ ] Luteal Grounding plays (7 min)
- [ ] Sleep Induction plays (10 min)
- [ ] Habit Installation plays (5 min)
- [ ] Anxiety Reset plays (90 sec)
- [ ] Body Acceptance plays (7 min)
- [ ] Volume controls work
- [ ] Pause/play works
- [ ] Can scrub through timeline

**Expected**: All audio files play with clear, calm voice

**Bugs Found**:
```
(Write any bugs here)
```

---

### 2. Main Screen (01-main-screen.html)
**URL**: `http://localhost:8001/01-main-screen.html`

**Test**:
- [ ] Cycle day displays correctly
- [ ] Thread visualization shows (7 segments)
- [ ] Guardian cat character visible
- [ ] Can select atmosphere (☀️🌧️❄️🔥🌊)
- [ ] Can select offering
- [ ] Habit card displays
- [ ] Atomic Habits breakdown visible
- [ ] Navigation buttons work
- [ ] Data persists after page reload

**Expected**: Dashboard shows cycle info, Guardian, and daily selections

**Bugs Found**:
```
(Write any bugs here)
```

---

### 3. Hypnosis Screen (02-hypnosis-screen.html)
**URL**: `http://localhost:8001/02-hypnosis-screen.html`

**Test**:
- [ ] Toggle between "Preset TTS" and "My Voice"
- [ ] Can select different scripts (Luteal, Anxiety, Sleep, Habit)
- [ ] Click "Start Session" plays audio
- [ ] Audio plays full length
- [ ] Can pause/resume
- [ ] Button updates to "Pause Session" when playing
- [ ] Script preview shows correct text
- [ ] Navigation works

**Expected**: Full hypnosis sessions play with professional audio

**Bugs Found**:
```
(Write any bugs here)
```

---

### 4. Progress Screen (03-progress-screen.html)
**URL**: `http://localhost:8001/03-progress-screen.html`

**Test**:
- [ ] 28-day calendar grid displays
- [ ] Days are color-coded by phase
- [ ] Habit completion shows
- [ ] Can navigate months
- [ ] Current day is highlighted
- [ ] Scarf visualization grows with progress
- [ ] Data persists after reload

**Expected**: Beautiful knitting calendar shows cycle and habits

**Bugs Found**:
```
(Write any bugs here)
```

---

### 5. Settings Screen (04-settings-screen.html)
**URL**: `http://localhost:8001/04-settings-screen.html`

**Test**:
- [ ] All settings categories display
- [ ] Toggle switches work
- [ ] Voice preference saves
- [ ] Notification settings save
- [ ] Phase descriptions toggle
- [ ] Settings persist after reload
- [ ] Navigation works

**Expected**: All settings functional and persistent

**Bugs Found**:
```
(Write any bugs here)
```

---

### 6. Breathwork Screen (05-breathwork-screen.html)
**URL**: `http://localhost:8001/05-breathwork-screen.html`

**Test**:
- [ ] 4 breathing patterns available (Box, 4-7-8, Coherence, Bilateral)
- [ ] Circle animation syncs with breathing
- [ ] Directional arrows show (↑→↓←)
- [ ] Timer displays correctly
- [ ] EMDR dot moves at comfortable speed
- [ ] Pattern descriptions clear
- [ ] Can switch between patterns
- [ ] Animation timing matches instructions

**Expected**: Smooth breathing animations with visual guides

**Bugs Found**:
```
(Write any bugs here)
```

---

### 7. Sleep Mode (06-sleep-mode.html)
**URL**: `http://localhost:8001/06-sleep-mode.html`

**Test**:
- [ ] Delta wave visualization displays
- [ ] **CRITICAL**: Actual audio plays (put on headphones!)
- [ ] Can hear 2 Hz binaural beat
- [ ] 4-7-8 breathing guide works
- [ ] Progressive relaxation script displays
- [ ] Loop mode toggles
- [ ] Timer options work (30/60/90/infinite)
- [ ] Can pause/resume
- [ ] Volume controls work

**Expected**: Hear actual binaural beat tone (low humming)

**Bugs Found**:
```
(Write any bugs here)
```

---

### 8. The Nest (07-cat-hangout.html)
**URL**: `http://localhost:8001/07-cat-hangout.html`

**Test**:
- [ ] Two Guardian cats visible (You + Friend)
- [ ] Window background shows
- [ ] Birds fly across window
- [ ] Cats sit/stand appropriately
- [ ] Mood sync shows status
- [ ] Support mode adjusts cat positions
- [ ] Controls work (mood selection)
- [ ] Visual animations smooth

**Expected**: Cozy bird-watching scene with two Guardians

**Bugs Found**:
```
(Write any bugs here)
```

---

### 9. Navigation Hub (index.html)
**URL**: `http://localhost:8001/index.html`

**Test**:
- [ ] All screen links work
- [ ] Screen previews display
- [ ] Can navigate to each screen
- [ ] Back buttons return correctly
- [ ] Bottom nav on each screen works

**Expected**: Easy navigation between all features

**Bugs Found**:
```
(Write any bugs here)
```

---

## 🔥 CRITICAL TESTS (MUST WORK)

### 1. Audio Playback
- [ ] Hypnosis sessions play completely
- [ ] Audio quality is acceptable
- [ ] No clicking/popping sounds
- [ ] Volume is consistent

### 2. Binaural Beats
- [ ] **PUT ON HEADPHONES**
- [ ] Can actually HEAR sound (not just visuals)
- [ ] Left ear: 200 Hz
- [ ] Right ear: 202 Hz
- [ ] Creates 2 Hz delta wave effect

### 3. Data Persistence
- [ ] Change cycle day → reload → still changed ✅
- [ ] Set habit → reload → still saved ✅
- [ ] Change settings → reload → still changed ✅
- [ ] Select atmosphere → reload → still selected ✅

### 4. Mobile Responsiveness
- [ ] Open on phone browser (same local network)
- [ ] All screens fit mobile viewport
- [ ] Touch targets large enough
- [ ] Scrolling works smoothly
- [ ] Audio plays on mobile

---

## 🐛 BUG PRIORITY LEVELS

**🔴 CRITICAL (Must fix before sharing)**:
- Blocks core functionality
- Audio doesn't play
- App crashes
- Data loss

**🟡 HIGH (Should fix before sharing)**:
- Major UX issues
- Confusing flows
- Visual glitches
- Performance problems

**🟢 LOW (Can fix later)**:
- Minor visual tweaks
- Nice-to-have features
- Edge cases
- Polish

---

## 📊 TESTING RESULTS

**Total Screens**: 10
**Tested**: ___ / 10
**Passing**: ___ / 10
**Critical Bugs**: ___
**High Priority Bugs**: ___
**Low Priority Bugs**: ___

---

## 🚀 NEXT STEPS AFTER TESTING

1. **If 0-2 critical bugs**: Fix them (30-60 min) → Ready to share! ✅
2. **If 3-5 critical bugs**: Fix session (1-2 hours) → Test again
3. **If 6+ critical bugs**: Deeper debugging needed (2-3 hours)

**Target**: Get to 0 critical bugs, then share with friends for feedback!

---

## 💡 TESTING TIPS

- **Use actual headphones** for binaural beats test
- **Test on mobile** (not just desktop)
- **Try to break things** (that's how you find bugs!)
- **Take notes** as you go
- **Don't fix yet** - just document bugs first

---

**Ready to start testing? Open the first URL and work through the checklist!**
