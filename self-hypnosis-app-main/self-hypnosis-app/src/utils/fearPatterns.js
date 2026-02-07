// Fear Patterns based on Chase Hughes' Behavioral Table of Elements
import { FEAR_PATTERN_IDS } from '../types.js';

export const fearPatterns = [
  {
    id: FEAR_PATTERN_IDS.AVOIDANCE,
    name: 'Avoidance',
    description: 'Tendency to evade situations due to fear of failure, rejection, or confrontation. Often manifests as procrastination, social withdrawal, or decision paralysis.',
    triggers: [
      'uncertainty',
      'criticism',
      'failure',
      'confrontation',
      'new situations',
      'performance evaluation',
      'social judgment'
    ],
    physicalSigns: [
      'shallow breathing',
      'muscle tension',
      'fidgeting',
      'avoiding eye contact',
      'closed body posture'
    ],
    affirmations: [
      'I face challenges with courage and wisdom',
      'I am safe to take calculated risks',
      'Mistakes are valuable learning opportunities',
      'I trust in my ability to handle whatever comes',
      'I embrace uncertainty as a path to growth'
    ],
    cbtExercises: [
      'Thought challenging: What evidence supports/contradicts my fear?',
      'Gradual exposure: Start with small, manageable challenges',
      'Cost-benefit analysis: What am I missing by avoiding this?'
    ],
    somaticExercises: [
      'Body scan to identify tension patterns',
      'Grounding through 5-4-3-2-1 sensory technique',
      'Gentle movement to discharge nervous energy'
    ]
  },
  {
    id: FEAR_PATTERN_IDS.CONTROL,
    name: 'Control',
    description: 'Compulsive need to dominate situations or people to mitigate fear of chaos, unpredictability, or vulnerability.',
    triggers: [
      'loss of control',
      'unpredictability',
      'delegation',
      'trusting others',
      'spontaneous changes',
      'vulnerability'
    ],
    physicalSigns: [
      'rigid posture',
      'clenched jaw',
      'rapid speech',
      'micromanaging gestures',
      'hypervigilance'
    ],
    affirmations: [
      'I trust the natural flow of life',
      'I release the need to control outcomes',
      'I am secure even in uncertainty',
      'I can influence without controlling',
      'Flexibility is my strength'
    ],
    cbtExercises: [
      'Identify what is and isn\'t within my control',
      'Practice letting go of small, non-critical decisions',
      'Challenge catastrophic thinking about loss of control'
    ],
    somaticExercises: [
      'Progressive muscle relaxation',
      'Breathing exercises to activate parasympathetic response',
      'Gentle stretching to release physical rigidity'
    ]
  },
  {
    id: FEAR_PATTERN_IDS.SUBMISSION,
    name: 'Submission',
    description: 'Yielding to others to avoid conflict, disapproval, or abandonment. Often stems from fear of authority or rejection.',
    triggers: [
      'conflict',
      'disapproval',
      'authority figures',
      'asserting boundaries',
      'expressing disagreement',
      'standing alone'
    ],
    physicalSigns: [
      'hunched shoulders',
      'downward gaze',
      'quiet voice',
      'apologetic gestures',
      'shrinking body language'
    ],
    affirmations: [
      'I value and trust my own voice',
      'I stand confidently in my truth',
      'I am worthy of respect and consideration',
      'My boundaries are healthy and necessary',
      'I can disagree while maintaining connection'
    ],
    cbtExercises: [
      'Assertiveness training: Practice "I" statements',
      'Boundary setting exercises',
      'Challenge people-pleasing thoughts'
    ],
    somaticExercises: [
      'Posture awareness and strengthening',
      'Voice projection exercises',
      'Grounding through feet connection to earth'
    ]
  },
  {
    id: FEAR_PATTERN_IDS.AUTHORITY_FEAR,
    name: 'Authority Fear',
    description: 'Specific fear of authority figures, often rooted in childhood experiences or trauma. Manifests as automatic submission or rebellion.',
    triggers: [
      'bosses or supervisors',
      'police or officials',
      'teachers or experts',
      'parental figures',
      'hierarchical structures',
      'being questioned by authority'
    ],
    physicalSigns: [
      'freeze response',
      'stammering',
      'sweating',
      'trembling',
      'fight-or-flight activation'
    ],
    affirmations: [
      'I am equal to all others in fundamental worth',
      'Authority is a role, not a measure of human value',
      'I can respect position while maintaining my dignity',
      'I have the right to be heard and respected',
      'My sovereignty is inherent and unshakeable'
    ],
    cbtExercises: [
      'Reframe authority as collaborative rather than dominating',
      'Practice viewing authority figures as fellow humans',
      'Develop internal locus of control'
    ],
    somaticExercises: [
      'Grounding exercises before authority interactions',
      'Power postures to embody confidence',
      'Breathing techniques to manage activation'
    ]
  },
  {
    id: FEAR_PATTERN_IDS.PERFECTIONISM,
    name: 'Perfectionism',
    description: 'Fear of making mistakes or being seen as flawed. Often masks deeper fears of rejection or inadequacy.',
    triggers: [
      'making mistakes',
      'criticism',
      'imperfection',
      'time pressure',
      'being evaluated',
      'comparison with others'
    ],
    physicalSigns: [
      'tension headaches',
      'eye strain',
      'repetitive checking behaviors',
      'restlessness',
      'fatigue from overwork'
    ],
    affirmations: [
      'Progress is more valuable than perfection',
      'I am worthy regardless of my performance',
      'Mistakes are proof that I am trying and learning',
      'Good enough is often perfect',
      'I embrace my human imperfections'
    ],
    cbtExercises: [
      'Set "good enough" standards for non-critical tasks',
      'Practice intentional imperfection',
      'Challenge all-or-nothing thinking'
    ],
    somaticExercises: [
      'Relaxation techniques to reduce physical tension',
      'Mindful awareness of perfectionist body patterns',
      'Gentle movement to break rigid patterns'
    ]
  },
  {
    id: FEAR_PATTERN_IDS.ABANDONMENT,
    name: 'Abandonment',
    description: 'Fear of being left alone or rejected by important people. Often leads to clingy behavior or preemptive withdrawal.',
    triggers: [
      'relationship conflicts',
      'being alone',
      'partner spending time with others',
      'changes in routine',
      'signs of disinterest',
      'endings or transitions'
    ],
    physicalSigns: [
      'chest tightness',
      'rapid heartbeat',
      'clinging behaviors',
      'hypervigilance to social cues',
      'restless energy'
    ],
    affirmations: [
      'I am complete and whole on my own',
      'Healthy relationships include space and independence',
      'I attract people who value and respect me',
      'Temporary separation does not mean abandonment',
      'I am worthy of lasting, secure connections'
    ],
    cbtExercises: [
      'Examine evidence for abandonment fears',
      'Practice self-soothing techniques',
      'Develop secure attachment behaviors'
    ],
    somaticExercises: [
      'Self-holding and comfort techniques',
      'Grounding exercises for emotional regulation',
      'Heart-centered breathing for self-connection'
    ]
  },
  {
    id: FEAR_PATTERN_IDS.REJECTION,
    name: 'Rejection',
    description: 'Fear of not being accepted or approved of by others. Often leads to people-pleasing or social withdrawal.',
    triggers: [
      'social situations',
      'expressing opinions',
      'asking for help',
      'being different',
      'potential criticism',
      'group dynamics'
    ],
    physicalSigns: [
      'blushing',
      'stammering',
      'avoiding eye contact',
      'nervous laughter',
      'self-protective postures'
    ],
    affirmations: [
      'I am worthy of acceptance as I am',
      'Not everyone needs to like me for me to be valuable',
      'Rejection is redirection to better connections',
      'I choose authenticity over approval',
      'My worth is not determined by others\' opinions'
    ],
    cbtExercises: [
      'Practice self-acceptance exercises',
      'Challenge mind-reading assumptions',
      'Develop internal validation skills'
    ],
    somaticExercises: [
      'Heart-opening postures and movements',
      'Self-compassion touch practices',
      'Confidence-building body language'
    ]
  },
  {
    id: FEAR_PATTERN_IDS.INADEQUACY,
    name: 'Inadequacy',
    description: 'Deep-seated belief of not being good enough or capable enough. Often drives overcompensation or withdrawal.',
    triggers: [
      'challenges',
      'comparison with others',
      'new responsibilities',
      'success of others',
      'compliments',
      'opportunities for growth'
    ],
    physicalSigns: [
      'slouched posture',
      'quiet voice',
      'self-deprecating gestures',
      'avoiding attention',
      'nervous energy'
    ],
    affirmations: [
      'I am enough exactly as I am',
      'My worth is inherent, not earned',
      'I have unique gifts and contributions',
      'I am constantly growing and learning',
      'I deserve success and happiness'
    ],
    cbtExercises: [
      'Inventory personal strengths and achievements',
      'Challenge negative self-talk',
      'Practice self-compassion'
    ],
    somaticExercises: [
      'Power postures to embody confidence',
      'Grounding exercises for stability',
      'Heart-centered practices for self-love'
    ]
  }
];

// Utility functions for fear pattern analysis
export const getFearPatternById = (id) => {
  return fearPatterns.find(pattern => pattern.id === id);
};

export const getFearPatternsByTriggers = (selectedTriggers) => {
  return fearPatterns.filter(pattern => 
    pattern.triggers.some(trigger => selectedTriggers.includes(trigger))
  );
};

export const getAllTriggers = () => {
  return Array.from(new Set(fearPatterns.flatMap(pattern => pattern.triggers)));
};

export const getAffirmationsForPatterns = (patternIds) => {
  return patternIds.flatMap(id => {
    const pattern = getFearPatternById(id);
    return pattern ? pattern.affirmations : [];
  });
};

export const getCBTExercisesForPatterns = (patternIds) => {
  return patternIds.flatMap(id => {
    const pattern = getFearPatternById(id);
    return pattern ? pattern.cbtExercises : [];
  });
};

export const getSomaticExercisesForPatterns = (patternIds) => {
  return patternIds.flatMap(id => {
    const pattern = getFearPatternById(id);
    return pattern ? pattern.somaticExercises : [];
  });
};

