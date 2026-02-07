import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Brain, Activity, Shield, Users, BookOpen, Lightbulb, AlertTriangle } from 'lucide-react';

import FearPatternForm from './FearPatternForm.jsx';
import SomaticExperiencing from './SomaticExperiencing.jsx';
import PolyvagalExercises from './PolyvagalExercises.jsx';
import IFSJournaling from './IFSJournaling.jsx';
import MediaPipeMonitor from './MediaPipeMonitor.jsx';
import { THERAPY_MODULES } from '../types.js';
import { getFearPatternById } from '../utils/fearPatterns.js';

/**
 * Wake Mode component - Conscious behavioral rewiring
 * Integrates all therapeutic modules for active healing work with safety monitoring
 */
export default function WakeMode({ userProfile, userProfileActions }) {
  const [activeModule, setActiveModule] = useState(THERAPY_MODULES.FEAR_PATTERN_FORM);
  const [safetyMonitorActive, setSafetyMonitorActive] = useState(false);
  const [showSafetyVideo, setShowSafetyVideo] = useState(false);
  const [distressAlert, setDistressAlert] = useState(null);

  const modules = [
    {
      id: THERAPY_MODULES.FEAR_PATTERN_FORM,
      name: 'Fear Pattern Analysis',
      description: 'Identify fear patterns using Chase Hughes\' methodology',
      icon: Brain,
      component: FearPatternForm,
      color: 'text-blue-600',
      requiresMonitoring: false
    },
    {
      id: THERAPY_MODULES.SOMATIC_EXPERIENCING,
      name: 'Somatic Experiencing',
      description: 'Body-based trauma healing and nervous system regulation',
      icon: Activity,
      component: SomaticExperiencing,
      color: 'text-green-600',
      requiresMonitoring: true
    },
    {
      id: THERAPY_MODULES.POLYVAGAL_EXERCISES,
      name: 'Polyvagal Exercises',
      description: 'Nervous system regulation based on Polyvagal Theory',
      icon: Shield,
      component: PolyvagalExercises,
      color: 'text-purple-600',
      requiresMonitoring: true
    },
    {
      id: THERAPY_MODULES.IFS_JOURNALING,
      name: 'IFS Journaling',
      description: 'Internal Family Systems self-exploration',
      icon: Users,
      component: IFSJournaling,
      color: 'text-orange-600',
      requiresMonitoring: false
    },
    {
      id: THERAPY_MODULES.CBT_EXERCISES,
      name: 'CBT Exercises',
      description: 'Cognitive Behavioral Therapy techniques',
      icon: BookOpen,
      component: null, // To be implemented
      color: 'text-indigo-600',
      requiresMonitoring: false
    },
    {
      id: THERAPY_MODULES.CARTESIAN_REFLECTION,
      name: 'Cartesian Reflection',
      description: 'Philosophical self-inquiry based on Descartes',
      icon: Lightbulb,
      component: null, // To be implemented
      color: 'text-yellow-600',
      requiresMonitoring: false
    }
  ];

  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
    const module = modules.find(m => m.id === moduleId);
    setSafetyMonitorActive(module?.requiresMonitoring || false);
    setDistressAlert(null);
  };

  const handleDistressDetected = (indicators) => {
    setDistressAlert({
      timestamp: new Date(),
      indicators,
      message: 'Distress indicators detected. Consider taking a break or switching to a gentler exercise.'
    });
    
    // Add to session history
    userProfileActions.addSessionToHistory({
      type: 'safety_alert',
      module: activeModule,
      indicators,
      timestamp: new Date().toISOString()
    });
  };

  const handleSafetyStateChange = (state) => {
    // Update user profile with current safety state if needed
    if (state === 'overwhelmed') {
      // Could trigger automatic pause or intervention
    }
  };

  const dismissDistressAlert = () => {
    setDistressAlert(null);
  };

  const renderUserProfile = () => {
    if (!userProfile.fearPatterns || userProfile.fearPatterns.length === 0) {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome to Wake Mode</CardTitle>
            <CardDescription>
              Start by identifying your fear patterns to personalize your therapeutic journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleModuleChange(THERAPY_MODULES.FEAR_PATTERN_FORM)}>
              Begin Fear Pattern Analysis
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Current fear patterns and progress overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Identified Fear Patterns:</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.fearPatterns.map(patternId => {
                  const pattern = getFearPatternById(patternId);
                  return pattern ? (
                    <Badge key={patternId} variant="secondary">
                      {pattern.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            {userProfile.sessionHistory && userProfile.sessionHistory.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Recent Sessions:</h3>
                <div className="space-y-2">
                  {userProfile.sessionHistory.slice(0, 3).map(session => (
                    <div key={session.id} className="flex items-center justify-between text-sm">
                      <span>{session.type.replace('_', ' ')} - {session.exercise || session.promptSet}</span>
                      <span className="text-muted-foreground">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(userProfile.progress || {}).length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Progress:</h3>
                <div className="space-y-1">
                  {Object.entries(userProfile.progress).map(([patternId, progress]) => {
                    const pattern = getFearPatternById(patternId);
                    return pattern ? (
                      <div key={patternId} className="flex items-center justify-between text-sm">
                        <span>{pattern.name}</span>
                        <Badge variant="outline">{progress}%</Badge>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDistressAlert = () => {
    if (!distressAlert) return null;

    return (
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-orange-800">Safety Alert</span>
            </div>
            <Button variant="outline" size="sm" onClick={dismissDistressAlert}>
              Dismiss
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700 mb-3">{distressAlert.message}</p>
          <div className="space-y-2">
            <h4 className="font-medium text-orange-800">Detected indicators:</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(distressAlert.indicators).map(([key, value]) => (
                value ? (
                  <div key={key} className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-sm text-orange-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderModuleContent = () => {
    const module = modules.find(m => m.id === activeModule);
    if (!module || !module.component) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              This module is currently under development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We're working on bringing you more therapeutic tools. 
              Please check back soon or try one of the available modules.
            </p>
          </CardContent>
        </Card>
      );
    }

    const Component = module.component;
    return (
      <Component
        userProfile={userProfile}
        {...userProfileActions}
      />
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {renderUserProfile()}
      {renderDistressAlert()}

      {/* Safety Monitor */}
      <MediaPipeMonitor
        isActive={safetyMonitorActive}
        onDistressDetected={handleDistressDetected}
        onSafetyStateChange={handleSafetyStateChange}
        showVideo={showSafetyVideo}
      />

      <Tabs value={activeModule} onValueChange={handleModuleChange}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {modules.map(module => {
            const ModuleIcon = module.icon;
            return (
              <TabsTrigger 
                key={module.id} 
                value={module.id}
                className="flex flex-col items-center space-y-1 p-3"
              >
                <ModuleIcon className={`h-4 w-4 ${module.color}`} />
                <span className="text-xs hidden lg:block">{module.name.split(' ')[0]}</span>
                {module.requiresMonitoring && (
                  <Shield className="h-2 w-2 text-green-500" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {modules.map(module => (
          <TabsContent key={module.id} value={module.id} className="mt-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <module.icon className={`h-6 w-6 ${module.color}`} />
                <span>{module.name}</span>
                {module.requiresMonitoring && (
                  <Badge variant="outline" className="text-green-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Monitored
                  </Badge>
                )}
              </h2>
              <p className="text-muted-foreground">{module.description}</p>
            </div>
            {renderModuleContent()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

