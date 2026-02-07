// Roundtable Investigation Service - Deep Dive Mode
// Handles the 4-round probing investigation for major life decisions

import {
  ThreadId,
  Thread,
  RoundtableSession,
  Exchange,
  Hypothesis,
  ThreadProfile,
  RoundNumber,
  THREAD_HAMSTER_MAP,
  HAMSTER_THREAD_MAP,
  THREAD_COLORS,
} from '../types';
import {
  HamsterId,
  HAMSTER_CONFIG,
  HAMSTER_PROBES,
  THREAD_ACTIVATION_KEYWORDS,
  ROUNDTABLE_AI_PROMPTS,
  CRISIS_KEYWORDS,
} from '../config/hamsters.config';

// OpenRouter configuration (reuse from hamsterService)
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

// =============================================================================
// Session Management
// =============================================================================

export function createNewSession(problem: string): RoundtableSession {
  const now = new Date().toISOString();

  const initialThreads: Record<ThreadId, Thread> = {
    pragmatic: {
      id: 'pragmatic',
      hamsterId: THREAD_HAMSTER_MAP.pragmatic,
      active: false,
      depth: 0,
      answers: [],
      ignored: 0,
    },
    psychological: {
      id: 'psychological',
      hamsterId: THREAD_HAMSTER_MAP.psychological,
      active: false,
      depth: 0,
      answers: [],
      ignored: 0,
    },
    analytical: {
      id: 'analytical',
      hamsterId: THREAD_HAMSTER_MAP.analytical,
      active: false,
      depth: 0,
      answers: [],
      ignored: 0,
    },
    social: {
      id: 'social',
      hamsterId: THREAD_HAMSTER_MAP.social,
      active: false,
      depth: 0,
      answers: [],
      ignored: 0,
    },
  };

  return {
    id: `roundtable_${Date.now()}`,
    problem,
    round: 1,
    threads: initialThreads,
    exchanges: [],
    awaitingAnswerFrom: null,
    debateInProgress: false,
    hypotheses: null,
    selectedHypothesis: null,
    threadProfile: null,
    createdAt: now,
    updatedAt: now,
    isComplete: false,
    isPaused: false,
  };
}

// =============================================================================
// Round 1: Opening Gambit
// =============================================================================

export interface OpeningProbes {
  probes: Array<{
    hamsterId: HamsterId;
    question: string;
    threadId: ThreadId;
  }>;
  timestamp: string;
}

export async function generateOpeningGambit(
  session: RoundtableSession
): Promise<OpeningProbes> {
  const probes: OpeningProbes['probes'] = [];

  // Check for crisis first
  if (CRISIS_KEYWORDS.test(session.problem)) {
    return {
      probes: [{
        hamsterId: 3, // Cogni handles crisis
        question: "I notice you're going through something really difficult. The hamster council cares about you, but we're not professionals. If you're in crisis, please reach out to a mental health professional or crisis line. You matter.",
        threadId: 'analytical',
      }],
      timestamp: new Date().toISOString(),
    };
  }

  // Generate one opening probe per hamster
  for (const hamsterId of [1, 2, 3, 4] as HamsterId[]) {
    const hamsterProbes = HAMSTER_PROBES[hamsterId];
    const threadId = HAMSTER_THREAD_MAP[hamsterId];

    // Use static probe for now (can enhance with AI later)
    // Pick a random opening probe
    const randomProbe = hamsterProbes.opening[
      Math.floor(Math.random() * hamsterProbes.opening.length)
    ];

    probes.push({
      hamsterId,
      question: randomProbe,
      threadId,
    });
  }

  return {
    probes,
    timestamp: new Date().toISOString(),
  };
}

// AI-enhanced opening probe (optional, uses more tokens)
export async function generateAIOpeningProbe(
  hamsterId: HamsterId,
  problem: string
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    // Fallback to static probe
    const probes = HAMSTER_PROBES[hamsterId].opening;
    return probes[Math.floor(Math.random() * probes.length)];
  }

  const prompt = ROUNDTABLE_AI_PROMPTS.generateOpeningProbe(hamsterId, problem);

  try {
    const response = await callOpenRouter(prompt, 150, 0.7);
    return response || HAMSTER_PROBES[hamsterId].opening[0];
  } catch (error) {
    console.warn(`[Roundtable] AI probe generation failed for hamster ${hamsterId}:`, error);
    return HAMSTER_PROBES[hamsterId].opening[0];
  }
}

// =============================================================================
// Answer Processing & Thread Activation
// =============================================================================

export function processAnswer(
  session: RoundtableSession,
  hamsterId: HamsterId,
  answer: string
): {
  activatedThreads: ThreadId[];
  updatedSession: RoundtableSession;
} {
  const now = new Date().toISOString();
  const threadId = HAMSTER_THREAD_MAP[hamsterId];
  const activatedThreads: ThreadId[] = [];

  // Create the exchange record
  const exchange: Exchange = {
    id: `exchange_${Date.now()}`,
    round: session.round,
    hamsterId,
    type: 'user_answer',
    content: answer,
    userAnswer: answer,
    timestamp: now,
  };

  // Update the thread that was answered
  const updatedThreads = { ...session.threads };
  updatedThreads[threadId] = {
    ...updatedThreads[threadId],
    active: true,
    depth: updatedThreads[threadId].depth + 1,
    answers: [...updatedThreads[threadId].answers, answer],
    ignored: 0, // Reset ignored counter when answered
  };

  // Check for cross-thread activation based on keywords in answer
  const detectedThreads = detectThreadActivation(answer);
  for (const detected of detectedThreads) {
    if (!updatedThreads[detected].active) {
      updatedThreads[detected].active = true;
      activatedThreads.push(detected);
    }
  }

  // Increment ignored counter for threads not answered
  for (const tid of Object.keys(updatedThreads) as ThreadId[]) {
    if (tid !== threadId && session.round > 1) {
      updatedThreads[tid] = {
        ...updatedThreads[tid],
        ignored: updatedThreads[tid].ignored + 1,
      };
    }
  }

  const updatedSession: RoundtableSession = {
    ...session,
    threads: updatedThreads,
    exchanges: [...session.exchanges, exchange],
    awaitingAnswerFrom: null,
    updatedAt: now,
  };

  return { activatedThreads, updatedSession };
}

export function detectThreadActivation(answer: string): ThreadId[] {
  const activated: ThreadId[] = [];
  const lowerAnswer = answer.toLowerCase();

  for (const [threadId, keywords] of Object.entries(THREAD_ACTIVATION_KEYWORDS)) {
    if (keywords.some(kw => lowerAnswer.includes(kw))) {
      activated.push(threadId as ThreadId);
    }
  }

  return activated;
}

// =============================================================================
// Round 2: Follow-Up Probes
// =============================================================================

export async function generateFollowUp(
  session: RoundtableSession,
  answeredHamsterId: HamsterId
): Promise<Exchange[]> {
  const exchanges: Exchange[] = [];
  const now = new Date().toISOString();
  const threadId = HAMSTER_THREAD_MAP[answeredHamsterId];
  const lastAnswer = session.threads[threadId].answers.slice(-1)[0] || '';

  // The answered hamster probes deeper
  const followUpProbes = HAMSTER_PROBES[answeredHamsterId].follow_up;
  const depth = session.threads[threadId].depth;
  const followUp = followUpProbes[Math.min(depth - 1, followUpProbes.length - 1)]
    .replace('{TOPIC}', extractTopic(lastAnswer))
    .replace('{QUOTE}', lastAnswer.slice(0, 50))
    .replace('{PERSON}', extractPerson(lastAnswer))
    .replace('{ASSUMPTION}', extractAssumption(lastAnswer))
    .replace('{THING}', extractThing(lastAnswer))
    .replace('{AMOUNT}', extractAmount(lastAnswer));

  exchanges.push({
    id: `exchange_${Date.now()}`,
    round: 2,
    hamsterId: answeredHamsterId,
    type: 'follow_up',
    content: followUp,
    userAnswer: null,
    timestamp: now,
  });

  // Check if Rocky should interrupt (he's pushy)
  if (answeredHamsterId !== 4 && Math.random() > 0.5) {
    const rockyInterrupts = HAMSTER_PROBES[4].interrupt;
    const interrupt = rockyInterrupts[Math.floor(Math.random() * rockyInterrupts.length)]
      .replace('{THING}', extractThing(lastAnswer));

    exchanges.push({
      id: `exchange_${Date.now() + 1}`,
      round: 2,
      hamsterId: 4,
      type: 'interrupt',
      content: interrupt,
      userAnswer: null,
      timestamp: now,
    });
  }

  return exchanges;
}

// =============================================================================
// Round 3: Council Debate
// =============================================================================

export async function generateCouncilDebate(
  session: RoundtableSession
): Promise<Exchange[]> {
  const exchanges: Exchange[] = [];
  const now = new Date().toISOString();

  // Find the two most active threads
  const activeThreads = (Object.entries(session.threads) as [ThreadId, Thread][])
    .filter(([_, t]) => t.active)
    .sort((a, b) => b[1].depth - a[1].depth)
    .slice(0, 2);

  if (activeThreads.length < 2) {
    // Not enough active threads for debate
    return [];
  }

  const [thread1, thread2] = activeThreads;
  const hamster1 = THREAD_HAMSTER_MAP[thread1[0]];
  const hamster2 = THREAD_HAMSTER_MAP[thread2[0]];

  // Use static challenges for the debate
  const h1Challenges = HAMSTER_PROBES[hamster1].challenge;
  const h2Challenges = HAMSTER_PROBES[hamster2].challenge;

  // Build context from user's answers
  const context = session.exchanges
    .filter(e => e.type === 'user_answer')
    .map(e => e.content)
    .slice(-3)
    .join(' | ');

  // Exchange 1: First hamster challenges
  exchanges.push({
    id: `debate_${Date.now()}`,
    round: 3,
    hamsterId: hamster1,
    type: 'debate',
    content: selectAndFillChallenge(h1Challenges, session.problem, context),
    userAnswer: null,
    timestamp: now,
  });

  // Exchange 2: Second hamster counters
  exchanges.push({
    id: `debate_${Date.now() + 1}`,
    round: 3,
    hamsterId: hamster2,
    type: 'debate',
    content: selectAndFillChallenge(h2Challenges, session.problem, context),
    userAnswer: null,
    timestamp: now,
  });

  // Exchange 3: First hamster responds
  exchanges.push({
    id: `debate_${Date.now() + 2}`,
    round: 3,
    hamsterId: hamster1,
    type: 'debate',
    content: `${HAMSTER_CONFIG[hamster2].defaultName}'s got a point, but here's what they're missing...`,
    userAnswer: null,
    timestamp: now,
  });

  return exchanges;
}

// AI-enhanced debate generation
export async function generateAIDebate(
  session: RoundtableSession
): Promise<Exchange[]> {
  if (!OPENROUTER_API_KEY) {
    return generateCouncilDebate(session);
  }

  const activeThreads = (Object.entries(session.threads) as [ThreadId, Thread][])
    .filter(([_, t]) => t.active)
    .sort((a, b) => b[1].depth - a[1].depth)
    .slice(0, 2);

  if (activeThreads.length < 2) return [];

  const hamster1 = THREAD_HAMSTER_MAP[activeThreads[0][0]];
  const hamster2 = THREAD_HAMSTER_MAP[activeThreads[1][0]];

  const context = session.exchanges
    .filter(e => e.type === 'user_answer')
    .map(e => e.content)
    .join(' | ');

  const prompt = ROUNDTABLE_AI_PROMPTS.generateDebate(
    hamster1,
    hamster2,
    session.problem,
    context
  );

  try {
    const response = await callOpenRouter(prompt, 400, 0.7);
    return parseDebateResponse(response, hamster1, hamster2);
  } catch (error) {
    console.warn('[Roundtable] AI debate generation failed:', error);
    return generateCouncilDebate(session);
  }
}

// =============================================================================
// Sulking Detection
// =============================================================================

export function checkForSulking(session: RoundtableSession): Exchange[] {
  const sulkingExchanges: Exchange[] = [];
  const now = new Date().toISOString();

  for (const [threadId, thread] of Object.entries(session.threads) as [ThreadId, Thread][]) {
    if (thread.ignored >= 3 && !thread.active) {
      const hamsterId = THREAD_HAMSTER_MAP[threadId];
      const sulkMessages = HAMSTER_PROBES[hamsterId].sulk;
      const sulk = sulkMessages[Math.floor(Math.random() * sulkMessages.length)];

      sulkingExchanges.push({
        id: `sulk_${Date.now()}_${threadId}`,
        round: session.round,
        hamsterId,
        type: 'sulk',
        content: sulk,
        userAnswer: null,
        timestamp: now,
      });
    }
  }

  return sulkingExchanges;
}

// =============================================================================
// Round 4: Hypothesis Generation
// =============================================================================

export async function generateHypotheses(
  session: RoundtableSession
): Promise<Hypothesis[]> {
  const hypotheses: Hypothesis[] = [];

  for (const [threadId, thread] of Object.entries(session.threads) as [ThreadId, Thread][]) {
    const hamsterId = THREAD_HAMSTER_MAP[threadId];
    const hamster = HAMSTER_CONFIG[hamsterId];
    const template = HAMSTER_PROBES[hamsterId].hypothesis_template;

    // Create hypothesis based on thread activity
    const hypothesis: Hypothesis = {
      threadId,
      hamsterId,
      title: `The ${hamster.defaultName} Hypothesis`,
      diagnosis: thread.active
        ? generateDiagnosis(threadId, session.problem, thread.answers)
        : `${hamster.defaultName} wasn't consulted enough to form a full diagnosis.`,
      test: generateTest(threadId, session.problem),
      consequence: generateConsequence(threadId, thread.active),
    };

    hypotheses.push(hypothesis);
  }

  return hypotheses;
}

// AI-enhanced hypothesis generation
export async function generateAIHypothesis(
  hamsterId: HamsterId,
  session: RoundtableSession
): Promise<Hypothesis | null> {
  if (!OPENROUTER_API_KEY) return null;

  const threadId = HAMSTER_THREAD_MAP[hamsterId];
  const thread = session.threads[threadId];

  if (!thread.active || thread.answers.length === 0) return null;

  const prompt = ROUNDTABLE_AI_PROMPTS.generateHypothesis(
    hamsterId,
    session.problem,
    thread.answers
  );

  try {
    const response = await callOpenRouter(prompt, 300, 0.6);
    return parseHypothesisResponse(response, threadId, hamsterId);
  } catch (error) {
    console.warn(`[Roundtable] AI hypothesis generation failed for hamster ${hamsterId}:`, error);
    return null;
  }
}

// =============================================================================
// Thread Profile Calculation
// =============================================================================

export function calculateThreadProfile(session: RoundtableSession): ThreadProfile {
  const threads = session.threads;

  // Calculate engagement scores based on depth and answer count
  const scores: Record<ThreadId, number> = {
    pragmatic: threads.pragmatic.depth * 10 + threads.pragmatic.answers.length * 5,
    psychological: threads.psychological.depth * 10 + threads.psychological.answers.length * 5,
    analytical: threads.analytical.depth * 10 + threads.analytical.answers.length * 5,
    social: threads.social.depth * 10 + threads.social.answers.length * 5,
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;

  // Convert to percentages
  const percentages: Record<ThreadId, number> = {
    pragmatic: Math.round((scores.pragmatic / total) * 100),
    psychological: Math.round((scores.psychological / total) * 100),
    analytical: Math.round((scores.analytical / total) * 100),
    social: Math.round((scores.social / total) * 100),
  };

  // Find dominant and secondary
  const sorted = (Object.entries(percentages) as [ThreadId, number][])
    .sort((a, b) => b[1] - a[1]);

  const dominant = sorted[0][0];
  const secondary = sorted[1][1] > 10 ? sorted[1][0] : null;

  // Generate interpretation
  const dominantHamster = HAMSTER_CONFIG[THREAD_HAMSTER_MAP[dominant]].defaultName;
  const interpretation = secondary
    ? `You're ${percentages[dominant]}% ${dominantHamster}-profile, ${percentages[secondary]}% ${HAMSTER_CONFIG[THREAD_HAMSTER_MAP[secondary]].defaultName}-profile. That tension is actually useful—it means you're weighing both ${getThreadConcern(dominant)} and ${getThreadConcern(secondary)}.`
    : `You're strongly ${dominantHamster}-focused (${percentages[dominant]}%). That's not bad, but consider what the other hamsters might be seeing that you're not.`;

  return {
    pragmatic: percentages.pragmatic,
    psychological: percentages.psychological,
    analytical: percentages.analytical,
    social: percentages.social,
    dominant,
    secondary,
    interpretation,
  };
}

// =============================================================================
// Round Progression
// =============================================================================

export function shouldAdvanceRound(session: RoundtableSession): boolean {
  const answeredCount = session.exchanges.filter(e => e.type === 'user_answer').length;

  switch (session.round) {
    case 1:
      return answeredCount >= 1; // At least 1 answer to proceed
    case 2:
      return answeredCount >= 2; // At least 2 total answers
    case 3:
      return true; // After debate, auto-advance
    case 4:
      return false; // Final round
    default:
      return false;
  }
}

export function advanceRound(session: RoundtableSession): RoundtableSession {
  const nextRound = Math.min(session.round + 1, 4) as RoundNumber;

  return {
    ...session,
    round: nextRound,
    updatedAt: new Date().toISOString(),
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

async function callOpenRouter(
  prompt: string,
  maxTokens: number = 200,
  temperature: number = 0.7
): Promise<string> {
  for (const model of FREE_MODELS) {
    try {
      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://glowchi.app',
          'X-Title': 'Glowchi Roundtable Investigation',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature,
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      if (content) return content;
    } catch (error) {
      console.warn(`[Roundtable] ${model} failed:`, error);
      continue;
    }
  }

  throw new Error('All models failed');
}

function extractTopic(text: string): string {
  // Simple topic extraction - find first noun phrase
  const words = text.split(' ').slice(0, 5);
  return words.join(' ').replace(/[.,!?]$/, '') || 'that';
}

function extractPerson(text: string): string {
  const personPatterns = /(?:my |the )?(wife|husband|partner|boss|friend|mother|father|sister|brother|colleague|mentor)/i;
  const match = text.match(personPatterns);
  return match ? match[1] : 'someone important';
}

function extractAssumption(text: string): string {
  // Look for assumption indicators
  const assumptionPatterns = /(will |would |should |must |have to |need to |can't |won't )[^.,!?]+/i;
  const match = text.match(assumptionPatterns);
  return match ? match[0].trim() : 'your assumption';
}

function extractThing(text: string): string {
  return text.slice(0, 30).replace(/[.,!?]$/, '') || 'that';
}

function extractAmount(text: string): string {
  const amountPattern = /\$?[\d,]+(?:\.\d{2})?(?:k|K|m|M)?|\d+ (?:months?|years?|weeks?)/;
  const match = text.match(amountPattern);
  return match ? match[0] : 'the amount';
}

function selectAndFillChallenge(challenges: string[], problem: string, context: string): string {
  const challenge = challenges[Math.floor(Math.random() * challenges.length)];
  return challenge
    .replace('{SURFACE_TOPIC}', extractTopic(problem))
    .replace('{PLACE}', extractPlace(problem) || 'there');
}

function extractPlace(text: string): string | null {
  const places = text.match(/(?:Dubai|London|Malta|New York|LA|Singapore|Hong Kong|Paris|Berlin|Tokyo|Sydney)/i);
  return places ? places[0] : null;
}

function parseDebateResponse(
  response: string,
  hamster1: HamsterId,
  hamster2: HamsterId
): Exchange[] {
  const now = new Date().toISOString();
  const lines = response.split('\n').filter(l => l.trim());
  const exchanges: Exchange[] = [];

  for (let i = 0; i < lines.length && i < 4; i++) {
    const hamsterId = i % 2 === 0 ? hamster1 : hamster2;
    exchanges.push({
      id: `debate_${Date.now()}_${i}`,
      round: 3,
      hamsterId,
      type: 'debate',
      content: lines[i].replace(/^[^:]+:\s*/, ''), // Remove speaker prefix
      userAnswer: null,
      timestamp: now,
    });
  }

  return exchanges;
}

function parseHypothesisResponse(
  response: string,
  threadId: ThreadId,
  hamsterId: HamsterId
): Hypothesis {
  const hamster = HAMSTER_CONFIG[hamsterId];

  // Try to parse structured response
  const diagnosisMatch = response.match(/DIAGNOSIS:\s*(.+?)(?=TEST:|$)/is);
  const testMatch = response.match(/TEST:\s*(.+?)(?=CONSEQUENCE:|$)/is);
  const consequenceMatch = response.match(/CONSEQUENCE:\s*(.+?)$/is);

  return {
    threadId,
    hamsterId,
    title: `The ${hamster.defaultName} Hypothesis`,
    diagnosis: diagnosisMatch?.[1]?.trim() || response.slice(0, 100),
    test: testMatch?.[1]?.trim() || 'A 90-day experiment to test this hypothesis.',
    consequence: consequenceMatch?.[1]?.trim() || "If you don't act on this, you'll stay stuck.",
  };
}

function generateDiagnosis(threadId: ThreadId, problem: string, answers: string[]): string {
  const context = answers.join(' ');

  switch (threadId) {
    case 'pragmatic':
      return `You're approaching this without clear financial parameters. The ${extractPlace(problem) || 'decision'} question is really about runway and risk tolerance.`;
    case 'psychological':
      return `This isn't about ${extractPlace(problem) || 'the change'}—it's about time. You're at a crossroads and treating geography as a solution to an identity question.`;
    case 'analytical':
      return `You're operating on assumptions that haven't been tested. The data gap is making this feel harder than it needs to be.`;
    case 'social':
      return `The relationship dynamics are driving this more than you're admitting. This is about belonging and proving something to someone.`;
    default:
      return `There's more to unpack here than surface-level concerns.`;
  }
}

function generateTest(threadId: ThreadId, problem: string): string {
  const place = extractPlace(problem);

  switch (threadId) {
    case 'pragmatic':
      return place
        ? `The ${place} Recon Trip: Book a 3-day business scouting trip in the next 30 days. Visit clinics, get real numbers, talk to locals.`
        : `The Numbers Sprint: Spend 4 hours this week creating a real financial model with actual data, not assumptions.`;
    case 'psychological':
      return `The Silence Week: Take 7 days off from researching. No spreadsheets, no planning. Just sit with the decision. If you still want to move after, it's real.`;
    case 'analytical':
      return `The Data Deep Dive: Create a checklist of every assumption you've made. Verify at least 5 of them this week with primary sources.`;
    case 'social':
      return `The Social Map: List everyone affected by this decision. Have a real conversation with the top 3 this week. Ask what they actually think.`;
    default:
      return `Design a 90-day experiment to test your core assumption.`;
  }
}

function generateConsequence(threadId: ThreadId, isActive: boolean): string {
  if (!isActive) {
    return `${HAMSTER_CONFIG[THREAD_HAMSTER_MAP[threadId]].defaultName} wasn't consulted enough to weigh in.`;
  }

  switch (threadId) {
    case 'pragmatic':
      return `If you don't do the recon trip, you're not serious about this move—you're just Malta-unhappy.`;
    case 'psychological':
      return `If the urge disappears after rest, it was burnout, not ambition. If it intensifies, it's real.`;
    case 'analytical':
      return `If you can't verify your assumptions, you're making a gut decision with spreadsheet confidence.`;
    case 'social':
      return `If you can't have the conversations, you're not choosing a city—you're running from people.`;
    default:
      return `If you don't act on this insight, you'll be back here in 6 months asking the same question.`;
  }
}

function getThreadConcern(threadId: ThreadId): string {
  switch (threadId) {
    case 'pragmatic': return 'practical realities';
    case 'psychological': return 'deeper meaning';
    case 'analytical': return 'concrete data';
    case 'social': return 'relationships';
    default: return 'concerns';
  }
}

// =============================================================================
// Storage Helpers
// =============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

const ROUNDTABLE_STORAGE_KEY = 'thinktank:roundtable:sessions';
const ACTIVE_SESSION_KEY = 'thinktank:roundtable:active';

export async function saveRoundtableSession(session: RoundtableSession): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(ROUNDTABLE_STORAGE_KEY);
    const sessions: RoundtableSession[] = existing ? JSON.parse(existing) : [];

    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }

    await AsyncStorage.setItem(ROUNDTABLE_STORAGE_KEY, JSON.stringify(sessions));

    if (!session.isComplete && !session.isPaused) {
      await AsyncStorage.setItem(ACTIVE_SESSION_KEY, session.id);
    }
  } catch (error) {
    console.error('[Roundtable] Failed to save session:', error);
  }
}

export async function loadRoundtableSession(sessionId: string): Promise<RoundtableSession | null> {
  try {
    const existing = await AsyncStorage.getItem(ROUNDTABLE_STORAGE_KEY);
    if (!existing) return null;

    const sessions: RoundtableSession[] = JSON.parse(existing);
    return sessions.find(s => s.id === sessionId) || null;
  } catch (error) {
    console.error('[Roundtable] Failed to load session:', error);
    return null;
  }
}

export async function getActiveRoundtableSession(): Promise<RoundtableSession | null> {
  try {
    const activeId = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    if (!activeId) return null;
    return loadRoundtableSession(activeId);
  } catch (error) {
    console.error('[Roundtable] Failed to get active session:', error);
    return null;
  }
}

export async function clearActiveSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (error) {
    console.error('[Roundtable] Failed to clear active session:', error);
  }
}

export async function getAllRoundtableSessions(): Promise<RoundtableSession[]> {
  try {
    const existing = await AsyncStorage.getItem(ROUNDTABLE_STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('[Roundtable] Failed to get all sessions:', error);
    return [];
  }
}
