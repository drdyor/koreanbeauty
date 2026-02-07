# Guardian Voice Generation Scripts

Generate all 5 hypnosis scripts as MP3 files using either **Google Cloud TTS** (budget-friendly) or **ElevenLabs** (premium quality).

---

## Quick Start

### Option 1: Google Cloud TTS (Recommended for MVP)

**Cost**: $0.19 one-time for all 5 scripts

```bash
# 1. Install dependencies
cd scripts
npm install

# 2. Set up Google Cloud credentials (see setup below)
# Follow: https://cloud.google.com/docs/authentication/getting-started

# 3. Generate all scripts
npm run generate:google
```

### Option 2: ElevenLabs (Premium Quality)

**Cost**: $22/month (Creator plan) - uses ~12,000 chars from monthly quota

```bash
# 1. Install dependencies
cd scripts
npm install

# 2. Get API key from ElevenLabs
# Visit: https://elevenlabs.io/app/settings/api-keys

# 3. Set environment variable
export ELEVENLABS_API_KEY="your_key_here"

# 4. Generate all scripts
npm run generate:elevenlabs
```

---

## Google Cloud TTS Setup (Detailed)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "guardian-tts")
3. Enable **Cloud Text-to-Speech API**:
   - Search for "Text-to-Speech API" in the console
   - Click "Enable"

### Step 2: Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name: `guardian-tts-service`
4. Grant role: **Cloud Text-to-Speech User**
5. Click **Create Key** > **JSON**
6. Save the JSON file (e.g., `guardian-tts-credentials.json`)

### Step 3: Set Up Credentials

**macOS/Linux**:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/guardian-tts-credentials.json"

# Add to ~/.zshrc or ~/.bashrc to make permanent:
echo 'export GOOGLE_APPLICATION_CREDENTIALS="/path/to/guardian-tts-credentials.json"' >> ~/.zshrc
```

**Windows (PowerShell)**:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\guardian-tts-credentials.json"
```

### Step 4: Test Connection

```bash
npm run test:google
# Should output: ✅ Google Cloud TTS client initialized successfully
```

### Step 5: Generate Scripts

```bash
npm run generate:google
```

**Expected output**:
```
🌙 Guardian Voice Generation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Voice: Google Cloud Neural2-C (Female, calm)
Output directory: ../audio
Scripts to generate: 5

🎙️  Generating: Luteal Phase Grounding...
✅ Saved: ../audio/01_luteal_grounding_neural2c.mp3

🎙️  Generating: Sleep Induction...
✅ Saved: ../audio/02_sleep_induction_neural2c.mp3

🎙️  Generating: Habit Installation...
✅ Saved: ../audio/03_habit_installation_neural2c.mp3

🎙️  Generating: Anxiety Reset...
✅ Saved: ../audio/04_anxiety_reset_neural2c.mp3

🎙️  Generating: Body Acceptance...
✅ Saved: ../audio/05_body_acceptance_neural2c.mp3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Generation Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successful: 5/5
❌ Failed: 0/5
⏱️  Total time: 12.34s

💰 Estimated cost: $0.19 (one-time)

🎧 Files ready to use in Guardian app!
```

---

## ElevenLabs Setup (Detailed)

### Step 1: Create ElevenLabs Account

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up for **Creator Plan** ($22/month)
3. Go to [Settings > API Keys](https://elevenlabs.io/app/settings/api-keys)
4. Click **Create API Key**
5. Copy the key (starts with `sk_...`)

### Step 2: Set Environment Variable

**macOS/Linux**:
```bash
export ELEVENLABS_API_KEY="sk_your_key_here"

# Add to ~/.zshrc or ~/.bashrc to make permanent:
echo 'export ELEVENLABS_API_KEY="sk_your_key_here"' >> ~/.zshrc
```

**Windows (PowerShell)**:
```powershell
$env:ELEVENLABS_API_KEY="sk_your_key_here"
```

### Step 3: Test Connection

```bash
npm run test:elevenlabs
# Should output: ✅ ElevenLabs API key found
```

### Step 4: Generate Scripts

```bash
npm run generate:elevenlabs
```

**Expected output**:
```
🌙 Guardian Voice Generation (ElevenLabs Premium)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Voices: Rachel (calm), Bella (soft), Domi (nurturing)
Output directory: ../audio
Scripts to generate: 5

🎙️  Generating: Luteal Phase Grounding...
✅ Saved: ../audio/01_luteal_grounding_rachel.mp3 (2,480 chars)

🎙️  Generating: Sleep Induction...
✅ Saved: ../audio/02_sleep_induction_bella.mp3 (2,420 chars)

🎙️  Generating: Habit Installation...
✅ Saved: ../audio/03_habit_installation_rachel.mp3 (2,520 chars)

🎙️  Generating: Anxiety Reset...
✅ Saved: ../audio/04_anxiety_reset_domi.mp3 (1,480 chars)

🎙️  Generating: Body Acceptance...
✅ Saved: ../audio/05_body_acceptance_rachel.mp3 (2,530 chars)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Generation Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successful: 5/5
❌ Failed: 0/5
📝 Total characters: 11,430
⏱️  Total time: 18.56s

💰 Estimated cost: $0.25 (11,430 chars used from monthly quota)
   Remaining: 88,570 chars

🎧 Files ready to use in Guardian app!
```

---

## Output Files

After generation, you'll have MP3 files in the `../audio/` directory:

**Google Cloud TTS**:
```
audio/
  01_luteal_grounding_neural2c.mp3   (~7 min)
  02_sleep_induction_neural2c.mp3    (~7 min)
  03_habit_installation_neural2c.mp3 (~7 min)
  04_anxiety_reset_neural2c.mp3      (~3 min)
  05_body_acceptance_neural2c.mp3    (~7 min)
```

**ElevenLabs**:
```
audio/
  01_luteal_grounding_rachel.mp3     (~7 min)
  02_sleep_induction_bella.mp3       (~7 min)
  03_habit_installation_rachel.mp3   (~7 min)
  04_anxiety_reset_domi.mp3          (~3 min)
  05_body_acceptance_rachel.mp3      (~7 min)
```

---

## Voice Comparison

| Provider | Voice | Quality | Cost | Best For |
|----------|-------|---------|------|----------|
| **Google Neural2-C** | Female, calm | 8/10 | $0.19 one-time | MVP, testing |
| **ElevenLabs Rachel** | Female, natural | 10/10 | $22/month | Premium users |
| **ElevenLabs Bella** | Female, soft | 10/10 | $22/month | Sleep scripts |
| **ElevenLabs Domi** | Female, gentle | 10/10 | $22/month | Anxiety reset |

---

## Customization

### Change Voice (Google Cloud)

Edit `generate-voice-google.js`:

```javascript
voice: {
  languageCode: 'en-US',
  name: 'en-US-Neural2-F',  // Try: Neural2-C, Neural2-F, Neural2-H
  ssmlGender: 'FEMALE'
}
```

Available voices: https://cloud.google.com/text-to-speech/docs/voices

### Change Voice (ElevenLabs)

Edit `generate-voice-elevenlabs.js`:

```javascript
const VOICES = {
  rachel: '21m00Tcm4TlvDq8ikWAM', // Female, calm
  bella: 'EXAVITQu4vr4xnSDxMaL',  // Female, soft
  adam: 'pNInz6obpgDQGcFmaJgB',   // Male, deep
  domi: 'AZnzlk1XvdvUeBnXmlld'    // Female, gentle
};
```

Browse more voices: https://elevenlabs.io/voice-library

### Adjust Speaking Rate / Pitch

**Google Cloud**:
```javascript
audioConfig: {
  speakingRate: 0.85,  // 0.25-4.0 (1.0 = normal)
  pitch: -2.0,         // -20 to +20 (0 = normal)
}
```

**ElevenLabs**:
```javascript
voice_settings: {
  stability: 0.75,     // 0-1 (higher = more consistent)
  similarity_boost: 0.8, // 0-1 (higher = truer to voice)
  style: 0.3,          // 0-1 (lower = less emotional)
}
```

---

## Troubleshooting

### Google Cloud: "Application Default Credentials not found"

**Problem**: `GOOGLE_APPLICATION_CREDENTIALS` not set correctly

**Fix**:
```bash
# Check if variable is set
echo $GOOGLE_APPLICATION_CREDENTIALS

# Should output the path to your JSON credentials file
# If empty, run:
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-credentials.json"
```

### Google Cloud: "API has not been enabled"

**Problem**: Text-to-Speech API not enabled for your project

**Fix**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Search for "Text-to-Speech API"
3. Click "Enable"
4. Wait 1-2 minutes, then try again

### ElevenLabs: "Invalid API key"

**Problem**: API key not set or incorrect

**Fix**:
```bash
# Check if key is set
echo $ELEVENLABS_API_KEY

# Should output: sk_...
# If empty or wrong, get new key from:
# https://elevenlabs.io/app/settings/api-keys
```

### ElevenLabs: "Quota exceeded"

**Problem**: Used all 100k characters for the month

**Fix**:
- Wait until next billing cycle (1st of month)
- OR upgrade to Pro plan ($99/month, 500k chars)
- OR switch to Google Cloud TTS (cheaper)

### Files not generating

**Problem**: Script runs but no files created

**Check**:
1. Does `../audio/` directory exist? (Script should create it automatically)
2. Do you have write permissions? Run: `ls -la ../audio`
3. Check error messages in console output

---

## Integration with Guardian App

### Step 1: Move Audio Files

```bash
# Copy generated MP3s to Guardian app public directory
cp audio/*.mp3 ../public/audio/
```

### Step 2: Update Hypnosis Screen

In `02-hypnosis-screen.html`, update audio sources:

```javascript
const presetScripts = [
  {
    id: 'luteal',
    name: 'Luteal Phase Grounding',
    duration: '7 min',
    audio: 'audio/01_luteal_grounding_neural2c.mp3'  // or _rachel.mp3
  },
  {
    id: 'sleep',
    name: 'Sleep Induction',
    duration: '7 min',
    audio: 'audio/02_sleep_induction_neural2c.mp3'
  },
  // ... etc
];
```

### Step 3: Test Playback

1. Open `02-hypnosis-screen.html` in browser
2. Select "Preset TTS" mode
3. Choose a script
4. Click play ▶️
5. Listen to confirm audio quality

---

## Cost Summary

### MVP Launch (5 scripts)

| Provider | Setup Cost | Monthly Cost | Total Year 1 |
|----------|------------|--------------|--------------|
| **Google Cloud** | $0 | $0 | $0.19 |
| **ElevenLabs** | $0 | $22 | $264 |

**Recommendation**: Start with Google Cloud, upgrade to ElevenLabs once you have 50+ paying users.

### Adding More Scripts (10 scripts total)

| Provider | Characters | Cost |
|----------|------------|------|
| **Google Cloud** | 24,000 | $0.38 one-time |
| **ElevenLabs** | 24,000 | $22/month (uses 24% of quota) |

### Large Library (50 scripts)

| Provider | Characters | Cost |
|----------|------------|------|
| **Google Cloud** | 120,000 | $1.92 one-time |
| **ElevenLabs** | 120,000 | $99/month (Pro plan required) |

**Break-even**: If generating 50+ scripts, ElevenLabs Pro becomes competitive.

---

## Next Steps

1. **Choose provider**: Google Cloud (MVP) or ElevenLabs (premium)
2. **Generate scripts**: Run `npm run generate:google` or `npm run generate:elevenlabs`
3. **Test audio**: Listen to each script, verify quality
4. **Integrate**: Copy MP3s to Guardian app
5. **User testing**: Get feedback on voice quality

---

## FAQ

**Q: Can I use both providers?**
A: Yes! Generate with both and A/B test with users.

**Q: Can I customize the scripts?**
A: Yes! Edit the text in `generate-voice-google.js` or `generate-voice-elevenlabs.js`.

**Q: What if I want a male voice?**
A: Google: Use `en-US-Neural2-D`. ElevenLabs: Use `adam` voice.

**Q: Can I add background music/binaural beats?**
A: Yes! Use `ffmpeg` to mix TTS with audio (see VOICE_GENERATION_GUIDE.md).

**Q: Do I need to regenerate every time I edit a script?**
A: Yes, but it's quick (10-20 seconds per script).

**Q: Can I voice clone my own voice?**
A: Yes, with ElevenLabs Creator plan. Upload 1-2 min of your voice, then use the cloned voice ID.

---

## Support

- Google Cloud TTS docs: https://cloud.google.com/text-to-speech/docs
- ElevenLabs docs: https://docs.elevenlabs.io/
- Guardian issues: https://github.com/guardian-app/guardian/issues

---

**Ready to generate your first hypnosis scripts? Pick a provider above and run the script!**
