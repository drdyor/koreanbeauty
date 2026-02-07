import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Brain, Heart, Eye, MessageSquare, BookOpen, Lightbulb } from 'lucide-react';
import FearPatternForm from './FearPatternForm.jsx';
import SomaticExperiencing from './SomaticExperiencing.jsx';
import PolyvagalExercises from './PolyvagalExercises.jsx';
import IFSJournaling from './IFSJournaling.jsx';
import MediaPipeMonitor from './MediaPipeMonitor.jsx';
import apiService, { mockData } from '../services/api';

/**
 * Enhanced Wake Mode component with backend API integration
 * Conscious behavioral rewiring through interactive therapeutic modules
 */
export default function EnhancedWakeMode({ userProfile, updateProfile, addSessionToHistory }) {
  const [activeModule, setActiveModule] = useState('fear_analysis');
  const [sessionData, setSessionData] = useState({});
  const [therapeuticContent, setTherapeuticContent] = useState([]);
  const [cbtExercises, setCbtExercises] = useState([]);
  const [cartesianReflections, setCartesianReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [safetyMonitoring, setSafetyMonitoring] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadTherapeuticData();
  }, []);

  const loadTherapeuticData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load therapeutic content
      let content;
      try {
        const response = await apiService.getTherapeuticContent({
          content_type: 'exercise,meditation'
        });
        content = response.content || response;
      } catch (apiError) {
        console.warn('API unavailable, using mock data:', apiError);
        content = mockData.therapeuticContent.filter(item => 
          ['exercise', 'meditation'].includes(item.content_type)
        );
      }
      setTherapeuticContent(content);

      // Load user's CBT exercises and Cartesian reflections if available
      if (userProfile?.id) {
        try {
          const [cbtResponse, cartesianResponse] = await Promise.all([
            apiService.getCBTExercises(userProfile.id),
            apiService.getCartesianReflections(userProfile.id)
          ]);
          setCbtExercises(cbtResponse.exercises || []);
          setCartesianReflections(cartesianResponse.reflections || []);
        } catch (apiError) {
          console.warn('Failed to load user exercises:', apiError);
        }
      }

    } catch (err) {
      console.error('Error loading therapeutic data:', err);
      setError('Failed to load therapeutic content');
      // Use mock data as fallback
      setTherapeuticContent(mockData.therapeuticContent.filter(item => 
        ['exercise', 'meditation'].includes(item.content_type)
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleModuleComplete = async (moduleType, data) => {
    try {
      // Update session data
      setSessionData(prev => ({
        ...prev,
        [moduleType]: {
          ...data,
          completedAt: new Date().toISOString()
        }
      }));

      // Log session to backend
      try {
        await apiService.createSession({
          user_id: userProfile?.id || 1,
          session_type: 'wake_mode',
          module_used: moduleType,
          duration_minutes: data.duration || 10,
          completion_status: 'completed'
        });
      } catch (apiError) {
        console.warn('Failed to log session:', apiError);
      }

      // Add to local session history
      addSessionToHistory?.({
        type: 'wake_mode',
        module: moduleType,
        duration: data.duration || 10,
        completed: true,
        timestamp: new Date().toISOString(),
        data: data
      });

      // Update user profile if needed
      if (moduleType === 'fear_analysis' && data.fearPatterns) {
        updateProfile?.({
          fearPatterns: data.fearPatterns,
          lastAnalysisDate: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Error handling module completion:', error);
    }
  };

  const handleSafetyAlert = async (alertData) => {
    try {
      setSafetyMonitoring(false);
      
      // Log safety alert to backend
      try {
        await apiService.createSafetyAlert({
          user_id: userProfile?.id || 1,
          alert_type: alertData.type,
          severity_level: alertData.severity,
          details: alertData.details
        });
      } catch (apiError) {
        console.warn('Failed to log safety alert:', apiError);
      }

      // Show user-friendly alert
      alert(`Safety Alert: ${alertData.message}\n\nPlease take a moment to ground yourself. The session has been paused for your wellbeing.`);
      
      // Re-enable monitoring after a delay
      setTimeout(() => setSafetyMonitoring(true), 30000);
    } catch (error) {
      console.error('Error handling safety alert:', error);
    }
  };

  const saveCBTExercise = async (exerciseData) => {
    try {
      const response = await apiService.saveCBTExercise({
        user_id: userProfile?.id || 1,
        ...exerciseData
      });
      
      // Update local state
      setCbtExercises(prev => [...prev, response.exercise || exerciseData]);
      
      return response;
    } catch (error) {
      console.error('Error saving CBT exercise:', error);
      throw error;
    }
  };

  const saveCartesianReflection = async (reflectionData) => {
    try {
      const response = await apiService.saveCartesianReflection({
        user_id: userProfile?.id || 1,
        ...reflectionData
      });
      
      // Update local state
      setCartesianReflections(prev => [...prev, response.reflection || reflectionData]);
      
      return response;
    } catch (error) {
      console.error('Error saving Cartesian reflection:', error);
      throw error;
    }
  };

  const modules = [
    {
      id: 'fear_analysis',
      name: 'Fear Pattern Analysis',
      description: 'Identify and analyze your fear patterns using Chase Hughes\' methodology',
      icon: <Brain className="h-5 w-5" />,
      difficulty: 2,
      duration: '15-20 min',
      component: FearPatternForm
    },
    {
      id: 'somatic',
      name: 'Somatic Experiencing',
      description: 'Body-based healing and nervous system regulation',
      icon: <Heart className="h-5 w-5" />,
      difficulty: 2,
      duration: '10-15 min',
      component: SomaticExperiencing
    },
    {
      id: 'polyvagal',
      name: 'Polyvagal Exercises',
      description: 'Nervous system safety and social connection activation',
      icon: <Eye className="h-5 w-5" />,
      difficulty: 2,
      duration: '10-15 min',
      component: PolyvagalExercises
    },
    {
      id: 'ifs',
      name: 'IFS Journaling',
      description: 'Internal Family Systems parts work and integration',
      icon: <MessageSquare className="h-5 w-5" />,
      difficulty: 3,
      duration: '20-30 min',
      component: IFSJournaling
    },
    {
      id: 'cbt',
      name: 'CBT Thought Records',
      description: 'Cognitive Behavioral Therapy for authority-related thoughts',
      icon: <BookOpen className="h-5 w-5" />,
      difficulty: 3,
      duration: '15-25 min',
      component: CBTModule
    },
    {
      id: 'cartesian',
      name: 'Cartesian Reflection',
      description: 'Philosophical inquiry using Descartes\' method of doubt',
      icon: <Lightbulb className="h-5 w-5" />,
      difficulty: 4,
      duration: '20-30 min',
      component: CartesianModule
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Loading Wake Mode...</h2>
          <p className="text-gray-600">Preparing your therapeutic modules</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-2xl font-bold mb-2">Wake Mode</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadTherapeuticData} variant="outline">
            Retry Loading Content
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold mb-2">Wake Mode</h2>
        <p className="text-gray-600">
          Conscious behavioral rewiring through interactive therapeutic modules
        </p>
      </div>

      {/* Safety Monitoring */}
      {safetyMonitoring && (
        <MediaPipeMonitor
          onAlert={handleSafetyAlert}
          isActive={true}
          sensitivity="medium"
        />
      )}

      {/* Module Selection */}
      <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {modules.map((module) => (
            <TabsTrigger key={module.id} value={module.id} className="text-xs">
              {module.icon}
              <span className="hidden sm:inline ml-1">{module.name.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {modules.map((module) => (
          <TabsContent key={module.id} value={module.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {module.icon}
                    {module.name}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{module.duration}</Badge>
                    <Badge variant={module.difficulty <= 2 ? "default" : module.difficulty === 3 ? "secondary" : "destructive"}>
                      Level {module.difficulty}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Render the appropriate module component */}
                {module.id === 'fear_analysis' && (
                  <FearPatternForm
                    userProfile={userProfile}
                    onComplete={(data) => handleModuleComplete('fear_analysis', data)}
                  />
                )}
                {module.id === 'somatic' && (
                  <SomaticExperiencing
                    userProfile={userProfile}
                    onComplete={(data) => handleModuleComplete('somatic', data)}
                    therapeuticContent={therapeuticContent.filter(c => c.category === 'somatic')}
                  />
                )}
                {module.id === 'polyvagal' && (
                  <PolyvagalExercises
                    userProfile={userProfile}
                    onComplete={(data) => handleModuleComplete('polyvagal', data)}
                    therapeuticContent={therapeuticContent.filter(c => c.category === 'polyvagal')}
                  />
                )}
                {module.id === 'ifs' && (
                  <IFSJournaling
                    userProfile={userProfile}
                    onComplete={(data) => handleModuleComplete('ifs', data)}
                  />
                )}
                {module.id === 'cbt' && (
                  <CBTModule
                    userProfile={userProfile}
                    onComplete={(data) => handleModuleComplete('cbt', data)}
                    onSave={saveCBTExercise}
                    exercises={cbtExercises}
                    therapeuticContent={therapeuticContent.filter(c => c.category === 'cbt')}
                  />
                )}
                {module.id === 'cartesian' && (
                  <CartesianModule
                    userProfile={userProfile}
                    onComplete={(data) => handleModuleComplete('cartesian', data)}
                    onSave={saveCartesianReflection}
                    reflections={cartesianReflections}
                    therapeuticContent={therapeuticContent.filter(c => c.category === 'cartesian')}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Session Progress */}
      {Object.keys(sessionData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Session Progress</CardTitle>
            <CardDescription>Your progress in this wake mode session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(sessionData).map(([moduleType, data]) => (
                <div key={moduleType} className="flex items-center justify-between">
                  <span className="capitalize">{moduleType.replace('_', ' ')}</span>
                  <Badge variant="default">Completed</Badge>
                </div>
              ))}
            </div>
            <Progress 
              value={(Object.keys(sessionData).length / modules.length) * 100} 
              className="mt-4" 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// CBT Module Component
function CBTModule({ userProfile, onComplete, onSave, exercises, therapeuticContent }) {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [responses, setResponses] = useState({});

  const cbtContent = therapeuticContent.find(c => c.title.includes('Thought Record')) || {
    title: 'Authority Figure Thought Record',
    content: 'This exercise helps you identify and challenge negative thought patterns about authority figures...'
  };

  const startExercise = () => {
    setCurrentExercise({
      id: Date.now(),
      type: 'thought_record',
      title: cbtContent.title,
      startTime: new Date().toISOString()
    });
    setResponses({});
  };

  const saveResponse = (step, value) => {
    setResponses(prev => ({
      ...prev,
      [step]: value
    }));
  };

  const completeExercise = async () => {
    if (!currentExercise) return;

    const exerciseData = {
      ...currentExercise,
      responses,
      completedAt: new Date().toISOString(),
      duration: Math.round((new Date() - new Date(currentExercise.startTime)) / 60000)
    };

    try {
      await onSave(exerciseData);
      onComplete(exerciseData);
      setCurrentExercise(null);
      setResponses({});
    } catch (error) {
      console.error('Error completing CBT exercise:', error);
    }
  };

  if (!currentExercise) {
    return (
      <div className="space-y-4">
        <div className="prose max-w-none">
          <p>{cbtContent.content.substring(0, 200)}...</p>
        </div>
        <Button onClick={startExercise} className="w-full">
          Start CBT Thought Record
        </Button>
        {exercises.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Previous Exercises ({exercises.length})</h4>
            <div className="text-sm text-gray-600">
              You have completed {exercises.length} CBT exercises.
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Step-by-Step Thought Record</h4>
        <p className="text-sm text-gray-600">
          Work through each step to identify and challenge negative thought patterns.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-2">1. Describe the situation with an authority figure:</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={3}
            value={responses.situation || ''}
            onChange={(e) => saveResponse('situation', e.target.value)}
            placeholder="What happened? Who was involved? When and where?"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">2. What emotions did you feel? (Rate 1-10)</label>
          <div className="grid grid-cols-2 gap-4">
            {['Anxiety', 'Fear', 'Anger', 'Shame'].map(emotion => (
              <div key={emotion}>
                <label className="block text-sm mb-1">{emotion}:</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={responses[emotion.toLowerCase()] || 1}
                  onChange={(e) => saveResponse(emotion.toLowerCase(), e.target.value)}
                  className="w-full"
                />
                <span className="text-sm text-gray-600">{responses[emotion.toLowerCase()] || 1}/10</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">3. What thoughts went through your mind?</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={3}
            value={responses.thoughts || ''}
            onChange={(e) => saveResponse('thoughts', e.target.value)}
            placeholder="What were you thinking? What did you tell yourself?"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">4. What evidence supports these thoughts?</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={2}
            value={responses.supporting_evidence || ''}
            onChange={(e) => saveResponse('supporting_evidence', e.target.value)}
            placeholder="What facts support this thought?"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">5. What evidence contradicts these thoughts?</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={2}
            value={responses.contradicting_evidence || ''}
            onChange={(e) => saveResponse('contradicting_evidence', e.target.value)}
            placeholder="What facts contradict this thought?"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">6. More balanced thoughts:</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={3}
            value={responses.balanced_thoughts || ''}
            onChange={(e) => saveResponse('balanced_thoughts', e.target.value)}
            placeholder="What would be a more balanced, realistic way to think about this?"
          />
        </div>

        <Button 
          onClick={completeExercise} 
          className="w-full"
          disabled={!responses.situation || !responses.thoughts}
        >
          Complete Exercise
        </Button>
      </div>
    </div>
  );
}

// Cartesian Module Component
function CartesianModule({ userProfile, onComplete, onSave, reflections, therapeuticContent }) {
  const [currentReflection, setCurrentReflection] = useState(null);
  const [responses, setResponses] = useState({});

  const cartesianContent = therapeuticContent.find(c => c.title.includes('Cartesian')) || {
    title: 'Cartesian Doubt: Questioning Authority',
    content: 'This philosophical exercise uses Descartes\' method of systematic doubt to examine your beliefs about authority...'
  };

  const startReflection = () => {
    setCurrentReflection({
      id: Date.now(),
      type: 'authority_doubt',
      title: cartesianContent.title,
      startTime: new Date().toISOString()
    });
    setResponses({});
  };

  const saveResponse = (step, value) => {
    setResponses(prev => ({
      ...prev,
      [step]: value
    }));
  };

  const completeReflection = async () => {
    if (!currentReflection) return;

    const reflectionData = {
      ...currentReflection,
      responses,
      completedAt: new Date().toISOString(),
      duration: Math.round((new Date() - new Date(currentReflection.startTime)) / 60000)
    };

    try {
      await onSave(reflectionData);
      onComplete(reflectionData);
      setCurrentReflection(null);
      setResponses({});
    } catch (error) {
      console.error('Error completing Cartesian reflection:', error);
    }
  };

  if (!currentReflection) {
    return (
      <div className="space-y-4">
        <div className="prose max-w-none">
          <p>{cartesianContent.content.substring(0, 200)}...</p>
        </div>
        <Button onClick={startReflection} className="w-full">
          Start Cartesian Reflection
        </Button>
        {reflections.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Previous Reflections ({reflections.length})</h4>
            <div className="text-sm text-gray-600">
              You have completed {reflections.length} philosophical reflections.
            </div>
          </div>
        )}
      </div>
    );
  }

  const authorityBeliefs = [
    'Authority figures are always right',
    'I must always obey authority',
    'Authority figures are superior to me',
    'Questioning authority is dangerous',
    'I am less valuable than those in power'
  ];

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Cartesian Method of Doubt</h4>
        <p className="text-sm text-gray-600">
          "I think, therefore I am" - Let's examine your beliefs about authority through systematic doubt.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-2">1. Examine these beliefs about authority:</label>
          <div className="space-y-2">
            {authorityBeliefs.map((belief, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <p className="mb-2">"{belief}"</p>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`belief_${index}`}
                      value="can_doubt"
                      checked={responses[`belief_${index}`] === 'can_doubt'}
                      onChange={(e) => saveResponse(`belief_${index}`, e.target.value)}
                      className="mr-2"
                    />
                    Can doubt this
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={`belief_${index}`}
                      value="cannot_doubt"
                      checked={responses[`belief_${index}`] === 'cannot_doubt'}
                      onChange={(e) => saveResponse(`belief_${index}`, e.target.value)}
                      className="mr-2"
                    />
                    Cannot doubt this
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">2. What remains certain after doubting these beliefs?</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={4}
            value={responses.certainties || ''}
            onChange={(e) => saveResponse('certainties', e.target.value)}
            placeholder="What can you be absolutely certain of about yourself and your relationship to authority?"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">3. From these certainties, how might you relate to authority differently?</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={4}
            value={responses.new_relationship || ''}
            onChange={(e) => saveResponse('new_relationship', e.target.value)}
            placeholder="Based on what you're certain of, how could your relationship with authority change?"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">4. Final insight from this reflection:</label>
          <textarea
            className="w-full p-3 border rounded-lg"
            rows={3}
            value={responses.final_insight || ''}
            onChange={(e) => saveResponse('final_insight', e.target.value)}
            placeholder="What is your key insight from this philosophical inquiry?"
          />
        </div>

        <Button 
          onClick={completeReflection} 
          className="w-full"
          disabled={!responses.certainties || !responses.new_relationship}
        >
          Complete Reflection
        </Button>
      </div>
    </div>
  );
}

