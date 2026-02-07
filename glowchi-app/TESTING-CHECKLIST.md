# 🧪 GLOWCHI Testing Checklist

**Version:** 1.0.0 (Phase 1 - MVP)
**Date:** 2025-12-31
**Tester:** _________________

---

## 📱 Testing Environment

### Device Information
- [ ] **Platform:** iOS / Android / Web
- [ ] **Device Model:** _________________
- [ ] **OS Version:** _________________
- [ ] **Has Wearable:** Apple Watch / Fitbit / Other / None
- [ ] **Testing Method:** Physical Device / Simulator / Expo Go

---

## 🚀 Installation & Setup

### Initial Launch
- [ ] App installs successfully
- [ ] Splash screen appears
- [ ] No crash on first launch
- [ ] Navigates to Pet tab by default
- [ ] All 4 tabs visible (Pet, Health, Glow Vision, Profile)

### First Impressions
- [ ] UI looks polished and professional
- [ ] Colors match K-beauty aesthetic (pink, purple, lavender)
- [ ] Text is readable
- [ ] No layout issues or overlapping elements
- [ ] Animations are smooth

**Notes:**
```


```

---

## 🐱 Pet Tab Testing

### Visual Elements
- [ ] Pet emoji displays correctly (default: neutral face)
- [ ] Pet circle has pink shadow
- [ ] Level badge shows "Level 1 🌟"
- [ ] Streak badge shows "0 day streak"
- [ ] XP progress bar visible
- [ ] Three stat bars visible (Energy, Skin Clarity, Happiness)

### Pet State (First Launch)
- [ ] Energy: 50%
- [ ] Skin Clarity: 70%
- [ ] Happiness: 50%
- [ ] Breakout Risk: 30% (not shown unless >= 60%)
- [ ] XP: 0 / 100

### Sync Button
- [ ] "Sync Apple Health" / "Sync Health Connect" button visible
- [ ] Button has purple border
- [ ] No sync data shown yet (first launch)

**Test: Tap Sync Button**
- [ ] If permissions not granted → Permission dialog appears
- [ ] If granted → Shows loading spinner
- [ ] On success → Alert shows: "✅ Synced! Steps: X, Sleep: Xhrs"
- [ ] Sync time appears below button
- [ ] Steps and sleep hours appear below button

**Real Device Only:**
- [ ] Real step count from Health app shows
- [ ] Real sleep hours show
- [ ] Numbers match Health app data

**Simulator (Expected Behavior):**
- [ ] Shows 0 steps (no Health data)
- [ ] Shows 7 hours sleep (default)
- [ ] No crash even without Health data

**Notes:**
```


```

### Check-In Button
- [ ] "Quick Check-In" button visible
- [ ] Pink gradient background
- [ ] Heart icon visible

**Test: First Check-In**
- [ ] Tap "Quick Check-In"
- [ ] Pet state updates
- [ ] Stats change (Energy, Skin Clarity, Happiness)
- [ ] XP increases (should gain ~20 XP)
- [ ] Streak increases to 1
- [ ] Button changes to "Checked In Today! ✓"
- [ ] Button becomes gray/disabled
- [ ] Message appears: "Come back tomorrow to check in again! 💖"

**Test: Try to Check In Again (Same Day)**
- [ ] Tap button again
- [ ] Alert appears: "You already checked in today! Come back tomorrow 💖"
- [ ] No state changes

**Notes:**
```


```

### Pet Mood Testing
After check-in, verify pet mood logic:

**Test: Low Sleep Scenario**
1. Go to Health tab
2. Set sleep to 5 hours
3. Save
4. Return to Pet tab
5. Check in
- [ ] Pet mood should be "sluggish" 😴
- [ ] Energy should be low (< 40%)
- [ ] Breakout risk should be high (>= 70%)
- [ ] Dark circles warning should appear

**Test: Perfect Day Scenario**
1. Go to Health tab (next day)
2. Set steps to 10,000+
3. Set sleep to 8 hours
4. Set water to 8 glasses
5. Save
6. Return to Pet tab
7. Check in
- [ ] Pet mood should be "happy" 😊 or "glowing" ✨
- [ ] Energy should be high (>= 70%)
- [ ] Skin Clarity should be high (>= 80%)
- [ ] Breakout risk should be low (< 40%)

**Notes:**
```


```

---

## 📊 Health Tab Testing

### UI Elements
- [ ] Title: "Health Dashboard"
- [ ] Subtitle: "Track your daily wellness"
- [ ] All 4 cards visible (Steps, Sleep, Water, Food)

### Steps Input
- [ ] Number input field visible
- [ ] Placeholder: "Enter steps"
- [ ] Can type numbers
- [ ] Progress bar shows percentage toward goal (10,000)
- [ ] Goal text: "Goal: 10,000"

**Test: Enter 5,000 steps**
- [ ] Progress bar fills to 50%
- [ ] Text shows "50% of goal"

**Test: Enter 10,000+ steps**
- [ ] Progress bar fills to 100%
- [ ] Text shows "100% of goal"

### Sleep Input
- [ ] 6 hour buttons visible (5h, 6h, 7h, 8h, 9h, 10h)
- [ ] Default: None selected
- [ ] Optimal range text: "Optimal: 7-9 hours"

**Test: Select 7h**
- [ ] Button turns purple
- [ ] White text
- [ ] No warning appears

**Test: Select 5h**
- [ ] Button turns purple
- [ ] Warning box appears: "⚠️ Low sleep may increase breakout risk"
- [ ] Warning has yellow background

**Test: Switch from 5h to 8h**
- [ ] 5h button deselects
- [ ] 8h button becomes active
- [ ] Warning disappears

### Water Intake
- [ ] 8 glass icons visible
- [ ] All start as outline icons (empty)
- [ ] Goal: "Goal: 8 glasses"

**Test: Tap glasses sequentially**
- [ ] 1st tap: First glass fills (solid blue)
- [ ] 2nd tap: Second glass fills
- [ ] Continue to 8th glass
- [ ] Progress bar shows percentage (12.5% per glass)
- [ ] At 8 glasses: Progress bar at 100%

**Test: Tap filled glass**
- [ ] Clicking glass 5 when 8 are filled
- [ ] All glasses after 5 should empty (6, 7, 8)
- [ ] Only 1-5 remain filled

### Food Log
- [ ] Subtitle: "Tap what you consumed today to track skin correlations"
- [ ] 6 food category buttons visible
- [ ] Each has emoji (🥛 🍰 🍟 🍷 ☕ 🥗)
- [ ] Each has label (Dairy, Sugar, Fried, Alcohol, Caffeine, Veggies)

**Test: Select food categories**
- [ ] Tap "Dairy" → Button gets pink border + pink background
- [ ] Tap "Sugar" → Also selected
- [ ] Tap "Dairy" again → Deselects
- [ ] Can select multiple at once
- [ ] Can deselect all

### Save Button
- [ ] Pink gradient button visible
- [ ] Text: "Save Health Data"
- [ ] Save icon visible

**Test: Save data**
1. Enter: 7,000 steps, 7h sleep, 6 glasses water, select dairy + sugar
2. Tap "Save Health Data"
- [ ] Button text changes to "Saved! ✓"
- [ ] Checkmark icon appears
- [ ] After 2 seconds: Reverts to "Save Health Data"

**Test: Data persistence**
1. Enter health data
2. Save
3. Navigate to Pet tab
4. Navigate back to Health tab
- [ ] All data still filled in
- [ ] Steps: 7,000
- [ ] Sleep: 7h selected
- [ ] Water: 6 glasses filled
- [ ] Food: Dairy + sugar selected

**Test: New day behavior**
1. Set device date to tomorrow
2. Open app
3. Go to Health tab
- [ ] All inputs reset to 0/empty? (Or keep yesterday's data?)

**Notes:**
```


```

---

## ✨ Glow Vision Tab Testing

### Placeholder Screen
- [ ] Camera icon (80pt) displays
- [ ] Icon in white circle with purple shadow
- [ ] Title: "Glow Vision"
- [ ] Subtitle: "Coming Soon! ✨"
- [ ] Card with feature list visible

### Feature List
- [ ] "📸 Daily photo tracking"
- [ ] "✨ AI-powered skin analysis"
- [ ] "🔮 Visualization mode (see your glow goal!)"
- [ ] "📊 Progress over time"
- [ ] "🎯 Correlation with products & habits"

### UI
- [ ] Text is centered
- [ ] Background gradient visible
- [ ] No crashes or errors
- [ ] Note at bottom: "This feature is in development..."

**Notes:**
```


```

---

## 👤 Profile Tab Testing

### Header
- [ ] Avatar circle with 👤 emoji
- [ ] Name: "Demo User"
- [ ] Email: "demo@glowchi.app"

### Stats Summary Card
- [ ] 3 stats displayed side-by-side
- [ ] "Days Tracked: 0" (or actual count after check-ins)
- [ ] "Pet Level: 1" (or current level)
- [ ] "Streak: 0" (or current streak)
- [ ] Stats update after check-ins

### Settings Menu
**Verify all menu items visible:**
- [ ] Edit Profile (with chevron →)
- [ ] Notifications (with chevron →)
- [ ] Health Connect (with "Coming Soon" badge)
- [ ] Cycle Tracking (with chevron →)
- [ ] Help & Support (with chevron →)
- [ ] Privacy Policy (with chevron →)
- [ ] About GLOWCHI (with chevron →)

**Test: Tap menu items**
- [ ] Tapping does nothing (placeholder)
- [ ] No crashes

### Version Footer
- [ ] "GLOWCHI v1.0.0 (MVP)"
- [ ] "Built with 💖 for better skin"

**Notes:**
```


```

---

## 🔔 Notifications Testing

**⚠️ REQUIRES PHYSICAL DEVICE**

### Permission Request
- [ ] On first launch, notification permission dialog appears
- [ ] If declined, can re-enable in Settings

### Daily Check-In Reminder (9 PM)
**Setup:**
1. Set device time to 8:58 PM
2. Keep app open
3. Wait until 9:00 PM

**Expected:**
- [ ] At 9:00 PM sharp: Notification appears
- [ ] Title: "Time to check in! 💖"
- [ ] Body: "Your pet is waiting for you! Log your day and see how they're doing."
- [ ] Sound plays
- [ ] Badge appears on app icon

**Test: Tap notification**
- [ ] App opens
- [ ] Navigates to Pet tab
- [ ] Can check in

### Streak Warning (11 PM)
**Setup:**
1. Don't check in all day
2. Set device time to 10:58 PM
3. Wait until 11:00 PM

**Expected:**
- [ ] At 11:00 PM: Notification appears
- [ ] Title: "Don't lose your streak! 🔥"
- [ ] Body: "You haven't checked in today. Your pet misses you!"

### Level-Up Notification
**Setup:**
1. Check in multiple times (change date between check-ins)
2. Get to Level 2

**Expected:**
- [ ] Immediately after leveling up: Notification
- [ ] Title: "🎉 Level Up! You're now Level 2!"
- [ ] Body: "Your pet evolved! Keep up the great work!"

### Breakout Warning
**Setup:**
1. Go to Health tab
2. Set sleep to 4 hours
3. Save
4. Go to Pet tab
5. Check in (breakout risk should be >= 60%)

**Expected:**
- [ ] Immediately: Notification appears
- [ ] Title: "⚠️ High Breakout Risk Detected"
- [ ] Body: "Your pet senses trouble ahead (XX% risk). Time to focus on skin care!"

**Notes:**
```


```

---

## 🔄 Data Persistence Testing

### App Close & Reopen
**Test 1: Pet state persists**
1. Check in on Pet tab
2. Note: Level, XP, Streak, Stats
3. Force close app
4. Reopen app
- [ ] Pet state exactly the same
- [ ] Level unchanged
- [ ] XP unchanged
- [ ] Streak unchanged
- [ ] Last check-in date preserved

**Test 2: Health data persists**
1. Enter health data on Health tab
2. Save
3. Force close app
4. Reopen app
5. Go to Health tab
- [ ] Steps still there
- [ ] Sleep still selected
- [ ] Water still filled
- [ ] Food still selected

**Test 3: Sync data persists**
1. Sync Apple Health
2. Note step count shown
3. Force close app
4. Reopen app
- [ ] Last sync time still shown
- [ ] Step count still shown

### Multi-Day Testing
**Day 1:**
1. Check in (Streak: 1)
2. Note XP and level

**Day 2 (change device date or wait 24 hours):**
1. Open app
2. Check in again
- [ ] Streak increases to 2
- [ ] XP increases
- [ ] "Quick Check-In" button available again

**Day 3:**
1. Skip check-in (don't open app)

**Day 4:**
1. Open app
2. Check Pet tab
- [ ] Streak reset to 0? (Or streak preserved?)
- [ ] Can still check in

**Notes:**
```


```

---

## 🩺 HealthKit/Health Connect Testing

**⚠️ REQUIRES PHYSICAL DEVICE WITH HEALTH APP**

### iOS HealthKit
**Setup:**
1. Open iPhone Health app
2. Verify you have step data from today
3. Verify you have sleep data from last night
4. Note the numbers

**In GLOWCHI:**
1. Tap "Sync Apple Health"
2. Grant permissions when prompted

**Expected:**
- [ ] Steps in GLOWCHI match Health app
- [ ] Sleep hours in GLOWCHI match Health app (within 0.5h)
- [ ] Sync time shows current time
- [ ] Alert shows synced numbers

**Test: Real-time sync**
1. Note current steps in GLOWCHI
2. Walk 100+ steps
3. Tap "Sync Apple Health" again
- [ ] Step count increases
- [ ] Matches Health app

**Test: Sleep tracking**
1. Check GLOWCHI in morning
2. Compare sleep hours to Health app
- [ ] Within reasonable range (±0.5 hours)

**Test: HRV (if you have Apple Watch)**
1. Sync health data
2. Check logs (if accessible)
- [ ] HRV value pulled from Health app
- [ ] Used in pet state calculation

### Android Health Connect
**Setup:**
1. Install Google Health Connect app
2. Grant permissions
3. Have step data from today

**In GLOWCHI:**
1. Tap "Sync Health Connect"
2. Grant permissions

**Expected:**
- [ ] Steps sync correctly
- [ ] Sleep syncs correctly
- [ ] No crashes

**Notes:**
```


```

---

## 🐛 Bug Discovery Section

### Critical Bugs (App Crashes)
```
Bug #1:
Steps to reproduce:
1.
2.
3.
Expected:
Actual:
Severity: Critical / High / Medium / Low


```

### UI/UX Issues
```
Issue #1:
Location:
Description:
Screenshot/Notes:


```

### Data Issues
```
Issue #1:
Description:
Impact:


```

### Performance Issues
```
Issue #1:
Description:
Device:
Impact:


```

---

## 📊 Performance Testing

### App Load Time
- [ ] App opens in < 3 seconds
- [ ] Splash screen shows briefly
- [ ] No hanging or freezing

### Navigation Speed
- [ ] Switching tabs is instant
- [ ] No lag when navigating
- [ ] Animations are smooth (60 FPS)

### Sync Performance
- [ ] Health sync completes in < 5 seconds
- [ ] No freezing during sync
- [ ] UI remains responsive

### Memory Usage
- [ ] App doesn't feel sluggish over time
- [ ] No memory warnings
- [ ] Can use app for 10+ minutes without issues

**Notes:**
```


```

---

## ✅ Overall Assessment

### What Works Well
1.
2.
3.

### What Needs Improvement
1.
2.
3.

### Blockers (Must fix before launch)
1.
2.
3.

### Nice-to-Haves (Can wait)
1.
2.
3.

### Overall Impression (1-10): _____

**Ready for next phase?** Yes / No / Needs work

**Notes:**
```


```

---

## 📝 Next Steps

Based on testing, prioritize:
1. [ ] Fix critical bugs
2. [ ] Address major UX issues
3. [ ] Verify data accuracy
4. [ ] Test on multiple devices
5. [ ] Proceed to Phase 2 (Glow Vision) or build Widget

**Tester Signature:** _________________ **Date:** _________
