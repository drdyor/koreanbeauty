import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Activity,
  Calendar,
  Zap,
  Brain,
  Heart,
  Pill
} from 'lucide-react';

// Mock pattern data - in real app this would come from API
const mockPatterns = [
  {
    id: '1',
    type: 'correlation',
    title: 'Anxiety peaks with caffeine',
    description: 'Your anxiety levels are 2.3x higher on days with 3+ caffeinated drinks',
    confidence: 0.85,
    impact: 'high',
    relatedSymptoms: ['Anxiety', 'Headache'],
    timeframe: 'Last 30 days',
    actionable: true,
    suggestion: 'Try reducing caffeine intake to 2 drinks per day',
  },
  {
    id: '2',
    type: 'trend',
    title: 'Headache frequency decreasing',
    description: 'Headache occurrences have dropped 40% over the last 2 weeks',
    confidence: 0.92,
    impact: 'positive',
    relatedSymptoms: ['Headache'],
    timeframe: 'Last 14 days',
    actionable: false,
  },
  {
    id: '3',
    type: 'prediction',
    title: 'PMS symptoms likely tomorrow',
    description: 'Based on your cycle patterns, PMS symptoms are predicted for tomorrow',
    confidence: 0.78,
    impact: 'info',
    relatedSymptoms: ['Mood Swings', 'Fatigue'],
    timeframe: 'Next 24 hours',
    actionable: true,
    suggestion: 'Consider magnesium supplement and rest',
  },
  {
    id: '4',
    type: 'correlation',
    title: 'Sleep quality affects next-day energy',
    description: 'Poor sleep quality correlates with 60% lower energy levels the next day',
    confidence: 0.88,
    impact: 'medium',
    relatedSymptoms: ['Fatigue', 'Focus Issues'],
    timeframe: 'Last 45 days',
    actionable: true,
    suggestion: 'Aim for 7-8 hours of sleep for better energy',
  },
];

const correlations = [
  { factor: 'Sleep Quality', symptom: 'Next Day Energy', strength: 0.82, direction: 'positive' },
  { factor: 'Caffeine Intake', symptom: 'Anxiety Levels', strength: 0.75, direction: 'negative' },
  { factor: 'Exercise', symptom: 'Mood', strength: 0.68, direction: 'positive' },
  { factor: 'Weather Changes', symptom: 'Headache', strength: 0.55, direction: 'negative' },
];

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'positive': return 'text-green-400 bg-green-400/10 border-green-400/20';
    default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  }
};

const getImpactIcon = (type: string) => {
  switch (type) {
    case 'correlation': return <Activity className="h-4 w-4" />;
    case 'trend': return <TrendingUp className="h-4 w-4" />;
    case 'prediction': return <Zap className="h-4 w-4" />;
    default: return <Lightbulb className="h-4 w-4" />;
  }
};

export function PatternAnalysis() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Pattern Analysis</h2>
        <p className="text-zinc-400">
          AI-powered insights from your symptom tracking data
        </p>
      </div>

      {/* Key Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        {mockPatterns.map((pattern) => (
          <Card key={pattern.id} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getImpactIcon(pattern.type)}
                  <CardTitle className="text-white text-lg">{pattern.title}</CardTitle>
                </div>
                <Badge className={getImpactColor(pattern.impact)}>
                  {Math.round(pattern.confidence * 100)}% confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-300">{pattern.description}</p>

              <div className="flex flex-wrap gap-1">
                {pattern.relatedSymptoms.map((symptom) => (
                  <Badge key={symptom} variant="outline" className="text-xs">
                    {symptom}
                  </Badge>
                ))}
              </div>

              <div className="text-sm text-zinc-500">
                <Calendar className="h-3 w-3 inline mr-1" />
                {pattern.timeframe}
              </div>

              {pattern.suggestion && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-400 mb-1">Suggestion</p>
                      <p className="text-sm text-zinc-300">{pattern.suggestion}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Correlations Matrix */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-400" />
            Factor Correlations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {correlations.map((correlation, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-zinc-300">
                    {correlation.factor}
                  </div>
                  <div className="text-zinc-500">→</div>
                  <div className="text-sm text-zinc-300">
                    {correlation.symptom}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-24">
                    <Progress value={correlation.strength * 100} className="h-2" />
                  </div>
                  <div className="text-sm font-medium text-zinc-300">
                    {Math.round(correlation.strength * 100)}%
                  </div>
                  {correlation.direction === 'positive' ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">This Week's Patterns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Most common symptom</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Anxiety
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Peak symptom time</span>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Morning (9-11 AM)
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Biggest trigger</span>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                Caffeine
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Improvement trend</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                +15% better
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Health Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Average sleep quality</span>
              <div className="flex items-center space-x-2">
                <Progress value={72} className="w-16 h-2" />
                <span className="text-sm text-zinc-400">7.2/10</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Stress management</span>
              <div className="flex items-center space-x-2">
                <Progress value={68} className="w-16 h-2" />
                <span className="text-sm text-zinc-400">6.8/10</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Symptom control</span>
              <div className="flex items-center space-x-2">
                <Progress value={82} className="w-16 h-2" />
                <span className="text-sm text-zinc-400">8.2/10</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Overall wellness</span>
              <div className="flex items-center space-x-2">
                <Progress value={75} className="w-16 h-2" />
                <span className="text-sm text-zinc-400">7.5/10</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-400" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-zinc-800 rounded-lg">
            <Pill className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Review caffeine intake</p>
              <p className="text-zinc-400 text-sm">Consider switching to decaf or limiting to 2 cups per day</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-zinc-800 rounded-lg">
            <Heart className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Prioritize sleep schedule</p>
              <p className="text-zinc-400 text-sm">Aim for consistent bedtime to improve next-day energy</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-zinc-800 rounded-lg">
            <Activity className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Track PMS patterns</p>
              <p className="text-zinc-400 text-sm">Monitor symptoms leading up to your period for better preparation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}