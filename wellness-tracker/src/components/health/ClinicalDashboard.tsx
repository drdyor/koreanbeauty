import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MedicalCard } from '@/components/visual';
import { Calendar, Heart, Pill, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ClinicalDashboardProps {
  onLogSymptom: () => void;
  onViewPatterns: () => void;
  onMedicationCheck: () => void;
  onProviderShare: () => void;
}

export function ClinicalDashboard({
  onLogSymptom,
  onViewPatterns,
  onMedicationCheck,
  onProviderShare
}: ClinicalDashboardProps) {
  const todaysDate = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="space-y-6">
      {/* Clinical Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clinical Dashboard</h1>
            <p className="text-gray-600 mt-1">{todaysDate}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-700 border-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              System Healthy
            </Badge>
          </div>
        </div>
      </div>

      {/* Critical Actions - Always Visible */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center text-lg">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Active Monitoring Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-red-700 text-sm">
              You have medications requiring attention and symptoms to document.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={onMedicationCheck}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <Pill className="h-4 w-4 mr-2" />
                Check Medications
              </Button>
              <Button
                onClick={onLogSymptom}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <Heart className="h-4 w-4 mr-2" />
                Log Symptoms
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-800 flex items-center text-lg">
              <Clock className="h-5 w-5 mr-2" />
              Healthcare Provider Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-blue-700 text-sm">
              Last shared: 3 days ago. Consider updating your healthcare provider.
            </p>
            <Button
              onClick={onProviderShare}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Share with Provider
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MedicalCard
          title="Today's Documentation"
          subtitle="Clinical entries recorded"
          icon={Calendar}
          severity="moderate"
          value="3"
          status="active"
        />

        <MedicalCard
          title="Medication Adherence"
          subtitle="This week"
          icon={Pill}
          severity="high"
          value="85%"
          status="active"
        />

        <MedicalCard
          title="Pattern Alerts"
          subtitle="Clinical insights"
          icon={TrendingUp}
          severity="moderate"
          value="2"
          status="pending"
        />

        <MedicalCard
          title="Provider Sync"
          subtitle="Last updated"
          icon={CheckCircle}
          severity="low"
          value="3d ago"
          status="active"
        />
      </div>

      {/* Recent Clinical Activity */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Recent Clinical Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MedicalCard
            title="Headache logged"
            subtitle="Severity: Moderate, Duration: 2 hours"
            icon={Heart}
            severity="moderate"
            timestamp="2 hours ago"
            status="active"
          />

          <MedicalCard
            title="Medication taken"
            subtitle="Sertraline 50mg - On schedule"
            icon={Pill}
            severity="low"
            timestamp="4 hours ago"
            status="active"
          />

          <MedicalCard
            title="Pattern detected"
            subtitle="Caffeine correlation with anxiety"
            icon={TrendingUp}
            severity="high"
            timestamp="1 day ago"
            status="pending"
          />
        </CardContent>
      </Card>

      {/* Primary Clinical Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button
          onClick={onLogSymptom}
          className="h-20 bg-blue-600 hover:bg-blue-700 text-white font-medium flex flex-col items-center justify-center"
        >
          <Heart className="h-6 w-6 mb-2" />
          <span className="text-sm">Document Symptoms</span>
          <span className="text-xs opacity-90">Clinical assessment</span>
        </Button>

        <Button
          onClick={onMedicationCheck}
          className="h-20 bg-green-600 hover:bg-green-700 text-white font-medium flex flex-col items-center justify-center"
        >
          <Pill className="h-6 w-6 mb-2" />
          <span className="text-sm">Medication Review</span>
          <span className="text-xs opacity-90">Adherence & effects</span>
        </Button>

        <Button
          onClick={onViewPatterns}
          className="h-20 bg-purple-600 hover:bg-purple-700 text-white font-medium flex flex-col items-center justify-center"
        >
          <TrendingUp className="h-6 w-6 mb-2" />
          <span className="text-sm">Clinical Insights</span>
          <span className="text-xs opacity-90">Pattern analysis</span>
        </Button>
      </div>
    </div>
  );
}