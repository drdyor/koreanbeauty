# Serverless Voice Training for Guardian

**In-app voice cloning with pay-per-use pricing (cheapest possible)**

---

## The Problem with My Original Recommendation

**What I suggested**: DigitalOcean Droplet with GPU ($6-50/month)

**Why it's wrong for MVP**:
- ❌ Pays $6/month even if 0 users train
- ❌ Pays $6/month if 1 user trains
- ❌ Pays $6/month if 100 users train
- ❌ Fixed cost regardless of usage

**What you actually need**: Pay **only when someone trains** their voice

---

## Serverless GPU Options (Pay-Per-Second)

### Option 1: RunPod Serverless (CHEAPEST) ⭐

**Pricing**:
- RTX 4090: $0.39/hour = **$0.0065/minute**
- 10 min training = **$0.065 per user**
- No monthly fee, scales to zero

**Cost examples**:
```
10 users train:   10 × $0.065 = $0.65
100 users train:  100 × $0.065 = $6.50
1000 users train: 1000 × $0.065 = $65
```

**vs. DigitalOcean Droplet**:
```
Year 1 cost (DigitalOcean): $72 (even if 0 users!)
Year 1 cost (RunPod): $6.50 (if 100 users train)

Savings: $65.50
```

**Setup**:
```yaml
1. Create RunPod Serverless endpoint
2. Deploy Applio Docker container
3. Guardian app calls webhook with user recordings
4. RunPod spins up GPU, trains model, returns .onnx
5. GPU shuts down automatically
6. You pay only for those 10 minutes
```

**Pros**:
- ✅ Cheapest option for MVP (10-100 users)
- ✅ Zero cost when idle
- ✅ Fast GPU (RTX 4090)
- ✅ Simple API (just POST audio, get model back)

**Cons**:
- ⚠️ Cold start: 20-30 sec to spin up GPU first time
- ⚠️ Requires Docker setup

---

### Option 2: Modal (Second Cheapest)

**Pricing**:
- A100 GPU: $1.10/hour = **$0.018/minute**
- 10 min training = **$0.18 per user**
- No monthly fee, generous free tier

**Cost examples**:
```
10 users:   10 × $0.18 = $1.80
100 users:  100 × $0.18 = $18
1000 users: 1000 × $0.18 = $180
```

**Setup**:
```python
# modal_train.py
import modal

stub = modal.Stub("guardian-voice-training")

@stub.function(
    gpu="A100",
    image=modal.Image.debian_slim().pip_install("applio"),
    timeout=600  # 10 min max
)
def train_voice(audio_files: list[bytes]) -> bytes:
    """Train RVC model on user's voice"""
    from applio import VoiceConverter

    # Train model
    converter = VoiceConverter()
    model = converter.train(audio_files, epochs=300)

    # Export to ONNX
    onnx_bytes = converter.export_onnx(model)
    return onnx_bytes

@stub.webhook(method="POST")
def train_endpoint(audio_files: list):
    """API endpoint for Guardian app"""
    model_bytes = train_voice.call(audio_files)
    return {"model": model_bytes}
```

**Pros**:
- ✅ Very cheap for low volume
- ✅ Elegant Python API
- ✅ Free tier: $30/month credit
- ✅ Fast deployment (push code, live in 30 sec)

**Cons**:
- ⚠️ 3x more expensive than RunPod
- ⚠️ Cold start: 10-15 sec

---

### Option 3: Replicate

**Pricing**:
- A100: $0.0023/second = **$0.138/minute**
- 10 min training = **$1.38 per user**

**Too expensive** - 20x more than RunPod

---

### Option 4: Banana.dev / Baseten

**Pricing**:
- Similar to Modal (~$0.15-0.20 per training)

**Verdict**: More expensive than RunPod, less elegant than Modal

---

### Option 5: On-Device Training (FREE but impractical)

**Pricing**: $0

**How it works**:
- Train RVC model directly on user's phone
- Uses phone's CPU/GPU
- Takes 30-60 minutes
- Phone gets very hot

**Pros**:
- ✅ $0 cost
- ✅ Fully private
- ✅ No server needed

**Cons**:
- ❌ 30-60 min wait (vs 10 min on GPU)
- ❌ Drains battery
- ❌ Requires flagship phone
- ❌ Hard to implement (need to port PyTorch training to CoreML/TFLite)
- ❌ Bad UX (user can't use phone for 1 hour)

**Verdict**: Only viable for ultra-budget "advanced users" mode

---

## Recommended Architecture: RunPod Serverless

### Cost Breakdown

**Scenario 1: Small MVP (100 users, 50% train voice)**
```
Users who train: 50
Cost per training: $0.065
Total cost: 50 × $0.065 = $3.25

vs. DigitalOcean: $72/year
Savings: $68.75
```

**Scenario 2: Growing app (1000 users, 30% train)**
```
Users who train: 300
Cost per training: $0.065
Total cost: 300 × $0.065 = $19.50

vs. DigitalOcean: $72/year
Savings: $52.50
```

**Scenario 3: Break-even point**
```
DigitalOcean: $6/month = $72/year
RunPod: $0.065/user

Break-even: $72 ÷ $0.065 = 1,108 trainings/year

If you get 1,108+ voice trainings per year,
dedicated server becomes cheaper
```

**Verdict**: For MVP (Year 1), RunPod is **10x cheaper**

---

## Implementation: RunPod Serverless

### Step 1: Create RunPod Endpoint

```bash
# 1. Sign up at runpod.io
# 2. Go to Serverless → New Endpoint
# 3. Choose GPU: RTX 4090 (cheapest)
# 4. Upload Docker container (see below)
# 5. Get API endpoint URL
```

### Step 2: Create Applio Docker Container

```dockerfile
# Dockerfile
FROM nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04

# Install Python
RUN apt-get update && apt-get install -y python3.10 python3-pip

# Install Applio
RUN pip install applio torch torchaudio

# Copy training script
COPY train.py /app/train.py
WORKDIR /app

# Expose handler
CMD ["python3", "train.py"]
```

```python
# train.py (RunPod handler)
import runpod
import base64
from applio import VoiceConverter
import tempfile
import os

def train_voice_handler(event):
    """
    Receives audio files from Guardian app,
    trains RVC model, returns ONNX
    """

    # Get audio files from request
    audio_files_b64 = event['input']['audio_files']

    # Decode and save to temp files
    temp_dir = tempfile.mkdtemp()
    audio_paths = []

    for i, audio_b64 in enumerate(audio_files_b64):
        audio_bytes = base64.b64decode(audio_b64)
        path = f'{temp_dir}/recording_{i}.wav'
        with open(path, 'wb') as f:
            f.write(audio_bytes)
        audio_paths.append(path)

    # Train RVC model
    print(f"Training on {len(audio_paths)} recordings...")
    converter = VoiceConverter()
    model = converter.train(
        audio_paths=audio_paths,
        epochs=300,
        batch_size=8
    )

    # Export to ONNX
    print("Exporting to ONNX...")
    onnx_path = f'{temp_dir}/model.onnx'
    converter.export_onnx(model, onnx_path)

    # Read ONNX file and encode
    with open(onnx_path, 'rb') as f:
        onnx_bytes = f.read()
    onnx_b64 = base64.b64encode(onnx_bytes).decode()

    # Cleanup
    os.system(f'rm -rf {temp_dir}')

    return {
        "model": onnx_b64,
        "size_mb": len(onnx_bytes) / 1024 / 1024
    }

# Start RunPod handler
runpod.serverless.start({"handler": train_voice_handler})
```

### Step 3: Deploy to RunPod

```bash
# Build and push Docker image
docker build -t guardian-voice-training .
docker tag guardian-voice-training <your-dockerhub>/guardian-voice-training
docker push <your-dockerhub>/guardian-voice-training

# In RunPod dashboard:
# - New Endpoint
# - Docker Image: <your-dockerhub>/guardian-voice-training
# - GPU: RTX 4090
# - Max workers: 3 (handles concurrent trainings)
# - Idle timeout: 5 seconds (shuts down fast to save $)
```

### Step 4: Guardian App Integration (Flutter)

```dart
// lib/services/voice_training_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class VoiceTrainingService {
  static const String RUNPOD_ENDPOINT =
    'https://api.runpod.ai/v2/<your-endpoint-id>/runsync';

  static const String RUNPOD_API_KEY =
    '<your-api-key>'; // Store in env vars

  /// Train user's voice model from recordings
  Future<File> trainVoiceModel(List<File> recordings) async {
    print('Uploading ${recordings.length} recordings...');

    // 1. Convert audio files to base64
    List<String> audioBase64 = [];
    for (final recording in recordings) {
      final bytes = await recording.readAsBytes();
      audioBase64.add(base64Encode(bytes));
    }

    // 2. Call RunPod endpoint
    final response = await http.post(
      Uri.parse(RUNPOD_ENDPOINT),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $RUNPOD_API_KEY',
      },
      body: jsonEncode({
        'input': {
          'audio_files': audioBase64,
        }
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Training failed: ${response.body}');
    }

    // 3. Parse response
    final result = jsonDecode(response.body);
    final modelBase64 = result['output']['model'];
    final sizeInMB = result['output']['size_mb'];

    print('Model trained! Size: ${sizeInMB.toStringAsFixed(1)} MB');

    // 4. Save model to device
    final modelBytes = base64Decode(modelBase64);
    final appDir = await getApplicationDocumentsDirectory();
    final modelFile = File('${appDir.path}/models/user_voice.onnx');
    await modelFile.writeAsBytes(modelBytes);

    return modelFile;
  }
}
```

### Step 5: User Flow in Guardian App

```dart
// UI Flow: Voice Training Screen
class VoiceTrainingScreen extends StatefulWidget {
  @override
  _VoiceTrainingScreenState createState() => _VoiceTrainingScreenState();
}

class _VoiceTrainingScreenState extends State<VoiceTrainingScreen> {
  List<File> recordings = [];
  bool isTraining = false;
  double progress = 0.0;

  // 20 prompts from VOICE_CLONING_INTEGRATION.md
  final List<String> prompts = [
    "Close your eyes and take a deep breath.",
    "You are safe. Your body knows what it needs.",
    // ... 18 more
  ];

  Future<void> recordPrompt(int index) async {
    // Show recording UI for this prompt
    final recording = await showRecordingDialog(prompts[index]);
    setState(() {
      recordings.add(recording);
    });
  }

  Future<void> trainModel() async {
    setState({ isTraining = true });

    try {
      // Upload and train on RunPod (takes ~10 min)
      final trainingService = VoiceTrainingService();
      final modelFile = await trainingService.trainVoiceModel(recordings);

      // Success!
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: Text('✅ Voice Model Ready!'),
          content: Text('Your hypnosis sessions will now use YOUR voice.'),
          actions: [
            TextButton(
              child: Text('Try It Now'),
              onPressed: () {
                Navigator.pushNamed(context, '/hypnosis');
              },
            )
          ],
        ),
      );
    } catch (e) {
      // Show error
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: Text('Training Failed'),
          content: Text(e.toString()),
        ),
      );
    } finally {
      setState({ isTraining = false });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Train Your Voice')),
      body: Column(
        children: [
          Text('Record ${prompts.length} sentences'),
          LinearProgressIndicator(
            value: recordings.length / prompts.length,
          ),

          // Show next prompt to record
          if (recordings.length < prompts.length)
            PromptCard(
              prompt: prompts[recordings.length],
              onRecord: () => recordPrompt(recordings.length),
            ),

          // Train button (enabled when all recorded)
          if (recordings.length == prompts.length)
            ElevatedButton(
              onPressed: isTraining ? null : trainModel,
              child: isTraining
                ? CircularProgressIndicator()
                : Text('Train My Voice (10 min)'),
            ),

          // Show training progress
          if (isTraining)
            Column(
              children: [
                Text('Training your voice model...'),
                Text('This takes about 10 minutes'),
                Text('You can close the app - we\'ll notify you when done'),
              ],
            ),
        ],
      ),
    );
  }
}
```

---

## Cost Comparison: All Options

| Solution | Fixed Cost | Per-User Cost | 100 Users | 1000 Users |
|----------|-----------|---------------|-----------|------------|
| **RunPod Serverless** | $0 | $0.065 | **$6.50** | **$65** |
| **Modal** | $0 | $0.18 | $18 | $180 |
| **DigitalOcean GPU** | $50/mo | $0 | $600/yr | $600/yr |
| **DigitalOcean CPU** | $6/mo | $0 | $72/yr | $72/yr |
| **AWS SageMaker** | $0 | $0.25 | $25 | $250 |
| **On-device** | $0 | $0 | $0 | $0 |

**Winner for MVP (0-1000 users)**: **RunPod Serverless**

**Winner for scale (10,000+ users)**: Dedicated GPU server

**Winner for $0 forever**: On-device (but bad UX)

---

## Hybrid Approach: Best of Both Worlds

```yaml
Tier 1: Piper Pre-trained Voice (Free)
  - User installs app
  - Gets good-quality TTS immediately
  - Uses female calm voice (Piper Lessac)
  - Cost: $0

Tier 2: Train Your Voice (Pay-per-use)
  - User taps "Use MY Voice"
  - Records 20 sentences (10 min)
  - App uploads to RunPod
  - 10 min later, model is ready
  - Cost: $0.065 per user (we absorb this)

Tier 3: Premium Voice Cloning (Revenue)
  - User pays $2.99 one-time
  - Same RunPod training
  - We make $2.93 profit per user
  - Funds free tier for users who can't pay
```

**Economics**:
```
Scenario: 1000 users in Year 1

Free tier (70%):    700 users × $0 = $0
DIY tier (20%):     200 users × $0.065 = $13
Premium tier (10%): 100 users × $2.99 = $299

Total cost: $13
Total revenue: $299
Net: +$286

Covers:
  - RunPod costs: $13
  - Hosting (Vercel): $0 (free tier)
  - Domain: $12/year
  - Profit: $261
```

---

## Setup Timeline

**Week 1**:
- Create RunPod account
- Build Applio Docker container
- Deploy serverless endpoint
- Test with sample audio

**Week 2**:
- Build Flutter recording UI
- Integrate RunPod API
- Test end-to-end flow
- Add progress indicators

**Week 3**:
- Polish UX (recording tips, progress bar)
- Add error handling
- Test with real users

**Total setup time**: 2-3 weeks

---

## Alternative: Modal (Easier Setup)

If you want **easier deployment** and don't mind 3x cost:

```python
# Deploy in 2 minutes with Modal

import modal

stub = modal.Stub("guardian-voice")

@stub.function(
    gpu="A100",
    image=modal.Image.debian_slim()
        .pip_install("applio", "torch", "torchaudio"),
    timeout=600
)
def train_voice(audio_files: list[bytes]) -> bytes:
    from applio import VoiceConverter
    converter = VoiceConverter()
    model = converter.train(audio_files, epochs=300)
    return converter.export_onnx(model)

@stub.webhook(method="POST")
def train_endpoint(audio_files: list):
    model = train_voice.remote(audio_files)
    return {"model": model}
```

```bash
# Deploy
modal deploy train.py

# Get webhook URL
https://<your-username>--guardian-voice-train-endpoint.modal.run
```

**That's it!** No Docker, no K8s, just push Python code.

**Cost**: $0.18/user (vs $0.065 for RunPod)

**For 100 users**: $18 vs $6.50 = **$11.50 more**

**Verdict**: If you value simplicity, Modal is worth the 3x price

---

## Final Recommendation: RunPod for MVP

**Phase 1 (Week 1-2)**: Piper only
- Cost: $0
- Users get pre-trained voice immediately

**Phase 2 (Week 3-4)**: Add RunPod training
- Cost: $0.065/user who trains
- Users can record 20 sentences in-app
- Model trains in 10 min
- Works seamlessly

**Phase 3 (Month 2+)**: Optional premium tier
- Charge $2.99 for "priority training"
- Same backend, just revenue
- Profit: $2.93/user

**Total Year 1 cost** (assuming 100 users, 50% train voice):
```
RunPod: 50 × $0.065 = $3.25
Domain: $12
Hosting: $0 (Vercel free)
Total: $15.25
```

**vs. DigitalOcean GPU**: $600/year

**Savings**: $584.75 ✅

---

## Next Steps

1. **Sign up for RunPod** (free account, pay-as-you-go)
2. **Build Applio Docker container** (I can provide full code)
3. **Deploy to RunPod Serverless** (30 min setup)
4. **Integrate into Flutter app** (API call with recordings)
5. **Test with your own voice** (end-to-end validation)

Want me to create the complete RunPod setup (Dockerfile + train.py + Flutter integration)?
