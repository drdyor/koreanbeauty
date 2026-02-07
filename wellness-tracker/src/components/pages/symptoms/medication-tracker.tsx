import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pill,
  Plus,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
  Edit,
  Trash2
} from 'lucide-react';

// Mock medication data
const mockMedications = [
  {
    id: '1',
    name: 'Sertraline',
    dosage: '50mg',
    frequency: 'Once daily',
    startDate: new Date('2024-01-01'),
    endDate: null,
    purpose: 'Anxiety and depression',
    sideEffects: [
      { symptom: 'Nausea', severity: 'mild', date: new Date('2024-01-02'), notes: 'Morning only' },
      { symptom: 'Headache', severity: 'moderate', date: new Date('2024-01-05'), notes: 'Lasted 2 days' },
    ],
    adherence: 0.95,
    effectiveness: 7,
  },
  {
    id: '2',
    name: 'Ibuprofen',
    dosage: '400mg',
    frequency: 'As needed',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-15'),
    purpose: 'Headache relief',
    sideEffects: [],
    adherence: 0.78,
    effectiveness: 8,
  },
];

const sideEffectSeverities = [
  { value: 'mild', label: 'Mild', color: 'bg-green-500' },
  { value: 'moderate', label: 'Moderate', color: 'bg-yellow-500' },
  { value: 'severe', label: 'Severe', color: 'bg-red-500' },
];

export function MedicationTracker() {
  const [medications, setMedications] = useState(mockMedications);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'severe': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 0.9) return 'text-green-400';
    if (adherence >= 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Medication Tracker</h2>
          <p className="text-zinc-400 mt-1">
            Monitor medications, side effects, and effectiveness
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Medication</DialogTitle>
            </DialogHeader>
            <AddMedicationForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Medications */}
      <div className="space-y-4">
        {medications.map((medication) => (
          <Card key={medication.id} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Pill className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{medication.name}</h3>
                    <p className="text-sm text-zinc-400">{medication.dosage} • {medication.frequency}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Purpose and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400 text-sm">Purpose</Label>
                  <p className="text-zinc-300">{medication.purpose}</p>
                </div>
                <div>
                  <Label className="text-zinc-400 text-sm">Started</Label>
                  <p className="text-zinc-300 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {medication.startDate.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-400 text-sm">Adherence</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={medication.adherence * 100} className="flex-1 h-2" />
                    <span className={`text-sm font-medium ${getAdherenceColor(medication.adherence)}`}>
                      {Math.round(medication.adherence * 100)}%
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-zinc-400 text-sm">Effectiveness</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={medication.effectiveness * 10} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-blue-400">
                      {medication.effectiveness}/10
                    </span>
                  </div>
                </div>
              </div>

              {/* Side Effects */}
              {medication.sideEffects.length > 0 && (
                <div>
                  <Label className="text-zinc-400 text-sm mb-2 block">Recent Side Effects</Label>
                  <div className="space-y-2">
                    {medication.sideEffects.slice(0, 2).map((effect, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-zinc-800 rounded">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(effect.severity)}`} />
                          <span className="text-zinc-300">{effect.symptom}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {effect.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedMedication(medication.id)}
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Log Side Effect
                </Button>

                <Button variant="outline" size="sm" className="flex-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Effectiveness
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Side Effect Logging Dialog */}
      {selectedMedication && (
        <Dialog open={!!selectedMedication} onOpenChange={() => setSelectedMedication(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Log Side Effect</DialogTitle>
            </DialogHeader>
            <SideEffectForm
              medicationId={selectedMedication}
              onClose={() => setSelectedMedication(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Summary Stats */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Medication Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {medications.length}
              </div>
              <div className="text-sm text-zinc-400">Active Medications</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {medications.filter(m => m.adherence >= 0.9).length}
              </div>
              <div className="text-sm text-zinc-400">High Adherence</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {medications.reduce((sum, m) => sum + m.sideEffects.length, 0)}
              </div>
              <div className="text-sm text-zinc-400">Side Effects Logged</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {(medications.reduce((sum, m) => sum + m.effectiveness, 0) / medications.length).toFixed(1)}
              </div>
              <div className="text-sm text-zinc-400">Avg Effectiveness</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddMedicationForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-zinc-300">Medication Name</Label>
          <Input placeholder="e.g., Sertraline" className="bg-zinc-800 border-zinc-700" />
        </div>
        <div>
          <Label className="text-zinc-300">Dosage</Label>
          <Input placeholder="e.g., 50mg" className="bg-zinc-800 border-zinc-700" />
        </div>
      </div>

      <div>
        <Label className="text-zinc-300">Frequency</Label>
        <Select>
          <SelectTrigger className="bg-zinc-800 border-zinc-700">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once-daily">Once daily</SelectItem>
            <SelectItem value="twice-daily">Twice daily</SelectItem>
            <SelectItem value="three-times">Three times daily</SelectItem>
            <SelectItem value="as-needed">As needed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-zinc-300">Purpose</Label>
        <Textarea
          placeholder="Why are you taking this medication?"
          className="bg-zinc-800 border-zinc-700"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Add Medication
        </Button>
      </div>
    </div>
  );
}

function SideEffectForm({ medicationId, onClose }: { medicationId: string; onClose: () => void }) {
  const [severity, setSeverity] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-zinc-300">Symptom</Label>
        <Input placeholder="e.g., Nausea, Headache" className="bg-zinc-800 border-zinc-700" />
      </div>

      <div>
        <Label className="text-zinc-300">Severity</Label>
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700">
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            {sideEffectSeverities.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${option.color}`} />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-zinc-300">Notes (Optional)</Label>
        <Textarea
          placeholder="Additional details about this side effect..."
          className="bg-zinc-800 border-zinc-700"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Log Side Effect
        </Button>
      </div>
    </div>
  );
}