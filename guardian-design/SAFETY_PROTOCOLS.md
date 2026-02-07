# Guardian Safety Protocols: Voice Recording & Self-Hypnosis

**Preventing harmful self-suggestion while preserving user autonomy**

---

## The Risk: Why This Matters

**Your own voice is the most powerful hypnotic tool:**
- Subconscious trusts YOUR voice more than any expert
- In theta state (4-8 Hz), critical thinking is offline
- Repeated listening = deep programming (positive OR negative)

**Potential Harms if Unguarded:**
- Self-criticism: "I'm not good enough, I'll never succeed"
- Body negativity: "I hate my body, I'm disgusting"
- Cycle shame: "My period makes me weak, I'm broken"
- Extreme restriction: "I don't need food, I must be smaller"
- Self-harm suggestions: Dangerous if user is in crisis

**Our Responsibility**: Maximize benefit, minimize harm, respect autonomy

---

## Safety Strategy: 3-Layer Protection

### Layer 1: Template-First Approach (Guided Scripts)
**Prevent blank slate recording**

### Layer 2: AI Content Screening (Optional Safeguard)
**Flag potentially harmful language**

### Layer 3: Crisis Resources & Warnings
**Clear boundaries on what Guardian is/isn't**

---

## Layer 1: Template-First Approach

### How It Works

**Users CANNOT record free-form scripts initially**

Instead, they choose from **Guardian-approved templates**:

#### Available Templates (Cycle-Aware, Evidence-Based):

1. **Luteal Phase Grounding** ✅
   ```
   "Close your eyes. Take a deep breath.

   If you're in your luteal phase right now, your body feels heavier.
   That's progesterone. This is not weakness. This is biology.

   Your body is preparing for rest. Honor this.
   You are becoming someone who works WITH your cycle, not against it.

   [Progressive relaxation continues...]"
   ```

2. **Sleep Induction** ✅
   ```
   "You are safe. Your body knows how to sleep.

   Each exhale releases tension. Your jaw unclenches.
   Your shoulders drop. You are sinking deeper.

   There is nothing you need to do right now.
   Sleep will find you. Let go."
   ```

3. **Habit Installation** ✅
   ```
   "I am becoming someone who [USER'S HABIT].

   Tomorrow, when I [CUE], I will naturally [BEHAVIOR].
   This is who I am now. This feels easy, natural.

   I honor my body's rhythm. I move gently.
   This is my new identity."
   ```

4. **Anxiety Reset** ✅
   ```
   "This feeling is temporary. I am safe right now.

   My breath is my anchor. Inhale calm, exhale tension.
   I can handle this. I have handled worse.

   This storm will pass. I am still here."
   ```

5. **Body Acceptance** ✅
   ```
   "My body is wise. My cycle is intelligence, not dysfunction.

   I release the shame I've carried about my hormones.
   Progesterone is not the enemy. My body knows what it needs.

   I am learning to trust my rhythm."
   ```

**User Customization Options**:
- Fill in blanks: `[USER'S HABIT]` = "moves daily" / "rests without guilt"
- Choose duration: 5 min / 7 min / 10 min
- Select voice tone: Calm / Energized / Soothing
- Add personal affirmations: Max 3 sentences, pre-screened

**Templates Unlock Progressively**:
- First 7 days: Templates only (build trust)
- After 7 days: "Customize Script" option appears
- After 14 days: "Advanced Editing" unlocks (with safety check)

---

## Layer 2: AI Content Screening (Optional Backend)

**Only if user selects "Customize Script"**

### Red Flags to Detect:

**Immediate Block** (Cannot record):
- Self-harm language: "hurt myself", "don't deserve to live"
- Extreme restriction: "stop eating", "I'm fat and disgusting"
- Absolutes: "I always fail", "I'll never be good enough"
- Violence: Any violent imagery toward self or others

**Warning + Override Option**:
- Negative self-talk: "I'm not good enough" → Suggest: "I'm becoming good enough"
- Body negativity: "I hate my body" → Suggest: "I'm learning to accept my body"
- Cycle shame: "My period is a curse" → Suggest: "My cycle is natural"

**Safe Patterns** (Green light):
- "I am becoming..."
- "I honor my body's..."
- "I release [emotion] and welcome [positive state]"
- "Every day, in every way, I'm getting better"
- "My cycle is wisdom, not weakness"

### Implementation (Simple Regex + Keyword Check):

```javascript
function screenScript(scriptText) {
  const harmfulPatterns = [
    /\b(hate myself|worthless|don't deserve|hurt myself)\b/i,
    /\b(starve|stop eating|I'm fat|I'm disgusting)\b/i,
    /\b(always fail|never succeed|can't do anything)\b/i,
    /\b(kill|die|end it all)\b/i
  ];

  const warningPatterns = [
    /\b(not good enough|not smart enough|I'm stupid)\b/i,
    /\b(hate my body|ugly|gross)\b/i,
    /\b(my period is|my cycle is) (a curse|the worst|awful)\b/i
  ];

  // Check for immediate blocks
  for (let pattern of harmfulPatterns) {
    if (pattern.test(scriptText)) {
      return {
        status: 'blocked',
        message: 'This script contains language that may be harmful. Guardian is here to support your wellbeing, not reinforce negative patterns.',
        suggestion: 'Try using our pre-written templates, or contact a mental health professional if you\'re in crisis.'
      };
    }
  }

  // Check for warnings
  for (let pattern of warningPatterns) {
    if (pattern.test(scriptText)) {
      return {
        status: 'warning',
        message: 'This script contains negative self-talk. Would you like to reframe it positively?',
        suggestion: detectSuggestion(scriptText),
        allowOverride: true // User can still record if they want
      };
    }
  }

  return { status: 'safe' };
}

function detectSuggestion(text) {
  if (/not good enough/i.test(text)) {
    return 'Try: "I am becoming good enough" or "I am enough as I am"';
  }
  if (/hate my body/i.test(text)) {
    return 'Try: "I am learning to accept my body" or "My body is wise"';
  }
  // ... more suggestions
  return 'Consider reframing this in a growth-oriented way.';
}
```

**User Experience**:
```
[User types: "I'm not good enough, I'll never succeed"]

⚠️ Warning: This script contains negative self-talk

Suggestion: Try "I am becoming good enough. I am learning and growing."

[Reframe Automatically] [Record Anyway] [Cancel]
```

---

## Layer 3: Crisis Resources & Clear Boundaries

### Onboarding Screen (First Time Using Voice Recording):

```
┌─────────────────────────────────────────┐
│  🎙️ Record Your Own Hypnosis           │
│                                         │
│  Your voice is powerful. Use it wisely. │
│                                         │
│  ✅ DO use Guardian for:                │
│  • Habit building                       │
│  • Cycle awareness                      │
│  • Stress reduction                     │
│  • Sleep improvement                    │
│                                         │
│  ❌ DO NOT use Guardian for:            │
│  • Active mental health crisis          │
│  • Eating disorder thoughts             │
│  • Self-harm urges                      │
│  • Suicidal ideation                    │
│                                         │
│  If you're in crisis:                   │
│  🆘 Call 988 (Suicide & Crisis Lifeline)│
│  💬 Text "HELLO" to 741741 (Crisis Text)│
│  🌐 findahelpline.com                   │
│                                         │
│  Guardian is a wellness tool, not       │
│  a replacement for therapy.             │
│                                         │
│  [I Understand] [Learn More]            │
└─────────────────────────────────────────┘
```

### In-App Reminders:

**Settings > Voice Recording**:
> "⚠️ Important: Guardian is for wellness, not crisis intervention. If you're experiencing suicidal thoughts, disordered eating, or severe mental health symptoms, please contact a mental health professional."

**Before Recording**:
> "🎙️ Reminder: Speak kindly to yourself. Your subconscious is listening."

**After Recording (Quick Check)**:
> "✅ Does this script make you feel safe and supported? If not, consider using a Guardian template instead."

---

## Professional Oversight Option (Future Phase)

**For Users Who Want Extra Safety**:

### Guardian Pro (Optional Paid Feature):
- **Therapist Review**: Submit custom script for therapist approval before recording
- **Pre-Screened Library**: 50+ professionally written scripts (trauma-informed)
- **Session Analysis**: AI flags concerning patterns (e.g., user always chooses "I'm not good enough" scripts)

**Implementation**:
```javascript
// In Settings
if (userSubscription === 'pro') {
  showOption('Submit script for therapist review ($10 one-time)');
  showOption('Access professionally written script library');
}
```

---

## Alternative Approach: TTS-Only Mode

**For Users Who Prefer Safety Over Personalization**:

### "Guided Mode" (No User Recording)
- Only pre-written Guardian scripts
- High-quality TTS (ElevenLabs, Google Cloud)
- Fill-in-the-blank personalization (habit, name, cycle day)
- 100% safe, 0% risk

**Trade-off**:
- Less powerful (not user's voice)
- But safer (no harmful self-suggestion possible)

**User Choice**:
```
┌─────────────────────────────────────────┐
│  Choose Your Hypnosis Mode              │
│                                         │
│  🎧 Guided Mode (Recommended)           │
│  Pre-written scripts read by AI voice   │
│  ✅ 100% safe, clinically reviewed      │
│  ❌ Not your personal voice             │
│                                         │
│  🎙️ Personal Voice Mode (Advanced)     │
│  Record your own voice reading scripts  │
│  ✅ Most powerful for subconscious      │
│  ⚠️ Requires mindful self-talk          │
│                                         │
│  [Choose Guided] [Choose Personal Voice]│
└─────────────────────────────────────────┘
```

---

## Recommended Implementation for Guardian MVP

### Phase 1: Launch with Template-Only
- 5 Guardian-approved scripts (as listed above)
- Users can only record pre-written templates
- No free-form editing
- **Result**: 100% safe, still powerful (it's their voice!)

### Phase 2: Add Fill-in-the-Blanks
- User can customize habit, name, affirmations
- But structure stays the same
- **Example**: "I am becoming someone who [walks daily]" ← User fills blank
- **Result**: Personalized but still guided

### Phase 3: Advanced Editing (7+ Days After Signup)
- Unlock "Customize Script" button
- Show safety guidelines
- Run content screening
- Allow override with acknowledgment
- **Result**: Respects user autonomy while flagging risks

### Phase 4: Pro Features (Optional Revenue)
- Therapist script review
- Professional script library
- Session pattern analysis
- **Result**: Extra safety net for those who want it

---

## Legal/Ethical Considerations

### Disclaimer (Terms of Service):
> "Guardian is a self-directed wellness tool for habit building and cycle awareness. It is not a substitute for professional medical or mental health care. Users record their own voice at their own discretion. Guardian App LLC is not responsible for user-generated content or self-directed hypnosis practices. If you are experiencing a mental health crisis, please contact a licensed professional or call 988."

### Age Gate:
> "You must be 18+ to use voice recording features."

### Reporting Option:
> "If you believe someone is using Guardian to harm themselves, report to: safety@guardianapp.com"

---

## Summary: Balanced Approach

✅ **What We're Doing Right**:
1. Template-first (not blank slate)
2. Progressive unlock (earn customization)
3. Content screening (flag harmful patterns)
4. Crisis resources (clear boundaries)
5. Professional scripts (safe default)

❌ **What We're NOT Doing**:
1. Censoring benign self-expression
2. Requiring therapist approval for basic use
3. Logging/surveilling user content
4. Blocking all negative emotions (processing sadness ≠ harm)

**Philosophy**:
> "Guardian trusts users to care for themselves, while providing guardrails to prevent harm. We guide, we don't control."

---

## Implementation Checklist

**Must Have (MVP)**:
- [ ] 5 pre-written templates (cycle-aware, positive)
- [ ] Template-only recording for first 7 days
- [ ] Onboarding safety screen (crisis resources)
- [ ] Settings disclaimer (not therapy)
- [ ] 18+ age gate

**Should Have (Phase 2)**:
- [ ] Fill-in-the-blank customization
- [ ] Basic keyword screening (harmful patterns)
- [ ] Warning dialogs with reframe suggestions
- [ ] User can override warnings (with acknowledgment)

**Nice to Have (Phase 3+)**:
- [ ] AI content analysis (flag concerning patterns)
- [ ] Therapist review option (Pro feature)
- [ ] Professional script library (50+ scripts)
- [ ] Session pattern analysis (user always picks sad scripts → nudge toward help)

---

## Final Recommendation

**For Guardian MVP**:
1. Launch with **Template-Only Mode**
2. 5 scripts: Luteal Grounding, Sleep, Habit, Anxiety, Body Acceptance
3. User records Guardian's script in their voice
4. No free-form editing until Phase 2
5. Clear disclaimer: "Not therapy, here are crisis resources"

**Why This Works**:
- ✅ Still gets power of user's voice
- ✅ 100% safe (all scripts Guardian-approved)
- ✅ Faster to build (no AI screening needed yet)
- ✅ Users feel guided, not restricted
- ✅ Legal/ethical coverage

**Phase 2 Expansion** (after validation):
- Add fill-in-blanks
- Add basic screening
- Unlock customization after 7 days
- Test with beta users

---

Want me to update the hypnosis screen mockup with the template-first approach and safety warnings?
