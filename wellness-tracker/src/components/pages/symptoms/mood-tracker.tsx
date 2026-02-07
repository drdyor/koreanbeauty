import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Smile,
  Meh,
  Frown,
  Heart,
  Coffee,
  UtensilsCrossed,
  Moon,
  Sun,
  Clock
} from 'lucide-react';

interface MoodEntry {
  timestamp: Date;
  mood: number;
  energy: number;
  notes?: string;
  triggers?: string[];
}

const moodOptions = [
  { value: 1, label: 'Very Low', icon: Frown, color: 'text-red-600' },
  { value: 2, label: 'Low', icon: Meh, color: 'text-orange-600' },
  { value: 3, label: 'Neutral', icon: Meh, color: 'text-yellow-600' },
  { value: 4, label: 'Good', icon: Smile, color: 'text-blue-600' },
  { value: 5, label: 'Excellent', icon: Heart, color: 'text-green-600' }
];

const commonTriggers = [
  'Caffeine', 'Sugar', 'Stress', 'Sleep', 'Exercise',
  'Weather', 'Social', 'Work', 'Food', 'Medication'
];

export function MoodTracker() {
  const [currentMood, setCurrentMood] = useState(3);
  const [currentEnergy, setCurrentEnergy] = useState(5);
  const [notes, setNotes] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  const handleSaveEntry = () => {
    const newEntry: MoodEntry = {
      timestamp: new Date(),
      mood: currentMood,
      energy: currentEnergy,
      notes: notes.trim() || undefined,
      triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined
    };

    setEntries(prev => [newEntry, ...prev]);
    // Reset form
    setCurrentMood(3);
    setCurrentEnergy(5);
    setNotes('');
    setSelectedTriggers([]);
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const getMoodIcon = (mood: number) => {
    const option = moodOptions.find(opt => opt.value === mood);
    return option ? React.createElement(option.icon, { className: `h-5 w-5 ${option.color}` }) : null;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Quick Mood Entry */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            How are you feeling right now?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Scale */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-blue-700">Mood</label>
            <div className="flex justify-between items-center">
              {moodOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={currentMood === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentMood(option.value)}
                  className={`flex flex-col items-center p-3 ${
                    currentMood === option.value
                      ? 'bg-blue-500 text-white'
                      : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <option.icon className="h-4 w-4 mb-1" />
                  <span className="text-xs">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-blue-700">
              Energy Level: {currentEnergy}/10
            </label>
            <Slider
              value={[currentEnergy]}
              onValueChange={(value) => setCurrentEnergy(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-blue-600">
              <span>Low Energy</span>
              <span>High Energy</span>
            </div>
          </div>

          {/* Quick Triggers */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-blue-700">Any triggers today?</label>
            <div className="flex flex-wrap gap-2">
              {commonTriggers.map((trigger) => (
                <Badge
                  key={trigger}
                  variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedTriggers.includes(trigger)
                      ? 'bg-blue-500 text-white'
                      : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                  }`}
                  onClick={() => toggleTrigger(trigger)}
                >
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-blue-700">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any thoughts or observations..."
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          <Button
            onClick={handleSaveEntry}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Clock className="h-4 w-4 mr-2" />
            Save Mood Entry
          </Button>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Today's Mood Journey</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No mood entries yet today. Start tracking to see your patterns! 🌟
            </p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getMoodIcon(entry.mood)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800">
                          Mood: {moodOptions.find(opt => opt.value === entry.mood)?.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          Energy: {entry.energy}/10
                        </span>
                      </div>
                      {entry.triggers && entry.triggers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.triggers.map((trigger) => (
                            <Badge key={trigger} variant="secondary" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}