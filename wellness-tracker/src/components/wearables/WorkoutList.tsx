import { Activity, Flame, Clock, TrendingUp } from 'lucide-react';
import type { Workout } from '@/lib/api/types';

interface WorkoutListProps {
  workouts: Workout[];
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatWorkoutType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const workoutColors: Record<string, string> = {
  running: 'bg-gradient-to-r from-orange-100 to-pink-100 text-orange-600',
  cycling: 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600',
  swimming: 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-600',
  strength_training: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-600',
  yoga: 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600',
  walking: 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-600',
  hiking: 'bg-gradient-to-r from-fuchsia-100 to-pink-100 text-fuchsia-600',
  default: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600',
};

export function WorkoutList({ workouts }: WorkoutListProps) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-fuchsia-100/50 p-6 shadow-lg shadow-fuchsia-200/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-purple-900">Recent Workouts</h3>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-fuchsia-50 flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-fuchsia-300" />
          </div>
          <p className="text-purple-400">No workouts recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.slice(0, 5).map((workout) => (
            <div
              key={workout.id}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                    workoutColors[workout.type] || workoutColors.default
                  }`}
                >
                  {formatWorkoutType(workout.type)}
                </span>
                <span className="text-xs text-purple-400">
                  {formatDate(workout.start_time)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {workout.duration_seconds && (
                  <div className="flex items-center gap-1.5 text-purple-600">
                    <Clock className="h-3.5 w-3.5 text-purple-400" />
                    {formatDuration(workout.duration_seconds)}
                  </div>
                )}
                {workout.calories_kcal && (
                  <div className="flex items-center gap-1.5 text-pink-600">
                    <Flame className="h-3.5 w-3.5 text-pink-400" />
                    {workout.calories_kcal} kcal
                  </div>
                )}
                {workout.avg_heart_rate_bpm && (
                  <div className="flex items-center gap-1.5 text-fuchsia-600">
                    <TrendingUp className="h-3.5 w-3.5 text-fuchsia-400" />
                    {workout.avg_heart_rate_bpm} bpm
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
