# Guardian Voice Cloning Integration Plan

**Open-source, on-device voice cloning for personalized hypnosis**

---

## Executive Summary

Based on analysis of 5 open-source voice cloning tools, the **recommended architecture** for Guardian is:

1. **Phase 1 (MVP)**: Use **Piper** for on-device TTS with pre-trained voices
2. **Phase 2**: Add **Applio** for voice conversion (user's voice)
3. **Phase 3**: Upgrade to **F5-TTS** for premium voice cloning

This provides a migration path from fast/simple → personalized → premium quality.

---

## Tool Comparison Matrix

| Tool | License | Mobile Ready | Quality | Training Ease | Model Size | Best For |
|------|---------|--------------|---------|---------------|------------|----------|
| **Piper** | MIT | ✅ Excellent | Good | Easy | 5-20 MB | MVP, offline TTS |
| **Applio** | MIT | ⚠️ Moderate | Excellent | Very Easy | 30-90 MB | Voice conversion |
| **F5-TTS** | MIT | ⚠️ Difficult | Excellent | Moderate | 200+ MB | Premium cloning |
| **Chatterbox** | MIT | ⚠️ Difficult | Excellent | Moderate | 350 MB+ | Server-side |
| **OpenVoice** | MIT | ❌ Server only | Excellent | Difficult | 500 MB+ | Multilingual |

**Key**:
- ✅ Excellent = Runs natively on mobile, proven in production
- ⚠️ Moderate = Possible with optimization, requires native code
- ❌ Server only = Too heavy for mobile, cloud deployment required

---

## Recommended Architecture: 3-Phase Rollout

### Phase 1: Piper (MVP - Week 1-2)

**Why Piper First**:
- Already runs on Android/iOS (SherpaTTS proves this)
- Smallest footprint (5-20 MB models)
- No internet required after model download
- MIT licensed, commercially safe
- C++ runtime = fast inference on mobile

**Implementation**:

```yaml
User Flow:
  1. User opens Guardian app
  2. App downloads 1 pre-trained Piper voice (20 MB, one-time)
  3. User selects hypnosis script (e.g., "Luteal Grounding")
  4. App generates audio on-device using Piper
  5. Audio mixed with binaural beats
  6. User listens to personalized session

Tech Stack:
  - Flutter app with FFI to call Piper C++ library
  - Pre-trained voice: "en_US-lessac-medium" (female, calm)
  - Model stored in app documents directory
  - Audio mixing: just_audio + audioplayers packages
```

**Piper Integration (Flutter)**:

```dart
// pubspec.yaml
dependencies:
  ffi: ^2.0.0
  path_provider: ^2.0.0
  just_audio: ^0.9.0

// lib/services/piper_tts.dart
import 'dart:ffi';
import 'dart:io';
import 'package:ffi/ffi.dart';
import 'package:path_provider/path_provider.dart';

class PiperTTS {
  late DynamicLibrary _piperLib;

  // Load Piper native library
  Future<void> initialize() async {
    if (Platform.isAndroid) {
      _piperLib = DynamicLibrary.open('libpiper.so');
    } else if (Platform.isIOS) {
      _piperLib = DynamicLibrary.process();
    }
  }

  // Generate speech from text
  Future<File> synthesize(String text, String scriptId) async {
    final appDir = await getApplicationDocumentsDirectory();
    final modelPath = '${appDir.path}/models/en_US-lessac-medium.onnx';
    final outputPath = '${appDir.path}/audio/generated_$scriptId.wav';

    // Call Piper C++ function
    // piper_synthesize(text, model_path, output_path)
    final textPtr = text.toNativeUtf8();
    final modelPtr = modelPath.toNativeUtf8();
    final outputPtr = outputPath.toNativeUtf8();

    final synthesizeFunc = _piperLib.lookupFunction<
      Int32 Function(Pointer<Utf8>, Pointer<Utf8>, Pointer<Utf8>),
      int Function(Pointer<Utf8>, Pointer<Utf8>, Pointer<Utf8>)
    >('piper_synthesize');

    final result = synthesizeFunc(textPtr, modelPtr, outputPtr);

    malloc.free(textPtr);
    malloc.free(modelPtr);
    malloc.free(outputPtr);

    if (result != 0) {
      throw Exception('Piper synthesis failed');
    }

    return File(outputPath);
  }
}

// Usage in hypnosis screen
class HypnosisScreen extends StatefulWidget {
  @override
  _HypnosisScreenState createState() => _HypnosisScreenState();
}

class _HypnosisScreenState extends State<HypnosisScreen> {
  final PiperTTS _tts = PiperTTS();
  final AudioPlayer _player = AudioPlayer();

  @override
  void initState() {
    super.initState();
    _tts.initialize();
  }

  Future<void> generateAndPlay(String scriptText, String scriptId) async {
    // 1. Generate speech with Piper
    final audioFile = await _tts.synthesize(scriptText, scriptId);

    // 2. Mix with binaural beats (optional)
    final mixedFile = await _mixWithBinauralBeats(audioFile, 6.0); // 6 Hz theta

    // 3. Play
    await _player.setFilePath(mixedFile.path);
    await _player.play();
  }

  Future<File> _mixWithBinauralBeats(File voiceFile, double frequency) async {
    // Use ffmpeg or audio mixing library
    // For now, return voice file as-is
    return voiceFile;
  }
}
```

**Piper Model Download** (one-time setup):

```dart
// lib/services/model_downloader.dart
class ModelDownloader {
  static const String PIPER_MODEL_URL =
    'https://github.com/rhasspy/piper/releases/download/v1.2.0/en_US-lessac-medium.onnx';

  Future<void> downloadPiperModel() async {
    final appDir = await getApplicationDocumentsDirectory();
    final modelDir = Directory('${appDir.path}/models');
    await modelDir.create(recursive: true);

    final modelFile = File('${modelDir.path}/en_US-lessac-medium.onnx');

    if (await modelFile.exists()) {
      print('Model already downloaded');
      return;
    }

    print('Downloading Piper model (20 MB)...');
    final response = await http.get(Uri.parse(PIPER_MODEL_URL));
    await modelFile.writeAsBytes(response.bodyBytes);
    print('Model downloaded successfully');
  }
}
```

**Pros of Phase 1**:
- ✅ Works offline immediately
- ✅ No API costs
- ✅ Fast implementation (1-2 weeks)
- ✅ Proven on mobile (SherpaTTS)

**Cons**:
- ❌ Not user's own voice (yet)
- ❌ Quality good but not amazing
- ❌ Fixed voice (can't customize)

---

### Phase 2: Applio Voice Conversion (User's Voice - Week 3-6)

**Why Applio Next**:
- Easiest path to user's own voice
- Voice conversion is lighter than full TTS
- Can use Piper as base TTS, then convert to user's voice
- RVC models are small (30-90 MB)
- Training requires only 5-10 minutes of user audio

**Implementation**:

```yaml
User Flow:
  1. User completes onboarding
  2. App prompts: "Record your voice for personalization (optional)"
  3. User records 20 sentences (5-10 min total audio)
  4. App uploads recordings to training server (one-time)
  5. Server trains RVC model using Applio (~10 min processing)
  6. App downloads user's voice model (30-90 MB)
  7. For each hypnosis session:
     a. Generate base audio with Piper
     b. Convert to user's voice with RVC model (on-device)
     c. Mix with binaural beats
     d. Play

Tech Stack:
  - Training: Python backend with Applio (DigitalOcean Droplet, $6/mo)
  - Inference: RVC model via ONNX Runtime on mobile
  - Storage: User's model stored locally, optionally backed up
```

**Recording Prompts** (for voice training):

```javascript
// 20 sentences to capture user's voice characteristics
const VOICE_TRAINING_PROMPTS = [
  // Warm-up (3 sentences)
  "Close your eyes and take a deep breath.",
  "You are safe. Your body knows what it needs.",
  "Let yourself relax completely.",

  // Hypnosis phrases (10 sentences)
  "Five... feel your body beginning to relax.",
  "Four... your breath slows to its natural rhythm.",
  "Three... thoughts begin to quiet.",
  "Two... you are entering your inner sanctuary.",
  "One... you are now in alpha.",
  "Imagine a screen about six feet in front of you.",
  "Your luteal phase is wisdom, not weakness.",
  "You are becoming someone who honors your rhythm.",
  "This feeling is temporary. You are safe right now.",
  "Your body is not broken. Your cycle is brilliant.",

  // Varied intonation (7 sentences)
  "Every day, in every way, I'm getting better and better.",
  "Inhale for five. One, two, three, four, five.",
  "You can handle this. You've got this.",
  "Sleep will find you. It always does.",
  "This is not weakness. This is biology.",
  "Step into the right mirror. This is your reality now.",
  "Open your eyes. You are fully present and at peace."
];
```

**Voice Training Backend** (Applio server):

```python
# server/train_voice.py
from applio import VoiceConverter
import os

def train_user_voice(user_id, audio_files):
    """Train RVC model on user's voice recordings"""

    # 1. Prepare training data
    training_dir = f'/tmp/training_{user_id}'
    os.makedirs(training_dir, exist_ok=True)

    for i, audio_file in enumerate(audio_files):
        audio_file.save(f'{training_dir}/recording_{i}.wav')

    # 2. Train RVC model with Applio
    converter = VoiceConverter()
    model_path = converter.train(
        name=f'user_{user_id}',
        training_dir=training_dir,
        epochs=300,  # ~10 min training on GPU
        batch_size=8
    )

    # 3. Export optimized model for mobile
    converter.export_onnx(
        model_path=model_path,
        output_path=f'/models/user_{user_id}.onnx'
    )

    return f'user_{user_id}.onnx'

# Flask API endpoint
from flask import Flask, request, send_file
app = Flask(__name__)

@app.route('/api/train-voice', methods=['POST'])
def train_voice_endpoint():
    user_id = request.form['user_id']
    audio_files = request.files.getlist('recordings')

    # Train model
    model_filename = train_user_voice(user_id, audio_files)

    # Return download link
    return {
        'success': True,
        'model_url': f'/api/download-model/{user_id}'
    }

@app.route('/api/download-model/<user_id>')
def download_model(user_id):
    model_path = f'/models/user_{user_id}.onnx'
    return send_file(model_path, as_attachment=True)
```

**Voice Conversion on Mobile** (RVC inference):

```dart
// lib/services/voice_converter.dart
class VoiceConverter {
  late InferenceSession _rvcSession;

  Future<void> loadUserModel(String userId) async {
    final appDir = await getApplicationDocumentsDirectory();
    final modelPath = '${appDir.path}/models/user_$userId.onnx';

    // Load RVC model with ONNX Runtime
    _rvcSession = InferenceSession.fromPath(modelPath);
  }

  Future<File> convertToUserVoice(File baseAudio) async {
    // 1. Load base audio (from Piper)
    final audioData = await _loadAudioData(baseAudio);

    // 2. Run RVC inference
    final inputs = {
      'audio': audioData,
      'f0_method': 'harvest', // pitch detection
    };

    final outputs = _rvcSession.run(inputs);
    final convertedAudio = outputs['audio'];

    // 3. Save converted audio
    final outputPath = '${baseAudio.parent.path}/converted_${baseAudio.uri.pathSegments.last}';
    await _saveAudioData(convertedAudio, outputPath);

    return File(outputPath);
  }
}

// Updated HypnosisScreen with voice conversion
class _HypnosisScreenState extends State<HypnosisScreen> {
  final PiperTTS _tts = PiperTTS();
  final VoiceConverter _converter = VoiceConverter();
  final AudioPlayer _player = AudioPlayer();

  Future<void> generateAndPlay(String scriptText, String scriptId) async {
    // 1. Generate base speech with Piper
    final baseAudio = await _tts.synthesize(scriptText, scriptId);

    // 2. Convert to user's voice (if model available)
    File finalAudio = baseAudio;
    if (await _hasUserVoiceModel()) {
      finalAudio = await _converter.convertToUserVoice(baseAudio);
    }

    // 3. Mix with binaural beats
    final mixedAudio = await _mixWithBinauralBeats(finalAudio, 6.0);

    // 4. Play
    await _player.setFilePath(mixedAudio.path);
    await _player.play();
  }
}
```

**Pros of Phase 2**:
- ✅ User's actual voice (10x more powerful)
- ✅ Moderate model size (30-90 MB)
- ✅ Fast inference (2-3 seconds conversion on-device)
- ✅ Privacy-preserving (model stored locally)

**Cons**:
- ⚠️ Requires training server ($6/mo DigitalOcean)
- ⚠️ User must record 20 sentences (10 min onboarding)
- ⚠️ Conversion quality depends on training data

---

### Phase 3: F5-TTS (Premium - Month 3-6)

**Why F5-TTS for Premium**:
- Best quality voice cloning (comparable to ElevenLabs)
- Zero-shot capability (clone from 30 seconds of audio)
- ONNX runtime available (mobile-optimized)
- MIT licensed

**Implementation**:

```yaml
User Flow (Premium Tier):
  1. User upgrades to Guardian Pro ($4.99/mo)
  2. Records just 30 seconds of voice (vs. 10 min for Applio)
  3. F5-TTS fine-tunes on server
  4. App downloads optimized model (150-200 MB)
  5. Direct TTS generation in user's voice (no conversion step)
  6. Higher quality, more natural prosody

Tech Stack:
  - Training: F5-TTS on GPU server (AWS g4dn.xlarge, spot instance)
  - Inference: Quantized ONNX model on mobile (8-bit)
  - Fallback: If model too large, run on server and stream audio
```

**Pros of Phase 3**:
- ✅ Highest quality voice cloning
- ✅ Minimal recording needed (30 sec)
- ✅ Natural prosody and emotion
- ✅ Direct TTS (no conversion step)

**Cons**:
- ❌ Large model size (150-200 MB even quantized)
- ❌ Slower inference (5-10 sec on-device)
- ❌ Requires premium tier to justify GPU costs

---

## Cost Comparison

### Piper (Phase 1)

| Item | Cost |
|------|------|
| Model hosting | $0 (included in app) |
| Inference | $0 (on-device) |
| Maintenance | $0 |
| **Total** | **$0/month** |

### Applio (Phase 2)

| Item | Cost |
|------|------|
| Training server | $6/month (DigitalOcean Droplet) |
| Model storage | $0.50/month (S3 for backups) |
| Inference | $0 (on-device) |
| **Total** | **$6.50/month** |

**Per-user cost**: ~$0.10 one-time training cost

### F5-TTS (Phase 3 - Premium)

| Item | Cost |
|------|------|
| Training (GPU) | $0.50/user (spot instance) |
| Inference | $0 (on-device) or $0.01/session (server) |
| Model storage | $1/month (larger models) |
| **Total** | **$1/month + $0.50/user** |

**Revenue model**: Charge $4.99/month for Pro tier, covers costs

---

## Recommended MVP: Piper + Applio Hybrid

**Week 1-2: Piper Foundation**
- Integrate Piper TTS into Flutter app
- Download pre-trained voice model
- Generate hypnosis scripts on-device
- Mix with binaural beats

**Week 3-4: Voice Recording UI**
- Build recording interface
- 20 sentence prompts
- Upload to training server

**Week 5-6: Applio Integration**
- Set up training backend
- Implement RVC inference on mobile
- Test voice conversion quality

**Month 2+: Polish & Expand**
- Add more voices (male option with Piper)
- Improve conversion quality
- Add F5-TTS for premium tier

---

## Privacy & Safety Considerations

### Data Handling

**User Voice Recordings**:
- ✅ Uploaded encrypted (TLS 1.3)
- ✅ Deleted after training (not stored on server)
- ✅ Model stored only on user's device
- ✅ Optional cloud backup (encrypted E2E)

**GDPR Compliance**:
- User owns their voice model
- Can download/delete anytime
- Training data not used for other purposes
- Clear consent before recording

### Safety Protocols (from SAFETY_PROTOCOLS.md)

**Still applies with voice cloning**:
- Template-first approach (user reads Guardian's scripts)
- No free-form recording initially
- AI content screening if user edits scripts
- Crisis resources prominently displayed

---

## Technical Implementation Notes

### Piper on Flutter

**Android**:
- Build Piper as shared library (.so)
- Include in `android/app/src/main/jniLibs/`
- Call via FFI

**iOS**:
- Build Piper as static library (.a)
- Include in Xcode project
- Call via FFI or Swift wrapper

**Example Native Bridge** (Android):

```kotlin
// android/app/src/main/kotlin/com/guardian/app/PiperBridge.kt
package com.guardian.app

import android.content.Context
import java.io.File

object PiperBridge {
    init {
        System.loadLibrary("piper")
    }

    external fun synthesize(
        text: String,
        modelPath: String,
        outputPath: String
    ): Int

    fun generateSpeech(context: Context, text: String, scriptId: String): File {
        val modelPath = "${context.filesDir}/models/en_US-lessac-medium.onnx"
        val outputPath = "${context.filesDir}/audio/generated_$scriptId.wav"

        val result = synthesize(text, modelPath, outputPath)
        if (result != 0) {
            throw RuntimeException("Piper synthesis failed")
        }

        return File(outputPath)
    }
}
```

### ONNX Runtime on Mobile

**Add to pubspec.yaml**:
```yaml
dependencies:
  onnxruntime: ^1.16.0
```

**Initialize**:
```dart
import 'package:onnxruntime/onnxruntime.dart';

final env = OrtEnv(OrtLoggingLevel.ORT_LOGGING_LEVEL_WARNING);
final sessionOptions = OrtSessionOptions();
final session = OrtSession.fromFile(modelPath, sessionOptions);
```

---

## Migration Path: Google Cloud TTS → Piper → Applio

**Week 1**: Use Google Cloud TTS (from previous guide)
- Fast to implement
- Good quality
- $0.19 cost

**Week 2-3**: Switch to Piper
- Remove Google Cloud dependency
- Download Piper model
- Test on-device generation

**Week 4-6**: Add Applio
- Build recording UI
- Set up training server
- Implement voice conversion

**Result**: Zero ongoing costs, user's own voice, full privacy

---

## Alternative: Piper Custom Voice Training

**Instead of Applio**, you can train a custom Piper voice:

1. User records 200+ sentences
2. Use Coqui TTS training pipeline
3. Export to Piper-compatible ONNX
4. Download to device

**Pros**:
- Native Piper voice (better quality than conversion)
- No conversion step needed

**Cons**:
- Requires 1-2 hours of recording
- Complex training pipeline
- Longer training time (2-4 hours on GPU)

**Verdict**: Applio is easier for MVP, Piper custom training for v2

---

## Next Steps

1. **Choose Phase 1 approach**: Piper (recommended)
2. **Set up Piper build environment**: Android NDK + iOS
3. **Integrate Piper into Flutter app**: FFI bridge
4. **Download pre-trained voice**: en_US-lessac-medium
5. **Test on-device TTS**: Generate "Luteal Grounding" script
6. **Plan Phase 2**: Design voice recording UI

---

## Resources

**Piper**:
- Repo: https://github.com/rhasspy/piper
- Docs: https://rhasspy.github.io/piper-samples/
- Android TTS Engine (reference): https://f-droid.org/packages/com.k2fsa.sherpa.onnx.tts.engine/

**Applio**:
- Repo: https://github.com/IAHispano/Applio
- RVC Training Guide: https://docs.applio.org/

**F5-TTS**:
- Repo: https://github.com/SWivid/F5-TTS
- ONNX Conversion: https://github.com/SWivid/F5-TTS/tree/onnx

**ONNX Runtime Flutter**:
- Package: https://pub.dev/packages/onnxruntime

---

**Ready to start with Piper integration? Want me to create the Flutter FFI bridge code?**
