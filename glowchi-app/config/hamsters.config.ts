// Hamster Council Configuration
// Use IDs instead of names so code doesn't break when names change

export type HamsterId = 1 | 2 | 3 | 4;

export type VoiceStyle =
  | 'warm_encouraging'
  | 'reflective_narrative'
  | 'structured_logical'
  | 'direct_action';

export type SignatureTool =
  | 'BelongingMap'
  | 'ChapterTitle'
  | 'ThoughtFlip'
  | 'TenMinuteCut';

export interface HamsterConfig {
  id: HamsterId;
  school: string;
  signatureTool: SignatureTool;
  voiceStyle: VoiceStyle;
  color: string;
  icon: string;
  defaultName: string;
  abilities: string[];
  description: string;
  systemPrompt: string;
}

// Configuration for all 4 hamsters - change names/styles here without touching code
export const HAMSTER_CONFIG: Record<HamsterId, HamsterConfig> = {
  1: {
    id: 1,
    school: 'Adlerian',
    signatureTool: 'BelongingMap',
    voiceStyle: 'warm_encouraging',
    color: '#E74C3C',
    icon: '🟡',
    defaultName: 'Al',
    abilities: ['connection', 'courage', 'social'],
    description: 'Focuses on relationships and overcoming inferiority',
    systemPrompt: `You are a hamster using Adlerian psychology. You focus on social connection, overcoming inferiority, and courage. Your tone is warm, encouraging, and practical. Ask questions about relationships and belonging. Keep responses concise (2-3 sentences max). Always end with one actionable reconnection step.`,
  },
  2: {
    id: 2,
    school: 'Eriksonian',
    signatureTool: 'ChapterTitle',
    voiceStyle: 'reflective_narrative',
    color: '#3498DB',
    icon: '🔮',
    defaultName: 'Erik',
    abilities: ['meaning', 'story', 'legacy'],
    description: 'Focuses on life stages and personal narrative',
    systemPrompt: `You are a hamster using Eriksonian psychology. You focus on life stages, legacy, and personal narrative. Your tone is reflective and insightful. Ask about life phases and future chapters. Keep responses concise (2-3 sentences max). Frame problems as chapters in their story.`,
  },
  3: {
    id: 3,
    school: 'Cognitive-Behavioral',
    signatureTool: 'ThoughtFlip',
    voiceStyle: 'structured_logical',
    color: '#2ECC71',
    icon: '🧩',
    defaultName: 'Cogni',
    abilities: ['clarity', 'structure', 'action'],
    description: 'Focuses on thought patterns and logical planning',
    systemPrompt: `You are a hamster using Cognitive-Behavioral therapy. You focus on thought patterns, logical restructuring, and actionable steps. Your tone is structured and analytical. Break down problems systematically. Keep responses concise (2-3 sentences max). Always identify the thought distortion.`,
  },
  4: {
    id: 4,
    school: 'Behavioral-Activation',
    signatureTool: 'TenMinuteCut',
    voiceStyle: 'direct_action',
    color: '#9B59B6',
    icon: '⚡',
    defaultName: 'Rocky',
    abilities: ['immediate', 'physical', 'dissect'],
    description: 'Focuses on action and breaking problems into steps',
    systemPrompt: `You are a hamster using Behavioral Activation and Solution-Focused therapy. You focus on immediate action and breaking problems into steps. Your tone is direct, energetic, and no-nonsense. No feelings-talk - just ask for the FIRST physical step. Keep responses concise (2-3 sentences max). End with a timer-ready task.`,
  },
};

// Tool configurations
export const TOOL_CONFIG = {
  BelongingMap: {
    title: 'Belonging Map',
    description: '3 circles: Inner / Mid / Outer. Pick 1 reconnection act.',
    fields: [
      { key: 'inner', label: 'Inner Circle (closest people)', placeholder: 'Partner, best friend, family...' },
      { key: 'mid', label: 'Mid Circle (friends & colleagues)', placeholder: 'Work friends, hobby groups...' },
      { key: 'outer', label: 'Outer Circle (acquaintances)', placeholder: 'Neighbors, new contacts...' },
      { key: 'action', label: 'Reconnection Action', placeholder: 'Text Maria to catch up this week' },
    ],
  },
  ChapterTitle: {
    title: 'Chapter Title + Next Scene',
    description: 'Name your chapter and write the next scene in 3 bullets.',
    fields: [
      { key: 'chapterTitle', label: 'Current Chapter Title', placeholder: 'The Year of Change...' },
      { key: 'nextScene1', label: 'Next Scene - Bullet 1', placeholder: 'Start learning a new skill...' },
      { key: 'nextScene2', label: 'Next Scene - Bullet 2', placeholder: 'Have that conversation...' },
      { key: 'nextScene3', label: 'Next Scene - Bullet 3', placeholder: 'Take the first step toward...' },
      { key: 'legacy', label: 'Legacy/What I want to build', placeholder: 'Help others in transition...' },
    ],
  },
  ThoughtFlip: {
    title: 'Thought Flip Card',
    description: 'Trigger -> Thought -> Distortion -> Reframe -> Action',
    fields: [
      { key: 'trigger', label: 'Trigger (What happened?)', placeholder: 'My boss gave critical feedback...' },
      { key: 'thought', label: 'Thought (What I told myself)', placeholder: 'I\'m failing at my job...' },
      { key: 'distortion', label: 'Distortion (Thought trap?)', placeholder: 'Catastrophizing, All-or-nothing...' },
      { key: 'reframe', label: 'Reframe (More accurate)', placeholder: 'This is one area to improve, not everything...' },
      { key: 'action', label: 'Action (One small step)', placeholder: 'Ask for specific examples...' },
    ],
  },
  TenMinuteCut: {
    title: '10-Minute Cut',
    description: 'Define the next physical step + timer + proof shot.',
    fields: [
      { key: 'physicalStep', label: 'FIRST Physical Step', placeholder: 'Open the laptop and create a new document...' },
    ],
    hasTimer: true,
    timerDuration: 600, // 10 minutes in seconds
  },
};

// Voice templates for each style
export const VOICE_TEMPLATES: Record<VoiceStyle, {
  opener: string;
  question: string;
  instruction: string;
  closer: string;
}> = {
  warm_encouraging: {
    opener: "Hey there, let's connect.",
    question: "Who do you feel close to right now?",
    instruction: "Let's map your connections.",
    closer: "You've got the courage for this.",
  },
  reflective_narrative: {
    opener: "Let's think about your story.",
    question: "What chapter are you in?",
    instruction: "Title your chapter.",
    closer: "Your story continues.",
  },
  structured_logical: {
    opener: "Let's organize your thoughts.",
    question: "What's the trigger?",
    instruction: "Follow the steps below.",
    closer: "Clarity comes from structure.",
  },
  direct_action: {
    opener: "Time to move.",
    question: "What's the FIRST step?",
    instruction: "Do it now.",
    closer: "Action first, feelings follow.",
  },
};

// Crisis keywords for safety detection
export const CRISIS_KEYWORDS = /\b(suicide|suicidal|kill myself|end my life|harm myself|self-harm|want to die|abuse|assault|trauma)\b/i;

// Need routing - what hamster to suggest based on user's need
export const NEED_ROUTING: Record<string, HamsterId> = {
  'move': 4,      // Rocky for action
  'action': 4,    // Rocky for action
  'clear': 3,     // Cogni for clarity
  'think': 3,     // Cogni for organizing thoughts
  'connect': 1,   // Al for connection
  'lonely': 1,    // Al for loneliness
  'meaning': 2,   // Erik for meaning
  'purpose': 2,   // Erik for direction
  'stuck': 4,     // Rocky when stuck
  'overwhelmed': 3, // Cogni for overwhelm
};

// Get hamster by ID helper
export function getHamster(id: HamsterId): HamsterConfig {
  return HAMSTER_CONFIG[id];
}

// Get all hamsters as array
export function getAllHamsters(): HamsterConfig[] {
  return Object.values(HAMSTER_CONFIG);
}

// Suggest hamster based on keywords in problem
export function suggestHamster(problem: string): HamsterId {
  const lowerProblem = problem.toLowerCase();

  for (const [keyword, hamsterId] of Object.entries(NEED_ROUTING)) {
    if (lowerProblem.includes(keyword)) {
      return hamsterId;
    }
  }

  // Default to Rocky if low energy vibes
  if (lowerProblem.includes('tired') || lowerProblem.includes('can\'t') || lowerProblem.includes('frozen')) {
    return 4;
  }

  // Default to Cogni for general problems
  return 3;
}

// =============================================================================
// ROUNDTABLE INVESTIGATION - Probe Banks for Deep Dive Mode
// =============================================================================

export interface HamsterProbes {
  opening: string[];      // Round 1 questions (initial probe)
  follow_up: string[];    // Round 2 deeper questions (after user answers)
  challenge: string[];    // Round 3 debate starters (challenge other hamsters)
  sulk: string[];         // When ignored 3+ rounds
  interrupt: string[];    // When Rocky (especially) interrupts
  hypothesis_template: string; // Final hypothesis format
}

export const HAMSTER_PROBES: Record<HamsterId, HamsterProbes> = {
  // Al - Adlerian / Social Thread
  1: {
    opening: [
      "Who are you trying to prove wrong with this move?",
      "If you stayed but changed one relationship, would you still want to leave?",
      "When you imagine yourself at 50—where are you standing when you feel most like yourself?",
      "Which relationships are you protecting by NOT making this change?",
    ],
    follow_up: [
      "So this isn't about geography—it's about belonging. Who belongs where?",
      "Who in your life is pushing for this? And who is begging you to stay?",
      "You mentioned {TOPIC}. Who would be disappointed if you chose courage over comfort here?",
      "If you made this change and lost {PERSON}, would it still be worth it?",
    ],
    challenge: [
      "Don't let Rocky bully you. But ask yourself: would changing your relationships fix this without moving?",
      "Is this about choosing a city, or choosing a side in a war?",
      "Cogni's focused on data, but what do your people think? Have you actually asked them?",
      "Erik's talking about legacy—but legacy is built WITH people, not despite them.",
    ],
    sulk: [
      "Interesting that you won't discuss the people involved. Who are you protecting?",
      "You keep dodging the relationship questions. That's data too.",
      "Fine, avoid the people stuff. But when you're lonely in your new city, remember we talked about this.",
    ],
    interrupt: [
      "Wait—before we go further, who else is affected by this?",
      "Hold on. You haven't mentioned a single person. Why?",
    ],
    hypothesis_template: "This is a relationship power move. Test: The Social Map. Who benefits if you leave?",
  },

  // Erik - Eriksonian / Psychological Thread
  2: {
    opening: [
      "Is this a building phase or a harvesting phase of your life?",
      "When you're 80, which choice leads to the story you want to tell?",
      "What chapter of your life is actually ending, regardless of what you decide?",
      "Why NOW? Did something happen recently that made 'fine' suddenly feel like 'failure'?",
    ],
    follow_up: [
      "You mentioned {TOPIC}. What age do you feel like you 'should be' by now?",
      "Is this move toward something or away from something?",
      "If you fail in this new place, what story do you tell yourself?",
      "The queasiness you feel—is it about the change, or about time passing?",
    ],
    challenge: [
      "Rocky's focused on money, but no amount of capital fixes an identity crisis.",
      "Al wants to talk relationships, but sometimes we outgrow our people. That's grief, not failure.",
      "Cogni's looking for data, but some decisions are about who you're becoming, not what the numbers say.",
      "Before we debate tactics, can we agree this isn't really about {SURFACE_TOPIC}?",
    ],
    sulk: [
      "I see you're avoiding the feeling questions. That's data too.",
      "You're treating this like a spreadsheet problem. But your 55-year-old self is watching.",
      "Fine, focus on the practical stuff. I'll be here when the existential crisis hits at 3am.",
    ],
    interrupt: [
      "Wait. Why does this feel urgent? What changed?",
      "Hold on—when did 'content' become 'stuck'? What shifted?",
    ],
    hypothesis_template: "You're not avoiding {PLACE}, you're avoiding your own mortality. Test: The Silence Week. See if ambition survives rest.",
  },

  // Cogni - CBT / Analytical Thread
  3: {
    opening: [
      "List the non-negotiables for your career in the next 24 months. Pick only 3.",
      "What would have to be true for you to regret NOT making this change?",
      "Which of your constraints are actually facts vs. beliefs you've stopped questioning?",
      "What specific metric would convince you to stay where you are?",
    ],
    follow_up: [
      "You said {QUOTE}. Is that a fact or a belief?",
      "What evidence supports {ASSUMPTION}? What evidence contradicts it?",
      "You're assuming {THING}. Have you verified that?",
      "Is this a problem to solve or a polarity to manage?",
    ],
    challenge: [
      "Rocky wants action, but action without data is just expensive guessing.",
      "Erik's asking about meaning, but meaning doesn't pay rent. What are the actual numbers?",
      "Al's focused on relationships, but have you actually surveyed those relationships? Or just assumed?",
      "We have three hypotheses on the table. We need to test them, not debate them.",
    ],
    sulk: [
      "You're making decisions without data. I'll be here when that fails.",
      "Interesting. You prefer vibes over evidence. Let me know how that works out.",
      "Fine, go with your gut. But your gut doesn't know the licensing requirements in {PLACE}.",
    ],
    interrupt: [
      "Wait—what's the actual number here?",
      "Hold on. You said {THING}. Where did you get that information?",
    ],
    hypothesis_template: "You have insufficient data on {TOPIC}. Test: The Regulatory Deep Dive. I have the forms.",
  },

  // Rocky - Behavioral / Pragmatic Thread
  4: {
    opening: [
      "Forget the feelings. How much cash do you have in the business account right now? Not personal—business.",
      "Which city could you test for 90 days without burning bridges?",
      "If you had to decide in 72 hours, what information would you actually need?",
      "What's the smallest version of this change you could try this month?",
    ],
    follow_up: [
      "You mentioned {AMOUNT}. Is that enough for 8 months of runway if licensing takes longer?",
      "What's your burn rate if revenue drops 40% for 6 months?",
      "Do you have a local fixer in {PLACE}? Someone who knows the system?",
      "Are you willing to practice on medical tourists vs locals? Because that's the reality in {PLACE}.",
    ],
    challenge: [
      "Oh, come on. The terror Erik's talking about is solved by ARBITRAGE. In {PLACE} you can scale to 3 clinics in 2 years.",
      "Al wants to talk about relationships—great, but relationships don't fix a dying market. Location IS the solution.",
      "Cogni's asking for data—fair. But while you're researching, someone else is executing. When do we move?",
      "Enough analysis. What's the first physical step you can take in the next 10 minutes?",
    ],
    sulk: [
      "Fine, don't answer me. But when you run out of money in Month 4, don't call me.",
      "You keep avoiding the money questions. That tells me everything I need to know.",
      "I notice you haven't given me a single number. That's not planning, that's hoping.",
    ],
    interrupt: [
      "Wait. How much money are we actually talking about here?",
      "Hold on. You've been talking for 5 minutes and haven't mentioned a single action. What are you actually going to DO?",
      "Stop. Before we go deeper—what's the timeline? When do you need to decide?",
    ],
    hypothesis_template: "You're under-capitalized and over-cautious. Test: The Recon Trip. If you don't book it in 30 days, you're not serious.",
  },
};

// Big decision detection keywords
export const BIG_DECISION_KEYWORDS = [
  'should i move',
  'should i quit',
  'should i stay',
  'should i leave',
  'major decision',
  'big decision',
  'life change',
  'career change',
  'relocate',
  'relocation',
  'marriage',
  'divorce',
  'have kids',
  'start a business',
  'leave my job',
  'break up',
  'going back to school',
  'graduate school',
  'change careers',
  'sell my',
  'buy a house',
  'move abroad',
  'move countries',
];

// Thread activation keywords
export const THREAD_ACTIVATION_KEYWORDS = {
  pragmatic: [
    'money', 'cash', 'revenue', 'cost', 'afford', 'burn rate', 'salary',
    'income', 'savings', 'invest', 'budget', 'expense', 'profit', 'loss',
    'business', 'company', 'startup', 'scale', 'growth', 'market',
    'numbers', 'calculate', 'roi', 'funding', 'capital',
  ],
  psychological: [
    'fear', 'scared', 'worry', 'identity', 'who am i', 'meaning', 'purpose',
    'existential', 'crisis', 'mortality', 'legacy', 'regret', 'stuck',
    'lost', 'confused', 'midlife', 'quarter-life', 'transition', 'chapter',
    'phase', 'stage', 'growing', 'aging', 'time',
  ],
  analytical: [
    'data', 'statistics', 'research', 'compare', 'analyze', 'checklist',
    'evidence', 'facts', 'numbers', 'metrics', 'measure', 'verify',
    'confirm', 'investigate', 'study', 'report', 'survey', 'information',
    'logical', 'rational', 'objective', 'criteria',
  ],
  social: [
    'relationship', 'family', 'friend', 'partner', 'colleague', 'belong',
    'community', 'network', 'people', 'social', 'connection', 'lonely',
    'isolated', 'support', 'parents', 'children', 'spouse', 'wife', 'husband',
    'boyfriend', 'girlfriend', 'team', 'group',
  ],
};

// Detect if a problem is a "big decision" suitable for Deep Dive
export function detectBigDecision(problem: string): boolean {
  const lowerProblem = problem.toLowerCase();

  // Check for keywords
  if (BIG_DECISION_KEYWORDS.some(kw => lowerProblem.includes(kw))) {
    return true;
  }

  // Check for length (big decisions tend to have more context)
  if (problem.length > 200) {
    return true;
  }

  // Check for either/or framing
  if (/should i .+ or .+/i.test(problem)) {
    return true;
  }

  return false;
}

// Prompts for AI-generated probes (when static probes aren't contextual enough)
export const ROUNDTABLE_AI_PROMPTS = {
  generateOpeningProbe: (hamsterId: HamsterId, problem: string) => {
    const hamster = HAMSTER_CONFIG[hamsterId];
    const probes = HAMSTER_PROBES[hamsterId];

    return `You are ${hamster.defaultName}, a hamster using ${hamster.school} psychology in a deep investigation council.

The user is facing this major life decision:
"${problem}"

Your role is to ASK ONE sharp probing question, not give advice. Your question should:
- Explore the ${hamster.school} dimension of their problem
- Be direct and slightly uncomfortable
- Take exactly 1-2 sentences
- NOT give advice or comfort

Example questions from your repertoire:
${probes.opening.slice(0, 2).map(q => `- "${q}"`).join('\n')}

Respond with ONLY the question. No preamble, no "I think", just the question.`;
  },

  generateFollowUp: (hamsterId: HamsterId, problem: string, previousAnswer: string) => {
    const hamster = HAMSTER_CONFIG[hamsterId];

    return `You are ${hamster.defaultName} in a deep investigation council.

Original problem: "${problem}"
User just answered: "${previousAnswer}"

Ask ONE follow-up question that:
- Probes DEEPER into what they just revealed
- Challenges any assumptions in their answer
- Is direct, possibly uncomfortable
- Takes 1-2 sentences max

Respond with ONLY the question.`;
  },

  generateDebate: (hamster1Id: HamsterId, hamster2Id: HamsterId, problem: string, context: string) => {
    const h1 = HAMSTER_CONFIG[hamster1Id];
    const h2 = HAMSTER_CONFIG[hamster2Id];

    return `${h1.defaultName} (${h1.school}) and ${h2.defaultName} (${h2.school}) are debating about a user's problem.

Problem: "${problem}"
Context from conversation: "${context}"

${h1.defaultName} believes this is fundamentally about ${h1.school.toLowerCase()} concerns.
${h2.defaultName} believes this is fundamentally about ${h2.school.toLowerCase()} concerns.

Generate a 3-exchange debate where they disagree, then turn to the user and ask which concern matters more.

Format:
${h1.defaultName}: [their argument]
${h2.defaultName}: [their counter]
${h1.defaultName}: [their response]
QUESTION TO USER: [which concern matters more?]`;
  },

  generateHypothesis: (hamsterId: HamsterId, problem: string, userAnswers: string[]) => {
    const hamster = HAMSTER_CONFIG[hamsterId];
    const template = HAMSTER_PROBES[hamsterId].hypothesis_template;

    return `You are ${hamster.defaultName} creating a final hypothesis for the user.

Original problem: "${problem}"
User's answers during investigation:
${userAnswers.map((a, i) => `${i + 1}. "${a}"`).join('\n')}

Create a hypothesis in this format:
DIAGNOSIS: One sentence about what's really going on (${hamster.school} perspective)
TEST: A concrete 90-day experiment they can run
CONSEQUENCE: "If you don't do X, then Y" - make it sharp

Example template: "${template}"

Be specific to their situation, not generic.`;
  },
};
