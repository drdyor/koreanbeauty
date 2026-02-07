# [ARCHIVED] 🌙 Guardian Audio Backend: ElevenLabs Action Plan

> **STATUS: ARCHIVED / SUPERSEDED**
> This document is kept for reference only. 
> **Active Plan**: See `VOICE_BACKEND_CHEAPEST_MVP.md` for the open-source/cheapest approach.

---

## 1. ElevenLabs API Setup (High-Fidelity Voice)
The app needs high-quality, soothing voices. ElevenLabs is the industry standard for this.

- [ ] **Create Account**: Sign up at [ElevenLabs.io](https://elevenlabs.io/).
- [ ] **Get API Key**: Go to Profile Settings -> API Key.
- [ ] **Clone Your Voice (Optional)**: Upload 1-2 minutes of a calm, soothing voice (yours or a professional's) to create a custom "Guardian" voice.
- [ ] **Get Voice ID**: Note the `voice_id` of the voice you want to use.

---

## 2. Supabase / Cloud Storage Setup
Large audio files (7-10 minutes) shouldn't be bundled in the app. They should be streamed.

- [ ] **Create Supabase Project**: Go to [supabase.com](https://supabase.com/).
- [ ] **Create Storage Bucket**: Create a public bucket named `guardian-audio`.
- [ ] **Policy**: Set the bucket policy to "Public" so the app can fetch files without complex auth for now.

---

## 3. Generate Full-Length Sessions
Use the scripts in `koreanbeauty/guardian-design/scripts/` as a base.

- [ ] **Run the ElevenLabs Script**: 
  ```bash
  cd /Users/dreva/Desktop/cursor/kbeauty/koreanbeauty/guardian-design/scripts
  # Edit generate-voice-elevenlabs.js with your API Key and Voice ID
  node generate-voice-elevenlabs.js
  ```
- [ ] **Scripts to Generate**:
    - `luteal_grounding.mp3` (7 mins)
    - `anxiety_reset.mp3` (3 mins)
    - `sleep_induction.mp3` (10 mins)
    - `habit_installation.mp3` (5 mins)
    - `body_acceptance.mp3` (7 mins)

---

## 4. The Binaural Mix (The "Secret Sauce")
To make the hypnosis effective, we must mix the Voice with the 2Hz Delta Waves.

- [ ] **Manual Mix (Fastest)**: Use Audacity or GarageBand.
    - Track 1: ElevenLabs Voice.
    - Track 2: Constant low hum (200Hz Left / 202Hz Right).
    - Export as a single high-quality `.mp3`.
- [ ] **Automated Mix (Scalable)**: Use the `ffmpeg` command:
  ```bash
  ffmpeg -i voice.mp3 -i binaural_tone.wav -filter_complex amix=inputs=2:duration=first combined.mp3
  ```

---

## 5. Connecting to React Native
Once the files are in Supabase Storage:

- [ ] **Update Constants**: Open `koreanbeauty/glowchi-app/constants/index.ts`.
- [ ] **Replace URLs**: Change local paths to Supabase URLs:
  ```typescript
  // Example
  AUDIO_URLS: {
    luteal: 'https://[your-project].supabase.co/storage/v1/object/public/guardian-audio/luteal_grounding.mp3',
  }
  ```
