import { Button } from '@/components/ui/button.jsx';
import { Moon, Sun } from 'lucide-react';
import { MODES } from '../types.js';

/**
 * Component for toggling between Wake and Sleep modes
 * @param {object} props - Component props
 * @param {string} props.mode - Current mode (wake/sleep)
 * @param {function} props.toggleMode - Function to toggle mode
 * @param {boolean} props.disabled - Whether the toggle is disabled
 */
export default function ModeToggle({ mode, toggleMode, disabled = false }) {
  const isWakeMode = mode === MODES.WAKE;
  
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4 bg-card p-2 rounded-lg border">
        <div className="flex items-center space-x-2">
          <Sun className={`h-5 w-5 ${isWakeMode ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`text-sm font-medium ${isWakeMode ? 'text-primary' : 'text-muted-foreground'}`}>
            Wake Mode
          </span>
        </div>
        
        <Button
          onClick={toggleMode}
          disabled={disabled}
          variant={isWakeMode ? "default" : "secondary"}
          size="sm"
          className="relative"
        >
          <div className="flex items-center space-x-2">
            <span>Switch to</span>
            {isWakeMode ? (
              <>
                <Moon className="h-4 w-4" />
                <span>Sleep Mode</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <span>Wake Mode</span>
              </>
            )}
          </div>
        </Button>
        
        <div className="flex items-center space-x-2">
          <Moon className={`h-5 w-5 ${!isWakeMode ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`text-sm font-medium ${!isWakeMode ? 'text-primary' : 'text-muted-foreground'}`}>
            Sleep Mode
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Mode description component to explain the current mode
 */
export function ModeDescription({ mode }) {
  const descriptions = {
    [MODES.WAKE]: {
      title: "Wake Mode - Conscious Behavioral Rewiring",
      description: "Engage in conscious exercises to identify and rewire fear-based patterns through guided meditation, journaling, and therapeutic techniques.",
      features: [
        "Fear pattern identification",
        "Somatic experiencing exercises",
        "Polyvagal theory practices",
        "Internal Family Systems journaling",
        "CBT exercises",
        "Cartesian philosophical reflection"
      ]
    },
    [MODES.SLEEP]: {
      title: "Sleep Mode - Subconscious Programming",
      description: "Utilize subliminal audio programming and frequency therapy to rewire patterns at the subconscious level during rest or meditation.",
      features: [
        "Subliminal affirmations",
        "Delta wave entrainment (0.5-4 Hz)",
        "Theta programming (4-8 Hz)",
        "Binaural beats",
        "Rife frequencies",
        "Personalized audio based on identified patterns"
      ]
    }
  };

  const currentMode = descriptions[mode];

  return (
    <div className="bg-card p-6 rounded-lg border mb-6">
      <h2 className="text-xl font-semibold mb-3">{currentMode.title}</h2>
      <p className="text-muted-foreground mb-4">{currentMode.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {currentMode.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

