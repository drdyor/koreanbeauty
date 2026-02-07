// Therapeutic Content and Affirmations for Self-Hypnosis Behavioral Rewiring App
// Based on Chase Hughes' methodology, CBT, Somatic Experiencing, Polyvagal Theory, and IFS

import { FEAR_PATTERN_IDS } from '../types.js';

// Core sovereignty affirmations based on the user's specific goal
export const SOVEREIGNTY_AFFIRMATIONS = [
  "I am sovereign and equal to all others in fundamental worth",
  "My inherent value is not determined by external authority",
  "I respect authority while maintaining my personal dignity",
  "I am neither above nor below any other human being",
  "My sovereignty is balanced with compassion and connection",
  "I stand confidently in my truth while respecting others",
  "Authority is a role, not a measure of human value",
  "I have the right to be heard and respected",
  "I choose cooperation over submission or domination",
  "My worth is inherent and cannot be diminished by others"
];

// Authority-specific affirmations for the user's core issue
export const AUTHORITY_CONFIDENCE_AFFIRMATIONS = [
  "I interact with authority figures as equals in human dignity",
  "I can respect position while maintaining my self-respect",
  "Authority figures are fellow humans with their own fears and limitations",
  "I speak my truth clearly and respectfully to all people",
  "I am safe to express my thoughts and opinions",
  "My voice matters and deserves to be heard",
  "I can disagree respectfully without fear of retaliation",
  "I trust my own judgment and inner wisdom",
  "I am confident in my abilities and contributions",
  "I release the need to seek approval from authority figures"
];

// Cartesian philosophical affirmations based on "I think, therefore I am"
export const CARTESIAN_AFFIRMATIONS = [
  "I think, therefore I am - my existence is undeniable",
  "My capacity for thought proves my inherent worth",
  "I am the authority on my own experience and consciousness",
  "My ability to doubt proves my ability to think independently",
  "I exist as a thinking, feeling, sovereign being",
  "My consciousness is my own domain of absolute authority",
  "I can question everything while remaining grounded in my being",
  "My thoughts and perceptions are valid and valuable",
  "I am the primary authority on my own inner world",
  "Through clear thinking, I discover my true nature"
];

// Subliminal programming scripts for different fear patterns
export const SUBLIMINAL_SCRIPTS = {
  [FEAR_PATTERN_IDS.AUTHORITY_FEAR]: {
    title: "Authority Confidence Programming",
    script: `
      You are safe and sovereign in the presence of all people. Authority figures are simply humans playing roles, no different from you in fundamental worth. You speak with confidence and clarity to everyone, regardless of their position. Your voice matters. Your thoughts are valuable. You stand tall in your own dignity while respecting the dignity of others.

      As you relax deeper, feel this truth settling into every cell of your body. You are equal to all others. You are neither above nor below anyone. You interact with authority from a place of centered confidence. You are safe to express yourself. You are safe to disagree respectfully. You are safe to be yourself.

      Your subconscious mind now accepts these truths completely. Every interaction with authority becomes easier and more natural. You feel calm, confident, and centered. You are sovereign. You are equal. You are safe.
    `,
    affirmations: AUTHORITY_CONFIDENCE_AFFIRMATIONS
  },

  [FEAR_PATTERN_IDS.SUBMISSION]: {
    title: "Personal Power Activation",
    script: `
      You are reclaiming your personal power now. Your voice is strong and clear. Your boundaries are healthy and necessary. You no longer need to shrink yourself to make others comfortable. You stand in your full presence and power.

      Feel strength flowing through your body. Feel your spine straightening with confidence. Feel your voice becoming clear and strong. You speak your truth with kindness but without apology. You are worthy of respect and consideration.

      Your subconscious mind releases all patterns of unnecessary submission. You choose when to yield and when to stand firm. You are in control of your responses. You are powerful. You are worthy. You are free.
    `,
    affirmations: [
      "I value and trust my own voice",
      "I stand confidently in my truth",
      "I am worthy of respect and consideration",
      "My boundaries are healthy and necessary",
      "I can disagree while maintaining connection"
    ]
  },

  [FEAR_PATTERN_IDS.CONTROL]: {
    title: "Trust and Flow Programming",
    script: `
      You are learning to trust the natural flow of life. You can influence without controlling. You can guide without forcing. You release the exhausting need to control every outcome and instead trust in your ability to adapt and respond.

      Feel the tension leaving your body as you let go of the need to control. Feel the peace that comes with trusting the process. You are safe even when you cannot control everything. You are capable of handling whatever comes.

      Your subconscious mind now embraces flexibility and trust. You influence through wisdom and example rather than force. You are secure in uncertainty. You flow with life rather than fighting against it.
    `,
    affirmations: [
      "I trust the natural flow of life",
      "I release the need to control outcomes",
      "I am secure even in uncertainty",
      "I can influence without controlling",
      "Flexibility is my strength"
    ]
  },

  [FEAR_PATTERN_IDS.AVOIDANCE]: {
    title: "Courage and Engagement Programming",
    script: `
      You are becoming more courageous with each passing day. You face challenges with wisdom and strength. You no longer run from difficulty but meet it with presence and skill. You are safe to take calculated risks.

      Feel courage flowing through your veins. Feel your willingness to engage with life fully. Mistakes are simply learning opportunities. Failure is feedback, not a reflection of your worth. You are resilient and adaptable.

      Your subconscious mind now chooses engagement over avoidance. You move toward your goals with confidence. You embrace uncertainty as a path to growth. You are brave. You are capable. You are engaged.
    `,
    affirmations: [
      "I face challenges with courage and wisdom",
      "I am safe to take calculated risks",
      "Mistakes are valuable learning opportunities",
      "I trust in my ability to handle whatever comes",
      "I embrace uncertainty as a path to growth"
    ]
  }
};

// Guided meditation scripts for different therapeutic approaches
export const GUIDED_MEDITATIONS = {
  somatic_body_scan: {
    title: "Somatic Body Scan for Nervous System Regulation",
    duration: 15,
    script: `
      Begin by finding a comfortable position, either sitting or lying down. Allow your eyes to close gently, and take three deep, slow breaths. With each exhale, feel yourself settling more deeply into this moment.

      Now, bring your attention to the very top of your head. Notice any sensations there - perhaps warmth, tingling, pressure, or simply awareness. There's no right or wrong thing to feel. Simply notice what's present without trying to change it.

      Slowly move your attention down to your forehead. Notice the space between your eyebrows. Is there any tension here? Any holding? If you notice tension, simply breathe into that area and allow it to soften naturally.

      Continue down to your eyes. Notice the muscles around your eyes. Are they holding or relaxed? Move to your jaw. Many of us hold tension in our jaw. If you notice tightness, allow your jaw to drop slightly and your tongue to rest gently in your mouth.

      Bring your attention to your neck and throat. This is often where we hold emotions and unexpressed words. Breathe gently into this area. Notice what's present without judgment.

      Move your awareness to your shoulders. Do they feel heavy or light? Tense or relaxed? Simply notice. If they feel tense, imagine breathing space into them, allowing them to drop away from your ears.

      Continue down your arms. Notice your upper arms, your elbows, your forearms, and your hands. What sensations are present? Warmth, coolness, tingling, pressure? All sensations are welcome.

      Now bring your attention to your chest and heart area. This is the center of your emotional world. Notice what you feel here. Perhaps there's openness, or maybe some constriction. Whatever is present is perfect. Breathe gently into your heart space.

      Move down to your stomach and abdomen. This is often called our second brain, where we feel our gut instincts. What do you notice here? Butterflies, warmth, tightness, or perhaps a sense of calm?

      Continue to your lower back and pelvis. This area often holds our sense of safety and groundedness. Notice what's present here. Breathe into any areas that feel tight or uncomfortable.

      Move your attention down your legs. Notice your thighs, your knees, your calves, and finally your feet. Feel your connection to the ground beneath you. This is your foundation, your support.

      Now take a moment to sense your entire body as a whole. Notice the overall feeling in your body right now. Has anything shifted since you began? What feels different?

      Take three more deep breaths, and when you're ready, gently open your eyes, carrying this awareness with you into your day.
    `
  },

  polyvagal_safety: {
    title: "Polyvagal Safety and Connection Meditation",
    duration: 12,
    script: `
      Settle into a comfortable position and allow your breathing to find its natural rhythm. You're going to guide your nervous system into a state of safety and social connection.

      Begin by looking around your environment slowly. This is called orienting, and it signals to your nervous system that you're safe. Notice five things you can see. Really look at them. Notice their colors, shapes, textures.

      Now notice four things you can hear. Perhaps sounds from outside, the hum of electronics, or simply the sound of your own breathing. Let these sounds remind you that you're present and aware.

      Notice three things you can physically feel. The temperature of the air on your skin, the texture of your clothing, the surface you're sitting or lying on. These sensations anchor you in the present moment.

      Now we're going to activate your vagus nerve through gentle humming. Take a deep breath in, and as you exhale, make a long, low "Ahhhh" sound. Feel the vibration in your chest and throat. This vibration stimulates the vagus nerve and signals safety to your nervous system.

      Try a few more sounds. Hum "Mmmmm" and feel where you sense the vibration. Try "Ooooo" and notice how it feels different. These sounds are like a gentle massage for your nervous system.

      Now imagine someone who makes you feel completely safe and accepted. This might be a friend, family member, pet, or even a spiritual figure. Picture their face, their warm expression. Imagine them looking at you with complete love and acceptance.

      Feel the warmth in your chest as you connect with this feeling of being loved and accepted. This is your ventral vagal state - the state of safety and social connection. Your nervous system recognizes this as your natural home.

      Imagine having a pleasant conversation with this person or being. Feel their genuine interest in you. Feel the ease of connection, the sense of belonging. This is what your nervous system is designed for - safe, warm connection.

      Now expand this feeling to include other supportive people in your life. Feel yourself surrounded by a network of care and support. You belong. You are valued. You are safe.

      Rest in this feeling of connection and safety. Let it fill every cell of your body. This is your true nature - connected, safe, and loved.

      When you're ready, take three deep breaths and gently return your attention to the room, carrying this sense of safety and connection with you.
    `
  },

  ifs_parts_dialogue: {
    title: "Internal Family Systems Parts Dialogue",
    duration: 18,
    script: `
      Find a comfortable position and close your eyes. Take several deep breaths to center yourself. Today you're going to meet and dialogue with the different parts of yourself.

      Begin by bringing to mind a situation where you feel fear around authority figures. Notice what comes up for you. What emotions arise? What thoughts? What sensations in your body?

      Now, with curiosity and compassion, ask: "Which part of me is feeling this fear?" Wait and see what emerges. You might get an image, a feeling, a sense of age, or even words.

      When you sense this fearful part, greet it gently. You might say, "Hello, I see you there. I want to understand you better." Notice how this part responds. Does it feel young or old? What does it look like? What is it wearing?

      Ask this part: "What are you afraid will happen if I'm confident with authority figures?" Listen with genuine curiosity. This part has been trying to protect you in some way. What is it protecting you from?

      You might hear things like: "They'll reject you," "You'll get in trouble," "You're not good enough," or "It's not safe to stand out." Whatever you hear, thank this part for sharing.

      Now ask: "When did you first learn to be afraid of authority?" Allow images or memories to arise. This part may have learned this fear very early in life. Send compassion to whatever you see or sense.

      Next, ask: "What do you need from me to feel safer?" Listen carefully. This part might need reassurance, protection, or simply to be heard and understood.

      Now, from your wise, adult Self, speak to this part. You might say: "I understand why you learned to be afraid. That made sense then. But I'm an adult now, and I can handle these situations. I'll keep you safe."

      Ask this part if it would be willing to step back and let your confident Self lead in situations with authority. Negotiate gently. This part doesn't have to disappear - it just doesn't need to be in charge.

      Now call forward your confident, sovereign Self. How does this part feel? What does it know about your worth and value? Let this part speak: "I am equal to all others. I have valuable contributions to make. I can speak my truth with respect and clarity."

      Imagine these two parts - the fearful part and the confident part - having a conversation. What would they say to each other? How can they work together instead of against each other?

      From your wise Self, speak to both parts: "I appreciate you both. Fear, thank you for trying to keep me safe. Confidence, thank you for knowing my worth. I will lead from now on, taking care of both of you."

      Visualize yourself in a situation with an authority figure, but this time your Self is leading. You feel calm, centered, and confident. You speak clearly and respectfully. You maintain your dignity while respecting others.

      Take a few moments to appreciate this internal harmony. Your parts are working together under the leadership of your Self. You feel integrated and whole.

      When you're ready, thank all your parts for this dialogue, and gently return your attention to the room.
    `
  }
};

// Breathing exercises for nervous system regulation
export const BREATHING_EXERCISES = {
  vagal_breathing: {
    title: "Vagal Breathing for Nervous System Regulation",
    duration: 8,
    instructions: [
      "Sit comfortably with one hand on your chest and one on your belly",
      "Breathe in slowly through your nose for 4 counts",
      "Hold your breath gently for 4 counts",
      "Exhale slowly through your mouth for 6 counts",
      "Make your exhale longer than your inhale",
      "Focus on making the exhale smooth and controlled",
      "Continue this 4-4-6 pattern",
      "Notice your heart rate slowing",
      "Continue for several more cycles",
      "Return to natural breathing"
    ]
  },

  box_breathing: {
    title: "Box Breathing for Calm Focus",
    duration: 6,
    instructions: [
      "Sit with your spine straight and shoulders relaxed",
      "Exhale completely to empty your lungs",
      "Breathe in through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale through your mouth for 4 counts",
      "Hold empty for 4 counts",
      "This creates a 'box' pattern: 4-4-4-4",
      "Continue for 6-8 cycles",
      "Notice the sense of calm and focus",
      "Return to natural breathing"
    ]
  }
};

// Grounding techniques for overwhelm and dissociation
export const GROUNDING_TECHNIQUES = {
  five_four_three_two_one: {
    title: "5-4-3-2-1 Sensory Grounding",
    description: "Use your senses to anchor yourself in the present moment",
    steps: [
      "Name 5 things you can see around you",
      "Name 4 things you can touch or feel",
      "Name 3 things you can hear",
      "Name 2 things you can smell",
      "Name 1 thing you can taste"
    ]
  },

  body_grounding: {
    title: "Physical Grounding",
    description: "Use your body to feel safe and present",
    steps: [
      "Feel your feet firmly on the ground",
      "Press your feet into the floor",
      "Notice the weight of your body in the chair",
      "Hold your hands together and squeeze gently",
      "Take three deep breaths into your belly",
      "Say aloud: 'I am here, I am safe, I am present'"
    ]
  }
};

// Progressive muscle relaxation scripts
export const RELAXATION_SCRIPTS = {
  progressive_muscle: {
    title: "Progressive Muscle Relaxation",
    duration: 20,
    script: `
      Lie down comfortably and close your eyes. We're going to systematically tense and relax each muscle group in your body, helping you release physical tension and stress.

      Start with your feet. Curl your toes tightly and tense all the muscles in your feet. Hold for 5 seconds... and release. Notice the contrast between tension and relaxation.

      Now tense your calf muscles. Point your toes toward your shins and feel the stretch in your calves. Hold... and release. Feel the muscles softening.

      Tense your thigh muscles. Straighten your legs and tighten your quadriceps. Hold... and release. Feel the heaviness as your legs sink into the surface beneath you.

      Clench your fists and tense your arms. Make tight fists and feel the tension up through your forearms and biceps. Hold... and release. Let your arms fall naturally to your sides.

      Tense your shoulders by raising them toward your ears. Hold this tension... and let them drop. Feel the relief as they settle.

      Scrunch up your face. Close your eyes tightly, wrinkle your forehead, clench your jaw. Hold... and release. Feel your face smoothing out.

      Finally, tense your entire body. Every muscle from head to toe. Hold for 5 seconds... and completely let go. Feel your whole body sinking into deep relaxation.

      Rest here for a few minutes, enjoying the feeling of complete relaxation. Your body knows how to release tension. Trust in this natural ability.
    `
  }
};

// Utility functions for content delivery
export const getPersonalizedContent = (userProfile) => {
  const { fearPatterns } = userProfile;
  
  const personalizedAffirmations = [
    ...SOVEREIGNTY_AFFIRMATIONS,
    ...AUTHORITY_CONFIDENCE_AFFIRMATIONS,
    ...CARTESIAN_AFFIRMATIONS
  ];

  // Add specific affirmations based on fear patterns
  fearPatterns.forEach(patternId => {
    if (SUBLIMINAL_SCRIPTS[patternId]) {
      personalizedAffirmations.push(...SUBLIMINAL_SCRIPTS[patternId].affirmations);
    }
  });

  return {
    affirmations: personalizedAffirmations,
    scripts: fearPatterns.map(id => SUBLIMINAL_SCRIPTS[id]).filter(Boolean),
    meditations: Object.values(GUIDED_MEDITATIONS),
    exercises: Object.values(BREATHING_EXERCISES),
    grounding: Object.values(GROUNDING_TECHNIQUES)
  };
};

export const getRandomAffirmation = (category = 'sovereignty') => {
  const affirmationSets = {
    sovereignty: SOVEREIGNTY_AFFIRMATIONS,
    authority: AUTHORITY_CONFIDENCE_AFFIRMATIONS,
    cartesian: CARTESIAN_AFFIRMATIONS
  };
  
  const affirmations = affirmationSets[category] || SOVEREIGNTY_AFFIRMATIONS;
  return affirmations[Math.floor(Math.random() * affirmations.length)];
};

export const generateSubliminalText = (fearPatterns, duration = 30) => {
  const relevantScripts = fearPatterns
    .map(id => SUBLIMINAL_SCRIPTS[id])
    .filter(Boolean);
  
  if (relevantScripts.length === 0) {
    return SUBLIMINAL_SCRIPTS[FEAR_PATTERN_IDS.AUTHORITY_FEAR].script;
  }
  
  // Combine scripts for multiple patterns
  return relevantScripts.map(script => script.script).join('\n\n');
};




// --- New Content for 35% Increase ---

// Affirmations: Self-Worth and Boundaries
export const selfWorthAffirmations = {
  content_type: 'affirmation',
  category: 'self_worth',
  title: 'Self-Worth and Boundary Affirmations',
  content: 'I am inherently worthy of respect and love.\nMy boundaries are sacred and I communicate them clearly.\nI honor my needs and feelings.\nI am capable of setting healthy boundaries.\nMy worth is not dependent on external validation.\nI am safe to express my authentic self.\nI attract respectful and supportive relationships.\nI am deserving of all good things.\nI am confident in my value.\nI choose to protect my energy and well-being.',
  audio_url: '/audio/self_worth_affirmations.wav',
  duration: 4,
  fear_patterns: ['self_doubt', 'people_pleasing', 'disapproval'],
  difficulty_level: 2,
  is_active: true
};

// Meditation: Grounding and Centering
export const groundingMeditation = {
  content_type: 'meditation',
  category: 'grounding',
  title: 'Grounding and Centering Meditation',
  content: 'Find a comfortable position, allowing your body to settle. Close your eyes gently or soften your gaze. Take a deep breath in, feeling your lungs expand, and exhale slowly, releasing any tension. Imagine roots growing from the base of your spine, extending deep into the earth. Feel yourself connected, stable, and secure. Bring your awareness to your center, a point of calm and stillness within you. This is your anchor, always accessible. Feel your energy drawing inward, becoming more focused and present. You are grounded, centered, and at peace.',
  audio_url: '/audio/grounding_meditation.wav',
  duration: 10,
  fear_patterns: ['anxiety', 'overwhelm', 'instability'],
  difficulty_level: 1,
  is_active: true
};

// Exercise: Cognitive Restructuring for Self-Criticism
export const selfCriticismCBT = {
  content_type: 'exercise',
  category: 'cbt',
  title: 'Cognitive Restructuring for Self-Criticism',
  content: 'This exercise helps you challenge and reframe harsh self-criticism.\n\nStep 1: Identify the Self-Critical Thought\nWhat negative thought are you having about yourself? (e.g., "I\'m not good enough," "I always mess up")\n\nStep 2: Identify the Emotion\nHow does this thought make you feel? (e.g., shame, sadness, anxiety)\n\nStep 3: Examine the Evidence\nWhat evidence supports this thought? What evidence contradicts it? Is there another way to look at this situation?\n\nStep 4: Reframe the Thought\nCreate a more compassionate and realistic thought. What would you tell a friend in this situation?\n\nStep 5: Notice the Shift\nHow do you feel now after reframing the thought?',
  duration: 15,
  fear_patterns: ['self_doubt', 'perfectionism', 'criticism'],
  difficulty_level: 3,
  is_active: true
};

// Affirmations: Inner Child Healing
export const innerChildAffirmations = {
  content_type: 'affirmation',
  category: 'inner_child',
  title: 'Inner Child Healing Affirmations',
  content: 'I embrace and nurture my inner child.\nI provide my inner child with the love and safety it always deserved.\nI am here for you, little one.\nYour feelings are valid and heard.\nI protect you and keep you safe.\nI am a loving and supportive parent to myself.\nI heal the wounds of the past with compassion.\nI integrate all parts of myself with love.\nI am whole and complete.',
  audio_url: '/audio/inner_child_affirmations.wav',
  duration: 5,
  fear_patterns: ['trauma', 'abandonment', 'unworthiness'],
  difficulty_level: 4,
  is_active: true
};

// Meditation: Future Self Visualization
export const futureSelfVisualization = {
  content_type: 'meditation',
  category: 'future_self',
  title: 'Future Self Visualization',
  content: 'Close your eyes and take a few deep breaths. Imagine yourself one year from now, having fully integrated the lessons and growth from your journey. See your future self standing confidently, embodying the qualities you desire. What do they look like? How do they carry themselves? What emotions are they experiencing? Step into their shoes, feel their confidence, their peace, their sovereignty. This future self is already within you, waiting to be fully expressed. Bring this feeling back with you as you gently return to the present moment.',
  audio_url: '/audio/future_self_visualization.wav',
  duration: 12,
  fear_patterns: ['uncertainty', 'self_doubt', 'lack_of_direction'],
  difficulty_level: 3,
  is_active: true
};

// Exercise: IFS Parts Integration Dialogue
export const ifsPartsIntegration = {
  content_type: 'exercise',
  category: 'ifs',
  title: 'IFS Parts Integration Dialogue',
  content: 'This exercise guides you through a dialogue with your internal parts to foster understanding and integration.\n\nStep 1: Identify a Part\nBring to mind a part of you that is currently active or causing distress. (e.g., a critical part, a fearful part, a rebellious part)\n\nStep 2: Witness the Part\nFrom your Self-energy, observe the part with curiosity and compassion. What does it look like? What is its intention?\n\nStep 3: Dialogue with the Part\nAsk the part: "What do you need me to know?" "What are you trying to protect me from?" Listen without judgment.\n\nStep 4: Acknowledge and Validate\nThank the part for its efforts. Let it know you understand its role.\n\nStep 5: Offer a New Role\nAsk the part if it would be willing to take on a new, less burdensome role, now that Self is present and can handle the situation.\n\nStep 6: Integration\nImagine the part relaxing, perhaps even transforming, as it accepts its new role and integrates more harmoniously with your Self.',
  duration: 20,
  fear_patterns: ['inner_conflict', 'self_sabotage', 'emotional_dysregulation'],
  difficulty_level: 4,
  is_active: true
};




// Exercise: CBT for Fear of Failure
export const fearOfFailureCBT = {
  content_type: 'exercise',
  category: 'cbt',
  title: 'CBT for Fear of Failure',
  content: 'This exercise helps you identify and challenge thoughts related to fear of failure.\n\nStep 1: Identify the Situation\nDescribe a situation where you felt fear of failure.\n\nStep 2: Identify the Automatic Thoughts\nWhat thoughts went through your mind? (e.g., "I will fail," "I am not good enough")\n\nStep 3: Identify the Emotions\nWhat emotions did you feel? (e.g., anxiety, shame, hopelessness)\n\nStep 4: Examine the Evidence For and Against\nWhat evidence supports these thoughts? What evidence contradicts them?\n\nStep 5: Develop Alternative Thoughts\nWhat is a more balanced and realistic thought you can have?\n\nStep 6: Re-evaluate Emotions\nHow do you feel now after challenging these thoughts?',
  duration: 15,
  fear_patterns: ['failure', 'perfectionism', 'criticism'],
  difficulty_level: 3,
  is_active: true
};

// Exercise: Polyvagal - Safe and Sound Protocol Inspired
export const safeAndSoundPolyvagal = {
  content_type: 'exercise',
  category: 'polyvagal',
  title: 'Polyvagal - Safe and Sound Inspired Exercise',
  content: 'This exercise is inspired by the Safe and Sound Protocol, focusing on auditory regulation.\n\nStep 1: Find a Quiet Space\nEnsure you are in a calm and quiet environment where you can focus.\n\nStep 2: Gentle Listening\nListen to calming, modulated music or nature sounds. Focus on the higher frequencies, which are associated with the ventral vagal state.\n\nStep 3: Notice Body Sensations\nPay attention to any shifts in your body. Do you feel more relaxed, more connected, or more present?\n\nStep 4: Deep Breathing\nIntegrate slow, deep breaths, extending your exhales to further activate your vagus nerve.\n\nStep 5: Self-Compassion\nOffer yourself compassion for any discomfort that arises, and gently return your focus to the sounds and your breath.',
  duration: 20,
  fear_patterns: ['anxiety', 'social_anxiety', 'disconnection'],
  difficulty_level: 4,
  is_active: true
};




// Exercise: Somatic - Pendulation and Titration
export const pendulationTitrationSomatic = {
  content_type: 'exercise',
  category: 'somatic',
  title: 'Somatic Pendulation and Titration',
  content: 'This exercise helps regulate your nervous system by gently moving between states of activation and calm.\n\nStep 1: Identify a Mild Sensation\nBring to mind a mild, tolerable sensation in your body related to a recent stressor or discomfort. Notice its location, quality, and intensity (1-10).\n\nStep 2: Resource Yourself\nNow, shift your attention to a part of your body that feels neutral or pleasant. This is your resource. Linger here, noticing the comfortable sensations. Allow yourself to fully experience this calm.\n\nStep 3: Pendulate\nGently move your awareness back to the mild sensation. Notice it for a few moments, then return your attention to your resource. Go back and forth, like a pendulum, allowing your nervous system to self-regulate. Do not stay too long in the uncomfortable sensation.\n\nStep 4: Titrate\nIf the uncomfortable sensation intensifies, immediately return to your resource. Take small "doses" of the discomfort, always returning to your safe place. This process is called titration.\n\nStep 5: Integration\nAs you continue to pendulate and titrate, you may notice the uncomfortable sensation shifting, decreasing, or even disappearing. This is your nervous system integrating the experience and returning to a state of balance.\n\nStep 6: Grounding\nEnd the exercise by focusing on your resource and the feeling of being grounded in your body. Notice the overall sense of calm and well-being.',
  duration: 15,
  fear_patterns: ['trauma', 'anxiety', 'overwhelm'],
  difficulty_level: 4,
  is_active: true
};




// Affirmations: Abundance and Prosperity
export const abundanceAffirmations = {
  content_type: 'affirmation',
  category: 'abundance',
  title: 'Abundance and Prosperity Affirmations',
  content: 'I am open and receptive to all the abundance the universe has to offer.\nMoney flows to me easily and effortlessly.\nI am worthy of financial success and prosperity.\nI attract opportunities for growth and wealth.\nMy life is filled with limitless possibilities.\nI am grateful for the abundance that surrounds me.\nI am a magnet for success and good fortune.\nI create my own reality of prosperity.\nEvery day, I am becoming more abundant.\nI am financially free and secure.',
  audio_url: '/audio/abundance_affirmations.wav',
  duration: 4,
  fear_patterns: ['scarcity', 'lack', 'financial_anxiety'],
  difficulty_level: 2,
  is_active: true
};

// Meditation: Manifestation and Visualization
export const manifestationMeditation = {
  content_type: 'meditation',
  category: 'manifestation',
  title: 'Manifestation and Visualization Meditation',
  content: 'Close your eyes and take a deep breath. Imagine your deepest desires as if they have already manifested. See them clearly, feel the emotions, hear the sounds, smell the scents. Immerse yourself fully in this future reality. Feel the joy, the gratitude, the excitement. Hold this vision in your mind, knowing that the universe is conspiring to bring it to you. Release any doubt or resistance. Trust in the process. You are a powerful creator, and your thoughts are shaping your reality. When you are ready, gently open your eyes, carrying this powerful feeling of manifestation with you.',
  audio_url: '/audio/manifestation_meditation.wav',
  duration: 15,
  fear_patterns: ['doubt', 'uncertainty', 'resistance'],
  difficulty_level: 3,
  is_active: true
};

// Exercise: Journaling for Emotional Release
export const emotionalReleaseJournaling = {
  content_type: 'exercise',
  category: 'journaling',
  title: 'Journaling for Emotional Release',
  content: 'This exercise helps you process and release pent-up emotions through writing.\n\nStep 1: Find a Quiet Space\nFind a private space where you can write freely without interruption.\n\nStep 2: Set an Intention\nBefore you begin, set an intention to release any emotions that are no longer serving you.\n\nStep 3: Free Writing\nStart writing whatever comes to mind. Don\'t censor yourself. Write about your feelings, thoughts, fears, and frustrations. Let it all out onto the page.\n\nStep 4: Acknowledge and Release\nAs you write, acknowledge the emotions you are experiencing. Once you have written everything, take a deep breath and imagine releasing these emotions as you exhale.\n\nStep 5: Gratitude and Closure\nEnd your journaling session by writing down a few things you are grateful for, bringing a sense of closure and positivity.',
  duration: 20,
  fear_patterns: ['emotional_suppression', 'stress', 'anger'],
  difficulty_level: 2,
  is_active: true
};

// Affirmations: Self-Love and Acceptance
export const selfLoveAffirmations = {
  content_type: 'affirmation',
  category: 'self_love',
  title: 'Self-Love and Acceptance Affirmations',
  content: 'I deeply and completely love and accept myself.\nI am worthy of love, just as I am.\nI treat myself with kindness and compassion.\nMy imperfections make me unique and beautiful.\nI am enough.\nI forgive myself for past mistakes.\nI embrace all parts of myself.\nI am my own best friend.\nI nourish my mind, body, and soul.\nI am a radiant being of love.',
  audio_url: '/audio/self_love_affirmations.wav',
  duration: 4,
  fear_patterns: ['self_criticism', 'unworthiness', 'rejection'],
  difficulty_level: 2,
  is_active: true
};

// Meditation: Inner Peace and Calm
export const innerPeaceMeditation = {
  content_type: 'meditation',
  category: 'inner_peace',
  title: 'Inner Peace and Calm Meditation',
  content: 'Find a comfortable position and close your eyes. Take a few deep breaths, allowing your body to relax. Imagine a serene, peaceful place within you. This could be a calm lake, a quiet forest, or a tranquil garden. Feel the stillness, the quiet, the profound sense of peace. Allow this peace to spread throughout your entire being, calming your mind and soothing your spirit. You are safe, you are loved, and you are at peace. Rest in this feeling for as long as you need. When you are ready, gently open your eyes, carrying this inner peace with you.',
  audio_url: '/audio/inner_peace_meditation.wav',
  duration: 10,
  fear_patterns: ['stress', 'anxiety', 'overwhelm'],
  difficulty_level: 1,
  is_active: true
};

// Exercise: Cognitive Reframing for Negative Self-Talk
export const negativeSelfTalkCBT = {
  content_type: 'exercise',
  category: 'cbt',
  title: 'Cognitive Reframing for Negative Self-Talk',
  content: 'This exercise helps you identify and reframe negative self-talk into more constructive thoughts.\n\nStep 1: Identify the Negative Self-Talk\nWhat negative things are you saying to yourself? (e.g., "I\'m so stupid," "I\'ll never succeed")\n\nStep 2: Identify the Impact\nHow does this self-talk make you feel? How does it affect your actions?\n\nStep 3: Challenge the Thought\nIs this thought 100% true? What evidence do you have to support it? What evidence contradicts it? Is there another way to interpret the situation?\n\nStep 4: Reframe the Thought\nChange the negative self-talk into a more positive, realistic, and helpful statement. (e.g., "I made a mistake, but I can learn from it," "I am capable of learning and growing")\n\nStep 5: Practice the New Thought\nRepeat the reframed thought to yourself. Notice how it feels different and how it empowers you.',
  duration: 15,
  fear_patterns: ['self_doubt', 'low_self_esteem', 'perfectionism'],
  difficulty_level: 3,
  is_active: true
};




// Affirmations: Confidence and Self-Esteem
export const confidenceAffirmations = {
  content_type: 'affirmation',
  category: 'confidence',
  title: 'Confidence and Self-Esteem Affirmations',
  content: 'I am confident in my abilities and talents.\nI believe in myself and my potential.\nI am worthy of success and happiness.\nI radiate confidence and attract positive experiences.\nI am strong, capable, and resilient.\nI trust my inner wisdom and intuition.\nI embrace challenges as opportunities for growth.\nI am proud of who I am and who I am becoming.\nI am a magnet for positive energy and opportunities.\nI am confident in my unique path and purpose.',
  audio_url: '/audio/confidence_affirmations.wav',
  duration: 4,
  fear_patterns: ['self_doubt', 'insecurity', 'social_anxiety'],
  difficulty_level: 2,
  is_active: true
};

// Meditation: Chakra Balancing
export const chakraBalancingMeditation = {
  content_type: 'meditation',
  category: 'energy_healing',
  title: 'Chakra Balancing Meditation',
  content: 'Sit comfortably and close your eyes. Bring your awareness to the base of your spine, your Root Chakra. Visualize a vibrant red light, grounding you to the earth. Breathe into this energy center, feeling stable and secure. Move your attention to your lower abdomen, your Sacral Chakra. See a glowing orange light, representing creativity and passion. Breathe into this center, embracing your emotions and desires. Shift to your solar plexus, your Solar Plexus Chakra. Imagine a bright yellow light, symbolizing personal power and confidence. Breathe into this center, feeling empowered and strong. Now, focus on your heart center, your Heart Chakra. Visualize a soft green light, radiating love and compassion. Breathe into this center, opening your heart to giving and receiving love. Move to your throat, your Throat Chakra. See a clear blue light, representing communication and truth. Breathe into this center, expressing your authentic self. Shift to your forehead, between your eyebrows, your Third Eye Chakra. Imagine a deep indigo light, symbolizing intuition and wisdom. Breathe into this center, trusting your inner guidance. Finally, bring your awareness to the crown of your head, your Crown Chakra. Visualize a brilliant violet or white light, connecting you to universal consciousness. Breathe into this center, feeling connected and enlightened. Rest in this balanced state, feeling harmony within your energy centers. When you are ready, gently open your eyes, carrying this balanced energy with you.',
  audio_url: '/audio/chakra_balancing_meditation.wav',
  duration: 20,
  fear_patterns: ['imbalance', 'stagnation', 'spiritual_disconnect'],
  difficulty_level: 4,
  is_active: true
};

// Exercise: Somatic - Trauma Release Exercises (TRE) Inspired
export const treInspiredSomatic = {
  content_type: 'exercise',
  category: 'somatic',
  title: 'Somatic - Trauma Release Exercises (TRE) Inspired',
  content: 'This exercise is inspired by TRE, helping to release chronic tension and trauma through natural body tremors.\n\nStep 1: Gentle Shaking\nLie down or sit comfortably. Begin to gently shake your legs, allowing small, involuntary tremors to emerge. This is your body\'s natural way of releasing tension.\n\nStep 2: Observe Sensations\nPay attention to the sensations in your body as the tremors occur. Notice any warmth, tingling, or release. Do not try to control or stop the tremors.\n\nStep 3: Allow the Process\nAllow the tremors to move through your body naturally. They may shift in intensity or location. Trust your body\'s innate wisdom to release what it needs to.\n\nStep 4: Grounding\nWhen you feel complete, gently bring your body to stillness. Take a few deep breaths and feel your connection to the ground. Notice any shifts in your state of being.\n\nStep 5: Integration\nAllow time for integration. You may feel a sense of calm, lightness, or increased presence. Drink water and rest if needed.',
  duration: 25,
  fear_patterns: ['trauma', 'chronic_stress', 'body_tension'],
  difficulty_level: 5,
  is_active: true
};

