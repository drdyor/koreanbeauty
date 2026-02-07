// Full test of the Hamster Council with dialogue
// Run with: node test-council-full.js

// Set up environment
process.env.EXPO_PUBLIC_OPENROUTER_API_KEY = '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';

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Working free models
const FREE_MODELS = [
  'tngtech/deepseek-r1t2-chimera:free',
  'deepseek/deepseek-r1-distill-llama-70b:free',
  'mistralai/devstral-2512:free',
];

const HAMSTERS = {
  1: { name: 'Al', school: 'Adlerian', icon: '🟡', focus: 'relationships, belonging, courage' },
  2: { name: 'Erik', school: 'Eriksonian', icon: '🔮', focus: 'life stages, legacy, meaning' },
  3: { name: 'Cogni', school: 'CBT', icon: '🧩', focus: 'thought patterns, cognitive distortions' },
  4: { name: 'Rocky', school: 'Behavioral', icon: '⚡', focus: 'immediate action, practical steps' },
};

async function callAPI(messages, maxTokens = 500) {
  for (const model of FREE_MODELS) {
    try {
      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://glowchi.app',
          'X-Title': 'Glowchi Hamster Council Test',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      let content = data.choices[0]?.message?.content || '';

      // Clean thinking markers
      if (content.includes('<think>')) {
        content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      }

      if (content) return content;
    } catch (error) {
      continue;
    }
  }
  return null;
}

async function runFullCouncilTest(problem) {
  console.log('\n' + '🐹'.repeat(35));
  console.log('\n  HAMSTER COUNCIL - FULL DIALOGUE TEST');
  console.log('\n' + '🐹'.repeat(35));
  console.log(`\n📋 PROBLEM: "${problem}"\n`);

  // Generate the dialogue
  console.log('💬 Generating hamster dialogue...\n');

  const dialoguePrompt = `You are simulating a roundtable discussion between 4 hamster therapists.

THE USER'S PROBLEM: "${problem}"

THE HAMSTERS:
- Al (Adlerian): Focuses on relationships, belonging, courage
- Erik (Eriksonian): Focuses on life stages, legacy, meaning
- Cogni (CBT): Focuses on thought patterns, cognitive distortions
- Rocky (Behavioral): Focuses on immediate action, practical steps

Simulate a NATURAL DIALOGUE where they discuss and debate. They should:
- Respond TO each other by name ("Al's right..." or "Hold on Erik...")
- Disagree sometimes
- Include small actions in parentheses like (spinning wheel), (adjusting glasses)

Format: [NAME]: (action) What they say

Generate 6-8 exchanges. Make it feel like friends arguing at a coffee shop.`;

  const dialogue = await callAPI([{ role: 'user', content: dialoguePrompt }], 1000);

  if (dialogue) {
    console.log('═'.repeat(60));
    console.log('  🎭 THE HAMSTER COUNCIL DISCUSSES');
    console.log('═'.repeat(60));
    console.log('\n' + dialogue + '\n');
  } else {
    console.log('❌ Failed to generate dialogue');
    return;
  }

  // Generate consensus
  console.log('═'.repeat(60));
  console.log('  📝 COUNCIL CONSENSUS');
  console.log('═'.repeat(60));

  const consensusPrompt = `Based on this hamster council discussion:

${dialogue}

PROBLEM: "${problem}"

As Cogni (the chairman), provide a BRIEF consensus:
1. What the council agrees on
2. The ONE action the user should take NOW

Keep it to 2-3 sentences. Be direct.`;

  const consensus = await callAPI([{ role: 'user', content: consensusPrompt }], 300);
  console.log('\n' + (consensus || 'Failed to generate consensus') + '\n');

  console.log('═'.repeat(60));
  console.log('  ✅ TEST COMPLETE');
  console.log('═'.repeat(60));
}

// Run test
const testProblem = process.argv[2] || "I'm thinking about quitting my stable job to start a business, but I have a family to support and I'm 42. Is it too late?";

runFullCouncilTest(testProblem);
