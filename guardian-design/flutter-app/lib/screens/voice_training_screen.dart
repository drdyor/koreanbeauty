/// Guardian Voice Training Screen
/// Guides user through recording 20 sentences for voice model training

import 'package:flutter/material.dart';
import 'package:record/record.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import '../services/voice_training_service.dart';

class VoiceTrainingScreen extends StatefulWidget {
  const VoiceTrainingScreen({Key? key}) : super(key: key);

  @override
  _VoiceTrainingScreenState createState() => _VoiceTrainingScreenState();
}

class _VoiceTrainingScreenState extends State<VoiceTrainingScreen> {
  // Recording prompts (from HYPNOSIS_SCRIPTS.md)
  static const List<String> RECORDING_PROMPTS = [
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

  final AudioRecorder _audioRecorder = AudioRecorder();
  final VoiceTrainingService _trainingService = VoiceTrainingService();

  List<File> _recordings = [];
  int _currentPromptIndex = 0;
  bool _isRecording = false;
  bool _isTraining = false;
  double _trainingProgress = 0.0;

  @override
  void dispose() {
    _audioRecorder.dispose();
    super.dispose();
  }

  /// Start recording current prompt
  Future<void> _startRecording() async {
    // Check microphone permission
    if (await _audioRecorder.hasPermission()) {
      final appDir = await getApplicationDocumentsDirectory();
      final recordingsDir = Directory('${appDir.path}/recordings');
      await recordingsDir.create(recursive: true);

      final filePath = '${recordingsDir.path}/recording_$_currentPromptIndex.wav';

      await _audioRecorder.start(
        const RecordConfig(
          encoder: AudioEncoder.wav,
          sampleRate: 16000,  // 16kHz for efficiency
          numChannels: 1,     // Mono
        ),
        path: filePath,
      );

      setState(() {
        _isRecording = true;
      });
    } else {
      _showError('Microphone permission denied');
    }
  }

  /// Stop recording and save
  Future<void> _stopRecording() async {
    final path = await _audioRecorder.stop();

    if (path != null) {
      final file = File(path);

      setState(() {
        _recordings.add(file);
        _isRecording = false;
        _currentPromptIndex++;
      });

      // Auto-train if all prompts recorded
      if (_currentPromptIndex >= RECORDING_PROMPTS.length) {
        _trainModel();
      }
    }
  }

  /// Re-record current prompt
  Future<void> _reRecord() async {
    if (_currentPromptIndex > 0) {
      setState(() {
        _currentPromptIndex--;
        if (_recordings.isNotEmpty) {
          _recordings.removeLast();
        }
      });
    }
  }

  /// Train voice model
  Future<void> _trainModel() async {
    setState(() {
      _isTraining = true;
      _trainingProgress = 0.0;
    });

    try {
      // Simulate progress (training happens on server)
      _simulateProgress();

      // Train model
      final result = await _trainingService.trainVoiceModel(_recordings);

      // Success!
      if (mounted) {
        setState(() {
          _isTraining = false;
        });

        _showSuccess(result);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isTraining = false;
        });

        _showError('Training failed: $e');
      }
    }
  }

  /// Simulate training progress (actual training is on GPU)
  void _simulateProgress() {
    Future.delayed(const Duration(milliseconds: 500), () {
      if (_isTraining && mounted) {
        setState(() {
          _trainingProgress += 0.05;
          if (_trainingProgress < 0.95) {
            _simulateProgress();
          }
        });
      }
    });
  }

  /// Show success dialog
  void _showSuccess(VoiceTrainingResult result) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('✅ Voice Model Ready!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Your hypnosis sessions will now use YOUR voice.'),
            const SizedBox(height: 16),
            Text('Model size: ${result.sizeInMB.toStringAsFixed(1)} MB'),
            Text('Training duration: ${result.trainingStats['total_duration_seconds']}s'),
          ],
        ),
        actions: [
          TextButton(
            child: const Text('Try It Now'),
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, '/hypnosis');
            },
          ),
        ],
      ),
    );
  }

  /// Show error dialog
  void _showError(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            child: const Text('OK'),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Show training progress
    if (_isTraining) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Training Your Voice'),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 24),
              Text(
                '${(_trainingProgress * 100).toInt()}%',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 16),
              const Text('Training your voice model...'),
              const SizedBox(height: 8),
              const Text('This takes about 10 minutes'),
              const SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: LinearProgressIndicator(value: _trainingProgress),
              ),
              const SizedBox(height: 16),
              const Text(
                'You can close the app - we\'ll notify you when done',
                style: TextStyle(fontSize: 12, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    // Show recording UI
    return Scaffold(
      appBar: AppBar(
        title: const Text('Train Your Voice'),
        actions: [
          if (_recordings.isNotEmpty)
            TextButton(
              child: Text('${_recordings.length}/${RECORDING_PROMPTS.length}'),
              onPressed: () {},
            ),
        ],
      ),
      body: Column(
        children: [
          // Progress indicator
          LinearProgressIndicator(
            value: _currentPromptIndex / RECORDING_PROMPTS.length,
            backgroundColor: Colors.grey[200],
          ),

          const SizedBox(height: 24),

          // Instructions
          if (_currentPromptIndex == 0)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        '🎙️ Record Your Voice',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text('Read each sentence calmly and naturally.'),
                      Text('Find a quiet space.'),
                      Text('Speak as if guiding yourself into relaxation.'),
                      SizedBox(height: 8),
                      Text(
                        'This will take about 10 minutes.',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          const Spacer(),

          // Current prompt
          if (_currentPromptIndex < RECORDING_PROMPTS.length)
            Padding(
              padding: const EdgeInsets.all(24),
              child: Card(
                elevation: 4,
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Text(
                        'Sentence ${_currentPromptIndex + 1} of ${RECORDING_PROMPTS.length}',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        RECORDING_PROMPTS[_currentPromptIndex],
                        style: const TextStyle(
                          fontSize: 20,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),

          const Spacer(),

          // Recording controls
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                // Record/Stop button
                GestureDetector(
                  onTapDown: (_) => _startRecording(),
                  onTapUp: (_) => _stopRecording(),
                  onTapCancel: () => _stopRecording(),
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isRecording ? Colors.red : Colors.blue,
                      boxShadow: [
                        if (_isRecording)
                          BoxShadow(
                            color: Colors.red.withOpacity(0.5),
                            blurRadius: 20,
                            spreadRadius: 5,
                          ),
                      ],
                    ),
                    child: Icon(
                      _isRecording ? Icons.stop : Icons.mic,
                      color: Colors.white,
                      size: 40,
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                Text(
                  _isRecording ? 'Hold to record' : 'Tap and hold to record',
                  style: const TextStyle(fontSize: 14),
                ),

                const SizedBox(height: 24),

                // Re-record button
                if (_currentPromptIndex > 0)
                  TextButton.icon(
                    icon: const Icon(Icons.replay),
                    label: const Text('Re-record previous'),
                    onPressed: _reRecord,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
