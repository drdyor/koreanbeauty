import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Shield, Heart, Zap, Play, Pause, RotateCcw } from 'lucide-react';
import { NERVOUS_SYSTEM_STATES } from '../types.js';

/**
 * Polyvagal Theory Exercises component
 * Based on Stephen Porges' Polyvagal Theory for nervous system regulation
 */
export default function PolyvagalExercises({ userProfile, addSessionToHistory, updateProfile }) {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentState, setCurrentState] = useState(userProfile.currentNervousSystemState || NERVOUS_SYSTEM_STATES.VENTRAL_VAGAL);

  const nervousSystemStates = {
    [NERVOUS_SYSTEM_STATES.VENTRAL_VAGAL]: {
      name: 'Ventral Vagal',
      description: 'Safe & Social - Calm, connected, and engaged',
      color: 'text-green-600',
      icon: Shield,
      characteristics: ['Calm', 'Connected', 'Curious', 'Compassionate']
    },
    [NERVOUS_SYSTEM_STATES.SYMPATHETIC]: {
      name: 'Sympathetic',
      description: 'Fight/Flight - Mobilized and alert',
      color: 'text-yellow-600',
      icon: Zap,
      characteristics: ['Alert', 'Energized', 'Anxious', 'Reactive']
    },
    [NERVOUS_SYSTEM_STATES.DORSAL_VAGAL]: {
      name: 'Dorsal Vagal',
      description: 'Freeze/Shutdown - Withdrawn and collapsed',
      color: 'text-red-600',
      icon: Heart,
      characteristics: ['Withdrawn', 'Numb', 'Disconnected', 'Exhausted']
    }
  };

  const exercises = [
    {
      id: 'vagal_toning',
      name: 'Vagal Toning',
      description: 'Humming and vocal exercises to stimulate the vagus nerve',
      duration: 8,
      targetState: NERVOUS_SYSTEM_STATES.VENTRAL_VAGAL,
      steps: [
        'Sit comfortably with your spine straight',
        'Take a deep breath in through your nose',
        'As you exhale, make a long "Ahhhh" sound',
        'Feel the vibration in your chest and throat',
        'Take another breath and try humming "Mmmmm"',
        'Continue with "Ohhhh" sounds',
        'Try "Voooo" sounds, feeling the vibration',
        'Experiment with different tones and pitches',
        'Notice how the vibrations feel in your body',
        'End with three natural breaths'
      ]
    },
    {
      id: 'orienting',
      name: 'Orienting Exercise',
      description: 'Slow environmental scanning to signal safety',
      duration: 6,
      targetState: NERVOUS_SYSTEM_STATES.VENTRAL_VAGAL,
      steps: [
        'Sit or stand comfortably in your space',
        'Very slowly turn your head to the right',
        'Notice what you see without judgment',
        'Slowly turn your head to the left',
        'Look up toward the ceiling',
        'Look down toward the floor',
        'Return to center and look straight ahead',
        'Name 5 things you can see',
        'Name 4 sounds you can hear',
        'Name 3 things you can physically feel',
        'Take a deep breath and notice how you feel'
      ]
    },
    {
      id: 'social_connection',
      name: 'Social Connection Visualization',
      description: 'Imagining safe, supportive relationships',
      duration: 10,
      targetState: NERVOUS_SYSTEM_STATES.VENTRAL_VAGAL,
      steps: [
        'Close your eyes and breathe naturally',
        'Think of someone who makes you feel safe and accepted',
        'Visualize their face and warm expression',
        'Imagine having a pleasant conversation with them',
        'Feel their genuine interest and care for you',
        'Notice the warmth in your chest and heart area',
        'Imagine sharing a laugh together',
        'Feel the sense of belonging and connection',
        'Expand this feeling to include other supportive people',
        'Rest in this sense of social safety and connection',
        'Slowly open your eyes when ready'
      ]
    },
    {
      id: 'cold_water',
      name: 'Cold Water Face Immersion',
      description: 'Brief cold exposure to activate the vagus nerve',
      duration: 5,
      targetState: NERVOUS_SYSTEM_STATES.VENTRAL_VAGAL,
      steps: [
        'Fill a bowl with cold (not ice) water',
        'Take a few deep breaths to prepare',
        'Immerse your face from temples to chin for 15-30 seconds',
        'Or apply a cold, wet cloth to your face',
        'Breathe normally while the cold is applied',
        'Remove and breathe deeply',
        'Notice the shift in your nervous system',
        'Repeat 2-3 times if comfortable',
        'End with gentle, warm breaths',
        'Notice how your body feels now'
      ]
    },
    {
      id: 'breathing_regulation',
      name: 'Vagal Breathing',
      description: 'Specific breathing pattern to activate ventral vagal state',
      duration: 7,
      targetState: NERVOUS_SYSTEM_STATES.VENTRAL_VAGAL,
      steps: [
        'Sit comfortably with one hand on chest, one on belly',
        'Breathe in slowly through your nose for 4 counts',
        'Hold your breath gently for 4 counts',
        'Exhale slowly through your mouth for 6 counts',
        'Make your exhale longer than your inhale',
        'Continue this 4-4-6 pattern',
        'Focus on making the exhale smooth and controlled',
        'Notice your heart rate slowing',
        'Continue for several more cycles',
        'Return to natural breathing'
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
      type: 'polyvagal_exercise',
      exercise: currentExercise.name,
      duration: Math.round((progress / 100) * currentExercise.duration),
      startState: userProfile.currentNervousSystemState,
      endState: currentState,
      targetState: currentExercise.targetState
    };
    
    addSessionToHistory(session);
    updateProfile({ currentNervousSystemState: currentState });
    setCurrentExercise(null);
    setProgress(0);
  };

  const getCurrentStep = () => {
    if (!currentExercise) return null;
    const stepIndex = Math.floor((progress / 100) * currentExercise.steps.length);
    return currentExercise.steps[Math.min(stepIndex, currentExercise.steps.length - 1)];
  };

  const renderStateIndicator = () => {
    const state = nervousSystemStates[currentState];
    const StateIcon = state.icon;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <StateIcon className={`h-5 w-5 ${state.color}`} />
            <span>Current Nervous System State</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-semibold ${state.color}`}>{state.name}</h3>
              <p className="text-sm text-muted-foreground">{state.description}</p>
            </div>
            <div className="flex space-x-2">
              {Object.entries(NERVOUS_SYSTEM_STATES).map(([key, value]) => (
                <Button
                  key={key}
                  variant={currentState === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentState(value)}
                >
                  {nervousSystemStates[value].name.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.characteristics.map(char => (
              <Badge key={char} variant="outline">{char}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderExerciseSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {exercises.map(exercise => {
        const targetState = nervousSystemStates[exercise.targetState];
        const TargetIcon = targetState.icon;
        
        return (
          <Card key={exercise.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TargetIcon className={`h-5 w-5 ${targetState.color}`} />
                <span>{exercise.name}</span>
              </CardTitle>
              <CardDescription>{exercise.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{exercise.duration} min</Badge>
                  <Badge variant="secondary" className={targetState.color}>
                    → {targetState.name}
                  </Badge>
                </div>
                <Button onClick={() => startExercise(exercise)}>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderActiveExercise = () => {
    const targetState = nervousSystemStates[currentExercise.targetState];
    const TargetIcon = targetState.icon;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TargetIcon className={`h-5 w-5 ${targetState.color}`} />
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

            <div>
              <label className="text-sm font-medium">How does your nervous system feel now?</label>
              <div className="flex space-x-2 mt-2">
                {Object.entries(NERVOUS_SYSTEM_STATES).map(([key, value]) => (
                  <Button
                    key={key}
                    variant={currentState === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentState(value)}
                  >
                    {nervousSystemStates[value].name.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Polyvagal Theory Exercises</CardTitle>
          <CardDescription>
            Exercises based on Stephen Porges' Polyvagal Theory to help regulate your nervous system 
            and cultivate a sense of safety and social connection.
          </CardDescription>
        </CardHeader>
      </Card>

      {renderStateIndicator()}
      {!currentExercise ? renderExerciseSelection() : renderActiveExercise()}
    </div>
  );
}

