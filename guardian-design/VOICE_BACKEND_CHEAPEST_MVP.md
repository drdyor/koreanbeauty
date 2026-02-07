# 🌙 Guardian Voice Backend: Cheapest MVP Plan (Open Source)

This document outlines the manual steps to set up the **cheapest possible** voice backend using open-source tools (**Piper**, **RVC**, and **RunPod**), as discussed in `SERVERLESS_VOICE_TRAINING.md`.

---

## 1. Immediate "Free" Voices (Piper TTS)
Piper is a fast, local, open-source neural text-to-speech engine.

- [ ] **Download Piper Voices**: Go to the [Piper Voice Gallery](https://rhasspy.github.io/piper-samples/).
- [ ] **Choose a Voice**: I recommend `en_US-lessac-medium` (a high-quality, calm female voice).
- [ ] **Hosting**: Upload the `.onnx` and `.json` voice files to your Supabase `guardian-audio` bucket.
- [ ] **Integration**: The app can now use these voices for $0 cost.

---

## 2. Serverless Voice Training (RunPod + Applio)
For the "Use MY Voice" feature. You only pay when a user actually trains their voice (~$0.06 per user).

- [ ] **Create RunPod Account**: Sign up at [runpod.io](https://runpod.io/).
- [ ] **Add Credits**: Add $5 or $10 (this will last for hundreds of users).
- [ ] **Deploy Applio**:
    - Use the `Dockerfile` and `train.py` already created in `koreanbeauty/guardian-design/voice-training/`.
    - Deploy this as a **Serverless Endpoint** on an RTX 4090.
- [ ] **Get API Key**: Save your RunPod API key for the React Native app.

---

## 3. Storage & Result Delivery (Supabase)
Used to store user recordings and the final trained voice models.

- [ ] **Create Supabase Project**: Go to [supabase.com](https://supabase.com/).
- [ ] **Bucket 1: `user-recordings`**: For the 20 sentences the user records.
- [ ] **Bucket 2: `user-models`**: For the final `.onnx` voice models returned by RunPod.

---

## 4. Manual Verification Flow (Test with YOUR voice)
Before going live, follow this manual test:

1. **Record**: Use your phone to record the 20 prompts from `VOICE_CLONING_INTEGRATION.md`.
2. **Upload**: Manually upload these to your Supabase `user-recordings` bucket.
3. **Trigger**: Use a tool like Postman or a simple curl command to call your RunPod endpoint with the audio links.
4. **Download**: Wait ~10 minutes, then download the `.onnx` model from the response.
5. **Listen**: Play a script using that model to verify it sounds like you.

---

## 5. React Native "Glue" Code
Once the manual setup is done, update the app:

- [ ] **`constants/index.ts`**: Add your `RUNPOD_ENDPOINT_URL` and `SUPABASE_URL`.
- [ ] **`services/voiceService.ts`**: (We can build this next) to handle the multi-step upload -> train -> download flow.

---

### 🚀 Why this is the "Cheapest MVP":
*   **Tier 1 (Piper)**: $0 cost. High quality for a free tier.
*   **Tier 2 (RunPod)**: Pay-per-use ($0.06/user). No monthly fees.
*   **Supabase**: Free tier covers up to 1GB of storage.

**This plan completely replaces ElevenLabs with open-source alternatives.**
