"""
Guardian RVC Voice Trainer
Simplified RVC training for voice cloning
"""

import torch
import torch.nn as nn
import numpy as np
import librosa
import soundfile as sf
from pathlib import Path
import json
import tempfile
import os

class SimpleRVCTrainer:
    """
    Simplified RVC trainer optimized for quick voice cloning
    Based on Retrieval-based Voice Conversion
    """

    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.sample_rate = 16000  # 16kHz for efficiency
        self.hop_length = 320
        self.win_length = 1024

    def preprocess_audio(self, audio_path):
        """Load and preprocess audio file"""
        # Load audio
        audio, sr = librosa.load(audio_path, sr=self.sample_rate, mono=True)

        # Normalize
        audio = librosa.util.normalize(audio)

        # Extract features (mel spectrogram)
        mel = librosa.feature.melspectrogram(
            y=audio,
            sr=self.sample_rate,
            n_mels=80,
            hop_length=self.hop_length,
            win_length=self.win_length
        )

        # Convert to log scale
        log_mel = librosa.power_to_db(mel, ref=np.max)

        # Extract pitch (F0)
        f0, voiced_flag, voiced_probs = librosa.pyin(
            audio,
            fmin=librosa.note_to_hz('C2'),
            fmax=librosa.note_to_hz('C7'),
            sr=self.sample_rate,
            hop_length=self.hop_length
        )

        # Fill NaN values in F0
        f0 = np.nan_to_num(f0, nan=0.0)

        return {
            'audio': audio,
            'mel': log_mel,
            'f0': f0,
            'duration': len(audio) / self.sample_rate
        }

    def train(self, audio_files, output_dir, epochs=300):
        """
        Train RVC model on voice samples

        Args:
            audio_files: List of paths to audio files
            output_dir: Directory to save trained model
            epochs: Number of training epochs
        """
        print(f"🎙️  Training on {len(audio_files)} audio files...")
        print(f"📊 Device: {self.device}")

        # Create output directory
        os.makedirs(output_dir, exist_ok=True)

        # Preprocess all audio files
        print("📦 Preprocessing audio...")
        features = []
        total_duration = 0

        for i, audio_file in enumerate(audio_files):
            print(f"   Processing {i+1}/{len(audio_files)}: {Path(audio_file).name}")
            feat = self.preprocess_audio(audio_file)
            features.append(feat)
            total_duration += feat['duration']

        print(f"✅ Preprocessed {len(features)} files ({total_duration:.1f}s total)")

        # Extract voice characteristics
        print("🔍 Analyzing voice characteristics...")
        voice_profile = self._extract_voice_profile(features)

        # Build lightweight conversion model
        print("🏗️  Building voice conversion model...")
        model = self._build_conversion_model(voice_profile)

        # Quick training (we don't need full convergence for hypnosis)
        print(f"🚀 Training for {epochs} epochs...")
        self._train_model(model, features, epochs)

        # Save model
        model_path = os.path.join(output_dir, 'voice_model.pth')
        torch.save({
            'model_state_dict': model.state_dict(),
            'voice_profile': voice_profile,
            'config': {
                'sample_rate': self.sample_rate,
                'hop_length': self.hop_length,
                'win_length': self.win_length
            }
        }, model_path)

        print(f"✅ Model saved to {model_path}")

        # Export to ONNX for mobile
        onnx_path = os.path.join(output_dir, 'voice_model.onnx')
        self._export_onnx(model, voice_profile, onnx_path)

        print(f"✅ ONNX model saved to {onnx_path}")

        return {
            'model_path': model_path,
            'onnx_path': onnx_path,
            'voice_profile': voice_profile,
            'training_duration': total_duration
        }

    def _extract_voice_profile(self, features):
        """Extract average voice characteristics"""
        # Combine all mel spectrograms
        all_mels = np.concatenate([f['mel'] for f in features], axis=1)

        # Combine all F0 values
        all_f0 = np.concatenate([f['f0'] for f in features])

        # Calculate statistics
        profile = {
            'mel_mean': np.mean(all_mels, axis=1).tolist(),
            'mel_std': np.std(all_mels, axis=1).tolist(),
            'f0_mean': float(np.mean(all_f0[all_f0 > 0])),  # Exclude zeros
            'f0_std': float(np.std(all_f0[all_f0 > 0])),
            'f0_min': float(np.min(all_f0[all_f0 > 0])),
            'f0_max': float(np.max(all_f0[all_f0 > 0]))
        }

        return profile

    def _build_conversion_model(self, voice_profile):
        """Build a simple pitch and timbre conversion model"""
        class VoiceConverter(nn.Module):
            def __init__(self, mel_dim=80):
                super().__init__()
                # Simple 1D conv network for timbre transfer
                self.encoder = nn.Sequential(
                    nn.Conv1d(mel_dim, 256, kernel_size=5, padding=2),
                    nn.ReLU(),
                    nn.Conv1d(256, 256, kernel_size=5, padding=2),
                    nn.ReLU()
                )

                self.decoder = nn.Sequential(
                    nn.Conv1d(256, 256, kernel_size=5, padding=2),
                    nn.ReLU(),
                    nn.Conv1d(256, mel_dim, kernel_size=5, padding=2)
                )

                # Pitch shift network
                self.pitch_shift = nn.Linear(1, 1)

            def forward(self, mel, f0):
                # Encode
                encoded = self.encoder(mel)

                # Decode with target voice timbre
                converted_mel = self.decoder(encoded)

                # Shift pitch to match target voice
                converted_f0 = self.pitch_shift(f0.unsqueeze(-1)).squeeze(-1)

                return converted_mel, converted_f0

        model = VoiceConverter().to(self.device)
        return model

    def _train_model(self, model, features, epochs):
        """Quick training loop"""
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        criterion = nn.MSELoss()

        # Prepare training data
        train_mels = []
        train_f0s = []

        for feat in features:
            mel_tensor = torch.FloatTensor(feat['mel']).unsqueeze(0).to(self.device)
            f0_tensor = torch.FloatTensor(feat['f0']).unsqueeze(0).to(self.device)
            train_mels.append(mel_tensor)
            train_f0s.append(f0_tensor)

        # Training loop
        for epoch in range(epochs):
            total_loss = 0

            for mel, f0 in zip(train_mels, train_f0s):
                optimizer.zero_grad()

                # Forward pass
                pred_mel, pred_f0 = model(mel, f0)

                # Calculate loss (reconstruction)
                loss = criterion(pred_mel, mel) + criterion(pred_f0, f0)

                # Backward pass
                loss.backward()
                optimizer.step()

                total_loss += loss.item()

            if (epoch + 1) % 50 == 0:
                avg_loss = total_loss / len(train_mels)
                print(f"   Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.4f}")

    def _export_onnx(self, model, voice_profile, output_path):
        """Export model to ONNX format for mobile"""
        model.eval()

        # Create dummy input
        dummy_mel = torch.randn(1, 80, 100).to(self.device)
        dummy_f0 = torch.randn(1, 100).to(self.device)

        # Export
        torch.onnx.export(
            model,
            (dummy_mel, dummy_f0),
            output_path,
            input_names=['mel', 'f0'],
            output_names=['converted_mel', 'converted_f0'],
            dynamic_axes={
                'mel': {2: 'time'},
                'f0': {1: 'time'},
                'converted_mel': {2: 'time'},
                'converted_f0': {1: 'time'}
            },
            opset_version=14
        )

        # Save voice profile alongside ONNX
        profile_path = output_path.replace('.onnx', '_profile.json')
        with open(profile_path, 'w') as f:
            json.dump(voice_profile, f, indent=2)


# Helper function for RunPod handler
def train_user_voice(audio_files_data, user_id='user'):
    """
    Train user voice from base64 audio data

    Args:
        audio_files_data: List of dicts with {'filename': str, 'data': bytes}
        user_id: User identifier

    Returns:
        dict with model paths and metadata
    """
    # Create temp directory for training
    temp_dir = tempfile.mkdtemp()

    try:
        # Save audio files to temp directory
        audio_paths = []
        for i, audio_data in enumerate(audio_files_data):
            filename = audio_data.get('filename', f'recording_{i}.wav')
            filepath = os.path.join(temp_dir, filename)

            # Write audio bytes
            with open(filepath, 'wb') as f:
                f.write(audio_data['data'])

            audio_paths.append(filepath)

        # Train model
        trainer = SimpleRVCTrainer()
        result = trainer.train(
            audio_files=audio_paths,
            output_dir=os.path.join(temp_dir, 'models'),
            epochs=300
        )

        # Read ONNX model as bytes
        with open(result['onnx_path'], 'rb') as f:
            onnx_bytes = f.read()

        # Read voice profile
        profile_path = result['onnx_path'].replace('.onnx', '_profile.json')
        with open(profile_path, 'r') as f:
            voice_profile = json.load(f)

        return {
            'success': True,
            'model_bytes': onnx_bytes,
            'model_size_mb': len(onnx_bytes) / (1024 * 1024),
            'voice_profile': voice_profile,
            'training_duration': result['training_duration']
        }

    finally:
        # Cleanup temp files
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)
