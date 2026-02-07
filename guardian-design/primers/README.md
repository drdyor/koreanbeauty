# Primer Audio Files - Schema v2

This directory contains cognitive primer audio files organized by Focus Mode.

## Directory Structure

```
/primers/
  deep-work/     → Pre-task focus priming (eyes-open)
  study/         → Memory cueing and anchoring (eyes-open)
  creative/      → Open-loop creativity priming (eyes-open)
  calm/          → Somatic downshift and breath guidance (continuous)
  sleep/         → Body scan and sleep descent (continuous, eyes-closed)
  reset/         → Emotional labeling and regulation (somatic)
```

## Naming Convention

Format: `{mode}_{guidance-style}_v{version}_{lang}_{voice}_{duration}.mp3`

Examples:
- `dw_focus-priming_v01_en_f_30s.mp3`
- `sm_memory-cue_v01_en_m_30s.mp3`
- `si_body-scan_v01_en_f_600s.mp3`

**Note:** App logic uses `primer-manifest.json` metadata, not filenames.

## Controlled Vocabulary

### Guidance Styles (allowed tags)
- `focus_priming` - Narrowing attention for task execution
- `task_commitment` - Mental contracting and intention setting
- `attention_narrowing` - Reducing cognitive load
- `memory_cueing` - Activating retrieval and encoding strategies
- `open_loop_creativity` - Divergent thinking activation
- `somatic_downshift` - Body-based stress reduction
- `breath_guidance` - Respiratory entrainment
- `body_scan` - Progressive relaxation technique
- `sleep_descent` - Transition to sleep state
- `emotional_labeling` - Affect naming and recognition
- `compassion_reframe` - Self-compassionate perspective shift

### Tone (allowed tags)
- `neutral` - Clinical, matter-of-fact
- `calm` - Soothing, steady
- `warm` - Friendly, supportive
- `directive` - Clear, instructional
- `minimal` - Sparse, spacious

### Eyes State
- `open` - Eyes-open tasks (Deep Work, Study, Creative)
- `closed` - Eyes-closed relaxation (Sleep)
- `either` - Flexible (Calm, Reset)

## Audio Specifications

### Pre-Task Primers (eyes-open modes)
- Duration: 30-90 seconds
- LUFS: -16 dB
- Mix: Duck music -10dB, binaural -6dB
- Behavior: `voice_continues: false`

### Continuous Guidance (eyes-closed/somatic modes)
- Duration: 120-1800 seconds
- LUFS: -18 dB
- Mix: Duck music -12dB, binaural -8dB
- Behavior: `voice_continues: true`

## Selection Algorithm

1. **Pool filtering**: Mode selects from designated primer pools
2. **Cooldown check**: Recently used primers excluded (configurable)
3. **Daily limit**: Respects `max_uses_per_day` constraint
4. **Weighted random**: Deterministic selection seeded by `session_id`

## Deployment

1. Place MP3 files in correct subdirectory
2. Update `primer-manifest.json` with metadata
3. Ensure `audio.src` path matches file location
4. Test with browser DevTools console logs

## Research Data

User interactions automatically logged to IndexedDB:
- `primer_started` - When primer begins
- `primer_completed` - Full playback
- `primer_skipped` - User manually skipped
- `primer_toggle_off_after_exposure` - Fatigue signal
- `primer_rating` - Post-session 1-5 star rating

Export data: Press **'E'** key in app to download JSON.
