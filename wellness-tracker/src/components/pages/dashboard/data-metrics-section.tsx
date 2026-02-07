import { cn } from '@/lib/utils';

export interface SeriesTypeMetric {
  series_type: string;
  count: number;
}

export interface WorkoutTypeMetric {
  workout_type: string | null;
  count: number;
}

export interface DataMetricsSectionProps {
  topSeriesTypes: SeriesTypeMetric[];
  topWorkoutTypes: WorkoutTypeMetric[];
  className?: string;
}

export function DataMetricsSection({
  topSeriesTypes,
  topWorkoutTypes,
  className,
}: DataMetricsSectionProps) {
  return (
    <div
      className={cn(
        'bg-white/70 backdrop-blur-sm border border-purple-100/50 rounded-2xl overflow-hidden shadow-lg shadow-purple-200/20',
        className
      )}
    >
      <div className="px-6 py-4 border-b border-purple-100/50 bg-purple-50/30">
        <h2 className="text-sm font-semibold text-purple-800">Data Points Metrics</h2>
        <p className="text-xs text-purple-500/70 mt-1">
          Breakdown by series type and workout type
        </p>
      </div>
      <div className="p-6 space-y-6">
        {/* Top Series Types */}
        <div>
          <h3 className="text-xs font-medium text-purple-600 mb-3">
            Top Series Types
          </h3>
          <div className="space-y-2.5">
            {topSeriesTypes.length > 0 ? (
              topSeriesTypes.map((metric, index) => (
                <div
                  key={metric.series_type}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-400 w-4">
                      {index + 1}.
                    </span>
                    <span className="text-sm text-purple-700 capitalize">
                      {metric.series_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-purple-800">
                    {metric.count.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-purple-400">No data available</p>
            )}
          </div>
        </div>

        {/* Top Workout Types */}
        <div>
          <h3 className="text-xs font-medium text-purple-600 mb-3">
            Top Workout Types
          </h3>
          <div className="space-y-2.5">
            {topWorkoutTypes.length > 0 ? (
              topWorkoutTypes.map((metric, index) => (
                <div
                  key={metric.workout_type || 'unknown'}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-400 w-4">
                      {index + 1}.
                    </span>
                    <span className="text-sm text-purple-700">
                      {metric.workout_type || 'Unknown'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-purple-800">
                    {metric.count.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-purple-400">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
