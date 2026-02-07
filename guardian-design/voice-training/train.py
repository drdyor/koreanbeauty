"""
Guardian Voice Training - RunPod Serverless Handler
Handles training requests from Guardian Flutter app
"""

import runpod
import base64
import json
import tempfile
import os
import traceback
from rvc_trainer import train_user_voice

def handler(event):
    """
    RunPod handler function

    Input event format:
    {
        "input": {
            "audio_files": [
                {
                    "filename": "recording_0.wav",
                    "data": "base64_encoded_audio..."
                },
                ...
            ],
            "user_id": "user_12345" (optional)
        }
    }

    Output format:
    {
        "model": "base64_encoded_onnx_model",
        "model_size_mb": 45.2,
        "voice_profile": {...},
        "training_stats": {...}
    }
    """

    print("🚀 Guardian Voice Training Handler Started")

    try:
        # Extract input
        input_data = event.get('input', {})
        audio_files_b64 = input_data.get('audio_files', [])
        user_id = input_data.get('user_id', 'anonymous')

        print(f"📥 Received {len(audio_files_b64)} audio files for user: {user_id}")

        if not audio_files_b64:
            return {
                "error": "No audio files provided",
                "success": False
            }

        if len(audio_files_b64) < 5:
            return {
                "error": f"Need at least 5 audio files, got {len(audio_files_b64)}",
                "success": False
            }

        # Decode audio files from base64
        print("🔓 Decoding audio files...")
        audio_files_data = []

        for i, audio_file in enumerate(audio_files_b64):
            try:
                filename = audio_file.get('filename', f'recording_{i}.wav')
                data_b64 = audio_file.get('data', '')

                # Decode base64
                audio_bytes = base64.b64decode(data_b64)

                audio_files_data.append({
                    'filename': filename,
                    'data': audio_bytes
                })

                print(f"   ✅ Decoded {filename}: {len(audio_bytes) / 1024:.1f} KB")

            except Exception as e:
                print(f"   ❌ Failed to decode file {i}: {e}")
                continue

        if len(audio_files_data) < 5:
            return {
                "error": f"Only {len(audio_files_data)} valid audio files decoded",
                "success": False
            }

        # Train model
        print(f"🎓 Starting training with {len(audio_files_data)} files...")
        result = train_user_voice(audio_files_data, user_id)

        if not result['success']:
            return {
                "error": "Training failed",
                "success": False
            }

        # Encode model to base64
        print("📦 Encoding model...")
        model_b64 = base64.b64encode(result['model_bytes']).decode('utf-8')

        # Prepare response
        response = {
            "success": True,
            "model": model_b64,
            "model_size_mb": round(result['model_size_mb'], 2),
            "voice_profile": result['voice_profile'],
            "training_stats": {
                "num_files": len(audio_files_data),
                "total_duration_seconds": round(result['training_duration'], 1),
                "device": "CUDA" if os.environ.get('CUDA_VISIBLE_DEVICES') else "CPU"
            }
        }

        print(f"✅ Training complete! Model size: {response['model_size_mb']} MB")

        return response

    except Exception as e:
        error_msg = f"Handler error: {str(e)}"
        print(f"❌ {error_msg}")
        print(traceback.format_exc())

        return {
            "error": error_msg,
            "success": False,
            "traceback": traceback.format_exc()
        }


# Start RunPod serverless handler
if __name__ == "__main__":
    print("🌙 Guardian Voice Training Service")
    print("=" * 50)
    print("Waiting for training requests...")
    print("=" * 50)

    runpod.serverless.start({"handler": handler})
