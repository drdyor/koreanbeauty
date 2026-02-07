#!/usr/bin/env python3
"""
Generate full-length audio files using Piper TTS
"""

import json
import subprocess
import os
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
AUDIO_DIR = SCRIPT_DIR.parent / "audio"
VOICE_DIR = SCRIPT_DIR.parent / "voices"
SCRIPTS_FILE = SCRIPT_DIR / "full-scripts.json"

# Voice model
VOICE_MODEL = VOICE_DIR / "en_US-lessac-medium.onnx"

# Create audio directory
AUDIO_DIR.mkdir(exist_ok=True)

def generate_audio(script_id, text, title):
    """Generate audio file using Piper TTS"""
    output_file = AUDIO_DIR / f"{script_id}.wav"

    print(f"🎙️  Generating: {title}...")
    print(f"   Length: {len(text)} characters")

    try:
        # Use Piper to generate audio
        # echo "text" | piper --model voice.onnx --output_file output.wav
        process = subprocess.Popen(
            ['piper', '--model', str(VOICE_MODEL), '--output_file', str(output_file)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        stdout, stderr = process.communicate(input=text)

        if process.returncode == 0:
            file_size = output_file.stat().st_size / 1024 / 1024  # MB
            print(f"✅ Saved: {output_file.name} ({file_size:.1f} MB)")
            return True
        else:
            print(f"❌ Error: {stderr}")
            return False

    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def main():
    print("🌙 Guardian Audio Generator (Piper TTS)")
    print("━" * 50)

    # Load scripts
    with open(SCRIPTS_FILE, 'r') as f:
        scripts = json.load(f)

    print(f"Voice model: {VOICE_MODEL}")
    print(f"Output directory: {AUDIO_DIR}")
    print(f"Scripts to generate: {len(scripts)}\n")

    # Generate each audio file
    results = []
    for script_id, data in scripts.items():
        success = generate_audio(script_id, data['script'], data['title'])
        results.append({
            'id': script_id,
            'title': data['title'],
            'success': success
        })
        print()

    # Summary
    print("━" * 50)
    print("📊 Generation Summary")
    print("━" * 50)

    successful = sum(1 for r in results if r['success'])
    failed = sum(1 for r in results if not r['success'])

    print(f"✅ Successful: {successful}/{len(scripts)}")
    print(f"❌ Failed: {failed}/{len(scripts)}")

    if failed > 0:
        print("\n❌ Failed scripts:")
        for r in results:
            if not r['success']:
                print(f"   - {r['title']}")

    print("\n🎧 Audio files ready!")
    print(f"📁 Location: {AUDIO_DIR}")

if __name__ == '__main__':
    main()
