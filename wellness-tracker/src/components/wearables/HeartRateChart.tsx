import { Heart } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TimeSeriesSample } from '@/lib/api/types';

interface HeartRateChartProps {
  data: TimeSeriesSample[];
}

export function HeartRateChart({ data }: HeartRateChartProps) {
  const chartData = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    bpm: d.value,
  }));

  const avgBpm = data.length
    ? Math.round(data.reduce((acc, d) => acc + d.value, 0) / data.length)
    : 0;

  const maxBpm = data.length ? Math.max(...data.map((d) => d.value)) : 0;
  const minBpm = data.length ? Math.min(...data.map((d) => d.value)) : 0;

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-pink-100/50 p-6 shadow-lg shadow-pink-200/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-purple-900">Heart Rate</h3>
        </div>
        <span className="text-sm font-medium text-pink-500">
          Avg: {avgBpm} bpm
        </span>
      </div>

      {data.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="heartGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#a78bfa' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#a78bfa' }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(236, 72, 153, 0.2)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 16px rgba(147, 51, 234, 0.1)',
                }}
                labelStyle={{ color: '#7c3aed' }}
              />
              <Line
                type="monotone"
                dataKey="bpm"
                stroke="url(#heartGradient)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs text-purple-400 mt-3 px-1">
            <span>Min: {minBpm} bpm</span>
            <span>Max: {maxBpm} bpm</span>
          </div>
        </>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-purple-300">
          No heart rate data available
        </div>
      )}
    </div>
  );
}
