// Quick test script for Hamster Council dialogue
// Run with: node test-council-dialogue.js

const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Updated free models list - January 2025
// Prioritizing models that work and respond quickly
const FREE_MODELS = [
  'tngtech/deepseek-r1t2-chimera:free',      // Primary: Works! DeepSeek R1T2 Chimera
  'deepseek/deepseek-r1-distill-llama-70b:free', // Fallback 1: DeepSeek R1 Distill 70B
  'mistralai/devstral-2512:free',            // Fallback 2: Mistral Devstral
  'nousresearch/deephermes-3-llama-3-8b-preview:free', // Fallback 3: DeepHermes 3
];

const HAMSTERS = {
  1: { name: 'Al', school: 'Adlerian', focus: 'relationships and belonging' },
  2: { name: 'Erik', school: 'Eriksonian', focus: 'life stages and meaning' },
  3: { name: 'Cogni', school: 'CBT', focus: 'thought patterns and data' },
  4: { name: 'Rocky', school: 'Behavioral', focus: 'action and practical steps' },
};

async function callOpenRouter(messages, maxTokens = 500) {
  for (const model of FREE_MODELS) {
    try {
      console.log(`  Trying model: ${model}`);
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
          // Skip extended thinking for faster responses
          provider: {
            require_parameters: false
          }
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.log(`  ${model} failed: ${err.error?.message || 'Unknown error'}`);
        continue;
      }

      const data = await response.json();
      let content = data.choices[0]?.message?.content || '';

      // Clean up thinking markers if present
      if (content.includes('<think>')) {
        content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      }

      return content;
    } catch (error) {
      console.log(`  ${model} error: ${error.message}`);
      continue;
    }
  }
  return null;
}

async function runDialogueTest(problem) {
  console.log('\n' + '='.repeat(70));
  console.log('HAMSTER COUNCIL DIALOGUE TEST');
  console.log('='.repeat(70));
  console.log(`\nPROBLEM: "${problem}"\n`);

  // STAGE 1: Get individual responses
  console.log('--- STAGE 1: Individual Responses ---\n');
  const responses = {};

  for (const [id, hamster] of Object.entries(HAMSTERS)) {
    console.log(`Getting response from ${hamster.name}...`);
    const messages = [
      {
        role: 'system',
        content: `You are ${hamster.name}, a hamster therapist using ${hamster.school} psychology. You focus on ${hamster.focus}. Give a brief 2-3 sentence response to the user's problem. Be direct and insightful.`,
      },
      { role: 'user', content: `Problem: ${problem}` },
    ];

    const response = await callOpenRouter(messages, 150);
    responses[id] = response;
    console.log(`\n${hamster.name}: ${response}\n`);
  }

  // STAGE 2: Generate ACTUAL DIALOGUE between hamsters
  console.log('\n--- STAGE 2: Hamster Dialogue (NEW) ---\n');

  const dialoguePrompt = `You are simulating a roundtable discussion between 4 hamster therapists discussing a user's problem.

THE PROBLEM: "${problem}"

THEIR INITIAL TAKES:
- Al (Adlerian): ${responses[1]}
- Erik (Eriksonian): ${responses[2]}
- Cogni (CBT): ${responses[3]}
- Rocky (Behavioral): ${responses[4]}

Now simulate a NATURAL DIALOGUE where they discuss, debate, and build on each other's ideas. They should:
- Respond TO each other (not just monologue)
- Disagree sometimes
- Ask each other clarifying questions
- Build on good points others make
- Have distinct voices/personalities

Format each line as:
[HAMSTER_NAME]: What they say

Generate 6-8 exchanges of natural dialogue. Make it feel like a real conversation, not a formal debate.`;

  console.log('Generating dialogue...');
  const dialogue = await callOpenRouter(
    [{ role: 'user', content: dialoguePrompt }],
    1000  // Increased for longer dialogue
  );

  console.log('\n' + dialogue + '\n');

  // STAGE 3: Consensus
  console.log('\n--- STAGE 3: Reaching Consensus ---\n');

  const consensusPrompt = `The hamsters have been discussing. Based on this dialogue:

${dialogue}

Now have them reach a consensus. Cogni (the chairman) should summarize:
1. What they agree on
2. The key action the user should take
3. One thing they're still debating

Keep it concise (3-4 sentences).`;

  const consensus = await callOpenRouter(
    [{ role: 'user', content: consensusPrompt }],
    200
  );

  console.log('CONSENSUS: ' + consensus);

  console.log('\n' + '='.repeat(70));
  console.log('TEST COMPLETE');
  console.log('='.repeat(70));
}

// Run the test
const testProblem = "I'm thinking about quitting my stable job to start a business, but I have a family to support and I'm 42 years old. Is it too late?";

runDialogueTest(testProblem);
