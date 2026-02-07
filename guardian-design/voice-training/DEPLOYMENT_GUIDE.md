# Guardian Voice Training - Deployment Guide

**Deploy to RunPod Serverless in 30 minutes**

---

## Prerequisites

- RunPod account (https://runpod.io)
- Docker installed locally
- Docker Hub account (free)

---

## Step 1: Build Docker Image (10 min)

```bash
cd guardian-design/voice-training

# Build Docker image
docker build -t guardian-voice-training:latest .

# Tag for Docker Hub
docker tag guardian-voice-training:latest <your-dockerhub-username>/guardian-voice-training:latest

# Push to Docker Hub
docker login
docker push <your-dockerhub-username>/guardian-voice-training:latest
```

---

## Step 2: Create RunPod Serverless Endpoint (10 min)

1. Go to https://runpod.io/console/serverless
2. Click **"New Endpoint"**
3. Configure endpoint:

```yaml
Endpoint Name: guardian-voice-training
Container Image: <your-dockerhub-username>/guardian-voice-training:latest
GPU Type: RTX 4090 (cheapest)
Max Workers: 3
Idle Timeout: 5 seconds
```

4. Click **"Deploy"**
5. Wait 2-3 minutes for deployment
6. Copy the **Endpoint ID** (looks like: `abc123xyz`)

---

## Step 3: Get API Key (2 min)

1. Go to https://runpod.io/console/user/settings
2. Click **"API Keys"** tab
3. Create new API key
4. Copy the key (starts with `RUNPOD_...`)

---

## Step 4: Update Flutter App (5 min)

Edit `flutter-app/lib/services/voice_training_service.dart`:

```dart
// Replace with your endpoint ID
static const String RUNPOD_ENDPOINT =
  'https://api.runpod.ai/v2/abc123xyz/runsync';

// Replace with your API key (or use env var)
static const String RUNPOD_API_KEY = 'RUNPOD_...';
```

**Better**: Use environment variables:

```dart
// In your .env file
RUNPOD_ENDPOINT_ID=abc123xyz
RUNPOD_API_KEY=RUNPOD_...

// In code
static const String RUNPOD_ENDPOINT =
  'https://api.runpod.ai/v2/${String.fromEnvironment('RUNPOD_ENDPOINT_ID')}/runsync';
```

---

## Step 5: Add Flutter Dependencies (3 min)

Add to `pubspec.yaml`:

```yaml
dependencies:
  http: ^1.1.0
  path_provider: ^2.1.1
  record: ^5.0.0
```

Run:
```bash
cd flutter-app
flutter pub get
```

---

## Step 6: Test End-to-End (10 min)

### Test 1: Docker locally

```bash
# Run Docker container locally
docker run -p 8000:8000 guardian-voice-training:latest

# In another terminal, test with curl
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "audio_files": [
        {"filename": "test.wav", "data": "...base64..."}
      ]
    }
  }'
```

### Test 2: RunPod endpoint

Create `test_runpod.py`:

```python
import requests
import base64

# Load test audio file
with open('test_recording.wav', 'rb') as f:
    audio_bytes = f.read()
    audio_b64 = base64.b64encode(audio_bytes).decode()

# Call RunPod
response = requests.post(
    'https://api.runpod.ai/v2/YOUR_ENDPOINT_ID/runsync',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    json={
        'input': {
            'audio_files': [
                {
                    'filename': 'test.wav',
                    'data': audio_b64
                }
            ] * 10  # Repeat 10 times for testing
        }
    }
)

print(response.json())
```

Run:
```bash
python test_runpod.py
```

Expected output:
```json
{
  "status": "COMPLETED",
  "output": {
    "success": true,
    "model": "base64_encoded_model...",
    "model_size_mb": 45.2,
    "voice_profile": {...},
    "training_stats": {...}
  }
}
```

### Test 3: Flutter app

1. Run app on device/simulator
2. Navigate to voice training screen
3. Record 20 sentences
4. Wait for training (10 min)
5. Check for success message

---

## Cost Monitoring

### Check RunPod Usage

1. Go to https://runpod.io/console/serverless
2. Click on your endpoint
3. View **"Analytics"** tab
4. See:
   - Total requests
   - GPU time used
   - Cost per request

### Example Costs

```
Training 1 user:
  - GPU time: 10 minutes
  - GPU: RTX 4090 @ $0.39/hour
  - Cost: (10/60) * $0.39 = $0.065 (6.5 cents)

Training 100 users:
  - Total cost: 100 * $0.065 = $6.50

Training 1000 users:
  - Total cost: 1000 * $0.065 = $65
```

---

## Troubleshooting

### Error: "Container failed to start"

**Cause**: Docker image issues

**Fix**:
```bash
# Test Docker image locally first
docker run --rm guardian-voice-training:latest

# Check logs
docker logs <container_id>
```

### Error: "CUDA out of memory"

**Cause**: GPU RAM insufficient

**Fix**:
- Use smaller batch size in training
- Or upgrade to A100 GPU (more expensive)

### Error: "Training takes too long (>600s)"

**Cause**: Too many audio files or CPU fallback

**Fix**:
- Reduce epochs to 200
- Ensure GPU is being used
- Check RunPod logs

### Error: "Model quality is poor"

**Cause**: Not enough training data

**Fix**:
- Ensure user records all 20 sentences clearly
- Check audio quality (16kHz, mono)
- Add more varied sentences

---

## Production Checklist

Before launching:

- [ ] Docker image built and pushed
- [ ] RunPod endpoint deployed and tested
- [ ] API keys stored securely (env vars, not hardcoded)
- [ ] Flutter app tested end-to-end
- [ ] Error handling implemented
- [ ] Cost monitoring set up
- [ ] User notification system (training complete)
- [ ] Privacy policy updated (voice data handling)
- [ ] Legal disclaimers added (voice cloning ethics)

---

## Monitoring & Alerts

### Set up RunPod alerts

1. Go to RunPod console
2. Settings > Notifications
3. Enable:
   - High GPU usage
   - Failed requests
   - Cost threshold ($10/day)

### Track metrics in Guardian app

```dart
// Track training success rate
Analytics.logEvent('voice_training_success', {
  'duration': trainingDuration,
  'file_count': audioFiles.length,
  'model_size_mb': modelSize,
});

// Track failures
Analytics.logEvent('voice_training_failed', {
  'error': errorMessage,
  'stage': 'upload' | 'training' | 'download',
});
```

---

## Scaling Strategy

### Phase 1: MVP (0-100 users)
- RunPod Serverless ($0.065/user)
- Manual monitoring
- Total cost: ~$6.50

### Phase 2: Growth (100-1000 users)
- Same RunPod setup
- Add caching (common voice profiles)
- Total cost: ~$65

### Phase 3: Scale (1000+ users)
- Consider dedicated GPU server if >1100 users/year
- Break-even: $72/year (server) vs $71.50 (RunPod for 1100 users)
- But RunPod still better (scales to zero)

### Phase 4: Enterprise (10,000+ users)
- Dedicated GPU fleet
- Or negotiate RunPod enterprise pricing
- Estimated: $0.03-0.04/user at scale

---

## Next Steps

1. **Deploy Docker image** (Step 1-2)
2. **Test with sample audio** (Step 6)
3. **Integrate into Flutter app** (Step 4-5)
4. **Test with real user** (you!)
5. **Monitor costs** for first week
6. **Launch beta** to 10-20 users
7. **Iterate** based on feedback

---

## Support

**RunPod Issues**:
- Discord: https://discord.gg/runpod
- Docs: https://docs.runpod.io

**Guardian Issues**:
- Check SERVERLESS_VOICE_TRAINING.md
- Check GitHub issues

---

**You're ready to deploy!** 🚀

Estimated total time: **30-60 minutes**
