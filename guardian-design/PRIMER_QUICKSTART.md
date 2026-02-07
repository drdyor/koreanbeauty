# Primer System v2 - Quick Start Guide

## What You Just Got

A **content-agnostic testing infrastructure** for cognitive primers, not a finished product.

This system lets you **discover** what works through experimentation, not assume you already know.

## Open the App

```bash
# From guardian-design directory
open test-binaural-beats.html
```

Or use a local server:
```bash
python3 -m http.server 8000
# Visit: http://localhost:8000/test-binaural-beats.html
```

## How to Test Primers

### 1. Select a Focus Mode
Click any of the 6 Focus Mode tiles:
- **Deep Work** - Beta state, 25min
- **Study / Memory** - Alpha state, 45min
- **Creative Flow** - Schumann resonance, 40min
- **Calm Nervous System** - Theta state, 15min
- **Sleep Induction** - Delta state, continuous
- **Emotional Reset** - Alpha state, 10min

### 2. What Happens Automatically
1. **Session ID** generated (for deterministic A/B testing)
2. **Primer selected** using weighted random (seeded by session ID)
3. **Primer plays** (currently mocked with setTimeout)
4. **Binaural beats** start after primer (or alongside for continuous modes)
5. **Session tracked** in IndexedDB

### 3. Toggle Guided Primers ON/OFF
Use the switch in the player card to enable/disable primers.

**Important:** Toggling OFF after trying a primer logs a **fatigue signal** - the most honest metric.

### 4. Rate Your Session
After stopping, rate 1-5 stars (only if primer was used).

## View Your Data

### Option 1: Browser Console
Press **F12** → Console Tab

### Option 2: Export to File
- Press **'E'** → Download JSON
- Press **'C'** → Download CSV

### Option 3: View Analytics
Press **'A'** → See summary in console:
- Total sessions
- Primers by mode
- Average ratings
- Completion rates
- Fatigue events

### Option 4: Debug Info
Press **'D'** → See current state

## Adding Real Primer Audio

Currently, primers are **mocked** (no actual audio). To add real primers:

### 1. Record/Generate Audio
Create MP3 files following naming convention:
```
dw_focus-priming_v01_en_f_30s.mp3
```

### 2. Place in Correct Folder
```bash
# Example for Deep Work primer
cp your_audio.mp3 primers/deep-work/dw_focus-priming_v01_en_f_30s.mp3
```

### 3. Verify Path in Manifest
Check `primer-manifest.json`:
```json
{
  "primer_id": "dw_fp_v01",
  "audio": {
    "src": "/primers/deep-work/dw_focus-priming_v01_en_f_30s.mp3"
  }
}
```

### 4. Uncomment Audio Playback
In `js/primerManager.js` (line ~140):
```javascript
// Replace mock with:
this.currentAudio = new Audio(primer.audio.src);
this.currentAudio.play();
```

## Validate Your Manifest

Before deploying changes:
```bash
node validate-manifest.js
```

This checks:
- ✅ Controlled vocabulary compliance
- ✅ Logical consistency (e.g., continuous primers must have voice_continues: true)
- ✅ Pool coverage
- ⚠️  Unusual configurations

## Understanding the Data

### Event Types in Export

**mode_selected**
- User picks a Focus Mode
- Logs: `focus_mode`, `session_id`, `target_state_path`

**primer_started**
- Primer begins playing
- Logs: `primer_id`, `guidance_style`, `duration_sec`

**primer_completed**
- Primer finishes successfully
- Logs: `primer_id`, `actual_duration_sec`

**primer_skipped**
- User manually skips (not yet implemented in UI, but tracked)
- Logs: `primer_id`, `primer_completed: false`

**fatigue_toggle_off**
- User turns OFF guided primers after exposure
- **KEY SIGNAL** - Strongest indicator of poor UX
- Logs: `focus_mode`, `primer_id`

**session_complete**
- Full focus session ends
- Logs: `session_duration_sec`, `completion_percentage`, `brain_state`

**primer_rating**
- User rates 1-5 stars
- Logs: `rating`, `rating_scale: 5`

### Analyzing Effectiveness

**Good Primer:**
- Low fatigue rate (<10% toggle OFF)
- High completion (>90%)
- High session completion (>80% of planned duration)
- Average rating >3.5/5

**Bad Primer:**
- High fatigue rate (>20% toggle OFF)
- Low completion (<70%)
- Users stop session early
- Low ratings (<3.0/5)

## A/B Testing Workflow

### Example: Test 2 Focus Primers for Deep Work

1. **Add both primers** to manifest:
```json
{
  "primer_id": "dw_fp_v01",
  "weight": 50,
  "tags": { "guidance_style": ["focus_priming"] }
},
{
  "primer_id": "dw_fp_v02",
  "weight": 50,
  "tags": { "guidance_style": ["task_commitment"] }
}
```

2. **Run 20+ sessions** with Deep Work mode

3. **Export data** (Press 'C')

4. **Analyze in spreadsheet:**
   - Filter by `primer_id`
   - Compare completion rates
   - Compare fatigue events
   - Compare average ratings

5. **Adjust weights** based on results:
```json
// Winner gets more weight
{ "primer_id": "dw_fp_v01", "weight": 70 }
{ "primer_id": "dw_fp_v02", "weight": 30 }
```

## Controlled Vocabulary Reference

**Guidance Styles:**
- `focus_priming` - Narrowing attention
- `task_commitment` - Mental contracting
- `memory_cueing` - Retrieval activation
- `open_loop_creativity` - Divergent thinking
- `somatic_downshift` - Body-based stress reduction
- `breath_guidance` - Respiratory entrainment
- `body_scan` - Progressive relaxation
- `sleep_descent` - Sleep transition
- `emotional_labeling` - Affect recognition
- `compassion_reframe` - Self-compassionate shift

**Tone:**
- `neutral` - Clinical
- `calm` - Soothing
- `warm` - Supportive
- `directive` - Instructional
- `minimal` - Spacious

## What Makes This Different

**Most apps:**
1. Assume they know what works
2. Hardcode content
3. Track vanity metrics (downloads, time spent)
4. Ignore negative signals

**This system:**
1. Treats cognition as experimental
2. Separates content from infrastructure
3. Tracks honest signals (fatigue, completion)
4. Self-corrects based on real behavior

## Next Steps

1. ✅ **Test the system** - Click around, try different modes
2. ✅ **Export data** - Press 'E' or 'C' to see what's tracked
3. ✅ **View analytics** - Press 'A' to see summary
4. ⏳ **Add real audio** - Record/generate primer MP3s
5. ⏳ **Run 20+ sessions** - Get statistically meaningful data
6. ⏳ **Analyze results** - Find what actually works
7. ⏳ **Iterate content** - Swap primers based on data

## Troubleshooting

**Primer not playing?**
- Check console (F12) for error messages
- Verify `audio.src` path in manifest
- Ensure file exists in `/primers/` subdirectory

**Data not exporting?**
- Check IndexedDB in DevTools → Application → Storage
- Try different browser (Chrome recommended)
- Verify JavaScript console for errors

**Validation failing?**
- Run `node validate-manifest.js`
- Check for typos in controlled vocabulary
- Ensure all mode_ids referenced by primers exist

## Support

This is a **research infrastructure**, not a finished product. 

If something breaks, check:
1. Browser console (F12)
2. `PRIMER_SYSTEM_V2.md` for architecture details
3. `validate-manifest.js` for schema compliance

**Remember:** The goal is to discover what works, not to ship pre-defined content.
