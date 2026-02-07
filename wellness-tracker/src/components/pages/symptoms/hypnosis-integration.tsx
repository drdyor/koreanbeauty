import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Headphones,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Moon,
  Sun,
  Star,
  Heart,
  Clock,
  Target
} from 'lucide-react';

interface HypnosisSession {
  id: string;
  timestamp: Date;
  type: string;
  duration: number; // minutes
  effectiveness: number; // 1-10
  notes?: string;
  triggers?: string[];
}

const hypnosisTypes = [
  {
    id: 'anxiety',
    name: 'Anxiety Relief',
    description: 'Deep relaxation and anxiety reduction',
    icon: Heart,
    color: 'from-blue-400 to-purple-500'
  },
  {
    id: 'sleep',
    name: 'Sleep Enhancement',
    description: 'Guided relaxation for better sleep',
    icon: Moon,
    color: 'from-indigo-400 to-blue-500'
  },
  {
    id: 'focus',
    name: 'Focus & Concentration',
    description: 'Mental clarity and improved focus',
    icon: Target,
    color: 'from-green-400 to-blue-500'
  },
  {
    id: 'confidence',
    name: 'Self-Confidence',
    description: 'Building inner strength and confidence',
    icon: Star,
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'stress',
    name: 'Stress Management',
    description: 'Release tension and find calm',
    icon: Sun,
    color: 'from-orange-400 to-red-500'
  }
];

export function HypnosisIntegration() {
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(7);
  const [sessions, setSessions] = useState<HypnosisSession[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [sessionEffectiveness, setSessionEffectiveness] = useState(7);
  const [sessionNotes, setSessionNotes] = useState('');

  const startSession = (typeId: string) => {
    setCurrentSession(typeId);
    setIsPlaying(true);
    // In a real app, this would start audio playback
  };

  const stopSession = () => {
    if (currentSession) {
      setShowLogForm(true);
    }
    setCurrentSession(null);
    setIsPlaying(false);
  };

  const logSession = () => {
    if (!currentSession) return;

    const newSession: HypnosisSession = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: currentSession,
      duration: 20, // Mock duration
      effectiveness: sessionEffectiveness,
      notes: sessionNotes.trim() || undefined
    };

    setSessions(prev => [newSession, ...prev]);

    // Reset form
    setSessionEffectiveness(7);
    setSessionNotes('');
    setShowLogForm(false);
  };

  const getSessionType = (typeId: string) => {
    return hypnosisTypes.find(type => type.id === typeId);
  };

  const formatDuration = (minutes: number) => {
    return `${minutes} min`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-indigo-800 flex items-center">
            <Headphones className="h-5 w-5 mr-2" />
            Guided Hypnosis Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-indigo-700 mb-4">
            Professional hypnosis sessions designed to complement your wellness tracking.
            Use alongside symptom logging for comprehensive mental health support.
          </p>
          <div className="flex items-center space-x-4 text-sm text-indigo-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              15-30 min sessions
            </div>
            <div className="flex items-center">
              <Headphones className="h-4 w-4 mr-1" />
              Audio guidance
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1" />
              Evidence-based techniques
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Types */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hypnosisTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              currentSession === type.id ? 'ring-2 ring-indigo-500' : ''
            }`}
            onClick={() => startSession(type.id)}
          >
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center mb-4`}>
                <type.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-gray-800 mb-2">{type.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{type.description}</p>
              {currentSession === type.id && (
                <Badge className="bg-indigo-500">Currently Playing</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Session Controls */}
      {currentSession && (
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {React.createElement(getSessionType(currentSession)?.icon || Headphones, {
                  className: "h-8 w-8"
                })}
                <div>
                  <h3 className="text-lg font-medium">
                    {getSessionType(currentSession)?.name}
                  </h3>
                  <p className="text-indigo-100">Guided session in progress</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                Live Session
              </Badge>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-6 mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                onClick={isPlaying ? () => setIsPlaying(false) : () => setIsPlaying(true)}
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-3">
              <Volume2 className="h-4 w-4" />
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={10}
                min={0}
                step={1}
                className="flex-1"
              />
              <span className="text-sm w-8">{volume}</span>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={stopSession}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/20"
              >
                End Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Completion Log */}
      {showLogForm && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800">How was your session?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-2">
                {getSessionType(currentSession!)?.name}
              </h4>
              <p className="text-indigo-600 text-sm">
                Completed • 20 minutes • {formatTime(new Date())}
              </p>
            </div>

            {/* Effectiveness Rating */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                How effective was this session? {sessionEffectiveness}/10
              </label>
              <Slider
                value={[sessionEffectiveness]}
                onValueChange={(value) => setSessionEffectiveness(value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Not helpful</span>
                <span>Very helpful</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Session notes (optional)</label>
              <Textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Any insights, feelings, or observations from this session..."
                className="border-gray-300"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={logSession}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                Save Session
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLogForm(false)}
                className="border-gray-300"
              >
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Headphones className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Complete your first hypnosis session to see your progress! 🧘
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {React.createElement(getSessionType(session.type)?.icon || Headphones, {
                      className: "h-8 w-8 text-indigo-500"
                    })}
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {getSessionType(session.type)?.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(session.timestamp)}</span>
                        <span>•</span>
                        <span>{formatDuration(session.duration)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{session.effectiveness}/10</span>
                    </div>
                    <div className="text-xs text-gray-500">Effectiveness</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}