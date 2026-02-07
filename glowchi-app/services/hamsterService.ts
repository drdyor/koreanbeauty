// Hamster Council - OpenRouter API Service
import { HamsterId, HAMSTER_CONFIG, CRISIS_KEYWORDS } from '../config/hamsters.config';

// OpenRouter configuration
// In production, store this in environment variables
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free tier models on OpenRouter (no cost) - January 2025 updated list
// Prioritizing models that are confirmed working
const FREE_MODELS = [
  'tngtech/deepseek-r1t2-chimera:free',         // Primary: DeepSeek R1T2 Chimera - confirmed working
  'deepseek/deepseek-r1-distill-llama-70b:free', // Fallback 1: DeepSeek R1 Distill 70B
  'mistralai/devstral-2512:free',               // Fallback 2: Mistral Devstral
  'nousresearch/deephermes-3-llama-3-8b-preview:free', // Fallback 3: DeepHermes 3
];
const DEFAULT_MODEL = FREE_MODELS[0];

export interface HamsterResponse {
  response: string;
  model: string;
  hamsterId: HamsterId;
  timestamp: string;
  isMock: boolean;
}

export interface HamsterSession {
  id: string;
  hamsterId: HamsterId;
  problem: string;
  response: string;
  toolUsed: string;
  toolResult: Record<string, string>;
  timestamp: string;
  nibblesEarned: number;
}

// Mock responses for testing without API key
const MOCK_RESPONSES: Record<HamsterId, string[]> = {
  1: [
    "Hey there! It sounds like you're feeling disconnected. Who's one person you haven't talked to in a while? Let's reconnect with them today.",
    "I hear you. Connection is medicine. Who do you feel closest to right now? What's one small way you could reach out today?",
    "That sounds tough. Remember, courage isn't the absence of fear - it's taking that first step anyway. Who could you text right now?",
  ],
  2: [
    "Let's think about where you are in your story. What chapter would you call this? Every struggle is shaping your narrative.",
    "This sounds like a transition chapter. What's the title you'd give to this period of your life? What comes next in the story?",
    "Your story continues. What legacy are you building right now? Even small moments matter in the grand narrative.",
  ],
  3: [
    "Let's organize this. What's the trigger that set this off? Once we identify the thought, we can flip it.",
    "I notice some cognitive distortions here. Are you catastrophizing? Let's break this down into facts vs. feelings.",
    "Structure brings clarity. What's the specific thought that's bothering you? Let's examine the evidence for and against it.",
  ],
  4: [
    "Alright, enough thinking. What's the FIRST physical step you can take in the next 10 minutes? Let's move.",
    "Feelings fester when we don't act. What's one tiny thing you can do RIGHT NOW? I'm setting a 10-minute timer.",
    "Dissect it. What's step one? Not the whole thing - just the very first action. Do that, then we talk.",
  ],
};

// Check for crisis keywords
export function checkForCrisis(text: string): boolean {
  return CRISIS_KEYWORDS.test(text);
}

// Get a random mock response
function getRandomMockResponse(hamsterId: HamsterId): string {
  const responses = MOCK_RESPONSES[hamsterId];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Main function to get hamster response
export async function getHamsterResponse(
  hamsterId: HamsterId,
  userMessage: string,
  context: string = ''
): Promise<HamsterResponse> {
  const hamster = HAMSTER_CONFIG[hamsterId];
  const timestamp = new Date().toISOString();

  // Check for crisis keywords first
  if (checkForCrisis(userMessage)) {
    return {
      response: "I notice you're going through something really difficult. I'm a hamster, not a professional - if you're in crisis, please reach out to a mental health professional or crisis line. You matter, and real help is available.",
      model: 'crisis-response',
      hamsterId,
      timestamp,
      isMock: true,
    };
  }

  // If no API key, use mock responses
  if (!OPENROUTER_API_KEY) {
    console.log('[HamsterService] No API key, using mock response');
    return {
      response: getRandomMockResponse(hamsterId),
      model: 'mock',
      hamsterId,
      timestamp,
      isMock: true,
    };
  }

  const messages = [
    { role: 'system', content: hamster.systemPrompt },
    {
      role: 'user',
      content: context
        ? `Context: ${context}\n\nProblem: ${userMessage}`
        : `Problem: ${userMessage}`,
    },
  ];

  // Try each model in order until one works
  for (const model of FREE_MODELS) {
    try {
      console.log(`[HamsterService] Trying model: ${model}`);

      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://glowchi.app',
          'X-Title': 'Glowchi Hamster Council',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn(`[HamsterService] ${model} failed:`, errorData.error?.message);
        continue; // Try next model
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content;

      if (assistantMessage) {
        return {
          response: assistantMessage,
          model: data.model || model,
          hamsterId,
          timestamp,
          isMock: false,
        };
      }
    } catch (error) {
      console.warn(`[HamsterService] ${model} error:`, error);
      continue; // Try next model
    }
  }

  // All models failed, use mock
  console.error('[HamsterService] All models failed, using mock');
  return {
    response: getRandomMockResponse(hamsterId),
    model: 'mock-fallback',
    hamsterId,
    timestamp,
    isMock: true,
  };
}

// Get response from all 4 hamsters (for "Spin the Wheel" feature)
export async function getAllHamsterResponses(
  userMessage: string
): Promise<HamsterResponse[]> {
  const promises = ([1, 2, 3, 4] as HamsterId[]).map((id) =>
    getHamsterResponse(id, userMessage)
  );

  return Promise.all(promises);
}

// Synthesize responses from all hamsters into one plan (Cogni-style)
export function synthesizeResponses(responses: HamsterResponse[]): string {
  const lines = responses.map((r) => {
    const hamster = HAMSTER_CONFIG[r.hamsterId];
    return `**${hamster.defaultName} (${hamster.school}):** ${r.response}`;
  });

  return `## Combined Perspectives\n\n${lines.join('\n\n')}\n\n---\n**Synthesis:** Take the action from Rocky, use Cogni's structure, find connection like Al suggests, and remember this is just one chapter in your story (Erik).`;
}

// ============================================================================
// HAMSTER COUNCIL CONSENSUS MECHANISM
// 3-stage deliberation for higher quality answers
// ============================================================================

export interface HamsterRanking {
  hamsterId: HamsterId;
  evaluation: string;
  parsedRanking: string[]; // e.g., ["Response C", "Response A", "Response B", "Response D"]
}

export interface CouncilResult {
  stage1: HamsterResponse[];           // Individual responses
  stage2: HamsterRanking[];            // Peer evaluations (legacy)
  dialogue?: HamsterDialogue;          // NEW: Actual hamster conversation
  stage3: string;                      // Final synthesized answer
  aggregateRankings: AggregateRank[];  // Who got ranked best overall
  labelToHamster: Record<string, HamsterId>; // "Response A" -> hamsterId
  chairmanId: HamsterId;
  timestamp: string;
  isMock: boolean;
}

export interface AggregateRank {
  hamsterId: HamsterId;
  hamsterName: string;
  averageRank: number;
  voteCount: number;
}

// Chairman hamster - Cogni (CBT) is good at synthesis and structure
const CHAIRMAN_HAMSTER: HamsterId = 3;

// =============================================================================
// DIALOGUE GENERATION - Natural hamster conversation
// =============================================================================

export interface DialogueExchange {
  hamsterId: HamsterId;
  hamsterName: string;
  action: string;  // e.g., "(leaning forward)", "(nodding)"
  content: string;
  timestamp: string;
}

export interface HamsterDialogue {
  exchanges: DialogueExchange[];
  rawDialogue: string;
  timestamp: string;
  isMock: boolean;
}

/**
 * Generate natural dialogue between hamsters discussing the user's problem.
 * This creates an actual conversation where hamsters respond to each other.
 */
export async function generateHamsterDialogue(
  userProblem: string,
  initialResponses: HamsterResponse[]
): Promise<HamsterDialogue> {
  const timestamp = new Date().toISOString();

  // Build initial takes summary
  const initialTakesText = initialResponses
    .map(r => {
      const h = HAMSTER_CONFIG[r.hamsterId];
      return `- ${h.defaultName} (${h.school}): ${r.response}`;
    })
    .join('\n');

  const dialoguePrompt = `You are simulating a roundtable discussion between 4 hamster therapists discussing a user's problem.

THE USER'S PROBLEM: "${userProblem}"

THE HAMSTERS:
- Al (Adlerian): Focuses on relationships, belonging, courage, overcoming inferiority
- Erik (Eriksonian): Focuses on life stages, legacy, meaning, personal narrative
- Cogni (CBT): Focuses on thought patterns, cognitive distortions, logical restructuring
- Rocky (Behavioral): Focuses on immediate action, breaking problems into steps, no-nonsense approach

${initialTakesText ? `THEIR INITIAL THOUGHTS:\n${initialTakesText}\n` : ''}

Now simulate a NATURAL DIALOGUE where they discuss, debate, and build on each other's ideas. They should:
- Respond TO each other by name (e.g., "Al's right about..." or "Hold on Erik...")
- Disagree sometimes and challenge each other's views
- Build on good points others make
- Have distinct personalities and voices
- Include small actions/gestures in parentheses (e.g., "(spinning exercise wheel)", "(adjusting glasses)")

Format each line EXACTLY as:
[HAMSTER_NAME]: (action) What they say

Generate 6-8 exchanges of natural back-and-forth dialogue. Make it feel like friends debating at a coffee shop, not a formal presentation.`;

  // If no API key, return mock dialogue
  if (!OPENROUTER_API_KEY) {
    return {
      exchanges: getMockDialogue(),
      rawDialogue: '',
      timestamp,
      isMock: true,
    };
  }

  const messages = [{ role: 'user' as const, content: dialoguePrompt }];

  // Try to get dialogue from API
  for (const model of FREE_MODELS) {
    try {
      console.log(`[HamsterDialogue] Trying model: ${model}`);
      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://glowchi.app',
          'X-Title': 'Glowchi Hamster Council',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.warn(`[HamsterDialogue] ${model} failed:`, err.error?.message);
        continue;
      }

      const data = await response.json();
      let rawDialogue = data.choices[0]?.message?.content || '';

      // Clean up thinking markers if present
      if (rawDialogue.includes('<think>')) {
        rawDialogue = rawDialogue.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      }

      if (rawDialogue) {
        const exchanges = parseDialogue(rawDialogue);
        return {
          exchanges,
          rawDialogue,
          timestamp,
          isMock: false,
        };
      }
    } catch (error) {
      console.warn(`[HamsterDialogue] ${model} error:`, error);
      continue;
    }
  }

  // Fallback to mock
  return {
    exchanges: getMockDialogue(),
    rawDialogue: '',
    timestamp,
    isMock: true,
  };
}

/**
 * Parse raw dialogue text into structured exchanges.
 */
function parseDialogue(rawDialogue: string): DialogueExchange[] {
  const exchanges: DialogueExchange[] = [];
  const lines = rawDialogue.split('\n').filter(line => line.trim());
  const timestamp = new Date().toISOString();

  // Name to ID mapping
  const nameToId: Record<string, HamsterId> = {
    'al': 1,
    'erik': 2,
    'cogni': 3,
    'rocky': 4,
  };

  for (const line of lines) {
    // Match pattern: [NAME]: (action) content or [NAME]: content
    const match = line.match(/\[(\w+)\]:\s*(?:\(([^)]+)\))?\s*(.+)/);
    if (match) {
      const [, name, action, content] = match;
      const hamsterId = nameToId[name.toLowerCase()];

      if (hamsterId) {
        exchanges.push({
          hamsterId,
          hamsterName: HAMSTER_CONFIG[hamsterId].defaultName,
          action: action || '',
          content: content.trim(),
          timestamp,
        });
      }
    }
  }

  return exchanges;
}

/**
 * Get mock dialogue for when API is unavailable.
 */
function getMockDialogue(): DialogueExchange[] {
  const timestamp = new Date().toISOString();
  return [
    {
      hamsterId: 1,
      hamsterName: 'Al',
      action: 'leaning forward',
      content: "Let's start with who you're really doing this for. Is this about proving something to someone?",
      timestamp,
    },
    {
      hamsterId: 4,
      hamsterName: 'Rocky',
      action: 'spinning wheel',
      content: "Al's got a point, but let's get concrete. What's the first thing you'd actually DO tomorrow morning?",
      timestamp,
    },
    {
      hamsterId: 2,
      hamsterName: 'Erik',
      action: 'stroking whiskers',
      content: "Rocky's rushing it. This feels like a midlife pivot. What chapter of your story is ending here?",
      timestamp,
    },
    {
      hamsterId: 3,
      hamsterName: 'Cogni',
      action: 'adjusting glasses',
      content: "Hold on everyone. I'm hearing catastrophizing - 'too late' at 42? The average founder is 45. Let's check that assumption.",
      timestamp,
    },
    {
      hamsterId: 1,
      hamsterName: 'Al',
      action: 'nodding',
      content: "Cogni's right about the data, but Erik's question matters too. Is this about growth or escape?",
      timestamp,
    },
    {
      hamsterId: 4,
      hamsterName: 'Rocky',
      action: 'jumping down',
      content: "Fine - let's test both. 3-month experiment: 10 hours a week on the business while keeping the job. Family stays secure.",
      timestamp,
    },
  ];
}

/**
 * Stage 2: Each hamster anonymously reviews and ranks the other hamsters' advice.
 * This creates consensus and identifies the most helpful perspectives.
 */
async function stage2CollectRankings(
  userProblem: string,
  stage1Results: HamsterResponse[]
): Promise<{ rankings: HamsterRanking[]; labelToHamster: Record<string, HamsterId> }> {
  // Create anonymous labels (Response A, B, C, D)
  const labels = stage1Results.map((_, i) => String.fromCharCode(65 + i)); // A, B, C, D

  const labelToHamster: Record<string, HamsterId> = {};
  labels.forEach((label, i) => {
    labelToHamster[`Response ${label}`] = stage1Results[i].hamsterId;
  });

  // Build the anonymized responses text
  const responsesText = stage1Results
    .map((r, i) => `Response ${labels[i]}:\n${r.response}`)
    .join('\n\n');

  const rankingPrompt = `You are a hamster therapist evaluating advice from your colleagues for this problem:

Problem: ${userProblem}

Here are the anonymized responses:

${responsesText}

Your task:
1. Briefly evaluate each response (1 sentence each) - what's helpful and what's missing?
2. Then provide your final ranking from most to least helpful.

IMPORTANT: End with "FINAL RANKING:" followed by a numbered list like:
1. Response C
2. Response A
3. Response B
4. Response D

Keep your evaluation concise (under 100 words total).`;

  const rankings: HamsterRanking[] = [];

  // Each hamster evaluates the others
  for (const hamsterId of [1, 2, 3, 4] as HamsterId[]) {
    const hamster = HAMSTER_CONFIG[hamsterId];

    // If no API key, generate mock ranking
    if (!OPENROUTER_API_KEY) {
      const shuffled = [...labels].sort(() => Math.random() - 0.5);
      rankings.push({
        hamsterId,
        evaluation: `${hamster.defaultName} thinks all advice has merit, but prefers action-oriented approaches.`,
        parsedRanking: shuffled.map(l => `Response ${l}`),
      });
      continue;
    }

    const messages = [
      { role: 'system', content: `You are ${hamster.defaultName}, a hamster using ${hamster.school} psychology. ${hamster.systemPrompt}` },
      { role: 'user', content: rankingPrompt },
    ];

    // Try to get ranking from API
    for (const model of FREE_MODELS) {
      try {
        const response = await fetch(OPENROUTER_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://glowchi.app',
            'X-Title': 'Glowchi Hamster Council',
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 200,
            temperature: 0.5,
          }),
        });

        if (!response.ok) continue;

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        rankings.push({
          hamsterId,
          evaluation: content,
          parsedRanking: parseRankingFromText(content),
        });
        break;
      } catch (error) {
        console.warn(`[Council Stage 2] ${model} error for hamster ${hamsterId}:`, error);
        continue;
      }
    }

    // Fallback if all models failed
    if (!rankings.find(r => r.hamsterId === hamsterId)) {
      const shuffled = [...labels].sort(() => Math.random() - 0.5);
      rankings.push({
        hamsterId,
        evaluation: `${hamster.defaultName} couldn't complete the evaluation.`,
        parsedRanking: shuffled.map(l => `Response ${l}`),
      });
    }
  }

  return { rankings, labelToHamster };
}

/**
 * Parse the "FINAL RANKING:" section from evaluation text.
 */
function parseRankingFromText(text: string): string[] {
  // Look for "FINAL RANKING:" section
  if (text.includes('FINAL RANKING:')) {
    const parts = text.split('FINAL RANKING:');
    if (parts.length >= 2) {
      const rankingSection = parts[1];
      // Extract "Response X" patterns in order
      const matches = rankingSection.match(/Response [A-D]/g);
      if (matches && matches.length > 0) {
        return matches;
      }
    }
  }

  // Fallback: find any "Response X" in the text
  const matches = text.match(/Response [A-D]/g);
  return matches || [];
}

/**
 * Calculate aggregate rankings across all hamster evaluations.
 */
function calculateAggregateRankings(
  rankings: HamsterRanking[],
  labelToHamster: Record<string, HamsterId>
): AggregateRank[] {
  const positionsByHamster: Record<HamsterId, number[]> = { 1: [], 2: [], 3: [], 4: [] };

  for (const ranking of rankings) {
    ranking.parsedRanking.forEach((label, position) => {
      const hamsterId = labelToHamster[label];
      if (hamsterId) {
        positionsByHamster[hamsterId].push(position + 1); // 1-indexed position
      }
    });
  }

  const aggregates: AggregateRank[] = [];
  for (const [id, positions] of Object.entries(positionsByHamster)) {
    const hamsterId = Number(id) as HamsterId;
    const hamster = HAMSTER_CONFIG[hamsterId];
    if (positions.length > 0) {
      const avgRank = positions.reduce((a, b) => a + b, 0) / positions.length;
      aggregates.push({
        hamsterId,
        hamsterName: hamster.defaultName,
        averageRank: Math.round(avgRank * 100) / 100,
        voteCount: positions.length,
      });
    }
  }

  // Sort by average rank (lower is better)
  return aggregates.sort((a, b) => a.averageRank - b.averageRank);
}

/**
 * Stage 3: Chairman hamster synthesizes the final answer using all
 * individual responses and peer rankings.
 */
async function stage3SynthesizeFinal(
  userProblem: string,
  stage1Results: HamsterResponse[],
  stage2Results: HamsterRanking[],
  aggregateRankings: AggregateRank[]
): Promise<string> {
  const chairman = HAMSTER_CONFIG[CHAIRMAN_HAMSTER];

  // Build context from Stage 1
  const stage1Text = stage1Results
    .map(r => {
      const h = HAMSTER_CONFIG[r.hamsterId];
      return `${h.defaultName} (${h.school}): ${r.response}`;
    })
    .join('\n\n');

  // Build rankings summary
  const rankingSummary = aggregateRankings
    .map((r, i) => `${i + 1}. ${r.hamsterName} (avg rank: ${r.averageRank})`)
    .join('\n');

  const synthesisPrompt = `You are ${chairman.defaultName}, the Chairman of the Hamster Council. Your colleagues have given advice on a problem and ranked each other's responses.

PROBLEM: ${userProblem}

INDIVIDUAL ADVICE:
${stage1Text}

PEER RANKING (most helpful first):
${rankingSummary}

As Chairman, synthesize the BEST actionable advice by:
1. Prioritizing insights from the highest-ranked responses
2. Combining complementary perspectives
3. Giving ONE clear action step the user can take RIGHT NOW

Keep your synthesis concise (3-4 sentences max). End with a single concrete action.`;

  // If no API key, return mock synthesis
  if (!OPENROUTER_API_KEY) {
    const topHamster = aggregateRankings[0]?.hamsterName || 'Rocky';
    return `The council has deliberated. ${topHamster}'s advice resonated most with your fellow hamsters. Here's the consensus: Start with one small action today. Don't overthink it - just take the first step, and let momentum build from there. Your action: Do the smallest possible version of what you've been avoiding, right now.`;
  }

  const messages = [
    { role: 'system', content: chairman.systemPrompt },
    { role: 'user', content: synthesisPrompt },
  ];

  // Try to get synthesis from API
  for (const model of FREE_MODELS) {
    try {
      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://glowchi.app',
          'X-Title': 'Glowchi Hamster Council',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 200,
          temperature: 0.6,
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (content) return content;
    } catch (error) {
      console.warn(`[Council Stage 3] ${model} error:`, error);
      continue;
    }
  }

  // Fallback synthesis
  const topHamster = aggregateRankings[0]?.hamsterName || 'The council';
  return `${topHamster}'s approach was rated most helpful by your hamster council. The key insight: take one concrete step today. Action beats analysis. What's the smallest thing you can do in the next 10 minutes?`;
}

/**
 * Run the full Hamster Council consensus mechanism.
 *
 * Stage 1: All hamsters give individual advice
 * Stage 2: Hamsters have a DIALOGUE (new!) - actual conversation
 * Stage 3: Chairman synthesizes final answer based on the discussion
 */
export async function runHamsterCouncil(userProblem: string): Promise<CouncilResult> {
  const timestamp = new Date().toISOString();

  // Check for crisis first
  if (checkForCrisis(userProblem)) {
    return {
      stage1: [],
      stage2: [],
      stage3: "I notice you're going through something really difficult. The hamster council cares about you, but we're not professionals. If you're in crisis, please reach out to a mental health professional or crisis line. You matter, and real help is available.",
      aggregateRankings: [],
      labelToHamster: {},
      chairmanId: CHAIRMAN_HAMSTER,
      timestamp,
      isMock: true,
    };
  }

  console.log('[HamsterCouncil] Starting Stage 1: Individual responses');

  // Stage 1: Get all individual responses
  const stage1Results = await getAllHamsterResponses(userProblem);

  console.log('[HamsterCouncil] Starting Stage 2: Hamster Dialogue');

  // Stage 2 (NEW): Generate actual dialogue between hamsters
  const dialogue = await generateHamsterDialogue(userProblem, stage1Results);

  // Legacy peer review (kept for backwards compatibility)
  const { rankings, labelToHamster } = await stage2CollectRankings(userProblem, stage1Results);
  const aggregateRankings = calculateAggregateRankings(rankings, labelToHamster);

  console.log('[HamsterCouncil] Starting Stage 3: Chairman synthesis');

  // Stage 3: Chairman synthesizes based on the dialogue
  const finalSynthesis = await stage3SynthesizeFromDialogue(
    userProblem,
    dialogue,
    aggregateRankings
  );

  console.log('[HamsterCouncil] Complete');

  return {
    stage1: stage1Results,
    stage2: rankings,
    dialogue,  // NEW: Include the dialogue
    stage3: finalSynthesis,
    aggregateRankings,
    labelToHamster,
    chairmanId: CHAIRMAN_HAMSTER,
    timestamp,
    isMock: !OPENROUTER_API_KEY,
  };
}

/**
 * Synthesize final answer based on the hamster dialogue.
 */
async function stage3SynthesizeFromDialogue(
  userProblem: string,
  dialogue: HamsterDialogue,
  aggregateRankings: AggregateRank[]
): Promise<string> {
  const chairman = HAMSTER_CONFIG[CHAIRMAN_HAMSTER];

  // Build dialogue text
  const dialogueText = dialogue.exchanges
    .map(e => `${e.hamsterName}: ${e.content}`)
    .join('\n');

  const synthesisPrompt = `You are ${chairman.defaultName}, the Chairman of the Hamster Council. Your colleagues have been discussing a user's problem.

PROBLEM: ${userProblem}

THE DISCUSSION:
${dialogueText || 'The hamsters shared their perspectives.'}

As Chairman, provide a CONSENSUS summary:
1. What the council agrees on (1-2 sentences)
2. The key insight from the discussion
3. ONE concrete action the user should take RIGHT NOW

Keep it concise (3-4 sentences max). Be direct and actionable.`;

  // If no API key, return mock synthesis
  if (!OPENROUTER_API_KEY) {
    return "The council has spoken! While we debated different angles, we agree: start small but start NOW. Your action: spend 30 minutes this week mapping out your idea. Not planning the whole business - just writing down what problem you'd solve and for whom. That's your first step.";
  }

  const messages = [
    { role: 'system' as const, content: chairman.systemPrompt },
    { role: 'user' as const, content: synthesisPrompt },
  ];

  // Try to get synthesis from API
  for (const model of FREE_MODELS) {
    try {
      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://glowchi.app',
          'X-Title': 'Glowchi Hamster Council',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 300,
          temperature: 0.6,
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      let content = data.choices[0]?.message?.content || '';

      // Clean up thinking markers
      if (content.includes('<think>')) {
        content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      }

      if (content) return content;
    } catch (error) {
      console.warn(`[Council Stage 3] ${model} error:`, error);
      continue;
    }
  }

  // Fallback synthesis
  return "The council has deliberated. Key insight: this isn't about age, it's about testing assumptions. Your action: spend 2 hours this week talking to 3 potential customers. Don't build anything yet - just validate the need exists.";
}
