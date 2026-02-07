import { useState } from "react";
import { CameraCapture } from "./components/AIAnalyzer/CameraCapture";
import { SkinAnalysisCard } from "./components/AIAnalyzer/SkinAnalysisCard";
import { AdaptiveQuiz } from "./components/AIAnalyzer/AdaptiveQuiz";
import { DailyCheckIn } from "./components/Routine/DailyCheckIn";
import { DynamicTimeline } from "./components/Routine/DynamicTimeline";
import { GlowStoryPlayer } from "./components/GlowJourney/GlowStoryPlayer";
import { MilestoneBadge } from "./components/GlowJourney/MilestoneBadge";
import { DynamicSkincarePet } from "./components/Pet/DynamicSkincarePet";
import { TriggerTracker } from "./components/Trackers/TriggerTracker";
import { TriggerFood } from "./components/Pet/TriggerFood";
import { ProcedureTracker } from "./components/Procedures";
import { saveToStorage, loadFromStorage } from "./utils/storage";
import { Calendar, Camera, TrendingUp, Sparkles, Award } from "lucide-react";

// Mock data
const mockRoutineSteps = [
  {
    id: "1",
    title: "Gentle Cleanser",
    description: "Remove impurities without stripping natural oils",
    time: "morning",
    glowState: "optimal",
    product: {
      name: "HydraGlow Cleanser",
      description: "pH-balanced formula with hyaluronic acid"
    }
  },
  {
    id: "2",
    title: "Vitamin C Serum",
    description: "Brighten and protect against environmental damage",
    time: "morning",
    glowState: "recovering",
    product: {
      name: "Radiance Boost Serum",
      description: "15% vitamin C with ferulic acid"
    }
  },
  {
    id: "3",
    title: "Hydrating Moisturizer",
    description: "Lock in moisture for 24-hour hydration",
    time: "evening",
    glowState: "optimal",
    product: {
      name: "Deep Moisture Cream",
      description: "Ceramides and squalane for barrier repair"
    }
  }
];

const mockMilestones = [
  {
    id: "1",
    title: "First Analysis",
    description: "Completed your initial skin assessment",
    achieved: true,
    date: "May 15, 2023"
  },
  {
    id: "2",
    title: "7 Days Consistent",
    description: "Used your routine for a full week",
    achieved: true,
    date: "May 22, 2023"
  },
  {
    id: "3",
    title: "Glow Improver",
    description: "Improved your skin score by 15 points",
    achieved: false
  },
  {
    id: "4",
    title: "Routine Master",
    description: "Completed 30 days without missing a step",
    achieved: false
  }
];

function App() {
  const [currentView, setCurrentView] = useState<'camera' | 'analysis' | 'quiz' | 'routine' | 'journey' | 'trackers' | 'procedures'>('procedures');
  const [showChronicPet, setShowChronicPet] = useState(false); // Toggle for pet motivation feature
  const [skinData, setSkinData] = useState({
    score: 0,
    concerns: [] as string[],
    skinType: 'combination',
    condition: 'balanced' as 'acne-prone' | 'sensitive' | 'aging' | 'balanced'
  });
  const [lastInteraction, setLastInteraction] = useState<Date | null>(() => {
    const saved = loadFromStorage('lastInteraction');
    return saved ? new Date(saved) : null;
  });
  const [triggerLogs, setTriggerLogs] = useState<any[]>(() => {
    const saved = loadFromStorage('triggerLogs');
    return saved ? JSON.parse(saved) : [];
  });

  const handleCapture = (imageData: string) => {
    // In a real app, this would process the image with AI
    // For demo, we'll simulate analysis results
    setTimeout(() => {
      const score = Math.floor(Math.random() * 30) + 50; // Random score between 50-80
      const concerns = ['Dryness', 'Uneven Texture', 'Dullness'];
      
      // Determine skin condition based on concerns
      let condition: 'acne-prone' | 'sensitive' | 'aging' | 'balanced' = 'balanced';
      if (concerns.includes('Breakouts') || concerns.includes('Acne')) {
        condition = 'acne-prone';
      } else if (concerns.includes('Redness') || concerns.includes('Sensitivity')) {
        condition = 'sensitive';
      } else if (concerns.includes('Fine Lines') || concerns.includes('Wrinkles')) {
        condition = 'aging';
      }
      
      setSkinData({
        score,
        concerns,
        skinType: 'combination',
        condition
      });
      setCurrentView('analysis');
    }, 1500);
  };

  const handleQuizComplete = (answers: Record<string, string>) => {
    // In a real app, this would process answers with AI
    // For demo, we'll simulate analysis results
    const score = Math.floor(Math.random() * 30) + 50;
    const concerns = ['Dryness', 'Uneven Texture', 'Dullness'];
    
    // Determine skin condition based on answers
    let condition: 'acne-prone' | 'sensitive' | 'aging' | 'balanced' = 'balanced';
    if (answers['breakouts'] === 'yes' || answers['acne'] === 'yes') {
      condition = 'acne-prone';
    } else if (answers['redness'] === 'yes' || answers['sensitivity'] === 'yes') {
      condition = 'sensitive';
    } else if (answers['wrinkles'] === 'yes' || answers['aging'] === 'yes') {
      condition = 'aging';
    }
    
    setSkinData({
      score,
      concerns,
      skinType: 'combination',
      condition
    });
    setCurrentView('routine');
  };

  const handleCheckInSubmit = (data: any) => {
    // Process check-in data
    const now = new Date();
    setLastInteraction(now);
    saveToStorage('lastInteraction', now.toISOString());
    setCurrentView('routine');
  };

  const handlePetInteraction = () => {
    const now = new Date();
    setLastInteraction(now);
    saveToStorage('lastInteraction', now.toISOString());
    setCurrentView('routine');
  };

  const handleTriggerLog = (data: any) => {
    const newLogs = [...triggerLogs, data];
    setTriggerLogs(newLogs);
    saveToStorage('triggerLogs', JSON.stringify(newLogs));
    
    // Show confirmation
    alert("Triggers logged successfully!");
    setCurrentView('routine');
  };

  const handleFoodTrigger = (foodName: string) => {
    const newLog = {
      date: new Date().toISOString(),
      foodTriggers: [foodName],
      notes: `Potential trigger: ${foodName}`
    };
    
    const newLogs = [...triggerLogs, newLog];
    setTriggerLogs(newLogs);
    saveToStorage('triggerLogs', JSON.stringify(newLogs));
    
    // Show confirmation
    alert(`${foodName} logged as potential trigger!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-rose-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent mb-2">
            GlowGuide 2.0
          </h1>
          <p className="text-gray-600">Your AI-powered skin companion</p>
        </header>

        <main>
          {currentView === 'camera' && (
            <div className="space-y-8">
              <CameraCapture onCapture={handleCapture} />
              <div className="text-center">
                <button 
                  onClick={() => setCurrentView('quiz')}
                  className="text-purple-600 font-medium"
                >
                  Skip camera and answer questions
                </button>
              </div>
            </div>
          )}

          {currentView === 'analysis' && (
            <div className="space-y-8">
              <SkinAnalysisCard 
                score={skinData.score}
                concerns={skinData.concerns}
                skinType={skinData.skinType}
                onContinue={() => setCurrentView('routine')}
              />
            </div>
          )}

          {currentView === 'quiz' && (
            <div className="space-y-8">
              <AdaptiveQuiz onComplete={handleQuizComplete} />
            </div>
          )}

          {currentView === 'routine' && (
            <div className="space-y-8">
              <DailyCheckIn onSubmit={handleCheckInSubmit} />
              <DynamicTimeline steps={mockRoutineSteps} />
              <TriggerTracker onLog={handleTriggerLog} />
            </div>
          )}

          {currentView === 'trackers' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">
                Your Trigger Logs
              </h2>
              <div className="space-y-4">
                {triggerLogs.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-purple-300" />
                    <p>No trigger logs yet. Start tracking to see patterns!</p>
                  </div>
                ) : (
                  triggerLogs.map((log, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-purple-800">
                            {new Date(log.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {log.foodTriggers && log.foodTriggers.length > 0 && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Food
                            </span>
                          )}
                          {log.stressLevel && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              Stress
                            </span>
                          )}
                          {log.cycleDay && (
                            <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                              Cycle
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        {log.foodTriggers && log.foodTriggers.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600">Food Triggers:</p>
                            <p className="font-medium">{log.foodTriggers.join(", ")}</p>
                          </div>
                        )}
                        
                        {log.stressLevel && (
                          <div>
                            <p className="text-sm text-gray-600">Stress Level:</p>
                            <p className="font-medium">
                              {["Very Low", "Low", "Moderate", "High", "Very High"][log.stressLevel - 1]}
                            </p>
                          </div>
                        )}
                        
                        {log.cycleDay && (
                          <div>
                            <p className="text-sm text-gray-600">Cycle Day:</p>
                            <p className="font-medium">Day {log.cycleDay}</p>
                          </div>
                        )}
                        
                        {log.notes && (
                          <div>
                            <p className="text-sm text-gray-600">Notes:</p>
                            <p className="font-medium">{log.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {currentView === 'journey' && (
            <div className="space-y-8">
              <GlowStoryPlayer />
              <div>
                <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">
                  Your Milestones
                </h2>
                <div className="space-y-4">
                  {mockMilestones.map(milestone => (
                    <MilestoneBadge key={milestone.id} {...milestone} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'procedures' && (
            <ProcedureTracker />
          )}
        </main>

        <nav className="fixed bottom-20 left-0 right-0 flex justify-center">
          <div className="flex bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-purple-100">
            <button
              onClick={() => setCurrentView('procedures')}
              className={`px-4 py-3 rounded-full text-sm font-medium flex items-center gap-1 ${currentView === 'procedures' ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white' : 'text-gray-600'}`}
            >
              <TrendingUp className="w-4 h-4" />
              Progress
            </button>
            <button
              onClick={() => setCurrentView('camera')}
              className={`px-4 py-3 rounded-full text-sm font-medium flex items-center gap-1 ${currentView === 'camera' || currentView === 'analysis' || currentView === 'quiz' ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white' : 'text-gray-600'}`}
            >
              <Camera className="w-4 h-4" />
              Analyze
            </button>
            <button
              onClick={() => setCurrentView('routine')}
              className={`px-4 py-3 rounded-full text-sm font-medium flex items-center gap-1 ${currentView === 'routine' ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white' : 'text-gray-600'}`}
            >
              <Sparkles className="w-4 h-4" />
              Routine
            </button>
            <button
              onClick={() => setCurrentView('journey')}
              className={`px-4 py-3 rounded-full text-sm font-medium flex items-center gap-1 ${currentView === 'journey' ? 'bg-gradient-to-r from-purple-500 to-rose-500 text-white' : 'text-gray-600'}`}
            >
              <Award className="w-4 h-4" />
              Journey
            </button>
          </div>
        </nav>
      </div>
      
      {/* Pet for chronic condition tracking - hidden by default */}
      {showChronicPet && (
        <>
          <DynamicSkincarePet
            onInteract={handlePetInteraction}
            skinCondition={skinData.condition}
            lastInteraction={lastInteraction || undefined}
          />
          <TriggerFood onTriggerLog={handleFoodTrigger} />
        </>
      )}
    </div>
  );
}

export default App;