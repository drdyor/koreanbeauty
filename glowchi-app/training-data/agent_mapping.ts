// Agent Mapping: Synthetic Data (6 agents) → Hamster Council (4 hamsters)
// This maps the training data agents to our hamster personas

import { HamsterId } from '../config/hamsters.config';

/**
 * Synthetic Data Agents (from training data):
 * 1. Analyst - Evidence-focused, data-driven
 * 2. Skeptic - Contrarian, risk-aware
 * 3. Synthesist - Holistic, pattern-recognizing
 * 4. Empath - Emotion-focused, validating
 * 5. Pragmatist - Action-oriented, concrete
 * 6. Philosopher - Paradigm-challenging, meaning-focused
 *
 * Hamster Council (our app):
 * 1. Al (Adlerian) - Warm, connection-focused, courage
 * 2. Erik (Eriksonian) - Reflective, narrative, meaning
 * 3. Cogni (CBT) - Structured, logical, thought patterns
 * 4. Rocky (Behavioral Activation) - Action-oriented, direct
 */

export type SyntheticAgentId =
  | 'analyst'
  | 'skeptic'
  | 'synthesist'
  | 'empath'
  | 'pragmatist'
  | 'philosopher';

export interface AgentMapping {
  syntheticAgent: SyntheticAgentId;
  primaryHamster: HamsterId;
  secondaryHamster?: HamsterId;
  roleInCouncil: 'core' | 'synthesis' | 'review';
  notes: string;
}

// Primary mapping from synthetic agents to hamsters
export const AGENT_TO_HAMSTER: Record<SyntheticAgentId, AgentMapping> = {
  empath: {
    syntheticAgent: 'empath',
    primaryHamster: 1, // Al (Adlerian)
    roleInCouncil: 'core',
    notes: 'Both focus on emotional validation and connection',
  },
  philosopher: {
    syntheticAgent: 'philosopher',
    primaryHamster: 2, // Erik (Eriksonian)
    roleInCouncil: 'core',
    notes: 'Both focus on meaning, narrative, and life stages',
  },
  analyst: {
    syntheticAgent: 'analyst',
    primaryHamster: 3, // Cogni (CBT)
    roleInCouncil: 'core',
    notes: 'Both focus on evidence, patterns, and logical analysis',
  },
  skeptic: {
    syntheticAgent: 'skeptic',
    primaryHamster: 3, // Cogni (CBT)
    secondaryHamster: 4, // Rocky for reality checks
    roleInCouncil: 'review',
    notes: 'Risk assessment blends into CBT thought examination',
  },
  pragmatist: {
    syntheticAgent: 'pragmatist',
    primaryHamster: 4, // Rocky (Behavioral Activation)
    roleInCouncil: 'core',
    notes: 'Both focus on concrete action and implementation',
  },
  synthesist: {
    syntheticAgent: 'synthesist',
    primaryHamster: 3, // Cogni as chairman
    roleInCouncil: 'synthesis',
    notes: 'Cogni performs the synthesis/chairman role',
  },
};

// Reverse mapping: which synthetic agents inform each hamster
export const HAMSTER_SOURCES: Record<HamsterId, SyntheticAgentId[]> = {
  1: ['empath'], // Al draws from Empath
  2: ['philosopher'], // Erik draws from Philosopher
  3: ['analyst', 'skeptic', 'synthesist'], // Cogni draws from multiple
  4: ['pragmatist'], // Rocky draws from Pragmatist
};

// DPO preference type mapping to hamster council context
export const DPO_PREFERENCE_MAPPING = {
  // Critique preferences: When reviewer response > critiqued response
  // Used to train hamsters to give constructive feedback
  critique_preference: {
    useCase: 'Train peer review in Stage 2',
    hamsterContext: 'Each hamster learns to evaluate others advice',
  },

  // Consensus preferences: Synthesis > individual agent
  // Used to train the chairman synthesis (Stage 3)
  consensus_preference: {
    useCase: 'Train chairman synthesis in Stage 3',
    hamsterContext: 'Cogni learns to synthesize multiple perspectives',
  },

  // Synthesis preferences: Post-reflection > initial
  // Used to train self-improvement within a single response
  synthesis_preference: {
    useCase: 'Train iterative improvement',
    hamsterContext: 'Hamsters learn to refine their advice after reflection',
  },

  // Ranking preferences: High-ranked > low-ranked
  // Used to train quality assessment
  ranking_preference: {
    useCase: 'Train quality discrimination',
    hamsterContext: 'System learns what advice resonates most',
  },
};

/**
 * Convert a synthetic agent response to hamster style
 */
export function adaptToHamsterStyle(
  syntheticAgentId: SyntheticAgentId,
  response: string
): { hamsterId: HamsterId; adaptedResponse: string } {
  const mapping = AGENT_TO_HAMSTER[syntheticAgentId];
  const hamsterId = mapping.primaryHamster;

  // The synthetic responses are already good - they just need
  // to be associated with the correct hamster persona
  // In production, you might add style adaptation here

  return {
    hamsterId,
    adaptedResponse: response,
  };
}

/**
 * Training data statistics
 */
export const TRAINING_STATS = {
  mentalDumps: 38,
  structuredPropositions: 38,
  mags: 38,
  dpoPairs: 1178,
  treeDpo: 38,

  // Domain distribution
  domains: {
    ethics: 11,
    creative_existential: 7,
    health: 6,
    career: 5,
    relationships: 5,
    finance: 4,
  },

  // DPO preference types
  preferences: {
    critique: 684, // 58%
    consensus: 228, // 19%
    synthesis: 228, // 19%
    ranking: 38, // 3%
  },
};
