# 📱 GLOWCHI - Wellness Cat Companion Onboarding & Page Spec

## Global Notes for Cursor Implementation

**Tone**: Warm, supportive, like a caring friend who happens to be a cat
**Mascot Integration**: Your cat appears throughout as an emotional anchor and guide
**Progressive Disclosure**: Start simple, reveal complexity only when users opt-in
**Optional Contexts**: Medication, menopause, mental wellness available but not forced
**Focus**: "Glowing" and radiance rather than clinical health metrics
**Unique Differentiation**: Cat companionship, emotional support, wellness framing (not medical)

---

## PAGE 1 — Welcome / Meet Your Cat
**Header**: Meet your wellness companion ✨

**Visual**:
- Animated cat introduction (gentle, welcoming)
- Cat stretches and looks curious, ready for adventure
- Soft glow effect around the cat

**Body Copy**:
🐱 I'm here to help you notice what makes you feel good and glow brighter each day
🌟 Together we'll track simple daily moments that support your radiance
💝 Your patterns are safe with me - I'm just here to care

**Cat Message**: "Hi! I'm so happy you're here. Let's start our wellness journey together!"

**CTA**: Let's begin our journey → Next

**Progress**: ● ○ ○ ○ ○

---

## PAGE 2 — Privacy & Safe Space
**Header**: 🛡️ Your glow journey is safe and private

**Body Copy**:
Your wellness moments stay just between us - we keep everything encrypted and secure.
You control what we track and can export or gently fade away any data whenever you choose.

We never share your personal patterns externally without your permission.

**Consent Toggles** (Required):
⬜ I understand my wellness data stays private and secure
⬜ I'm ready to begin this gentle journey of self-care

**Optional Toggle**:
⬜ Send gentle wellness tips and cat care reminders (no pressure!)

**Cat Message**: "Your privacy matters to me. I just want to support your glow! 🐾"

**Disclaimer**: Your cat's glow reflects gentle wellness patterns, not medical advice.

**CTA**: Ready to glow → Next (disabled until consents checked)

**Progress**: ● ● ○ ○ ○

---

## PAGE 3 — How Did Your Cat Find You?
**Header**: How did you find your glow companion?

**Options** (Single Select):
🐱 Friend shared our story
📸 Instagram wellness community
📱 App Store discovery
▶️ YouTube wellness journey
👩‍⚕️ Healthcare provider suggestion
🔍 Gentle wellness search
💬 Wellness forums/discussions
📘 Facebook wellness groups
✨ Wellness synchronicity

**Cat Message**: "I'm glad we're connected! Every wellness journey starts somewhere special."

**CTA**: Continue → Next

**Progress**: ● ● ● ○ ○

---

## PAGE 4 — Your Wellness Rhythm
**Header**: What's your wellness pace?
**Subtitle**: This helps me tailor our journey to feel just right for you.

**Gentle Pace Selection**:
How much detail feels supportive right now?

- **Gentle**: Simple daily moments and basic glow patterns
- **Balanced**: Regular check-ins with some gentle details
- **Attentive**: Full wellness exploration and pattern noticing

**Wellness Focus** (Optional Context):
Would you like to explore any specific wellness areas?

- Just general radiance and glow
- Starting/changing wellness support (medications, supplements)
- Hormonal wellness rhythm (cycles, transitions)
- Mental wellness flow (mood, focus, energy)
- Skin radiance journey

**Cat Message**: "Whatever pace feels right for you is perfect. I'm here to support your glow!"

**CTA**: Let's personalize → Next

**Progress**: ● ● ● ● ○

---

## PAGE 5 — Wellness Areas of Interest (Optional)
**Header**: Tell me about your wellness curiosities (completely optional)
**Subtitle**: This helps me offer more personalized glow support. Skip anytime.

**Multi-select wellness themes** (if medication context chosen):
Starting new wellness support, Managing ongoing patterns, Tracking gentle changes, Preparing for wellness conversations

**Multi-select wellness themes** (if hormonal context chosen):
Cycle rhythm awareness, Transition support, PMS pattern noticing, Fertility wellness

**Multi-select wellness themes** (if mental wellness chosen):
Focus flow support, Energy pattern awareness, Mood journey noticing, Gentle overwhelm support

**Free text**: Any other wellness areas you're curious about?

**Cat Message**: "It's okay to be curious about different aspects of wellness. I'm here to explore gently with you."

**CTA**: Continue → Skip always available

**Progress**: ● ● ● ● ●

---

## PAGE 6 — Our Daily Glow Moments
**Header**: What moments shall we notice together?

**Subtitle**: Start with what feels meaningful. We can always add more glow moments later.

**Daily Glow Categories** (all default ON, can gently toggle off):
🙂 How I'm feeling today (mood/energy)
🐾 My cat's current glow level
💤 Sleep rhythm last night
🚶 Movement & fresh air
💧 Hydration & nourishment
🍎 Food & body fuel
💊 Wellness support (if context selected)
📱 Screen time before rest
📝 Gentle notes & wins

**Cat Message**: "Even small moments of noticing can help us glow brighter together!"

**CTA**: Ready to start glowing → Next

---

## PAGE 7 — Connect Wellness Signals (Optional)
**Header**: Let's connect your wellness signals

**Body Copy**:
Help me understand your patterns by connecting gentle health signals. This lets me respond to your rest, movement, and heart rhythms.

**Visual**: Cat with heart monitor icon, gentle connection animation

**Privacy Note**: Read-only access, you control what connects, your patterns stay private.

**Cat Message**: "I love learning about your natural rhythms - it helps me support your glow!"

**CTA**: Connect signals → Skip for gentle manual tracking

**Progress**: Complete - advances to dashboard

---

## 🏠 MAIN APP SCREENS

### Home Dashboard - Your Glow Space
**Header**: Today with [Cat Name] ✨

**Welcome Message** (first session):
🐱 "Good morning! I'm excited to start noticing your glow together. How are you feeling today?"

**Cat Display**:
- Animated cat in current mood pose
- Glow meter (0-100) based on recent patterns
- Supportive message based on your entries

**Daily Glow Check-Ins** (Collapsible cards):
- Mood & Energy (⭐ gentle scale 1-5)
- Sleep Quality (💤 hours of rest)
- Water & Hydration (💧 gentle tracking)
- Movement (🚶 steps taken)
- Nourishment (🍎 body fuel choices)
- Wellness Support (💊 if enabled)
- Screen Time (📱 before rest)
- Gentle Notes (📝 wins & observations)

**Bottom CTA**: Complete today's glow check

### Wellness Tab - Your Patterns
**Sections**:
- **Gentle Correlations**: Your cat notices patterns (supportive insights)
- **Glow Timeline**: Weekly/monthly radiance patterns
- **Wellness Goals**: Gentle intentions, not strict requirements
- **Share Insights**: Export for wellness conversations (PDF reports)

### Profile Tab - Your Space
**Settings**:
- Cat customization (name, appearance, personality)
- Notification preferences (gentle glow reminders)
- Data care & privacy controls
- Wellness context modules (add/remove gentle focuses)
- Healthcare sharing settings

### Glow Vision Tab - Radiance Journey
**Features**:
- Gentle skin analysis with AI enhancement
- Progress photos with glow comparison
- Wellness tips from your cat's perspective

---

## 💊 MEDICATION & WELLNESS SUPPORT INTEGRATION

**Wellness Support Tracking** (when context enabled):
- Baseline periods before new support begins
- Gentle change noticing with timestamps
- Doctor conversation preparation
- Pattern correlation with cat's glow

**Doctor Sharing**:
- Clean PDF reports: "My wellness patterns"
- Timeline views with gentle insights
- Support impact summaries
- Export without medical claims

**Context Modules** (Progressive):
- Wellness Support: Track baselines & gentle changes
- Hormonal Rhythm: Cycle awareness and transitions
- Mental Flow: Mood, focus, and energy pattern noticing
- Radiance Journey: Skin and overall glow patterns

---

## 🎯 KEY DIFFERENTIATION FROM BEARABLE

| Bearable Approach | Glowchi Wellness Companion |
|------------------|---------------------------|
| Clinical symptoms | Gentle wellness patterns |
| Achievement pressure | Supportive companionship |
| Dense configuration | Progressive gentle discovery |
| Medical terminology | Warm, cat-themed radiance |
| Strict medication logging | Wellness support observation |
| Doctor sharing as afterthought | Built-in glow pattern sharing |

This creates a unique wellness companion experience that's inspired by successful patterns but distinctly different through emotional design, cat mascot integration, and gentle wellness framing.