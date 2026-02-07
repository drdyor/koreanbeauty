#!/usr/bin/env node

/**
 * Guardian Voice Generation Script
 * Generates all 5 hypnosis scripts using Google Cloud Text-to-Speech Neural2
 *
 * Setup:
 * 1. npm install @google-cloud/text-to-speech
 * 2. Set up Google Cloud credentials: https://cloud.google.com/docs/authentication/getting-started
 * 3. Run: node scripts/generate-voice-google.js
 *
 * Cost: ~$0.19 for all 5 scripts (one-time)
 */

const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs').promises;
const path = require('path');

// Initialize Google Cloud TTS client
const client = new textToSpeech.TextToSpeechClient();

// Output directory for generated audio files
const OUTPUT_DIR = path.join(__dirname, '../audio');

// Script definitions with SSML content
const scripts = [
  {
    id: '01_luteal_grounding',
    name: 'Luteal Phase Grounding',
    speakingRate: 0.85,
    pitch: -2.0,
    ssml: `
<speak>
  <prosody rate="0.85" pitch="-2st">
    Close your eyes.
    <break time="2s"/>

    Take a deep breath in through your nose.
    <break time="2s"/>

    We're entering your alpha state now. Let's count down together.
    <break time="2s"/>

    Five... Feel your body beginning to relax. Your shoulders drop.
    <break time="3s"/>

    Four... Your breath slows to its natural rhythm. Nothing to force.
    <break time="3s"/>

    Three... Thoughts begin to quiet, like snow settling on the ground.
    <break time="3s"/>

    Two... You are entering your inner sanctuary. This is your safe space.
    <break time="3s"/>

    One... You are now in alpha. Your subconscious mind is receptive and open.
    <break time="3s"/>

    If you're in your luteal phase right now, your body feels different.
    <break time="2s"/>

    Heavier. Slower. More sensitive.
    <break time="2s"/>

    This is progesterone. This is not weakness. This is biology.
    <break time="3s"/>

    Your body is preparing for rest, for renewal, for deep wisdom.
    <break time="2s"/>

    The world tells you to stay productive, to push through.
    <break time="2s"/>

    But your luteal phase whispers: slow down. Turn inward. Listen.
    <break time="3s"/>

    Imagine a screen about six feet in front of you. This is your mental screen.
    <break time="2s"/>

    On this screen, see yourself tomorrow during your luteal phase.
    <break time="2s"/>

    Watch yourself choosing rest when your body asks for it.
    <break time="2s"/>

    See yourself saying no to demands that drain you.
    <break time="2s"/>

    Notice how natural this feels. This is not laziness. This is self-preservation.
    <break time="3s"/>

    Your luteal phase is a superpower disguised as a slowdown.
    <break time="2s"/>

    This is when you process. When you integrate. When you become wise.
    <break time="3s"/>

    Press your thumb, index finger, and middle finger together gently.
    <break time="2s"/>

    This is your luteal anchor. Whenever you press these three fingers together, you will remember:
    <break time="2s"/>

    Progesterone is intelligence. My body knows what it needs.
    <break time="3s"/>

    Release your fingers. The anchor is set.
    <break time="2s"/>

    Repeat these truths silently as I speak them:
    <break time="2s"/>

    I honor my rhythm.
    <break time="2s"/>

    I am becoming someone who works with my cycle, not against it.
    <break time="2s"/>

    My luteal phase is wisdom, not weakness.
    <break time="2s"/>

    Every day, in every way, I'm learning to trust my body.
    <break time="3s"/>

    In a moment, I will count from one to five, and you will return feeling grounded and aligned.
    <break time="2s"/>

    One... Beginning to return. Energy flowing back gently.
    <break time="2s"/>

    Two... Bringing this luteal wisdom with you.
    <break time="2s"/>

    Three... Your body remembers. You are safe in your rhythm.
    <break time="2s"/>

    Four... Feeling alert, calm, and deeply aligned.
    <break time="2s"/>

    Five... Open your eyes. You are fully present and at peace with your cycle.
    <break time="2s"/>
  </prosody>
</speak>
    `
  },

  {
    id: '02_sleep_induction',
    name: 'Sleep Induction',
    speakingRate: 0.80,
    pitch: -3.0,
    ssml: `
<speak>
  <prosody rate="0.80" pitch="-3st">
    You are safe. Your body knows how to sleep.
    <break time="3s"/>

    Close your eyes if they aren't already closed.
    <break time="2s"/>

    Let's count down into deep rest.
    <break time="2s"/>

    Five... Your body is heavy, sinking into the bed.
    <break time="3s"/>

    Four... Your breath slows. Each exhale is a release.
    <break time="3s"/>

    Three... Your mind begins to drift like a leaf on water.
    <break time="3s"/>

    Two... You are entering the threshold of sleep. This is safe.
    <break time="3s"/>

    One... You are in delta now. Deep rest is coming.
    <break time="4s"/>

    Notice the weight of your head on the pillow.
    <break time="2s"/>

    Your jaw unclenches. Your tongue rests softly in your mouth.
    <break time="3s"/>

    Your shoulders drop away from your ears. Tension melts.
    <break time="3s"/>

    Each breath carries you deeper into stillness.
    <break time="3s"/>

    If you're in your luteal phase, your body is naturally preparing for sleep right now.
    <break time="2s"/>

    Progesterone makes you drowsy. This is not a problem. This is design.
    <break time="3s"/>

    Your body is saying: it's time to rest, to restore, to dream.
    <break time="3s"/>

    There is nothing you need to do right now.
    <break time="2s"/>

    No problem to solve. No task to complete.
    <break time="2s"/>

    This moment is only for rest.
    <break time="4s"/>

    Imagine a warm, gentle wave washing over you from head to toe.
    <break time="2s"/>

    This wave carries away any remaining tension.
    <break time="2s"/>

    Your forehead smooths. Your eyes soften behind your eyelids.
    <break time="3s"/>

    Your chest rises and falls like the ocean. Slow. Steady. Natural.
    <break time="3s"/>

    Your arms are heavy. Your legs are heavy. You are sinking.
    <break time="3s"/>

    Sleep is not something you do. Sleep is something you allow.
    <break time="3s"/>

    And right now, you are allowing.
    <break time="4s"/>

    Your nervous system shifts into its rest-and-digest state.
    <break time="2s"/>

    Your heart rate slows. Your blood pressure lowers.
    <break time="2s"/>

    Delta waves begin to rise in your brain.
    <break time="3s"/>

    This is the frequency of deep, healing sleep.
    <break time="3s"/>

    You are safe. You are held. You are allowed to let go.
    <break time="4s"/>

    If thoughts arise, let them drift by like clouds.
    <break time="2s"/>

    You don't need to follow them. You don't need to solve them.
    <break time="2s"/>

    Just breathe. Just sink. Just allow.
    <break time="4s"/>

    Sleep will find you. It always does.
    <break time="3s"/>

    Your only job now is to surrender.
    <break time="4s"/>

    Let go.
    <break time="5s"/>

    Let go.
    <break time="5s"/>

    Sleep is here.
    <break time="10s"/>
  </prosody>
</speak>
    `
  },

  {
    id: '03_habit_installation',
    name: 'Habit Installation',
    speakingRate: 0.85,
    pitch: -2.0,
    ssml: `
<speak>
  <prosody rate="0.85" pitch="-2st">
    Close your eyes. Take a deep breath.
    <break time="2s"/>

    We're going to install a new habit tonight. Not through willpower. Through visualization.
    <break time="2s"/>

    Your subconscious mind doesn't know the difference between a vivid visualization and reality.
    <break time="2s"/>

    What you see clearly on your mental screen can become your new normal.
    <break time="3s"/>

    Let's count down into alpha.
    <break time="2s"/>

    Five... Relaxing deeply.
    <break time="3s"/>

    Four... Breath slowing naturally.
    <break time="3s"/>

    Three... Thoughts quieting.
    <break time="3s"/>

    Two... Entering your inner sanctuary.
    <break time="3s"/>

    One... You are now in alpha. Receptive. Open. Ready.
    <break time="3s"/>

    Imagine a screen about six feet in front of you. Like a movie screen.
    <break time="2s"/>

    On this screen, you're going to watch yourself tomorrow.
    <break time="2s"/>

    See yourself when your habit cue happens.
    <break time="2s"/>

    Maybe it's finishing lunch. Maybe it's waking up. Maybe it's coming home.
    <break time="2s"/>

    Watch yourself in this moment. See it clearly.
    <break time="3s"/>

    Now, watch yourself naturally, easily doing your new habit.
    <break time="2s"/>

    Notice how automatic it feels. Like you've been doing this for years.
    <break time="2s"/>

    There's no resistance. No willpower needed. It's just what you do now.
    <break time="3s"/>

    See the details. What are you wearing? Where are you?
    <break time="2s"/>

    Notice how your body moves. See yourself doing this with ease.
    <break time="3s"/>

    Now, watch yourself feel the reward from this habit.
    <break time="2s"/>

    Maybe it's a sense of calm. Maybe it's energy. Maybe it's pride.
    <break time="2s"/>

    Let yourself feel this reward fully. This is why you do this habit.
    <break time="3s"/>

    Your subconscious mind is learning right now.
    <break time="2s"/>

    When the cue happens, you do the behavior, and you feel the reward.
    <break time="3s"/>

    This is your new identity. This is who you are becoming.
    <break time="3s"/>

    If you're in your follicular phase, your brain is especially plastic right now.
    <break time="2s"/>

    Estrogen helps you learn new patterns. Your neurons are forming new connections.
    <break time="2s"/>

    This is the perfect time to install a habit.
    <break time="3s"/>

    Press your thumb, index finger, and middle finger together.
    <break time="2s"/>

    This is your habit anchor. Tomorrow, when your cue happens, press these three fingers.
    <break time="2s"/>

    Your body will remember this moment. It will remember what to do.
    <break time="3s"/>

    Release your fingers.
    <break time="2s"/>

    Repeat these truths silently:
    <break time="2s"/>

    I am becoming someone who honors my habits.
    <break time="2s"/>

    This habit is easy and natural for me.
    <break time="2s"/>

    Every day, in every way, I'm aligning with my highest self.
    <break time="3s"/>

    In a moment, you'll return, and this new pattern will be installed.
    <break time="2s"/>

    One... Beginning to return.
    <break time="2s"/>

    Two... Bringing this new habit with you.
    <break time="2s"/>

    Three... Your subconscious remembers.
    <break time="2s"/>

    Four... Feeling confident and aligned.
    <break time="2s"/>

    Five... Open your eyes. The habit is installed. Tomorrow, you'll see.
    <break time="2s"/>
  </prosody>
</speak>
    `
  },

  {
    id: '04_anxiety_reset',
    name: 'Anxiety Reset',
    speakingRate: 0.90,
    pitch: -1.0,
    ssml: `
<speak>
  <prosody rate="0.90" pitch="-1st">
    This feeling is temporary. You are safe right now.
    <break time="2s"/>

    Close your eyes. Place one hand on your heart.
    <break time="2s"/>

    Breathe in for five counts. One, two, three, four, five.
    <break time="1s"/>

    Hold for five. One, two, three, four, five.
    <break time="1s"/>

    Exhale for five. One, two, three, four, five.
    <break time="2s"/>

    Again. Inhale. One, two, three, four, five.
    <break time="1s"/>

    Hold. One, two, three, four, five.
    <break time="1s"/>

    Exhale. One, two, three, four, five.
    <break time="3s"/>

    Your nervous system is shifting right now. From sympathetic to parasympathetic.
    <break time="2s"/>

    From fight-or-flight to rest-and-digest.
    <break time="2s"/>

    This is not dangerous. This is your body's wisdom.
    <break time="3s"/>

    If you're in your luteal phase, anxiety spikes are common.
    <break time="2s"/>

    Progesterone affects your GABA receptors. This is biochemistry, not your fault.
    <break time="2s"/>

    You are not broken. You are cycling.
    <break time="3s"/>

    Press your thumb, index finger, and middle finger together.
    <break time="2s"/>

    This is your calm anchor. Feel it working. Your body remembers safety.
    <break time="3s"/>

    Imagine two mirrors in front of you.
    <break time="2s"/>

    On the left, see yourself anxious, overwhelmed.
    <break time="2s"/>

    Acknowledge this. It's real. It's okay.
    <break time="2s"/>

    Now look to the right mirror.
    <break time="2s"/>

    See yourself calm. Grounded. Breathing steadily.
    <break time="2s"/>

    This version of you knows: this storm will pass.
    <break time="2s"/>

    Step into the right mirror. Feel this as your reality now.
    <break time="3s"/>

    You are safe. You are capable. You can handle this.
    <break time="3s"/>

    This anxiety is a wave. You are the ocean.
    <break time="2s"/>

    Waves rise. Waves fall. The ocean remains.
    <break time="3s"/>

    One more breath. In for five. One, two, three, four, five.
    <break time="1s"/>

    Hold. One, two, three, four, five.
    <break time="1s"/>

    Out for five. One, two, three, four, five.
    <break time="3s"/>

    When you open your eyes, the intensity will have softened.
    <break time="2s"/>

    One, two, three. Eyes open. You've got this.
    <break time="2s"/>
  </prosody>
</speak>
    `
  },

  {
    id: '05_body_acceptance',
    name: 'Body Acceptance',
    speakingRate: 0.85,
    pitch: -2.0,
    ssml: `
<speak>
  <prosody rate="0.85" pitch="-2st">
    Close your eyes. Take a deep breath.
    <break time="2s"/>

    Your body is not the enemy. Your cycle is not a curse.
    <break time="2s"/>

    Today, we release the shame you've carried about being hormonal.
    <break time="3s"/>

    Let's count down together.
    <break time="2s"/>

    Five... Your body relaxes. You are safe here.
    <break time="3s"/>

    Four... Your breath finds its rhythm.
    <break time="3s"/>

    Three... Thoughts quiet. Judgment fades.
    <break time="3s"/>

    Two... You enter your sanctuary of self-compassion.
    <break time="3s"/>

    One... You are in alpha. Your heart is open.
    <break time="3s"/>

    Imagine a warm, golden light above your head.
    <break time="2s"/>

    This is the light of acceptance. Of unconditional love.
    <break time="2s"/>

    Let this light pour down over you like honey.
    <break time="3s"/>

    It flows over your forehead. Your face. Your neck.
    <break time="2s"/>

    It fills your chest. Your belly. Your pelvis.
    <break time="2s"/>

    Every part of you that's been criticized is now held in golden light.
    <break time="3s"/>

    Your body has been doing impossible work your entire cycle.
    <break time="2s"/>

    Building. Shedding. Healing. Renewing.
    <break time="2s"/>

    Every month, your body performs miracles, and you've been calling it dysfunction.
    <break time="3s"/>

    Imagine a screen in front of you.
    <break time="2s"/>

    On this screen, see your younger self, maybe age twelve or thirteen.
    <break time="2s"/>

    The first time someone called you moody. Hormonal. Too much.
    <break time="2s"/>

    See how that younger you internalized that shame.
    <break time="3s"/>

    Now, as your present self, step into the screen.
    <break time="2s"/>

    Put your hand on her shoulder. Look her in the eyes.
    <break time="2s"/>

    Tell her: There is nothing wrong with you.
    <break time="2s"/>

    Tell her: Your cycle is intelligence, not dysfunction.
    <break time="2s"/>

    Tell her: You are allowed to change. You are allowed to feel.
    <break time="3s"/>

    Watch her face soften. Watch the shame begin to lift.
    <break time="3s"/>

    Now create a second mirror on your right.
    <break time="2s"/>

    In this mirror, see yourself tomorrow, living in full acceptance of your cycle.
    <break time="2s"/>

    You rest during your menstrual phase without guilt.
    <break time="2s"/>

    You honor your luteal need to slow down.
    <break time="2s"/>

    You celebrate your follicular energy when it rises.
    <break time="2s"/>

    You trust your ovulation intuition.
    <break time="3s"/>

    This is not indulgence. This is self-preservation.
    <break time="2s"/>

    This is not weakness. This is wisdom.
    <break time="3s"/>

    Press your three fingers together.
    <break time="2s"/>

    This is your body acceptance anchor.
    <break time="2s"/>

    Whenever shame arises about your cycle, press these fingers and remember:
    <break time="2s"/>

    My body is not broken. My cycle is brilliant.
    <break time="3s"/>

    Release your fingers.
    <break time="2s"/>

    Repeat these truths:
    <break time="2s"/>

    I release the belief that my hormones make me less than.
    <break time="2s"/>

    I am becoming someone who honors all phases of my cycle.
    <break time="2s"/>

    My body's rhythm is intelligence, not inconvenience.
    <break time="2s"/>

    Every day, I am learning to trust what my body knows.
    <break time="3s"/>

    The golden light continues to glow around you.
    <break time="2s"/>

    This light will stay with you as you return.
    <break time="2s"/>

    One... Beginning to come back.
    <break time="2s"/>

    Two... Bringing this acceptance with you.
    <break time="2s"/>

    Three... Your body is safe. You are whole.
    <break time="2s"/>

    Four... Feeling compassion for yourself and your cycle.
    <break time="2s"/>

    Five... Open your eyes. You are free.
    <break time="2s"/>
  </prosody>
</speak>
    `
  }
];

/**
 * Generate a single hypnosis script using Google Cloud TTS
 */
async function generateScript(script) {
  console.log(`\n🎙️  Generating: ${script.name}...`);

  const request = {
    input: { ssml: script.ssml },
    voice: {
      languageCode: 'en-US',
      name: 'en-US-Neural2-C', // Female, warm, calm voice
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: script.speakingRate,
      pitch: script.pitch,
      effectsProfileId: ['headphone-class-device'] // Optimized for headphones
    }
  };

  try {
    const [response] = await client.synthesizeSpeech(request);

    // Create output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Save audio file
    const outputPath = path.join(OUTPUT_DIR, `${script.id}_neural2c.mp3`);
    await fs.writeFile(outputPath, response.audioContent, 'binary');

    console.log(`✅ Saved: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`❌ Error generating ${script.name}:`, error.message);
    throw error;
  }
}

/**
 * Generate all hypnosis scripts
 */
async function generateAllScripts() {
  console.log('🌙 Guardian Voice Generation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Voice: Google Cloud Neural2-C (Female, calm)`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Scripts to generate: ${scripts.length}`);

  const startTime = Date.now();
  const results = [];

  for (const script of scripts) {
    try {
      const outputPath = await generateScript(script);
      results.push({ success: true, script: script.name, path: outputPath });
    } catch (error) {
      results.push({ success: false, script: script.name, error: error.message });
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Generation Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`✅ Successful: ${successful}/${scripts.length}`);
  console.log(`❌ Failed: ${failed}/${scripts.length}`);
  console.log(`⏱️  Total time: ${duration}s`);

  if (failed > 0) {
    console.log('\n❌ Failed scripts:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.script}: ${r.error}`);
    });
  }

  console.log('\n💰 Estimated cost: $0.19 (one-time)');
  console.log('\n🎧 Files ready to use in Guardian app!');
}

// Run if called directly
if (require.main === module) {
  generateAllScripts()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateScript, generateAllScripts, scripts };
