import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, Heart, Brain, Activity, Moon, Smile } from 'lucide-react';

const quickMetrics = [
  { id: 'energy', label: 'Energy Level', icon: Zap, color: 'text-yellow-400' },
  { id: 'mood', label: 'Mood', icon: Smile, color: 'text-pink-400' },
  { id: 'focus', label: 'Focus', icon: Brain, color: 'text-blue-400' },
  { id: 'stress', label: 'Stress', icon: Heart, color: 'text-red-400' },
  { id: 'sleep', label: 'Sleep Quality', icon: Moon, color: 'text-purple-400' },
  { id: 'activity', label: 'Physical Activity', icon: Activity, color: 'text-green-400' },
];

interface QuickCheckInProps {
  trigger?: React.ReactNode;
  onCheckInComplete?: () => void;
}

export function QuickCheckIn({ trigger, onCheckInComplete }: QuickCheckInProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  const handleMetricChange = (metricId: string, value: number[]) => {
    setValues(prev => ({ ...prev, [metricId]: value[0] }));
  };

  const handleSubmit = () => {
    // TODO: Save quick check-in data
    console.log('Quick check-in:', { values, notes, timestamp: new Date() });
    setIsOpen(false);
    setValues({});
    setNotes('');
  };

  const getAverageScore = () => {
    const scores = Object.values(values);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const getAverageLabel = (score: number) => {
    if (score >= 8) return { text: 'Excellent', color: 'text-green-400' };
    if (score >= 6) return { text: 'Good', color: 'text-blue-400' };
    if (score >= 4) return { text: 'Fair', color: 'text-yellow-400' };
    return { text: 'Needs Attention', color: 'text-red-400' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
          <Zap className="h-4 w-4 mr-2" />
          Quick Check-in
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white/95 border-pink-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-800 text-center">How are you feeling?</DialogTitle>
          <p className="text-pink-600 text-center text-sm">
            A quick wellness snapshot - takes just 30 seconds
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metrics */}
          {quickMetrics.map((metric) => {
            const Icon = metric.icon;
            const value = values[metric.id] || 5;

            return (
              <div key={metric.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                    <Label className="text-zinc-300 text-sm">{metric.label}</Label>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {value}/10
                  </Badge>
                </div>

                <Slider
                  value={[value]}
                  onValueChange={(val) => handleMetricChange(metric.id, val)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />

                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            );
          })}

          {/* Overall Summary */}
          {Object.keys(values).length > 0 && (
            <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-pink-700">Overall Wellness</span>
                <Badge className={`${
                  getAverageScore() >= 8 ? 'bg-green-100 text-green-700 border-green-300' :
                  getAverageScore() >= 6 ? 'bg-blue-100 text-blue-700 border-blue-300' :
                  getAverageScore() >= 4 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                  'bg-red-100 text-red-700 border-red-300'
                }`}>
                  {getAverageScore() >= 8 ? 'Excellent' :
                   getAverageScore() >= 6 ? 'Good' :
                   getAverageScore() >= 4 ? 'Fair' : 'Needs Attention'}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-gray-800 text-center">
                {getAverageScore()}/10
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-pink-700 text-sm">Quick Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any thoughts or observations..."
              className="bg-white border-pink-200 text-gray-800 focus:border-pink-300 min-h-[60px]"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-white border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
              disabled={Object.keys(values).length === 0}
            >
              Save Check-in
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}