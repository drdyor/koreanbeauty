import React from 'react';
import { 
  Heart, 
  Brain, 
  Shield, 
  Zap, 
  Moon, 
  Sun, 
  Waves, 
  TreePine, 
  Flower, 
  Compass,
  Eye,
  Lightbulb,
  Target,
  Anchor,
  Feather,
  Leaf,
  Star,
  Circle,
  Triangle,
  Square,
  Headphones,
  Activity,
  Music,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  Award,
  Gem,
  Sparkles
} from 'lucide-react';

// Enhanced therapeutic icon mapping with meaningful symbols
const THERAPEUTIC_ICONS = {
  // Core therapeutic concepts
  heart: Heart,
  brain: Brain,
  shield: Shield,
  energy: Zap,
  moon: Moon,
  sun: Sun,
  waves: Waves,
  tree: TreePine,
  flower: Flower,
  compass: Compass,
  eye: Eye,
  insight: Lightbulb,
  focus: Target,
  anchor: Anchor,
  freedom: Feather,
  growth: Leaf,
  guidance: Star,
  
  // Audio and frequency
  audio: Headphones,
  frequency: Activity,
  music: Music,
  sound: Volume2,
  play: Play,
  pause: Pause,
  reset: RotateCcw,
  
  // Status and feedback
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
  achievement: Award,
  precious: Gem,
  transformation: Sparkles,
  
  // Sacred geometry
  circle: Circle,
  triangle: Triangle,
  square: Square,
  
  // Therapeutic modalities
  somatic: Waves,
  polyvagal: Heart,
  ifs: Circle,
  cbt: Brain,
  cartesian: Eye,
  authority: Shield,
  sovereignty: Star,
  grounding: Anchor,
  breathing: Waves,
  meditation: Circle,
  healing: Flower,
  lightfrequency: Activity
};

// Enhanced therapeutic color themes using new design system
const THERAPEUTIC_THEMES = {
  primary: {
    background: 'var(--therapeutic-primary-600)',
    foreground: 'white',
    glow: 'var(--therapeutic-primary-200)',
    soft: 'var(--therapeutic-primary-50)'
  },
  secondary: {
    background: 'var(--therapeutic-secondary-600)',
    foreground: 'white',
    glow: 'var(--therapeutic-secondary-200)',
    soft: 'var(--therapeutic-secondary-50)'
  },
  accent: {
    background: 'var(--therapeutic-accent-500)',
    foreground: 'white',
    glow: 'var(--therapeutic-accent-200)',
    soft: 'var(--therapeutic-accent-50)'
  },
  neutral: {
    background: 'var(--therapeutic-neutral-600)',
    foreground: 'white',
    glow: 'var(--therapeutic-neutral-200)',
    soft: 'var(--therapeutic-neutral-50)'
  },
  calm: {
    background: 'var(--therapeutic-primary-500)',
    foreground: 'var(--therapeutic-primary-900)',
    glow: 'var(--therapeutic-primary-100)',
    soft: 'var(--therapeutic-primary-50)'
  },
  healing: {
    background: 'var(--therapeutic-secondary-500)',
    foreground: 'var(--therapeutic-secondary-900)',
    glow: 'var(--therapeutic-secondary-100)',
    soft: 'var(--therapeutic-secondary-50)'
  },
  wisdom: {
    background: 'var(--therapeutic-accent-500)',
    foreground: 'var(--therapeutic-accent-900)',
    glow: 'var(--therapeutic-accent-100)',
    soft: 'var(--therapeutic-accent-50)'
  },
  confidence: {
    background: 'var(--gradient-confidence)',
    foreground: 'white',
    glow: 'var(--therapeutic-accent-200)',
    soft: 'var(--therapeutic-accent-50)'
  }
};

/**
 * TherapeuticIcon - Enhanced icon component with therapeutic design
 */
const TherapeuticIcon = ({
  name = 'heart',
  size = 24,
  theme = 'primary',
  variant = 'default',
  animate = false,
  glow = false,
  className = '',
  style = {},
  ...props
}) => {
  const IconComponent = THERAPEUTIC_ICONS[name] || Heart;
  const themeColors = THERAPEUTIC_THEMES[theme] || THERAPEUTIC_THEMES.primary;
  
  const baseStyles = {
    width: size,
    height: size,
    transition: 'all var(--timing-therapeutic-normal) var(--ease-therapeutic-out)',
    ...style
  };
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          color: themeColors.foreground,
          backgroundColor: themeColors.background,
          borderRadius: 'var(--radius-therapeutic-md)',
          padding: size * 0.2,
          boxShadow: glow ? `var(--shadow-therapeutic-glow)` : 'var(--shadow-therapeutic-sm)'
        };
      
      case 'outlined':
        return {
          ...baseStyles,
          color: themeColors.background,
          border: `2px solid ${themeColors.background}`,
          borderRadius: 'var(--radius-therapeutic-md)',
          padding: size * 0.15,
          boxShadow: glow ? `0 0 15px ${themeColors.glow}` : 'none'
        };
      
      case 'soft':
        return {
          ...baseStyles,
          color: themeColors.background,
          backgroundColor: themeColors.soft,
          borderRadius: 'var(--radius-therapeutic-lg)',
          padding: size * 0.25,
          boxShadow: glow ? `var(--shadow-therapeutic-glow)` : 'var(--shadow-therapeutic-md)'
        };
      
      case 'minimal':
        return {
          ...baseStyles,
          color: themeColors.background,
          boxShadow: glow ? `0 0 10px ${themeColors.glow}` : 'none'
        };
      
      default:
        return {
          ...baseStyles,
          color: themeColors.background,
          boxShadow: glow ? `0 0 15px ${themeColors.glow}` : 'none'
        };
    }
  };
  
  const getAnimationClass = () => {
    if (!animate) return '';
    
    switch (animate) {
      case 'breathe':
        return 'therapeutic-pulse';
      case 'pulse':
        return 'therapeutic-pulse';
      case 'spin':
        return 'animate-spin';
      case 'bounce':
        return 'animate-bounce';
      case 'float':
        return 'therapeutic-fade-in';
      case 'glow':
        return 'therapeutic-glow';
      default:
        return 'therapeutic-pulse';
    }
  };
  
  const combinedClassName = [
    'therapeutic-icon',
    getAnimationClass(),
    className
  ].filter(Boolean).join(' ');
  
  return (
    <IconComponent
      className={combinedClassName}
      style={getVariantStyles()}
      {...props}
    />
  );
};

/**
 * TherapeuticIconGroup - Group of related therapeutic icons
 */
export const TherapeuticIconGroup = ({
  icons = [],
  size = 32,
  theme = 'primary',
  variant = 'soft',
  spacing = 'normal',
  alignment = 'center',
  className = ''
}) => {
  const getSpacingClass = () => {
    switch (spacing) {
      case 'tight':
        return 'gap-2';
      case 'normal':
        return 'gap-4';
      case 'loose':
        return 'gap-6';
      default:
        return 'gap-4';
    }
  };
  
  const getAlignmentClass = () => {
    switch (alignment) {
      case 'start':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'end':
        return 'justify-end';
      case 'between':
        return 'justify-between';
      case 'around':
        return 'justify-around';
      default:
        return 'justify-center';
    }
  };
  
  return (
    <div className={`flex items-center ${getSpacingClass()} ${getAlignmentClass()} ${className}`}>
      {icons.map((iconName, index) => (
        <TherapeuticIcon
          key={`${iconName}-${index}`}
          name={iconName}
          size={size}
          theme={theme}
          variant={variant}
          animate={index === 0 ? 'breathe' : false} // Animate first icon
        />
      ))}
    </div>
  );
};

/**
 * TherapeuticBadge - Icon with text label
 */
export const TherapeuticBadge = ({
  icon = 'heart',
  label = '',
  size = 'medium',
  theme = 'primary',
  variant = 'soft',
  className = ''
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { iconSize: 16, textSize: 'text-xs', padding: 'px-2 py-1' };
      case 'medium':
        return { iconSize: 20, textSize: 'text-sm', padding: 'px-3 py-2' };
      case 'large':
        return { iconSize: 24, textSize: 'text-base', padding: 'px-4 py-3' };
      default:
        return { iconSize: 20, textSize: 'text-sm', padding: 'px-3 py-2' };
    }
  };
  
  const { iconSize, textSize, padding } = getSizeConfig();
  const themeColors = THERAPEUTIC_THEMES[theme] || THERAPEUTIC_THEMES.primary;
  
  const badgeStyle = {
    backgroundColor: variant === 'filled' ? themeColors.background : themeColors.glow,
    color: variant === 'filled' ? themeColors.foreground : themeColors.background,
    border: variant === 'outlined' ? `2px solid ${themeColors.background}` : 'none'
  };
  
  return (
    <div 
      className={`inline-flex items-center gap-2 rounded-full ${padding} ${textSize} font-medium transition-all duration-200 hover:scale-105 ${className}`}
      style={badgeStyle}
    >
      <TherapeuticIcon
        name={icon}
        size={iconSize}
        theme={theme}
        variant="minimal"
      />
      {label && <span>{label}</span>}
    </div>
  );
};

/**
 * TherapeuticProgress - Circular progress with therapeutic icon
 */
export const TherapeuticProgress = ({
  icon = 'heart',
  progress = 0,
  size = 80,
  theme = 'primary',
  showPercentage = true,
  animate = true,
  className = ''
}) => {
  const themeColors = THERAPEUTIC_THEMES[theme] || THERAPEUTIC_THEMES.primary;
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke="var(--therapeutic-neutral-200)"
          strokeWidth="4"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 8}
          stroke={themeColors.background}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <TherapeuticIcon
          name={icon}
          size={size * 0.3}
          theme={theme}
          variant="minimal"
          animate={animate ? 'breathe' : false}
        />
        {showPercentage && (
          <span 
            className="text-xs font-semibold mt-1"
            style={{ color: themeColors.background }}
          >
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
};

// Export available icons for reference
export const AVAILABLE_ICONS = Object.keys(THERAPEUTIC_ICONS);
export const AVAILABLE_THEMES = Object.keys(THERAPEUTIC_THEMES);

export default TherapeuticIcon;

