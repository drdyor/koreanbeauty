// Hamster Council - OpenRouter API Service
import { HamsterId, HAMSTER_CONFIG } from './config';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Free tier models - in order of preference
const FREE_MODELS = [
  'xiaomi/mimo-v2-flash:free',
  'deepseek/deepseek-r1-0528:free',
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

// Mock responses - tight, direct, no therapy-speak
const MOCK_RESPONSES: Record<HamsterId, string[]> = {
  1: [
    "This is about your boyfriend not treating you like a partner. Have you told him directly: 'I need to know your schedule to plan mine'?",
    "You keep talking about work but there's a person here. Who at work is actually the problem?",
    "This sounds like it's about your mom. What do you actually need from her that you haven't asked for?",
  ],
  2: [
    "This is 'The Reckoning' — the part where you find out if he can meet you halfway. What happens if he can't?",
    "You're in 'The Waiting Room.' What are you waiting for permission to do?",
    "This chapter is called 'Learning What I Actually Need.' What did you just learn?",
  ],
  3: [
    "You're calling yourself a 'firecracker' like it's an insult. Is that his word or are you mind-reading?",
    "You said he 'doesn't have to' keep you informed. That's a belief, not a fact. Where'd you get that rule?",
    "You're assuming what he thinks about his dad means something about you. Does it? Do you actually know?",
  ],
  4: [
    "Text him: 'I need your schedule for the conference so I can plan.' Send it now.",
    "Stop analyzing why. Call him tonight and say what you need. Do it before 9pm.",
    "You've been spinning on this for days. One text: 'Can we talk about how we communicate during trips?' Send it.",
  ],
};

export interface HamsterResponse {
  response: string;
  model: string;
  isMock: boolean;
}

function getRandomMock(hamsterId: HamsterId): string {
  const responses = MOCK_RESPONSES[hamsterId];
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function getHamsterResponse(
  hamsterId: HamsterId,
  userMessage: string
): Promise<HamsterResponse> {
  const hamster = HAMSTER_CONFIG[hamsterId];

  // No API key = mock mode
  if (!OPENROUTER_API_KEY) {
    console.log('[HamsterService] No API key, using mock');
    return { response: getRandomMock(hamsterId), model: 'mock', isMock: true };
  }

  const messages = [
    { role: 'system', content: hamster.systemPrompt },
    { role: 'user', content: `Problem: ${userMessage}` },
  ];

  // Try each model until one works
  for (const model of FREE_MODELS) {
    try {
      console.log(`[HamsterService] Trying ${model}`);

      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'GlowChi Think Tank',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.warn(`[HamsterService] ${model} failed`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (content) {
        return { response: content, model, isMock: false };
      }
    } catch (err) {
      console.warn(`[HamsterService] ${model} error:`, err);
      continue;
    }
  }

  // All failed = mock
  return { response: getRandomMock(hamsterId), model: 'mock-fallback', isMock: true };
}

// Session storage
export interface ThinkTankSession {
  id: string;
  hamsterId: HamsterId;
  problem: string;
  response: string;
  toolResult: Record<string, string>;
  timestamp: string;
}

const STORAGE_KEY = 'thinktank-sessions';

export function getSessions(): ThinkTankSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSession(session: ThinkTankSession): void {
  const sessions = getSessions();
  sessions.unshift(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 50))); // Keep last 50
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================================================
// COUNCIL CONSENSUS MECHANISM (from Karpathy's LLM Council)
// 3-stage deliberation for higher quality answers
// ============================================================================

export interface HamsterRanking {
  hamsterId: HamsterId;
  evaluation: string;
  parsedRanking: string[]; // ["Response C", "Response A", ...]
}

export interface AggregateRank {
  hamsterId: HamsterId;
  hamsterName: string;
  averageRank: number;
  voteCount: number;
}

export interface CouncilResult {
  stage1: { hamsterId: HamsterId; response: string }[];
  stage2: HamsterRanking[];
  stage3: string;
  aggregateRankings: AggregateRank[];
  labelToHamster: Record<string, HamsterId>;
  chairmanId: HamsterId;
  timestamp: string;
  isMock: boolean;
}

// Cogni (CBT) is the chairman - good at synthesis
const CHAIRMAN_HAMSTER: HamsterId = 3;

/**
 * Stage 1: Get responses from all 4 hamsters in parallel
 */
async function getAllHamsterResponses(
  problem: string
): Promise<{ hamsterId: HamsterId; response: string }[]> {
  const hamsterIds: HamsterId[] = [1, 2, 3, 4];
  const results = await Promise.all(
    hamsterIds.map(async (id) => {
      const result = await getHamsterResponse(id, problem);
      return { hamsterId: id, response: result.response };
    })
  );
  return results;
}

/**
 * Stage 2: Each hamster anonymously reviews and ranks the others
 */
async function stage2CollectRankings(
  problem: string,
  stage1Results: { hamsterId: HamsterId; response: string }[]
): Promise<{ rankings: HamsterRanking[]; labelToHamster: Record<string, HamsterId> }> {
  const labels = stage1Results.map((_, i) => String.fromCharCode(65 + i)); // A, B, C, D

  const labelToHamster: Record<string, HamsterId> = {};
  labels.forEach((label, i) => {
    labelToHamster[`Response ${label}`] = stage1Results[i].hamsterId;
  });

  const responsesText = stage1Results
    .map((r, i) => `Response ${labels[i]}:\n${r.response}`)
    .join('\n\n');

  const rankingPrompt = `You're ranking advice for this problem:

Problem: ${problem}

Responses:
${responsesText}

Evaluate each briefly (1 sentence). Then rank best to worst.
End with:
FINAL RANKING:
1. Response X
2. Response Y
3. Response Z
4. Response W

Keep it under 80 words total.`;

  const rankings: HamsterRanking[] = [];

  for (const hamsterId of [1, 2, 3, 4] as HamsterId[]) {
    const hamster = HAMSTER_CONFIG[hamsterId];

    if (!OPENROUTER_API_KEY) {
      const shuffled = [...labels].sort(() => Math.random() - 0.5);
      rankings.push({
        hamsterId,
        evaluation: `${hamster.defaultName} ranked the responses.`,
        parsedRanking: shuffled.map((l) => `Response ${l}`),
      });
      continue;
    }

    try {
      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'GlowChi Council',
        },
        body: JSON.stringify({
          model: FREE_MODELS[0],
          messages: [
            { role: 'system', content: `You are ${hamster.defaultName}. Be direct and brief.` },
            { role: 'user', content: rankingPrompt },
          ],
          max_tokens: 200,
          temperature: 0.5,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        rankings.push({
          hamsterId,
          evaluation: content,
          parsedRanking: parseRankingFromText(content),
        });
      } else {
        throw new Error('API failed');
      }
    } catch {
      const shuffled = [...labels].sort(() => Math.random() - 0.5);
      rankings.push({
        hamsterId,
        evaluation: `${hamster.defaultName} couldn't complete ranking.`,
        parsedRanking: shuffled.map((l) => `Response ${l}`),
      });
    }
  }

  return { rankings, labelToHamster };
}

function parseRankingFromText(text: string): string[] {
  if (text.includes('FINAL RANKING:')) {
    const parts = text.split('FINAL RANKING:');
    if (parts.length >= 2) {
      const matches = parts[1].match(/Response [A-D]/g);
      if (matches) return matches;
    }
  }
  return text.match(/Response [A-D]/g) || [];
}

function calculateAggregateRankings(
  rankings: HamsterRanking[],
  labelToHamster: Record<string, HamsterId>
): AggregateRank[] {
  const positions: Record<HamsterId, number[]> = { 1: [], 2: [], 3: [], 4: [] };

  for (const ranking of rankings) {
    ranking.parsedRanking.forEach((label, pos) => {
      const hId = labelToHamster[label];
      if (hId) positions[hId].push(pos + 1);
    });
  }

  const aggregates: AggregateRank[] = [];
  for (const [id, pos] of Object.entries(positions)) {
    const hamsterId = Number(id) as HamsterId;
    if (pos.length > 0) {
      aggregates.push({
        hamsterId,
        hamsterName: HAMSTER_CONFIG[hamsterId].defaultName,
        averageRank: Math.round((pos.reduce((a, b) => a + b, 0) / pos.length) * 100) / 100,
        voteCount: pos.length,
      });
    }
  }

  return aggregates.sort((a, b) => a.averageRank - b.averageRank);
}

/**
 * Stage 3: Chairman synthesizes the final answer
 */
async function stage3SynthesizeFinal(
  problem: string,
  stage1Results: { hamsterId: HamsterId; response: string }[],
  aggregateRankings: AggregateRank[]
): Promise<string> {
  const chairman = HAMSTER_CONFIG[CHAIRMAN_HAMSTER];

  const stage1Text = stage1Results
    .map((r) => `${HAMSTER_CONFIG[r.hamsterId].defaultName}: ${r.response}`)
    .join('\n\n');

  const rankingSummary = aggregateRankings
    .map((r, i) => `${i + 1}. ${r.hamsterName}`)
    .join('\n');

  const prompt = `As chairman, synthesize the best advice.

PROBLEM: ${problem}

ADVICE:
${stage1Text}

RANKINGS (most helpful first):
${rankingSummary}

Give ONE clear action. 50 words max. No therapy-speak.`;

  if (!OPENROUTER_API_KEY) {
    const top = aggregateRankings[0]?.hamsterName || 'The council';
    return `${top}'s advice ranked highest. Bottom line: Take one concrete action today. Stop analyzing and start moving.`;
  }

  try {
    const response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GlowChi Council',
      },
      body: JSON.stringify({
        model: FREE_MODELS[0],
        messages: [
          { role: 'system', content: chairman.systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 150,
        temperature: 0.6,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Take action now.';
    }
  } catch (err) {
    console.error('[Council] Stage 3 error:', err);
  }

  return `Council consensus: ${aggregateRankings[0]?.hamsterName || 'Rocky'}'s approach is best. One action, today.`;
}

/**
 * Run the full 3-stage council consensus
 */
export async function runHamsterCouncil(problem: string): Promise<CouncilResult> {
  console.log('[Council] Stage 1: Individual responses');
  const stage1Results = await getAllHamsterResponses(problem);

  console.log('[Council] Stage 2: Peer rankings');
  const { rankings, labelToHamster } = await stage2CollectRankings(problem, stage1Results);
  const aggregateRankings = calculateAggregateRankings(rankings, labelToHamster);

  console.log('[Council] Stage 3: Chairman synthesis');
  const synthesis = await stage3SynthesizeFinal(problem, stage1Results, aggregateRankings);

  return {
    stage1: stage1Results,
    stage2: rankings,
    stage3: synthesis,
    aggregateRankings,
    labelToHamster,
    chairmanId: CHAIRMAN_HAMSTER,
    timestamp: new Date().toISOString(),
    isMock: !OPENROUTER_API_KEY,
  };
}
