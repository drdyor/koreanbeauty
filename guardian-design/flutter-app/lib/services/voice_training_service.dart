/// Guardian Voice Training Service
/// Handles communication with RunPod serverless GPU for voice model training

import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

class VoiceTrainingService {
  // RunPod configuration
  static const String RUNPOD_ENDPOINT =
    'https://api.runpod.ai/v2/<YOUR_ENDPOINT_ID>/runsync';

  static const String RUNPOD_API_KEY =
    String.fromEnvironment('RUNPOD_API_KEY', defaultValue: '');

  /// Train user's voice model from recordings
  ///
  /// [recordings] - List of WAV file paths recorded by user
  /// Returns trained model file path
  Future<VoiceTrainingResult> trainVoiceModel(List<File> recordings) async {
    if (recordings.length < 5) {
      throw Exception('Need at least 5 recordings to train voice model');
    }

    print('🎙️ Training voice model with ${recordings.length} recordings...');

    // 1. Convert audio files to base64
    final audioFilesData = await _convertRecordingsToBase64(recordings);

    // 2. Call RunPod API
    final response = await _callRunPodAPI(audioFilesData);

    // 3. Save model to device
    final modelFile = await _saveModelToDevice(response);

    return VoiceTrainingResult(
      modelFile: modelFile,
      sizeInMB: response['model_size_mb'],
      voiceProfile: response['voice_profile'],
      trainingStats: response['training_stats'],
    );
  }

  /// Convert recording files to base64 for API transmission
  Future<List<Map<String, String>>> _convertRecordingsToBase64(
    List<File> recordings
  ) async {
    print('📦 Encoding ${recordings.length} audio files...');

    final audioFilesData = <Map<String, String>>[];

    for (int i = 0; i < recordings.length; i++) {
      final file = recordings[i];
      final bytes = await file.readAsBytes();
      final base64Data = base64Encode(bytes);

      audioFilesData.add({
        'filename': 'recording_$i.wav',
        'data': base64Data,
      });

      final sizeKB = bytes.length / 1024;
      print('   ✅ Encoded recording_$i.wav (${sizeKB.toStringAsFixed(1)} KB)');
    }

    return audioFilesData;
  }

  /// Call RunPod serverless API
  Future<Map<String, dynamic>> _callRunPodAPI(
    List<Map<String, String>> audioFilesData
  ) async {
    print('🚀 Sending to RunPod for training...');

    // Prepare request
    final requestBody = {
      'input': {
        'audio_files': audioFilesData,
        'user_id': 'user_${DateTime.now().millisecondsSinceEpoch}',
      }
    };

    // Make API call
    final response = await http.post(
      Uri.parse(RUNPOD_ENDPOINT),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $RUNPOD_API_KEY',
      },
      body: jsonEncode(requestBody),
    );

    if (response.statusCode != 200) {
      throw Exception(
        'RunPod API error (${response.statusCode}): ${response.body}'
      );
    }

    // Parse response
    final result = jsonDecode(response.body);

    if (result['status'] == 'FAILED') {
      throw Exception('Training failed: ${result['error']}');
    }

    final output = result['output'];

    if (output['success'] != true) {
      throw Exception('Training failed: ${output['error']}');
    }

    print('✅ Training complete!');
    print('   Model size: ${output['model_size_mb']} MB');
    print('   Files used: ${output['training_stats']['num_files']}');

    return output;
  }

  /// Save trained model to device storage
  Future<File> _saveModelToDevice(Map<String, dynamic> trainingResult) async {
    print('💾 Saving model to device...');

    // Decode model from base64
    final modelBase64 = trainingResult['model'] as String;
    final modelBytes = base64Decode(modelBase64);

    // Get app directory
    final appDir = await getApplicationDocumentsDirectory();
    final modelsDir = Directory('${appDir.path}/models');
    await modelsDir.create(recursive: true);

    // Save model file
    final modelFile = File('${modelsDir.path}/user_voice.onnx');
    await modelFile.writeAsBytes(modelBytes);

    // Also save voice profile
    final profileFile = File('${modelsDir.path}/user_voice_profile.json');
    await profileFile.writeAsString(
      jsonEncode(trainingResult['voice_profile'])
    );

    print('✅ Model saved: ${modelFile.path}');
    return modelFile;
  }

  /// Check if user has a trained voice model
  Future<bool> hasVoiceModel() async {
    final appDir = await getApplicationDocumentsDirectory();
    final modelFile = File('${appDir.path}/models/user_voice.onnx');
    return modelFile.exists();
  }

  /// Get user's voice model file
  Future<File?> getVoiceModel() async {
    final appDir = await getApplicationDocumentsDirectory();
    final modelFile = File('${appDir.path}/models/user_voice.onnx');

    if (await modelFile.exists()) {
      return modelFile;
    }
    return null;
  }

  /// Delete user's voice model
  Future<void> deleteVoiceModel() async {
    final appDir = await getApplicationDocumentsDirectory();
    final modelsDir = Directory('${appDir.path}/models');

    if (await modelsDir.exists()) {
      await modelsDir.delete(recursive: true);
    }
  }
}

/// Result of voice training
class VoiceTrainingResult {
  final File modelFile;
  final double sizeInMB;
  final Map<String, dynamic> voiceProfile;
  final Map<String, dynamic> trainingStats;

  VoiceTrainingResult({
    required this.modelFile,
    required this.sizeInMB,
    required this.voiceProfile,
    required this.trainingStats,
  });

  @override
  String toString() {
    return 'VoiceTrainingResult(size: ${sizeInMB.toStringAsFixed(1)}MB, '
           'files: ${trainingStats['num_files']}, '
           'duration: ${trainingStats['total_duration_seconds']}s)';
  }
}
