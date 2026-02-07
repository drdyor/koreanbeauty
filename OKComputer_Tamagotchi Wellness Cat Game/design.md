# Glowchi - Visual Design Guidelines

## Design Philosophy

### Core Principles
- **Calm Minimalism**: Reduce visual noise to promote mental clarity
- **Gentle Presence**: Soft, rounded forms that feel safe and approachable
- **Mindful Color**: Carefully chosen palette that supports emotional regulation
- **Breathing Space**: Generous whitespace that allows the mind to rest

### Visual Language
- **Organic Shapes**: All elements use natural, curved forms
- **Subtle Transitions**: Gentle animations that never startle or distract
- **Purposeful Simplicity**: Every element serves a clear function
- **Emotional Resonance**: Design that connects with users on a feeling level

## Color Palette

### Primary Colors
- **Background**: `#F8F9FA` (Soft warm gray - creates calm foundation)
- **Primary**: `#A8DADC` (Muted blue-teal - promotes tranquility)
- **Secondary**: `#E0E1DD` (Warm neutral - gentle contrast)
- **Accent**: `#D6E2E9` (Cool blue - restful state)

### State Colors
- **Idle**: Base palette with subtle breathing animation
- **Alert**: Slightly brighter primary (`#B8E4E6`)
- **Content**: Warmer accent (`#E8F2F5`)
- **Withdrawn**: Desaturated primary (`#98CACC`)

### Text Colors
- **Primary Text**: `#2D3748` (Dark gray - readable but not harsh)
- **Secondary Text**: `#718096` (Medium gray - subtle information)
- **Disabled Text**: `#A0AEC0` (Light gray - non-intrusive)

## Typography

### Font Pairing
- **Display Font**: "Inter" - Clean, friendly, highly readable
- **Body Font**: "Inter" - Consistent, accessible, modern
- **Accent Font**: "Inter" - Unified typography system

### Font Sizing
- **Large Heading**: 28px (700 weight)
- **Medium Heading**: 20px (600 weight)
- **Body Text**: 16px (400 weight)
- **Small Text**: 14px (400 weight)
- **Caption**: 12px (400 weight)

### Text Treatment
- Generous line height (1.6) for readability
- Soft, muted colors to reduce eye strain
- Adequate contrast ratios for accessibility
- No all-caps text (feels aggressive)

## Visual Effects

### Used Libraries
- **Anime.js**: Smooth, organic animations
- **CSS Custom Properties**: Dynamic theming
- **Intersection Observer**: Scroll-triggered animations
- **RequestAnimationFrame**: Performance-optimized motion

### Animation Principles
- **Easing**: Custom cubic-bezier curves for natural motion
- **Duration**: 300-800ms for most transitions
- **Stagger**: Subtle delays between related elements
- **Breathing**: Continuous, gentle ambient animations

### Effect Types
- **Color Breathing**: Gentle hue shifts for emotional states
- **Soft Shadows**: Dynamic depth that responds to interaction
- **Particle Systems**: Subtle floating elements for ambiance
- **Blur Transitions**: Smooth focus changes between states

## Layout System

### Grid Structure
- **Container**: Max-width 1200px, centered
- **Columns**: Flexible CSS Grid with 24px gutters
- **Breakpoints**: Mobile-first responsive design
- **Spacing**: 8px base unit for consistent rhythm

### Component Spacing
- **Section Padding**: 48px vertical, 24px horizontal
- **Element Margins**: 16px between related elements
- **Card Padding**: 24px all sides
- **Button Padding**: 12px vertical, 24px horizontal

## Interactive Elements

### Button Styles
- **Primary**: Rounded corners (12px), soft shadows
- **Secondary**: Outlined style with hover fill
- **Ghost**: Text-only with subtle hover background
- **Disabled**: Reduced opacity, no pointer events

### Form Elements
- **Input Fields**: Soft borders, focus states with color shifts
- **Checkboxes**: Custom rounded squares with smooth check animation
- **Sliders**: Organic, pill-shaped handles with track gradients

### Hover Effects
- **Buttons**: Gentle scale (1.02x) with shadow increase
- **Cards**: Subtle lift with enhanced shadow
- **Images**: Soft zoom (1.05x) with overlay fade-in
- **Links**: Underline animation from left to right

## Cat Character Design

### Visual Specifications
- **Style**: Minimalist vector illustration
- **Proportions**: Large head (1.5x body size), small features
- **Lines**: Rounded, no sharp corners (minimum 8px radius)
- **Colors**: Soft pastels with low saturation
- **Expressions**: Subtle, emotionally neutral

### Animation Details
- **Breathing**: 4-second cycle, scaleY 1.0 to 1.02
- **Blinking**: 150ms duration, random intervals
- **Tail Sway**: ±2° rotation, 3-second cycle
- **Ear Twitch**: 3° rotation, occasional trigger

### State Variations
- **Idle**: Sitting upright, relaxed posture
- **Alert**: Slight forward lean, perked ears
- **Content**: Eyes half-closed, peaceful expression
- **Withdrawn**: Curled position, minimal movement

## Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile Optimizations
- Larger touch targets (44px minimum)
- Simplified navigation
- Reduced animation complexity
- Optimized image sizes

### Performance Considerations
- SVG graphics for scalability
- CSS animations over JavaScript
- Lazy loading for non-critical elements
- Optimized asset delivery

## Accessibility Standards

### Color Contrast
- **Normal Text**: Minimum 4.5:1 ratio
- **Large Text**: Minimum 3:1 ratio
- **Interactive Elements**: Clear visual focus indicators

### Motion Sensitivity
- Respect `prefers-reduced-motion` settings
- Provide animation toggle in settings
- Avoid flashing or strobing effects

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for interactive elements
- Cat character marked as decorative
- Clear heading hierarchy

## Brand Personality

### Emotional Tone
- **Calm**: Everything feels peaceful and centered
- **Supportive**: Always there, never demanding
- **Gentle**: Soft interactions, kind feedback
- **Mindful**: Present-focused, not rushed

### Visual Metaphors
- **Breathing**: Expansion and contraction animations
- **Growth**: Gentle upward movement over time
- **Flow**: Organic, curved motion paths
- **Presence**: Subtle but consistent visual attention

## Implementation Notes

### CSS Custom Properties
```css
:root {
  --color-primary: #A8DADC;
  --color-background: #F8F9FA;
  --color-text: #2D3748;
  --border-radius: 12px;
  --shadow-soft: 0 4px 12px rgba(0,0,0,0.1);
  --animation-breathe: breathe 4s ease-in-out infinite;
}
```

### Animation Keyframes
```css
@keyframes breathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.02); }
}

@keyframes blink {
  0%, 90%, 100% { opacity: 1; }
  95% { opacity: 0.1; }
}
```

### Performance Targets
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- First Input Delay: <100ms

This design system creates a cohesive, calming experience that supports the wellness goals of your application while maintaining high standards of usability and accessibility.