# Guardian Tech Stack Decision

## Option 1: Web App (Progressive Web App)
**Pros:**
- ✅ Faster to build (2-3 days for MVP)
- ✅ Works on all devices (no app store approval)
- ✅ Easy to iterate and test
- ✅ Can reuse OKComputer code
- ✅ Self-hypnosis easier (Web Audio API, MediaRecorder API)
- ✅ Deploy to glowchi.app or koreanbeauty.com subdomain

**Cons:**
- ❌ Not "native" feeling
- ❌ Push notifications harder (but doable with PWA)
- ❌ Less "sticky" (no app icon by default, until installed)

**Tech:**
- React (or vanilla JS to start)
- Web Audio API (for playback)
- MediaRecorder API (for user voice recording)
- LocalStorage/IndexedDB (for data)
- Service Worker (for offline, PWA)

---

## Option 2: React Native App (Mobile-First)
**Pros:**
- ✅ Native app feeling
- ✅ Push notifications built-in
- ✅ App store presence (credibility)
- ✅ Can integrate with glowchi-app codebase you already have

**Cons:**
- ❌ Slower to build (1-2 weeks for MVP)
- ❌ App store approval process (Apple can reject)
- ❌ Need to maintain iOS + Android
- ❌ Harder to test (need simulators/devices)

**Tech:**
- React Native + Expo (you already have this setup)
- expo-av (for audio playback/recording)
- AsyncStorage (for data)
- expo-notifications (for reminders)

---

## Option 3: Hybrid (Web MVP → React Native Later)
**Strategy:**
1. **Week 1-2:** Build web app (validate concept)
2. **Week 3:** User testing, iterate
3. **Week 4:** If validated, port to React Native

**This is the smart approach:**
- Test fast with web
- Don't waste time on native if concept doesn't work
- Reuse React components when porting

---

## Self-Hypnosis: The Tricky Part

You're absolutely right - this is the core differentiator and the hardest part.

### Approach A: Preset Hypnosis Tapes (Easier MVP)

**How it works:**
1. 5-7 professionally written scripts
2. Text-to-Speech (TTS) generation
3. Pre-rendered audio files (MP3)
4. User just hits play

**Pros:**
- ✅ Fast to implement (1 day)
- ✅ Consistent quality
- ✅ Works offline (files cached)

**Cons:**
- ❌ Not personalized
- ❌ TTS voice can sound robotic
- ❌ Less effective than user's own voice

**Implementation:**
```javascript
// Preset scripts
const scripts = {
  luteal_grounding: {
    title: "Luteal Phase Grounding",
    duration: "7 min",
    audioFile: "/audio/luteal_grounding.mp3",
    transcript: "Close your eyes. Notice your body..."
  },
  anxiety_reset: {
    title: "90-Second Anxiety Reset",
    duration: "90 sec",
    audioFile: "/audio/anxiety_reset.mp3"
  }
};

// Simple playback
function playHypnosis(scriptId) {
  const audio = new Audio(scripts[scriptId].audioFile);
  audio.play();
}
```

**TTS Options:**
1. **ElevenLabs** - Most natural ($5-30/month)
2. **Google Cloud TTS** - Good quality (~$4/1M chars)
3. **Web Speech API** - Free but robotic
4. **AWS Polly** - Decent quality (~$4/1M chars)

---

### Approach B: User's Own Voice (GENIUS Idea)

**Why this is brilliant:**
- Your subconscious trusts YOUR voice more than any other
- Fully personalized to your needs
- You can adapt scripts on the fly
- Deep sense of ownership

**How it works:**
1. **Script Template** - Guardian provides a template
2. **User Records** - Record their voice reading it
3. **Audio Stored** - Save locally (or cloud)
4. **Playback** - Listen to their own hypnosis

**Example Flow:**
```
┌─────────────────────────────────────┐
│  Create Your Own Hypnosis           │
│                                     │
│  1. Choose Template:                │
│     [Luteal Grounding]              │
│     [Anxiety Reset]                 │
│     [Sleep Induction]               │
│                                     │
│  2. Customize Script:               │
│     "Close your eyes. Notice        │
│      your body feels heavier        │
│      right now—that's               │
│      progesterone..."               │
│                                     │
│     [Edit Script]                   │
│                                     │
│  3. Record Your Voice:              │
│     🎙️ [Press to Record]            │
│     Read the script slowly,         │
│     in a calm, soothing tone        │
│                                     │
│  4. Listen & Adjust:                │
│     ▶️ [Play Recording]              │
│     [Re-record] [Save]              │
└─────────────────────────────────────┘
```

**Technical Implementation (Web):**

```javascript
// MediaRecorder API (works in all modern browsers)
class VoiceHypnosisRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      this.saveRecording(audioBlob);
    };

    this.mediaRecorder.start();
  }

  stopRecording() {
    this.mediaRecorder.stop();
  }

  saveRecording(audioBlob) {
    // Save to IndexedDB (offline support)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result;
      localStorage.setItem('hypnosis_luteal', base64Audio);
    };
    reader.readAsDataURL(audioBlob);
  }

  playRecording(scriptId) {
    const base64Audio = localStorage.getItem(`hypnosis_${scriptId}`);
    const audio = new Audio(base64Audio);
    audio.play();
  }
}
```

**Challenges:**
- **Storage:** Audio files are large (7 min = ~5-10 MB)
  - Solution: LocalStorage for web (5-10 MB limit), AsyncStorage for mobile
  - Better: IndexedDB (unlimited storage)
- **Quality:** User might not have good mic
  - Solution: Provide recording tips, show waveform
- **Privacy:** Audio stored locally (good for trust)

**Hybrid Approach (Best of Both Worlds):**
1. **Start with preset TTS** (immediate use)
2. **Unlock user recording** at Day 7 (habit established)
3. **Let users choose** preset vs their voice

---

## Recommended Path: Web App + Hybrid Hypnosis

### Phase 1: Web MVP (Week 1)
**Build:**
- React app (or vanilla JS for speed)
- Cycle tracking
- Atmosphere selector
- Habit builder (Atomic Habits)
- Thread visualization
- Guardian states

**Self-Hypnosis V1:**
- 3 preset scripts (TTS audio)
- Simple play/pause interface
- Text transcript shown during playback

**Deploy:**
- guardian.koreanbeauty.com
- PWA support (installable)

### Phase 2: User Voice Recording (Week 2)
**Add:**
- Recording interface
- Script templates (editable)
- Audio storage (IndexedDB)
- Playback from user's voice

### Phase 3: Polish & Test (Week 3)
**Refine:**
- Animation polish
- User feedback integration
- Analytics (which scripts used most?)

### Phase 4: React Native Port (Week 4-5, if validated)
**Port to mobile:**
- Reuse React components
- Native audio APIs
- App store submission

---

## Self-Hypnosis Script Examples

Let me create actual scripts you can use:

### Script 1: Luteal Phase Grounding (7 min)

```
[Soft tone, slow pace]

Close your eyes.

Take a deep breath in... and out.

If you're in your luteal phase right now, you might notice
your body feels heavier. That's progesterone. This is not
weakness. This is your body preparing for rest.

Imagine roots growing from the soles of your feet, deep into
the earth. With each exhale, those roots grow deeper. You are
grounded. You are held.

[Continue for 7 minutes with progressive muscle relaxation]
```

### Script 2: 90-Second Anxiety Reset

```
[Calm but energized tone]

Pause. Just for 90 seconds.

Notice where you feel the anxiety. Is it your chest? Your
throat? Your stomach?

Don't fight it. Just notice it.

Now, take the deepest breath you've taken all day. Hold it
for 4 counts. 1... 2... 3... 4.

Exhale slowly for 6 counts. 1... 2... 3... 4... 5... 6.

[Repeat 3 times]

That tightness? It's starting to soften. You're okay. This
moment is safe.
```

### Script 3: Habit Installation (Before Sleep)

```
[Very slow, drowsy tone]

You're becoming someone who [USER'S HABIT].

Tomorrow morning, when you [CUE], you will naturally
[BEHAVIOR]. It will feel easy. It will feel right.

This is who you are now. Someone who [IDENTITY].

See yourself tomorrow, doing this habit effortlessly. Watch
yourself [BEHAVIOR]. Feel how good it feels.

[Repeat visualization 3 times, then drift to sleep]
```

---

## My Recommendation

**Start with:**
1. ✅ Web app (React or vanilla JS)
2. ✅ Preset TTS hypnosis (3 scripts)
3. ✅ Add user recording in Phase 2

**Why:**
- Validate concept fast (web = 3 days vs mobile = 2 weeks)
- TTS is good enough for MVP (can improve later)
- User voice recording = killer feature for Phase 2

**Then:**
- If users love it → Port to React Native
- If users want better voice → Use ElevenLabs
- If users want customization → Add recording feature

---

## Next Steps

**Option A: Build Web MVP Now**
I can start building:
1. React app skeleton
2. Cycle calendar + thread viz
3. Atmosphere + Offering selectors
4. Guardian responsive states
5. Simple audio player (TTS scripts)

**Option B: Design First**
Let me create:
1. Full UI mockup (Figma-style in HTML)
2. Self-hypnosis script library (5-7 scripts written)
3. User recording flow (wireframes)

**Option C: Research First**
Let me:
1. Find best TTS service (test quality)
2. Test MediaRecorder API (user voice recording)
3. Research hypnosis script effectiveness

Which approach do you want?
