import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MapPin, Camera, Clock, Zap } from 'lucide-react';
import type { SymptomCategory } from '@/lib/api/types';

const symptomEntrySchema = z.object({
  category: z.enum(['mental', 'physical', 'hormonal', 'medication', 'lifestyle']),
  symptomType: z.string().min(1, 'Symptom type is required'),
  severity: z.number().min(1).max(10),
  notes: z.string().optional(),
  locationEnabled: z.boolean(),
  photosEnabled: z.boolean(),
});

type SymptomEntryFormData = z.infer<typeof symptomEntrySchema>;

const symptomSuggestions = {
  mental: ['Anxiety', 'Depression', 'Focus Issues', 'Irritability', 'Brain Fog', 'Panic Attacks'],
  physical: ['Headache', 'Fatigue', 'Nausea', 'Pain', 'Dizziness', 'Insomnia'],
  hormonal: ['Mood Swings', 'PMS', 'Hot Flashes', 'Irregular Periods', 'Cravings', 'Bloating'],
  medication: ['Nausea', 'Drowsiness', 'Headache', 'Dizziness', 'Insomnia', 'Appetite Changes'],
  lifestyle: ['Stress', 'Sleep Quality', 'Energy Levels', 'Digestive Issues', 'Allergies', 'Weather Sensitivity']
};

export function SymptomEntryForm() {
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory | ''>('');
  const [severity, setSeverity] = useState([5]);

  const form = useForm<SymptomEntryFormData>({
    resolver: zodResolver(symptomEntrySchema),
    defaultValues: {
      category: 'mental',
      symptomType: '',
      severity: 5,
      notes: '',
      locationEnabled: false,
      photosEnabled: false,
    },
  });

  const onSubmit = (data: SymptomEntryFormData) => {
    console.log('Symptom entry:', data);
    // TODO: Implement API call to save symptom
  };

  const handleCategoryChange = (category: SymptomCategory) => {
    setSelectedCategory(category);
    form.setValue('category', category);
  };

  const getSeverityColor = (value: number) => {
    if (value <= 3) return 'bg-green-500';
    if (value <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityLabel = (value: number) => {
    if (value <= 3) return 'Mild';
    if (value <= 6) return 'Moderate';
    return 'Severe';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-white/90 border-pink-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center">
            <Zap className="h-5 w-5 mr-2 text-pink-500" />
            Log New Symptom
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <Label className="text-zinc-300">Symptom Category</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(['mental', 'physical', 'hormonal', 'medication', 'lifestyle'] as const).map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`capitalize ${
                      selectedCategory === category
                        ? 'bg-pink-500 hover:bg-pink-600 text-white'
                        : 'bg-white border-pink-200 hover:bg-pink-50 text-pink-700'
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Symptom Type */}
            <div className="space-y-3">
              <Label className="text-zinc-300">What are you experiencing?</Label>
              <Input
                {...form.register('symptomType')}
                placeholder="Describe your symptom..."
                className="bg-white border-pink-200 text-gray-800 focus:border-pink-300"
              />

              {/* Quick Suggestions */}
              {selectedCategory && symptomSuggestions[selectedCategory] && (
                <div className="space-y-2">
                  <Label className="text-sm text-zinc-500">Quick suggestions:</Label>
                  <div className="flex flex-wrap gap-2">
                    {symptomSuggestions[selectedCategory].map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="outline"
                        className="cursor-pointer hover:bg-zinc-700 border-zinc-600"
                        onClick={() => form.setValue('symptomType', suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Severity Rating */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Severity Level</Label>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getSeverityColor(severity[0])} text-white`}>
                    {severity[0]}/10
                  </Badge>
                  <span className="text-sm text-zinc-500">
                    {getSeverityLabel(severity[0])}
                  </span>
                </div>
              </div>

              <Slider
                value={severity}
                onValueChange={(value) => {
                  setSeverity(value);
                  form.setValue('severity', value[0]);
                }}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-zinc-500">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Additional Context */}
            <div className="space-y-4">
              <Label className="text-zinc-300">Additional Context (Optional)</Label>

              <Textarea
                {...form.register('notes')}
                placeholder="Any additional notes, triggers, or observations..."
                className="bg-white border-pink-200 text-gray-800 focus:border-pink-300 min-h-[100px]"
              />

              {/* Optional Features */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                    <Label className="text-zinc-300">Include location</Label>
                  </div>
                  <Switch
                    checked={form.watch('locationEnabled')}
                    onCheckedChange={(checked) => form.setValue('locationEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-4 w-4 text-zinc-500" />
                    <Label className="text-zinc-300">Add photos</Label>
                  </div>
                  <Switch
                    checked={form.watch('photosEnabled')}
                    onCheckedChange={(checked) => form.setValue('photosEnabled', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              disabled={form.formState.isSubmitting}
            >
              <Clock className="h-4 w-4 mr-2" />
              {form.formState.isSubmitting ? 'Saving...' : 'Save Symptom Entry'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}