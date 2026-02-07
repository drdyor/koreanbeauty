# Voice Generation Guide for Guardian

**TTS options for hypnosis scripts with cost analysis**

---

## Option 1: ElevenLabs (Recommended for Quality)

### Why ElevenLabs for Hypnosis:
- ✅ **Most natural TTS available** (indistinguishable from human)
- ✅ **Emotional range** (can sound calm, soothing, warm)
- ✅ **Consistent pacing** (important for hypnosis rhythm)
- ✅ **Voice cloning** (can create Guardian's unique voice)
- ✅ **API available** (easy integration)

### Pricing (2024):

| Plan | Cost | Characters/month | Cost per script |
|------|------|------------------|-----------------|
| **Free** | $0 | 10,000 chars | ~3-4 scripts (2,500 chars each) |
| **Starter** | $5/mo | 30,000 chars | ~12 scripts |
| **Creator** | $22/mo | 100,000 chars | ~40 scripts |
| **Pro** | $99/mo | 500,000 chars | ~200 scripts |
| **Scale** | $330/mo | 2M chars | ~800 scripts |

**For Guardian MVP**:
- **Creator Plan ($22/mo)** = Perfect for startup
- Generate 5-7 hypnosis scripts upfront
- Each script = ~2,500 characters (7 min spoken @ 6 words/sec)
- Total: ~17,500 chars for full library
- **Leaves 82,500 chars** for updates/new scripts

### Best Voices for Hypnosis:

**1. Rachel (Female, Calm)**
- Natural, warm, soothing
- Perfect for: Sleep induction, body acceptance
- Demo: https://elevenlabs.io/voice-library

**2. Adam (Male, Grounding)**
- Steady, deep, reassuring
- Perfect for: Habit installation, anxiety reset

**3. Domi (Female, Gentle)**
- Soft, nurturing, non-judgmental
- Perfect for: Luteal phase support, self-compassion

**4. Antoni (Male, Warm)**
- Friendly, approachable, calm
- Perfect for: Morning activation, confidence building

**Recommendation**: Choose **Rachel** (female) or **Adam** (male) as Guardian's primary voice

### Voice Settings for Hypnosis:

```json
{
  "voice_id": "21m00Tcm4TlvDq8ikWAM",  // Rachel
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.75,        // High = consistent, calm
    "similarity_boost": 0.8,  // High = true to voice
    "style": 0.3,             // Low = subtle emotion (not theatrical)
    "use_speaker_boost": true // Clearer pronunciation
  }
}
```

### Implementation (API):

```javascript
// Generate hypnosis script audio
async function generateHypnosisVoice(scriptText, voiceId = "Rachel") {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text: scriptText,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.8,
        style: 0.3,
        use_speaker_boost: true
      }
    })
  });

  const audioBlob = await response.blob();
  return audioBlob; // Save as MP3
}

// Example: Generate sleep induction
const sleepScript = `
Close your eyes. Take a deep breath.

Your body is preparing for rest. This is natural.
With each exhale, tension releases.
Your jaw unclenches. Your shoulders drop.

You are safe. Sleep will find you.
There is nothing you need to do right now.

Let go.
`;

const sleepAudio = await generateHypnosisVoice(sleepScript, "Rachel");
// Save to: /audio/sleep_induction_rachel.mp3
```

### Cost for Full Guardian Library:

**5 Core Scripts** (7 min each):
1. Luteal Phase Grounding (2,500 chars)
2. Sleep Induction (2,500 chars)
3. Habit Installation (2,500 chars)
4. Anxiety Reset (1,500 chars - shorter)
5. Body Acceptance (2,500 chars)

**Total**: ~12,000 characters = **One-time generation on Creator plan ($22)**

**Annual Cost**: $264/year for unlimited script updates

---

## Option 2: Google Cloud Text-to-Speech (Budget Option)

### Why Google Cloud:
- ✅ **Cheaper than ElevenLabs** (~$4 per 1M characters)
- ✅ **WaveNet voices** (pretty good quality)
- ✅ **Neural2 voices** (even better, almost ElevenLabs quality)
- ✅ **Multiple languages** (if we expand internationally)
- ❌ Not quite as natural as ElevenLabs

### Pricing:

| Voice Type | Cost per 1M chars | Quality |
|------------|-------------------|---------|
| **Standard** | $4.00 | Robotic |
| **WaveNet** | $16.00 | Good (natural-ish) |
| **Neural2** | $16.00 | Very Good (closest to ElevenLabs) |

**For Guardian**: Use **Neural2** voices

**Cost for 5 scripts** (12,000 chars):
- 0.012M characters × $16 = **$0.19 total**
- Essentially free for MVP

### Best Voices (Neural2):

**1. en-US-Neural2-C (Female, Calm)**
- Soothing, clear, professional
- Good for: Sleep, body acceptance

**2. en-US-Neural2-D (Male, Steady)**
- Deep, grounding, reassuring
- Good for: Habit installation, anxiety

**3. en-US-Neural2-F (Female, Warm)**
- Gentle, nurturing
- Good for: Luteal support, self-compassion

### Implementation (API):

```javascript
// Google Cloud TTS
async function generateGoogleVoice(scriptText, voiceName = "en-US-Neural2-C") {
  const {TextToSpeechClient} = require('@google-cloud/text-to-speech');
  const client = new TextToSpeechClient();

  const request = {
    input: {text: scriptText},
    voice: {
      languageCode: 'en-US',
      name: voiceName,
      ssmlGender: 'FEMALE'  // or 'MALE'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.85,  // Slower for hypnosis
      pitch: -2.0,         // Slightly lower (calming)
      effectsProfileId: ['headphone-class-device']  // Optimized for headphones
    }
  };

  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent; // Save as MP3
}
```

### Cost Comparison:

**5 Scripts (12,000 chars)**:
- ElevenLabs Creator: $22/month (100k chars total)
- Google Neural2: $0.19 one-time
- **Savings**: $263/year

**Trade-off**:
- ElevenLabs = More natural, better for repeated listening
- Google Neural2 = 90% as good, way cheaper

---

## Option 3: Azure Speech Service (Middle Ground)

### Why Azure:
- ✅ **Neural voices** (comparable to Google)
- ✅ **Affordable** (~$15 per 1M chars)
- ✅ **Low latency** (good for real-time generation)
- ✅ **SSML support** (fine control over pacing, pauses)

### Pricing:
- Neural voices: $15 per 1M characters
- **5 scripts (12k chars)**: $0.18 total

### Best Voices:

**1. en-US-JennyNeural (Female)**
- Warm, conversational, natural
- Good all-around voice

**2. en-US-GuyNeural (Male)**
- Calm, steady, professional

### Implementation:

```javascript
const sdk = require("microsoft-cognitiveservices-speech-sdk");

async function generateAzureVoice(scriptText, voiceName = "en-US-JennyNeural") {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_REGION
  );

  speechConfig.speechSynthesisVoiceName = voiceName;

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  // Use SSML for better control
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
      <voice name="${voiceName}">
        <prosody rate="0.85" pitch="-2st">
          ${scriptText}
        </prosody>
      </voice>
    </speak>
  `;

  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(ssml,
      result => {
        synthesizer.close();
        resolve(result.audioData);
      },
      error => {
        synthesizer.close();
        reject(error);
      }
    );
  });
}
```

---

## Option 4: Web Speech API (Free, Built-in Browser)

### Why Web Speech:
- ✅ **Free** (no API costs)
- ✅ **Built into browsers** (no external dependency)
- ✅ **Works offline** (once loaded)
- ❌ **Very robotic** (sounds like Siri)
- ❌ **Not suitable for hypnosis** (breaks immersion)

**Verdict**: ❌ Don't use for hypnosis (too robotic)

---

## Recommendation for Guardian MVP

### Strategy: Hybrid Approach

**Phase 1: Launch with Google Cloud Neural2** ($0.19 one-time)
- Generate 5 core scripts with Google Neural2-C (female voice)
- Save as MP3 files, serve from app
- **Why**: Cheapest to start, good quality, no monthly fees

**Phase 2: Upgrade to ElevenLabs** (after first 100 users)
- Once validated, regenerate scripts with ElevenLabs Rachel
- **Why**: Premium experience for paying users
- Cost: $22/month Creator plan

**Phase 3: User Choice** (future feature)
- Let user choose voice: Rachel (female) or Adam (male)
- Let user choose speed: Normal (1.0x) or Slow (0.85x)
- **Why**: Personalization increases engagement

---

## Voice Settings for Hypnosis (Universal)

**Optimal TTS Settings**:
- **Speaking Rate**: 0.85x (15% slower than normal)
- **Pitch**: -2 semitones (slightly lower = calming)
- **Pause Length**: 1.5-2 seconds between sentences
- **Volume**: Normalize to -16 LUFS (consistent loudness)

**Why These Settings Work**:
- Slower rate = easier to follow in trance state
- Lower pitch = activates parasympathetic (calming)
- Longer pauses = breathing rhythm sync
- Consistent volume = no jarring changes

---

## Script Generation Workflow

### Step 1: Write Script with Pauses

```
Close your eyes.
[PAUSE 2s]

Take a deep breath in for five... two, three, four, five.
[PAUSE 1s]

Hold for five... two, three, four, five.
[PAUSE 1s]

Exhale for five... two, three, four, five.
[PAUSE 2s]

Your body is now in resonance.
[PAUSE 2s]

You are becoming someone who honors your rhythm.
[PAUSE 3s]
```

### Step 2: Convert to SSML (for better control)

```xml
<speak>
  Close your eyes.
  <break time="2s"/>

  Take a deep breath in for five
  <break time="500ms"/>
  two, three, four, five.
  <break time="1s"/>

  Hold for five
  <break time="500ms"/>
  two, three, four, five.
  <break time="1s"/>

  Exhale for five
  <break time="500ms"/>
  two, three, four, five.
  <break time="2s"/>

  <prosody rate="0.85" pitch="-2st">
    Your body is now in resonance.
  </prosody>
  <break time="2s"/>

  <prosody rate="0.85" pitch="-2st">
    You are becoming someone who honors your rhythm.
  </prosody>
  <break time="3s"/>
</speak>
```

### Step 3: Generate Audio

```bash
# Google Cloud (cheapest)
node scripts/generate-voice-google.js

# ElevenLabs (best quality)
node scripts/generate-voice-elevenlabs.js

# Output: /public/audio/luteal_grounding_v1.mp3
```

### Step 4: Post-Processing (Optional)

**Add binaural beat background**:
```bash
# Mix TTS voice with theta wave
ffmpeg -i luteal_grounding_voice.mp3 -i theta_6hz.mp3 \
  -filter_complex "[0:a]volume=0.8[voice];[1:a]volume=0.2[beat];[voice][beat]amix=inputs=2:duration=longest" \
  luteal_grounding_final.mp3
```

---

## Cost Breakdown for Full Guardian Library

### 5 Core Scripts (7 min each, ~2,500 chars):

| Script | Characters | ElevenLabs | Google | Azure |
|--------|------------|------------|--------|-------|
| Luteal Grounding | 2,500 | $0.05 | $0.04 | $0.04 |
| Sleep Induction | 2,500 | $0.05 | $0.04 | $0.04 |
| Habit Installation | 2,500 | $0.05 | $0.04 | $0.04 |
| Anxiety Reset | 1,500 | $0.03 | $0.02 | $0.02 |
| Body Acceptance | 2,500 | $0.05 | $0.04 | $0.04 |
| **TOTAL** | **12,000** | **$22/mo** | **$0.19** | **$0.18** |

**Winner**: Google Cloud Neural2 for MVP (basically free)

### If We Add 10 More Scripts (Expansion):

| Total Scripts | Characters | ElevenLabs | Google | Azure |
|---------------|------------|------------|--------|-------|
| 15 scripts | 36,000 | $22/mo | $0.58 | $0.54 |
| 30 scripts | 72,000 | $22/mo | $1.15 | $1.08 |
| 50 scripts | 120,000 | $99/mo (Pro) | $1.92 | $1.80 |

**Break-even point**: If you need >500k chars/month, ElevenLabs Pro ($99) becomes competitive

---

## Voice Cloning (Advanced Feature)

### ElevenLabs Voice Cloning:
**Create Guardian's unique voice**:
- Upload 1-2 min of sample audio (your voice or hired voice actor)
- ElevenLabs clones it
- Generate all scripts in that consistent voice
- **Cost**: Available on Creator plan ($22/mo)

**Use Case**:
- Hire a voice actor to record "Hello, I'm Guardian"
- Clone that voice
- Generate all 50 scripts in identical voice
- **Result**: Consistent brand voice across all content

**Alternative**:
- Record YOUR voice (founder)
- Clone it with ElevenLabs
- Guardian speaks in your voice
- **Result**: Authentic, personal touch

---

## Recommended Setup for Guardian

### MVP (Month 1-3):

1. **Generate 5 scripts with Google Cloud Neural2**
   - Cost: $0.19 one-time
   - Voice: en-US-Neural2-C (female)
   - Settings: 0.85x speed, -2 pitch

2. **Save as static MP3 files**
   - `/public/audio/luteal_grounding.mp3`
   - `/public/audio/sleep_induction.mp3`
   - `/public/audio/habit_installation.mp3`
   - `/public/audio/anxiety_reset.mp3`
   - `/public/audio/body_acceptance.mp3`

3. **User plays preset TTS** (before they record their own)
   - "Try Guardian's voice first"
   - Then unlock "Record in YOUR voice"

### Growth (Month 4-12):

1. **Upgrade to ElevenLabs Creator** ($22/mo)
   - Regenerate all scripts with Rachel voice
   - Add 5-10 more scripts (Silva countdown, Gateway breathing guide, etc.)
   - Clone a professional voice actor's voice

2. **User choice**:
   - Rachel (female) or Adam (male)
   - Normal (1.0x) or Slow (0.85x)

### Scale (Year 2+):

1. **ElevenLabs Pro** ($99/mo)
   - 50+ scripts in library
   - Multiple languages (Spanish, French, etc.)
   - User can generate custom scripts (type text → instant TTS)

---

## Legal Note: Voice Licensing

**ElevenLabs**: ✅ Commercial use allowed (Creator plan+)
**Google Cloud**: ✅ Commercial use allowed
**Azure**: ✅ Commercial use allowed

**But**: Check ToS if you're cloning a voice
- Your own voice: ✅ OK
- Voice actor you hired: ✅ OK (get signed release)
- Celebrity voice: ❌ NOT OK (even with ElevenLabs cloning)

---

## Final Recommendation

### **Start with Google Cloud Neural2** ($0.19)
- Generate 5 core scripts
- Test with users
- Zero monthly cost

### **Upgrade to ElevenLabs** ($22/mo when revenue starts)
- Once you have 50+ paying users
- Premium voice = premium experience
- Worth the cost for retention

### **Voice Options**:
1. Google Neural2-C (female) - MVP
2. ElevenLabs Rachel (female) - Premium
3. ElevenLabs Adam (male) - Alternative voice

---

Want me to:
1. Write the 5 core hypnosis scripts (ready for TTS)?
2. Create the TTS generation script (Node.js)?
3. Set up the audio integration in the hypnosis screen?

Pick one and I'll build it!
