#!/usr/bin/env node

/**
 * Simple Audio Generator for Guardian (No API Required)
 * Uses Mac's built-in 'say' command to generate audio
 *
 * Usage: node generate-audio-simple.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../audio');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Scripts (shortened for testing)
const scripts = [
  {
    id: '01_luteal_grounding',
    name: 'Luteal Phase Grounding',
    text: `Close your eyes. Take a deep breath. We're entering your alpha state now. Five... Feel your body beginning to relax. Four... Your breath slows naturally. Three... Thoughts begin to quiet. Two... You are entering your inner sanctuary. One... You are now in alpha.`
  },
  {
    id: '02_sleep_induction',
    name: 'Sleep Induction',
    text: `You are safe. Your body knows how to sleep. Five... Your body is heavy, sinking into the bed. Four... Your breath slows. Three... Your mind begins to drift. Two... You are entering the threshold of sleep. One... Deep rest is coming.`
  },
  {
    id: '03_habit_installation',
    name: 'Habit Installation',
    text: `Close your eyes. We're going to install a new habit tonight. Five... Relaxing deeply. Four... Breath slowing naturally. Three... Thoughts quieting. Two... Entering your inner sanctuary. One... You are now in alpha. Receptive. Open. Ready.`
  },
  {
    id: '04_anxiety_reset',
    name: 'Anxiety Reset',
    text: `This feeling is temporary. You are safe right now. Breathe in for five. One, two, three, four, five. Hold for five. Exhale for five. Your nervous system is shifting. From fight-or-flight to rest-and-digest.`
  },
  {
    id: '05_body_acceptance',
    name: 'Body Acceptance',
    text: `Close your eyes. Your body is not the enemy. Your cycle is not a curse. Five... Your body relaxes. Four... Your breath finds its rhythm. Three... Thoughts quiet. Two... You enter your sanctuary. One... Your heart is open.`
  }
];

// Check if 'say' command exists (Mac only)
function checkMacOS() {
  return process.platform === 'darwin';
}

// Generate audio file using Mac's 'say' command
function generateAudio(script) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(OUTPUT_DIR, `${script.id}.aiff`);

    console.log(`🎙️  Generating: ${script.name}...`);

    // Use Mac's say command with Samantha voice (calm female)
    const command = `say -v Samantha -r 180 -o "${outputPath}" "${script.text}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }

      console.log(`✅ Saved: ${outputPath}`);
      resolve(outputPath);
    });
  });
}

// Convert AIFF to MP3 (if ffmpeg is available)
function convertToMP3(aiffPath) {
  return new Promise((resolve, reject) => {
    const mp3Path = aiffPath.replace('.aiff', '.mp3');
    const command = `ffmpeg -i "${aiffPath}" -acodec libmp3lame -ab 128k "${mp3Path}" -y`;

    exec(command, (error) => {
      if (error) {
        console.warn(`⚠️  ffmpeg not found, keeping AIFF format`);
        resolve(aiffPath);
        return;
      }

      // Delete AIFF, keep MP3
      fs.unlinkSync(aiffPath);
      console.log(`✅ Converted to: ${mp3Path}`);
      resolve(mp3Path);
    });
  });
}

// Generate all audio files
async function generateAllAudio() {
  console.log('🌙 Guardian Audio Generator (Simple)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!checkMacOS()) {
    console.error('❌ Error: This script only works on macOS (uses `say` command)');
    console.log('\n📝 For other systems:');
    console.log('   1. Use Google Cloud TTS: npm run generate:google');
    console.log('   2. Use ElevenLabs: npm run generate:elevenlabs');
    console.log('   3. Or record manually');
    process.exit(1);
  }

  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Scripts to generate: ${scripts.length}\n`);

  const results = [];

  for (const script of scripts) {
    try {
      const aiffPath = await generateAudio(script);
      const finalPath = await convertToMP3(aiffPath);
      results.push({ success: true, script: script.name, path: finalPath });
    } catch (error) {
      results.push({ success: false, script: script.name, error: error.message });
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Generation Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${scripts.length}`);
  console.log(`❌ Failed: ${failed}/${scripts.length}`);

  if (failed > 0) {
    console.log('\n❌ Failed scripts:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.script}: ${r.error}`);
    });
  }

  console.log('\n🎧 Audio files ready!');
  console.log(`📁 Location: ${OUTPUT_DIR}`);
  console.log('\n📝 Note: These are short test versions.');
  console.log('   For full 7-minute scripts, use Google Cloud TTS or ElevenLabs.');
}

// Run if called directly
if (require.main === module) {
  generateAllAudio()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateAudio, generateAllAudio };
