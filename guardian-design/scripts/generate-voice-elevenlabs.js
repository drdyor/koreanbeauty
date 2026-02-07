#!/usr/bin/env node

/**
 * Guardian Voice Generation Script - ElevenLabs Version
 * Generates all 5 hypnosis scripts using ElevenLabs premium voices
 *
 * Setup:
 * 1. npm install elevenlabs-node
 * 2. Get API key from: https://elevenlabs.io/app/settings/api-keys
 * 3. Set environment variable: export ELEVENLABS_API_KEY="your_key_here"
 * 4. Run: node scripts/generate-voice-elevenlabs.js
 *
 * Cost: Uses Creator plan credits ($22/month for 100k chars)
 * All 5 scripts = ~12,000 chars = $0.22 worth of credits
 */

const fs = require('fs').promises;
const path = require('path');

// Output directory for generated audio files
const OUTPUT_DIR = path.join(__dirname, '../audio');

// ElevenLabs voices (pre-selected for hypnosis)
const VOICES = {
  rachel: '21m00Tcm4TlvDq8ikWAM', // Female, calm, natural
  bella: 'EXAVITQu4vr4xnSDxMaL',  // Female, soft, soothing
  adam: 'pNInz6obpgDQGcFmaJgB',   // Male, deep, grounding
  domi: 'AZnzlk1XvdvUeBnXmlld'    // Female, gentle, nurturing
};

// Script definitions (without SSML, ElevenLabs handles pacing naturally)
const scripts = [
  {
    id: '01_luteal_grounding',
    name: 'Luteal Phase Grounding',
    voice: 'rachel',
    text: `Close your eyes.

Take a deep breath in through your nose.

We're entering your alpha state now. Let's count down together.

Five... Feel your body beginning to relax. Your shoulders drop.

Four... Your breath slows to its natural rhythm. Nothing to force.

Three... Thoughts begin to quiet, like snow settling on the ground.

Two... You are entering your inner sanctuary. This is your safe space.

One... You are now in alpha. Your subconscious mind is receptive and open.

If you're in your luteal phase right now, your body feels different.

Heavier. Slower. More sensitive.

This is progesterone. This is not weakness. This is biology.

Your body is preparing for rest, for renewal, for deep wisdom.

The world tells you to stay productive, to push through.

But your luteal phase whispers: slow down. Turn inward. Listen.

Imagine a screen about six feet in front of you. This is your mental screen.

On this screen, see yourself tomorrow during your luteal phase.

Watch yourself choosing rest when your body asks for it.

See yourself saying no to demands that drain you.

Notice how natural this feels. This is not laziness. This is self-preservation.

Your luteal phase is a superpower disguised as a slowdown.

This is when you process. When you integrate. When you become wise.

Press your thumb, index finger, and middle finger together gently.

This is your luteal anchor. Whenever you press these three fingers together, you will remember:

Progesterone is intelligence. My body knows what it needs.

Release your fingers. The anchor is set.

Repeat these truths silently as I speak them:

I honor my rhythm.

I am becoming someone who works with my cycle, not against it.

My luteal phase is wisdom, not weakness.

Every day, in every way, I'm learning to trust my body.

In a moment, I will count from one to five, and you will return feeling grounded and aligned.

One... Beginning to return. Energy flowing back gently.

Two... Bringing this luteal wisdom with you.

Three... Your body remembers. You are safe in your rhythm.

Four... Feeling alert, calm, and deeply aligned.

Five... Open your eyes. You are fully present and at peace with your cycle.`
  },

  {
    id: '02_sleep_induction',
    name: 'Sleep Induction',
    voice: 'bella', // Softer voice for sleep
    text: `You are safe. Your body knows how to sleep.

Close your eyes if they aren't already closed.

Let's count down into deep rest.

Five... Your body is heavy, sinking into the bed.

Four... Your breath slows. Each exhale is a release.

Three... Your mind begins to drift like a leaf on water.

Two... You are entering the threshold of sleep. This is safe.

One... You are in delta now. Deep rest is coming.

Notice the weight of your head on the pillow.

Your jaw unclenches. Your tongue rests softly in your mouth.

Your shoulders drop away from your ears. Tension melts.

Each breath carries you deeper into stillness.

If you're in your luteal phase, your body is naturally preparing for sleep right now.

Progesterone makes you drowsy. This is not a problem. This is design.

Your body is saying: it's time to rest, to restore, to dream.

There is nothing you need to do right now.

No problem to solve. No task to complete.

This moment is only for rest.

Imagine a warm, gentle wave washing over you from head to toe.

This wave carries away any remaining tension.

Your forehead smooths. Your eyes soften behind your eyelids.

Your chest rises and falls like the ocean. Slow. Steady. Natural.

Your arms are heavy. Your legs are heavy. You are sinking.

Sleep is not something you do. Sleep is something you allow.

And right now, you are allowing.

Your nervous system shifts into its rest-and-digest state.

Your heart rate slows. Your blood pressure lowers.

Delta waves begin to rise in your brain.

This is the frequency of deep, healing sleep.

You are safe. You are held. You are allowed to let go.

If thoughts arise, let them drift by like clouds.

You don't need to follow them. You don't need to solve them.

Just breathe. Just sink. Just allow.

Sleep will find you. It always does.

Your only job now is to surrender.

Let go.

Let go.

Sleep is here.`
  },

  {
    id: '03_habit_installation',
    name: 'Habit Installation',
    voice: 'rachel',
    text: `Close your eyes. Take a deep breath.

We're going to install a new habit tonight. Not through willpower. Through visualization.

Your subconscious mind doesn't know the difference between a vivid visualization and reality.

What you see clearly on your mental screen can become your new normal.

Let's count down into alpha.

Five... Relaxing deeply.

Four... Breath slowing naturally.

Three... Thoughts quieting.

Two... Entering your inner sanctuary.

One... You are now in alpha. Receptive. Open. Ready.

Imagine a screen about six feet in front of you. Like a movie screen.

On this screen, you're going to watch yourself tomorrow.

See yourself when your habit cue happens.

Maybe it's finishing lunch. Maybe it's waking up. Maybe it's coming home.

Watch yourself in this moment. See it clearly.

Now, watch yourself naturally, easily doing your new habit.

Notice how automatic it feels. Like you've been doing this for years.

There's no resistance. No willpower needed. It's just what you do now.

See the details. What are you wearing? Where are you?

Notice how your body moves. See yourself doing this with ease.

Now, watch yourself feel the reward from this habit.

Maybe it's a sense of calm. Maybe it's energy. Maybe it's pride.

Let yourself feel this reward fully. This is why you do this habit.

Your subconscious mind is learning right now.

When the cue happens, you do the behavior, and you feel the reward.

This is your new identity. This is who you are becoming.

If you're in your follicular phase, your brain is especially plastic right now.

Estrogen helps you learn new patterns. Your neurons are forming new connections.

This is the perfect time to install a habit.

Press your thumb, index finger, and middle finger together.

This is your habit anchor. Tomorrow, when your cue happens, press these three fingers.

Your body will remember this moment. It will remember what to do.

Release your fingers.

Repeat these truths silently:

I am becoming someone who honors my habits.

This habit is easy and natural for me.

Every day, in every way, I'm aligning with my highest self.

In a moment, you'll return, and this new pattern will be installed.

One... Beginning to return.

Two... Bringing this new habit with you.

Three... Your subconscious remembers.

Four... Feeling confident and aligned.

Five... Open your eyes. The habit is installed. Tomorrow, you'll see.`
  },

  {
    id: '04_anxiety_reset',
    name: 'Anxiety Reset',
    voice: 'domi', // Gentle, nurturing voice for anxiety
    text: `This feeling is temporary. You are safe right now.

Close your eyes. Place one hand on your heart.

Breathe in for five counts. One, two, three, four, five.

Hold for five. One, two, three, four, five.

Exhale for five. One, two, three, four, five.

Again. Inhale. One, two, three, four, five.

Hold. One, two, three, four, five.

Exhale. One, two, three, four, five.

Your nervous system is shifting right now. From sympathetic to parasympathetic.

From fight-or-flight to rest-and-digest.

This is not dangerous. This is your body's wisdom.

If you're in your luteal phase, anxiety spikes are common.

Progesterone affects your GABA receptors. This is biochemistry, not your fault.

You are not broken. You are cycling.

Press your thumb, index finger, and middle finger together.

This is your calm anchor. Feel it working. Your body remembers safety.

Imagine two mirrors in front of you.

On the left, see yourself anxious, overwhelmed.

Acknowledge this. It's real. It's okay.

Now look to the right mirror.

See yourself calm. Grounded. Breathing steadily.

This version of you knows: this storm will pass.

Step into the right mirror. Feel this as your reality now.

You are safe. You are capable. You can handle this.

This anxiety is a wave. You are the ocean.

Waves rise. Waves fall. The ocean remains.

One more breath. In for five. One, two, three, four, five.

Hold. One, two, three, four, five.

Out for five. One, two, three, four, five.

When you open your eyes, the intensity will have softened.

One, two, three. Eyes open. You've got this.`
  },

  {
    id: '05_body_acceptance',
    name: 'Body Acceptance',
    voice: 'rachel',
    text: `Close your eyes. Take a deep breath.

Your body is not the enemy. Your cycle is not a curse.

Today, we release the shame you've carried about being hormonal.

Let's count down together.

Five... Your body relaxes. You are safe here.

Four... Your breath finds its rhythm.

Three... Thoughts quiet. Judgment fades.

Two... You enter your sanctuary of self-compassion.

One... You are in alpha. Your heart is open.

Imagine a warm, golden light above your head.

This is the light of acceptance. Of unconditional love.

Let this light pour down over you like honey.

It flows over your forehead. Your face. Your neck.

It fills your chest. Your belly. Your pelvis.

Every part of you that's been criticized is now held in golden light.

Your body has been doing impossible work your entire cycle.

Building. Shedding. Healing. Renewing.

Every month, your body performs miracles, and you've been calling it dysfunction.

Imagine a screen in front of you.

On this screen, see your younger self, maybe age twelve or thirteen.

The first time someone called you moody. Hormonal. Too much.

See how that younger you internalized that shame.

Now, as your present self, step into the screen.

Put your hand on her shoulder. Look her in the eyes.

Tell her: There is nothing wrong with you.

Tell her: Your cycle is intelligence, not dysfunction.

Tell her: You are allowed to change. You are allowed to feel.

Watch her face soften. Watch the shame begin to lift.

Now create a second mirror on your right.

In this mirror, see yourself tomorrow, living in full acceptance of your cycle.

You rest during your menstrual phase without guilt.

You honor your luteal need to slow down.

You celebrate your follicular energy when it rises.

You trust your ovulation intuition.

This is not indulgence. This is self-preservation.

This is not weakness. This is wisdom.

Press your three fingers together.

This is your body acceptance anchor.

Whenever shame arises about your cycle, press these fingers and remember:

My body is not broken. My cycle is brilliant.

Release your fingers.

Repeat these truths:

I release the belief that my hormones make me less than.

I am becoming someone who honors all phases of my cycle.

My body's rhythm is intelligence, not inconvenience.

Every day, I am learning to trust what my body knows.

The golden light continues to glow around you.

This light will stay with you as you return.

One... Beginning to come back.

Two... Bringing this acceptance with you.

Three... Your body is safe. You are whole.

Four... Feeling compassion for yourself and your cycle.

Five... Open your eyes. You are free.`
  }
];

/**
 * Generate a single hypnosis script using ElevenLabs
 */
async function generateScript(script) {
  console.log(`\n🎙️  Generating: ${script.name}...`);

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable not set');
  }

  const voiceId = VOICES[script.voice];
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const requestBody = {
    text: script.text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.75,        // High = consistent, calm
      similarity_boost: 0.8,  // High = true to voice
      style: 0.3,             // Low = subtle emotion (not theatrical)
      use_speaker_boost: true // Clearer pronunciation
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();

    // Create output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Save audio file
    const outputPath = path.join(OUTPUT_DIR, `${script.id}_${script.voice}.mp3`);
    await fs.writeFile(outputPath, Buffer.from(audioBuffer));

    // Calculate character count for cost tracking
    const charCount = script.text.length;
    console.log(`✅ Saved: ${outputPath} (${charCount} chars)`);

    return { path: outputPath, chars: charCount };
  } catch (error) {
    console.error(`❌ Error generating ${script.name}:`, error.message);
    throw error;
  }
}

/**
 * Generate all hypnosis scripts
 */
async function generateAllScripts() {
  console.log('🌙 Guardian Voice Generation (ElevenLabs Premium)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Voices: Rachel (calm), Bella (soft), Domi (nurturing)`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Scripts to generate: ${scripts.length}`);

  const startTime = Date.now();
  const results = [];
  let totalChars = 0;

  for (const script of scripts) {
    try {
      const result = await generateScript(script);
      results.push({ success: true, script: script.name, ...result });
      totalChars += result.chars;
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
  console.log(`📝 Total characters: ${totalChars.toLocaleString()}`);
  console.log(`⏱️  Total time: ${duration}s`);

  if (failed > 0) {
    console.log('\n❌ Failed scripts:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.script}: ${r.error}`);
    });
  }

  // Calculate cost (Creator plan = $22/mo for 100k chars)
  const costEstimate = (totalChars / 100000) * 22;
  console.log(`\n💰 Estimated cost: $${costEstimate.toFixed(2)} (${totalChars} chars used from monthly quota)`);
  console.log(`   Remaining: ${(100000 - totalChars).toLocaleString()} chars`);
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
