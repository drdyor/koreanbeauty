# Primer System v2 - Implementation Summary

## Overview

The Guardian app now implements a **Schema v2** primer testing infrastructure with:
- Controlled vocabulary to prevent tag chaos
- Deterministic weighted A/B testing
- Research-grade session tracking
- Enhanced fatigue signal detection

## Architecture

```
User Selects Focus Mode
        ↓
Session ID Generated (deterministic seed)
        ↓
Primer Manager selects primer using weighted random
        ↓
Check: Cooldown, Daily Limits, Pool Eligibility
        ↓
Play Primer (with audio ducking specs)
        ↓
Transition to Binaural Beats Engine
        ↓
Track: completion, rating, fatigue signals
```

## Key Files

### 1. `primer-manifest.json` (Schema v2)
- **Version**: 2
- **Modes**: 6 Focus Modes (deep_work, study, creative, calm, sleep, reset)
- **Primers**: 7 content-agnostic primer definitions
- **Controlled Vocabulary**: guidance_style, tone, eyes, complexity, intensity

**Example Mode:**
```json
{
  "mode_id": "deep_work",
  "label": "Deep Work",
  "category": "eyes_open",
  "primer_policy": {
    "primer_slot": "pre_task",
    "allow_continuous_guidance": false
  },
  "selection": {
    "pool_ids": ["pool_dw_focus"],
    "strategy": "weighted_random",
    "cooldown_sessions": 2
  }
}
```

**Example Primer:**
```json
{
  "primer_id": "dw_fp_v01",
  "weight": 70,
  "audio": {
    "duration_sec": 30,
    "mix": {
      "duck_music_db": -10,
      "duck_binaural_db": -6
    }
  },
  "behavior": {
    "voice_continues": false,
    "eyes": "open"
  },
  "tags": {
    "guidance_style": ["focus_priming"],
    "tone": ["calm", "directive"]
  }
}
```

### 2. `js/primerManager.js`
**Capabilities:**
- ✅ Deterministic primer selection seeded by `session_id`
- ✅ Weighted random distribution (e.g., 70% v01, 30% v02)
- ✅ Cooldown tracking (prevents immediate re-use)
- ✅ Daily usage limits per primer
- ✅ Pool-based filtering
- ✅ Audio mixing parameter handling

**Key Methods:**
- `generateSessionId()` - Creates unique session identifier
- `selectPrimerDeterministic(modeId)` - Weighted selection with constraints
- `trackPrimerUsage(primerId)` - Logs usage for cooldown/limits
- `playPrimer(modeId, onComplete)` - Coordinates playback sequence

### 3. `js/sessionTracker.js`
**Capabilities:**
- ✅ IndexedDB storage for local research data
- ✅ Enhanced fatigue tracking
- ✅ CSV export for spreadsheet analysis
- ✅ JSON export for programmatic analysis
- ✅ Real-time analytics

**Event Types Logged:**
- `mode_selected` - User picks a Focus Mode
- `primer_started` - Primer begins playing
- `primer_completed` - Primer finishes successfully
- `primer_skipped` - User manually skips
- `fatigue_toggle_off` - User turns OFF guided primers (KEY SIGNAL)
- `session_complete` - Full session ends
- `primer_rating` - User rates 1-5 stars

**Analytics:**
```javascript
tracker.getAnalytics() // View in console
tracker.exportData()   // Download JSON
tracker.exportCSV()    // Download CSV
```

### 4. `test-binaural-beats.html`
**UI Enhancements:**
- Focus Mode badges show primer metadata (e.g., "🎧 Focus primer · 30s")
- Guided Primer toggle with persistent state
- Expandable primer info line (shows active primer ID)
- Post-session rating modal (5-star, non-blocking)

**Keyboard Shortcuts:**
- **E** - Export session data (JSON)
- **C** - Export session data (CSV)
- **A** - View analytics in console
- **D** - Debug info

## Controlled Vocabulary

### Guidance Styles (allowed)
- `focus_priming`, `task_commitment`, `attention_narrowing`
- `memory_cueing`, `open_loop_creativity`
- `somatic_downshift`, `breath_guidance`, `body_scan`
- `sleep_descent`, `emotional_labeling`, `compassion_reframe`

### Tone (allowed)
- `neutral`, `calm`, `warm`, `directive`, `minimal`

### Eyes State
- `open` (Deep Work, Study, Creative)
- `closed` (Sleep Induction)
- `either` (Calm, Emotional Reset)

## Selection Algorithm

1. **Generate session_id** (deterministic seed)
2. **Filter eligible primers:**
   - Must match mode's `pool_ids`
   - Must not violate `cooldown_sessions`
   - Must not exceed `max_uses_per_day`
3. **Weighted random selection:**
   - Sum total weights
   - Generate seeded random number
   - Select primer based on weight distribution
4. **Track usage** (for future cooldowns/limits)

## Fatigue Signals (Most Important Metrics)

These are more honest than star ratings:

1. **`primer_toggle_off_after_exposure`**
   - User turns OFF primers after trying them
   - Strongest signal of poor UX or mismatch

2. **`primer_skipped`**
   - User manually skips during playback
   - Indicates content isn't engaging

3. **`primer_completed` rate**
   - Percentage of primers played to completion
   - High completion = good signal

4. **Session completion percentage**
   - Did user finish the full focus session?
   - Links primer quality to task performance

## Data Export & Analysis

### Export Session Data
Press **'E'** key → Downloads `guardian_sessions_YYYY-MM-DD.json`

### Export to Spreadsheet
Press **'C'** key → Downloads `guardian_sessions_YYYY-MM-DD.csv`

### View Analytics
Press **'A'** key → Console shows:
- Total sessions
- Primers by mode
- Average rating per primer
- Completion rates
- Fatigue event count

## Testing Workflow

1. **Add primer audio files** to `/primers/{mode}/` subdirectories
2. **Update `primer-manifest.json`** with metadata
3. **Launch app** and select Focus Modes
4. **Monitor console logs** for primer selection
5. **Complete sessions** and provide ratings
6. **Export data** (E/C keys)
7. **Analyze effectiveness** in spreadsheet or Python

## Production Deployment

### Replace Mock Audio
Currently, primers are mocked with `setTimeout()`. 

For production:
```javascript
// In primerManager.js, line ~140
this.currentAudio = new Audio(primer.audio.src);
this.currentAudio.volume = 0.3;
this.currentAudio.onended = () => {
  if (onComplete) onComplete();
};
this.currentAudio.play();
```

### Audio Ducking (Advanced)
Implement Web Audio API to:
- Duck background music by `-10dB` during voice
- Duck binaural beats by `-6dB` during voice
- Fade in/out using `audio.mix.fade_in_ms` and `fade_out_ms`

## Migration from v1

Old manifest will automatically fail gracefully. Update `primer-manifest.json` to v2 schema.

**Breaking Changes:**
- `mode` → `mode_id`
- `type` → `category`
- `guidance_style` (string) → `tags.guidance_style` (array)
- Added `pool_id`, `weight`, `slot` fields

## Success Metrics

**What makes a "good" primer?**
1. Low fatigue rate (<10% toggle OFF)
2. High completion rate (>90%)
3. High session completion (>80% of planned duration)
4. Average rating >3.5/5 (if tracked)

**Compare primers A/B:**
Export CSV → Filter by `primer_id` → Compare metrics

## Future Enhancements

- [ ] Add Zod schema validation for manifest
- [ ] Implement TypeScript types
- [ ] Add pool inheritance for filtered variants
- [ ] Implement actual Web Audio ducking
- [ ] Add server-side analytics aggregation
- [ ] Build admin dashboard for viewing A/B test results
