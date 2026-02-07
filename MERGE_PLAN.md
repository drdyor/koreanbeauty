# Merge Plan: OKComputer + Guardian Concept

## What to Keep from OKComputer

✅ **Technical Foundation**
- HTML/CSS/JS structure (well-organized)
- Anime.js integration (smooth transitions)
- LocalStorage for data persistence
- Responsive layout system

✅ **Visual Assets**
- K-tiger PNG files (can be repurposed)
- Korean aesthetic foundation
- Soft gradients and shadows

✅ **Functional Features**
- Breathing exercise interface
- State management system
- Data logging infrastructure

## What to Change

### 1. Color Palette
**From:** Pink (#FFB6C1, #FFE4E1)
**To:** Purple/Lavender (#c084fc, #fdf4ff, #e9d5ff)

### 2. Terminology
| Old (OKComputer) | New (Guardian) |
|------------------|----------------|
| Mood (1-10) | Atmosphere (☀️☁️⛈️) |
| Activities | Offering (simple/nourishing/stimulating) |
| Cat states | Guardian states |
| - | Thread (knitting progress) |

### 3. Cat State Logic

**Current (timer-based):**
```javascript
changeState(newState, duration) {
  setTimeout(() => {
    this.returnToDefaultState();
  }, duration);
}
```

**New (user-responsive):**
```javascript
updateGuardianState(userMood, userFood, cycleDay) {
  if (userMood === 'storm' && userFood === 'stimulating') {
    return 'close-quiet'; // Guardian moves closer
  }
  if (userMood === 'sunny' && userFood === 'nourishing') {
    return 'nearby-alert'; // Guardian is bright
  }
  if (cycleDay >= 15) {
    return 'distant-resting'; // Luteal phase
  }
  return 'observing'; // Default
}
```

### 4. Add Cycle Tracking

**New features to add:**
- Day counter (1-28)
- Thread visualization (7 segments)
- Ovulation trigger (day 14)
- Cycle phase descriptions

### 5. Simplify Food Tracking

**Remove:**
- Complex activity buttons
- Multiple wellness features
- Detailed mood scale (1-10)

**Add:**
- 3 offering buttons (simple/nourishing/stimulating)
- 3 atmosphere buttons (sunny/cloudy/storm)
- Quiet mode toggle

## Implementation Steps

### Phase 1: Visual Rebrand (1-2 hours)
1. Update CSS color variables
2. Replace text labels with new terminology
3. Test color contrast and readability

### Phase 2: Simplify UI (2-3 hours)
1. Remove complex mood scale
2. Replace with 3-button atmosphere selector
3. Add 3-button offering selector
4. Remove activity logs
5. Add cycle day counter

### Phase 3: Add Thread System (2-3 hours)
1. Create thread visualization component
2. Add cycle progression logic
3. Implement ovulation trigger (day 14)
4. Add phase descriptions

### Phase 4: Guardian Nervous System (3-4 hours)
1. Rewrite state logic to respond to user input
2. Add state descriptions that match user state
3. Remove timer-based transitions
4. Test all state combinations

### Phase 5: Polish & Test (2-3 hours)
1. Add quiet mode
2. Test responsive design
3. Optimize animations
4. User testing

**Total Estimated Time:** 10-15 hours

## Quick Start Script

Copy OKComputer and modify:

```bash
cd "/Users/dreva/Desktop/cursor/kbeauty/koreanbeauty"
cp -r "OKComputer_Tamagotchi Wellness Cat Game" "Guardian-App"
cd "Guardian-App"

# Rename for clarity
mv index.html guardian.html
mv main.js guardian.js
```

Then edit:
1. `guardian.html` - Update colors, terminology, remove complexity
2. `guardian.js` - Rewrite state logic to be user-responsive
3. Add cycle tracking components
4. Test and iterate

## Visual Asset Strategy

**Option A: Reuse K-tiger PNGs**
- Quick
- Already have 4 states
- Need to add 5th state (ovulation-alert)

**Option B: Generate new Guardian cat with Wan Video**
- More polished
- Consistent with vision
- Requires GPU time (~45 mins)

**Option C: Commission illustrator**
- Perfect brand fit
- Expensive ($200-500)
- Takes 1-2 weeks

**Recommendation:** Start with Option A (reuse tigers), then upgrade to Option B after validating the concept.

## Next Steps

1. **Review OKComputer in browser** - See what you're working with
2. **Decide on visual strategy** - Reuse, generate, or commission?
3. **Pick a timeline** - Quick hack (1-2 days) or polished (1 week)?
4. **Start Phase 1** - Color rebrand is easiest first step

Want me to start the merge for you?
