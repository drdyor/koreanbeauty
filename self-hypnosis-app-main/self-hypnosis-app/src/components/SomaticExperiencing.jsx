import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Heart, Play, Pause, RotateCcw, Activity } from 'lucide-react';

/**
 * Somatic Experiencing component for body-based trauma healing
 * Implements Peter Levine's SE principles for nervous system regulation
 */
export default function SomaticExperiencing({ userProfile, addSessionToHistory }) {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sessionData, setSessionData] = useState({
    sensations: [],
    nervousSystemState: 'neutral',
    insights: ''
  });

  const exercises = [
    {
      id: 'body_scan',
      name: 'Body Scan with Sensation Tracking',
      description: 'Gentle awareness of bodily sensations without judgment',
      duration: 10,
      steps: [
        'Find a comfortable position and close your eyes',
        'Take three deep breaths to center yourself',
        'Start at the top of your head, notice any sensations',
        'Slowly move your attention down through your face',
        'Notice your neck and shoulders - any tension or warmth?',
        'Continue down your arms to your fingertips',
        'Bring attention to your chest and heart area',
        'Notice your stomach and abdomen',
        'Move down through your hips and pelvis',
        'Continue down your legs to your feet',
        'Take a moment to sense your whole body',
        'Notice what feels different from when you started'
      ]
    },
    {
      id: 'pendulation',
      name: 'Pendulation Exercise',
      description: 'Gentle movement between activation and calm states',
      duration: 8,
      steps: [
        'Identify a sensation of distress in your body',
        'Notice where you feel it - location, quality, intensity',
        'Now find a place in your body that feels neutral or pleasant',
        'Gently shift your attention to this resourced area',
        'Stay here for 30-60 seconds, breathing naturally',
        'Now gently return attention to the distressed area',
        'Notice if anything has changed',
        'Move back to the resourced area',
        'Continue this gentle pendulation',
        'Notice the natural rhythm of your nervous system',
        'End by resting in the resourced sensation'
      ]
    },
    {
      id: 'discharge',
      name: 'Gentle Discharge Exercise',
      description: 'Allow natural movements to release trapped energy',
      duration: 6,
      steps: [
        'Stand or sit comfortably with space to move',
        'Close your eyes and tune into your body',
        'Notice any impulses to move or stretch',
        'Allow small, gentle movements to emerge naturally',
        'This might be shaking, stretching, or swaying',
        'Follow your body\'s wisdom - no forcing',
        'If you feel overwhelmed, pause and breathe',
        'Continue for a few minutes',
        'Gradually slow down and come to stillness',
        'Notice how your body feels now'
      ]
    },
    {
      id: 'grounding',
      name: 'Grounding and Orientation',
      description: 'Connect with the present moment and environment',
      duration: 5,
      steps: [
        'Feel your feet on the ground or body in the chair',
        'Press gently into the surface supporting you',
        'Look around your environment slowly',
        'Name 5 things you can see',
        'Name 4 things you can hear',
        'Name 3 things you can touch',
        'Name 2 things you can smell',
        'Name 1 thing you can taste',
        'Take three deep breaths',
        'Notice how present and grounded you feel'
      ]
    }
  ];

  useEffect(() => {
    let interval;
    if (isActive && currentExercise) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (currentExercise.duration * 60));
          if (newProgress >= 100) {
            setIsActive(false);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentExercise]);

  const startExercise = (exercise) => {
    setCurrentExercise(exercise);
    setProgress(0);
    setIsActive(true);
  };

  const pauseExercise = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setProgress(0);
  };

  const completeSession = () => {
    const session = {
      type: 'somatic_experiencing',
      exercise: currentExercise.name,
      duration: Math.round((progress / 100) * currentExercise.duration),
      ...sessionData
    };
    
    addSessionToHistory(session);
    setCurrentExercise(null);
    setProgress(0);
    setSessionData({
      sensations: [],
      nervousSystemState: 'neutral',
      insights: ''
    });
  };

  const getCurrentStep = () => {
    if (!currentExercise) return null;
    const stepIndex = Math.floor((progress / 100) * currentExercise.steps.length);
    return currentExercise.steps[Math.min(stepIndex, currentExercise.steps.length - 1)];
  };

  const renderExerciseSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {exercises.map(exercise => (
        <Card key={exercise.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>{exercise.name}</span>
            </CardTitle>
            <CardDescription>{exercise.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{exercise.duration} minutes</Badge>
              <Button onClick={() => startExercise(exercise)}>
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderActiveExercise = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span>{currentExercise.name}</span>
        </CardTitle>
        <CardDescription>{currentExercise.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Current guidance:</p>
            <p className="text-sm">{getCurrentStep()}</p>
          </div>

          <div className="flex space-x-3">
            <Button onClick={pauseExercise} variant="outline">
              {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button onClick={resetExercise} variant="outline">
              <RotateCcw className="h-4 w-4" />
            </Button>
            {progress >= 100 && (
              <Button onClick={completeSession} className="flex-1">
                Complete Session
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">How is your nervous system feeling?</label>
              <div className="flex space-x-2 mt-2">
                {['activated', 'neutral', 'calm', 'grounded'].map(state => (
                  <Button
                    key={state}
                    variant={sessionData.nervousSystemState === state ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSessionData(prev => ({ ...prev, nervousSystemState: state }))}
                  >
                    {state}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Any insights or sensations to note?</label>
              <textarea
                className="w-full mt-2 p-2 border rounded text-sm"
                rows={3}
                placeholder="Optional: Note any sensations, emotions, or insights..."
                value={sessionData.insights}
                onChange={(e) => setSessionData(prev => ({ ...prev, insights: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Somatic Experiencing</CardTitle>
          <CardDescription>
            Body-based exercises to help regulate your nervous system and process stored trauma or stress.
            These practices are based on Peter Levine's Somatic Experiencing methodology.
          </CardDescription>
        </CardHeader>
      </Card>

      {!currentExercise ? renderExerciseSelection() : renderActiveExercise()}
    </div>
  );
}

