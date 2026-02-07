import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Plus,
  Sparkles,
  Coffee,
  Users,
  Home,
  Sun,
  Moon,
  Star
} from 'lucide-react';

interface GratitudeEntry {
  id: string;
  timestamp: Date;
  items: string[];
  category?: string;
  notes?: string;
}

const gratitudePrompts = [
  "What made you smile today?",
  "Who showed you kindness?",
  "What are you looking forward to?",
  "What small thing brought you joy?",
  "What are you thankful for right now?"
];

const quickGratitude = [
  "Good coffee ☕",
  "Supportive friends 👥",
  "Warm bed 🛏️",
  "Beautiful weather ☀️",
  "Good health ❤️",
  "Loving family 👨‍👩‍👧",
  "Favorite music 🎵",
  "Comfortable home 🏠",
  "Delicious food 🍽️",
  "Peaceful moments 🧘"
];

export function GratitudeLog() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [currentNotes, setCurrentNotes] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const addGratitudeItem = (item: string) => {
    if (!currentItems.includes(item)) {
      setCurrentItems(prev => [...prev, item]);
    }
  };

  const removeGratitudeItem = (item: string) => {
    setCurrentItems(prev => prev.filter(i => i !== item));
  };

  const addCustomItem = () => {
    const customItem = prompt("What are you grateful for?");
    if (customItem && customItem.trim()) {
      addGratitudeItem(customItem.trim());
    }
  };

  const saveEntry = () => {
    if (currentItems.length === 0) return;

    const newEntry: GratitudeEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      items: currentItems,
      notes: currentNotes.trim() || undefined
    };

    setEntries(prev => [newEntry, ...prev]);
    setCurrentItems([]);
    setCurrentNotes('');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Daily Gratitude Prompt */}
      <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
        <CardHeader>
          <CardTitle className="text-rose-800 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Daily Gratitude Practice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white/70 p-4 rounded-lg border border-rose-100">
            <p className="text-rose-700 font-medium mb-2">
              {gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)]}
            </p>
            <p className="text-rose-600 text-sm">
              Taking a moment to notice the good things helps build resilience and positive mental health patterns.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add New Entry */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center justify-between">
            <span className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-rose-500" />
              What are you grateful for today?
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="border-gray-300"
            >
              Quick Add
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Add Options */}
          {showQuickAdd && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {quickGratitude.map((item) => (
                  <Button
                    key={item}
                    variant="outline"
                    size="sm"
                    onClick={() => addGratitudeItem(item)}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    {item}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addCustomItem}
                className="border-gray-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Custom
              </Button>
            </div>
          )}

          {/* Current Items */}
          {currentItems.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Your gratitude list:</label>
              <div className="flex flex-wrap gap-2">
                {currentItems.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-300"
                    onClick={() => removeGratitudeItem(item)}
                  >
                    {item} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Additional notes (optional)</label>
            <Textarea
              value={currentNotes}
              onChange={(e) => setCurrentNotes(e.target.value)}
              placeholder="Any reflections or context about these moments of gratitude..."
              className="border-gray-300"
            />
          </div>

          <Button
            onClick={saveEntry}
            disabled={currentItems.length === 0}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white"
          >
            <Heart className="h-4 w-4 mr-2" />
            Save Gratitude Entry
          </Button>
        </CardContent>
      </Card>

      {/* Gratitude History */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Your Gratitude Journey</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Start your gratitude practice today! 🌟
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-gray-800">
                        {formatDate(entry.timestamp)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {entry.items.map((item, index) => (
                        <Badge key={index} variant="outline" className="border-gray-300">
                          {item}
                        </Badge>
                      ))}
                    </div>

                    {entry.notes && (
                      <p className="text-sm text-gray-600 italic mt-2">
                        "{entry.notes}"
                      </p>
                    )}
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