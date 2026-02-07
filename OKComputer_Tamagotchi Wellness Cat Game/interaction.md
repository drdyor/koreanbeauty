# Glowchi - Wellness Cat Game Interaction Design

## Core Philosophy
Glowchi is a wellness companion that mirrors the user's mental state rather than demanding care. The cat exists to provide gentle, non-intrusive emotional support through its presence and subtle behavioral changes.

## Character Identity
- **Name**: Glowchi (users can rename if desired)
- **Species**: Calico cat with soft, rounded features
- **Personality**: Quietly present, never demanding, always supportive
- **Role**: Emotional state mirror and wellness companion

## State System

### 1. Idle State (Default)
- **Visual**: Sitting upright, slow blinking, gentle tail sway
- **Behavior**: Subtle breathing animation, occasional ear twitch
- **Trigger**: Default state when app is open and no recent interactions
- **Duration**: Indefinite, with ambient animations

### 2. Alert State
- **Visual**: Slight forward lean, ears perked, eyes more open
- **Behavior**: Brief attentive posture, then returns to idle
- **Trigger**: User opens app, logs mood, or interacts with features
- **Duration**: 3-5 seconds, then transitions back to idle

### 3. Withdrawn State
- **Visual**: Curled up sleeping or turned away, minimal movement
- **Behavior**: Very subtle breathing, may appear "asleep"
- **Trigger**: High stress levels, user hasn't interacted in several hours, or during designated rest periods
- **Duration**: Variable - remains until user actively engages with app

### 4. Content State
- **Visual**: Relaxed sitting, eyes half-closed, gentle purr-like animation
- **Behavior**: Occasional slow blink, peaceful posture
- **Trigger**: User completes wellness activities, low stress levels
- **Duration**: 10-15 seconds, then returns to idle

## User Interactions

### Passive Interactions (No User Action Required)
- **Ambient Animations**: Breathing, blinking, tail swaying, ear twitching
- **State Changes**: Automatic transitions based on user behavior and time
- **Visual Feedback**: Subtle responses to app usage patterns

### Active Interactions (User Initiated)
- **Open App**: Cat transitions from withdrawn to alert to idle
- **Log Mood**: Cat shows brief alert state, may change color slightly
- **Complete Activity**: Cat enters content state with gentle animation
- **Settings**: Cat remains in current state, doesn't react to settings changes

### What the Cat NEVER Does
- Never asks for attention or care
- Never shows negative emotions (sad, angry, sick)
- Never requires feeding, petting, or maintenance
- Never interrupts user activities
- Never uses sound or vibration
- Never blocks UI elements

## Wellness Integration

### Mood Tracking
- User can log mood 1-10 scale
- Cat's color subtly shifts based on recent mood patterns
- No judgment - just gentle visual feedback

### Activity Tracking
- Gentle prompts for wellness activities (breathing, journaling)
- Cat enters content state when activities are completed
- No streaks, points, or gamification elements

### Stress Awareness
- Cat may enter withdrawn state during high-stress periods
- Provides visual cue that user might need rest
- No pressure to "fix" the cat - it's just reflecting state

## Technical Implementation Notes

### Animation System
- Use CSS animations for ambient effects (breathing, blinking)
- State transitions use smooth easing (not instant changes)
- Maximum 3 animations running simultaneously for performance

### State Management
- Simple state machine with 4 primary states
- Timers control automatic state transitions
- User actions can override automatic transitions

### Visual Design
- SVG-based for scalability and performance
- Subtle color palette changes based on mood/activity
- Rounded, soft shapes throughout
- No sharp edges or harsh contrasts

## User Experience Flow

### First Time User
1. Cat appears in alert state, then settles to idle
2. Brief, gentle introduction to cat's purpose
3. Cat remains present but non-intrusive during onboarding

### Daily Usage
1. User opens app - cat shows brief alert state
2. Cat returns to idle ambient animations
3. User can interact with wellness features
4. Cat responds to activities with content state
5. Cat may enter withdrawn state during long breaks

### Stressful Periods
1. Cat may spend more time in withdrawn state
2. User can still access all features normally
3. Cat provides gentle visual reminder to practice self-care
4. No pressure or guilt - just supportive presence

## Accessibility Considerations
- Cat is decorative - all functionality works without it
- Animations can be disabled in settings
- High contrast mode available
- Screen reader friendly (cat marked as decorative element)

## Success Metrics
- User reports feeling calmer when using app
- Cat is seen as supportive rather than demanding
- Users appreciate the non-intrusive nature
- Increased engagement with wellness features
- Positive emotional association with the app