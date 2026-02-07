import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Apple,
  Coffee,
  Pizza,
  IceCream,
  Wheat,
  Milk,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface FoodEntry {
  id: string;
  timestamp: Date;
  food: string;
  category: string;
  symptoms: string[];
  severity: number;
  notes?: string;
}

const foodCategories = {
  beverages: [
    { name: 'Coffee', icon: Coffee },
    { name: 'Energy Drinks', icon: Coffee },
    { name: 'Alcohol', icon: Coffee },
    { name: 'Soda', icon: Coffee }
  ],
  dairy: [
    { name: 'Milk', icon: Milk },
    { name: 'Cheese', icon: Milk },
    { name: 'Yogurt', icon: Milk },
    { name: 'Ice Cream', icon: IceCream }
  ],
  grains: [
    { name: 'Bread', icon: Wheat },
    { name: 'Pasta', icon: Wheat },
    { name: 'Rice', icon: Wheat },
    { name: 'Oats', icon: Wheat }
  ],
  other: [
    { name: 'Chocolate', icon: IceCream },
    { name: 'Nuts', icon: Apple },
    { name: 'Spicy Foods', icon: Pizza },
    { name: 'Processed Foods', icon: Pizza }
  ]
};

const commonSymptoms = [
  'Headache', 'Fatigue', 'Brain Fog', 'Digestive Issues',
  'Mood Changes', 'Sleep Problems', 'Skin Issues', 'Joint Pain'
];

export function FoodTriggers() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [selectedFood, setSelectedFood] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addEntry = () => {
    if (!selectedFood || selectedSymptoms.length === 0) return;

    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      food: selectedFood,
      category: getCategoryForFood(selectedFood),
      symptoms: selectedSymptoms,
      severity,
      notes: notes.trim() || undefined
    };

    setEntries(prev => [newEntry, ...prev]);

    // Reset form
    setSelectedFood('');
    setSelectedSymptoms([]);
    setSeverity(3);
    setNotes('');
    setShowAddForm(false);
  };

  const getCategoryForFood = (food: string): string => {
    for (const [category, foods] of Object.entries(foodCategories)) {
      if (foods.some(f => f.name === food)) {
        return category;
      }
    }
    return 'other';
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 2) return 'text-green-600';
    if (severity <= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 2) return 'Mild';
    if (severity <= 4) return 'Moderate';
    return 'Severe';
  };

  return (
    <div className="space-y-6">
      {/* Add New Entry Button */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-orange-800">Track Food & Symptoms</h3>
              <p className="text-orange-600 mt-1">
                Connect what you eat with how you feel
              </p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {showAddForm ? 'Cancel' : 'Add Entry'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Entry Form */}
      {showAddForm && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800">Log Food & Symptoms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Food Selection */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">What did you eat?</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(foodCategories).map(([category, foods]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {category}
                    </h4>
                    {foods.map((food) => (
                      <Button
                        key={food.name}
                        variant={selectedFood === food.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedFood(food.name)}
                        className={`w-full justify-start ${
                          selectedFood === food.name
                            ? 'bg-orange-500 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        <food.icon className="h-4 w-4 mr-2" />
                        {food.name}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                What symptoms did you notice? (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <Badge
                    key={symptom}
                    variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-red-500 text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                How severe were the symptoms? {severity}/10
              </label>
              <Slider
                value={[severity]}
                onValueChange={(value) => setSeverity(value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Mild</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any other details about timing, portions, etc..."
                className="border-gray-300"
              />
            </div>

            <Button
              onClick={addEntry}
              disabled={!selectedFood || selectedSymptoms.length === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Save Food & Symptom Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Food-Symptom History */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">Food & Symptom Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <Apple className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                Start tracking foods and symptoms to discover patterns! 🍎
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div key={entry.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Apple className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{entry.food}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(entry.timestamp)}</span>
                          <Badge variant="outline" className="text-xs">
                            {getSeverityLabel(entry.severity)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className={`text-right ${getSeverityColor(entry.severity)}`}>
                      <div className="font-medium">{entry.severity}/10</div>
                      <div className="text-xs">Severity</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {entry.symptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>

                    {entry.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
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