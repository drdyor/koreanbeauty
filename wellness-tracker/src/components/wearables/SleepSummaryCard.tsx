import { Moon } from 'lucide-react';
import type { SleepSummary } from '@/lib/api/types';

interface SleepSummaryCardProps {
  sleepData: SleepSummary;
}

export function SleepSummaryCard({ sleepData }: SleepSummaryCardProps) {
  const durationMinutes = sleepData.duration_minutes || 0;
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const efficiency = sleepData.efficiency_percent || 0;

  const stages = sleepData.stages || {};
  const totalStageMinutes =
    (stages.deep_minutes || 0) +
    (stages.rem_minutes || 0) +
    (stages.light_minutes || 0) +
    (stages.awake_minutes || 0);

  const getStagePercent = (minutes: number | undefined) => {
    if (!minutes || !totalStageMinutes) return 0;
    return (minutes / totalStageMinutes) * 100;
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-purple-100/50 p-6 shadow-lg shadow-purple-200/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
          <Moon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-purple-900">Last Night's Sleep</h3>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-4xl font-bold text-purple-900">
            {hours}h {mins}m
          </div>
          <div className="text-sm text-purple-400">Total sleep</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            {efficiency.toFixed(0)}%
          </div>
          <div className="text-sm text-purple-400">Efficiency</div>
        </div>
      </div>

      {/* Sleep Stages Bar */}
      {totalStageMinutes > 0 && (
        <>
          <div className="h-4 rounded-full overflow-hidden flex mb-3 bg-purple-100/50">
            <div
              style={{ width: `${getStagePercent(stages.deep_minutes)}%` }}
              className="bg-gradient-to-r from-purple-700 to-violet-700"
              title={`Deep: ${stages.deep_minutes || 0}m`}
            />
            <div
              style={{ width: `${getStagePercent(stages.rem_minutes)}%` }}
              className="bg-gradient-to-r from-purple-500 to-violet-500"
              title={`REM: ${stages.rem_minutes || 0}m`}
            />
            <div
              style={{ width: `${getStagePercent(stages.light_minutes)}%` }}
              className="bg-purple-300"
              title={`Light: ${stages.light_minutes || 0}m`}
            />
            <div
              style={{ width: `${getStagePercent(stages.awake_minutes)}%` }}
              className="bg-pink-200"
              title={`Awake: ${stages.awake_minutes || 0}m`}
            />
          </div>

          {/* Stage Legend */}
          <div className="grid grid-cols-4 gap-2 text-xs text-purple-600">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-700 to-violet-700" />
              Deep {stages.deep_minutes || 0}m
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-violet-500" />
              REM {stages.rem_minutes || 0}m
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-300" />
              Light {stages.light_minutes || 0}m
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-pink-200" />
              Awake {stages.awake_minutes || 0}m
            </div>
          </div>
        </>
      )}

      {/* Additional metrics */}
      {(sleepData.avg_heart_rate_bpm || sleepData.avg_hrv_rmssd_ms) && (
        <div className="mt-5 pt-5 border-t border-purple-100/50 grid grid-cols-2 gap-4">
          {sleepData.avg_heart_rate_bpm && (
            <div>
              <div className="text-lg font-semibold text-purple-900">
                {sleepData.avg_heart_rate_bpm} bpm
              </div>
              <div className="text-xs text-purple-400">Avg Heart Rate</div>
            </div>
          )}
          {sleepData.avg_hrv_rmssd_ms && (
            <div>
              <div className="text-lg font-semibold text-purple-900">
                {sleepData.avg_hrv_rmssd_ms.toFixed(0)} ms
              </div>
              <div className="text-xs text-purple-400">Avg HRV</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
