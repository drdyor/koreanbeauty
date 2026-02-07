import { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data - in real app this would come from API
const mockSymptoms = [
  {
    id: '1',
    category: 'mental',
    symptomType: 'Anxiety',
    severity: 7,
    notes: 'Worse in the mornings, better after exercise',
    timestamp: new Date(),
    trends: 'up' as const,
  },
  {
    id: '2',
    category: 'physical',
    symptomType: 'Headache',
    severity: 4,
    notes: 'Started after coffee, helped by rest',
    timestamp: subDays(new Date(), 1),
    trends: 'down' as const,
  },
  {
    id: '3',
    category: 'hormonal',
    symptomType: 'Mood Swings',
    severity: 6,
    notes: 'More irritable than usual',
    timestamp: subDays(new Date(), 2),
    trends: 'stable' as const,
  },
  {
    id: '4',
    category: 'medication',
    symptomType: 'Nausea',
    severity: 3,
    notes: 'Side effect from new medication',
    timestamp: subDays(new Date(), 3),
    trends: 'down' as const,
  },
];

const categoryColors = {
  mental: 'bg-purple-500',
  physical: 'bg-blue-500',
  hormonal: 'bg-pink-500',
  medication: 'bg-orange-500',
  lifestyle: 'bg-green-500',
};

const severityColors = {
  1: 'bg-green-400',
  2: 'bg-green-500',
  3: 'bg-lime-500',
  4: 'bg-yellow-400',
  5: 'bg-yellow-500',
  6: 'bg-orange-400',
  7: 'bg-orange-500',
  8: 'bg-red-400',
  9: 'bg-red-500',
  10: 'bg-red-600',
};

export function SymptomHistory() {
  const [timeRange, setTimeRange] = useState('7d');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredSymptoms = mockSymptoms.filter(symptom => {
    if (categoryFilter !== 'all' && symptom.category !== categoryFilter) {
      return false;
    }

    const days = parseInt(timeRange.replace('d', ''));
    const cutoff = subDays(new Date(), days);
    return symptom.timestamp >= cutoff;
  });

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-red-400" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-green-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/90 border-pink-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-pink-500" />
            Symptom History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white border-pink-200 text-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last Day</SelectItem>
                  <SelectItem value="7d">Last Week</SelectItem>
                  <SelectItem value="30d">Last Month</SelectItem>
                  <SelectItem value="90d">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-white border-pink-200 text-gray-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="mental">Mental Health</SelectItem>
                  <SelectItem value="physical">Physical Health</SelectItem>
                  <SelectItem value="hormonal">Hormonal</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Symptom Timeline */}
      <div className="space-y-4">
        {filteredSymptoms.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No symptoms logged</h3>
                <p className="text-zinc-400">
                  Start tracking your symptoms to see patterns and insights here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredSymptoms.map((symptom) => (
            <Card key={symptom.id} className="bg-white/90 border-pink-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge
                        className={cn(
                          'capitalize',
                          symptom.category === 'mental' && 'bg-purple-100 text-purple-700 border-purple-300',
                          symptom.category === 'physical' && 'bg-blue-100 text-blue-700 border-blue-300',
                          symptom.category === 'hormonal' && 'bg-pink-100 text-pink-700 border-pink-300',
                          symptom.category === 'medication' && 'bg-orange-100 text-orange-700 border-orange-300',
                          symptom.category === 'lifestyle' && 'bg-green-100 text-green-700 border-green-300'
                        )}
                      >
                        {symptom.category}
                      </Badge>

                      <div className="flex items-center space-x-2">
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full',
                            severityColors[symptom.severity as keyof typeof severityColors]
                          )}
                        />
                        <span className="text-sm text-zinc-400">
                          {symptom.severity}/10 • {getSeverityLabel(symptom.severity)}
                        </span>
                      </div>

                      {getTrendIcon(symptom.trends)}
                    </div>

                    <h3 className="text-lg font-medium text-gray-800 mb-1">
                      {symptom.symptomType}
                    </h3>

                    {symptom.notes && (
                      <p className="text-pink-600 text-sm mb-3">{symptom.notes}</p>
                    )}

                    <div className="flex items-center text-sm text-pink-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(symptom.timestamp, 'MMM d, h:mm a')}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredSymptoms.length > 0 && (
        <Card className="bg-white/90 border-pink-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-800">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {filteredSymptoms.length}
                </div>
                <div className="text-sm text-zinc-400">Total Entries</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {filteredSymptoms.filter(s => s.trends === 'down').length}
                </div>
                <div className="text-sm text-zinc-400">Improving</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {filteredSymptoms.filter(s => s.trends === 'up').length}
                </div>
                <div className="text-sm text-zinc-400">Worsening</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {(filteredSymptoms.reduce((sum, s) => sum + s.severity, 0) / filteredSymptoms.length).toFixed(1)}
                </div>
                <div className="text-sm text-zinc-400">Avg Severity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}