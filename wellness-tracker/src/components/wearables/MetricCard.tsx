import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  variant?: 'default' | 'sleep' | 'heart' | 'activity';
}

const variantStyles = {
  default: 'bg-white/70 border-purple-100/50 backdrop-blur-sm',
  sleep: 'bg-gradient-to-br from-violet-50/80 to-purple-50/80 border-purple-200/50 backdrop-blur-sm',
  heart: 'bg-gradient-to-br from-pink-50/80 to-rose-50/80 border-pink-200/50 backdrop-blur-sm',
  activity: 'bg-gradient-to-br from-fuchsia-50/80 to-purple-50/80 border-fuchsia-200/50 backdrop-blur-sm',
};

const iconStyles = {
  default: 'text-purple-400',
  sleep: 'text-violet-500',
  heart: 'text-pink-500',
  activity: 'text-fuchsia-500',
};

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg hover:shadow-purple-200/30 hover:-translate-y-0.5',
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-purple-700/70">{title}</span>
        <Icon className={cn('h-5 w-5', iconStyles[variant])} />
      </div>
      <div className="text-3xl font-bold text-purple-900">
        {value}
        {unit && (
          <span className="text-sm font-normal text-purple-400 ml-1">
            {unit}
          </span>
        )}
      </div>
      {trend && trendValue && (
        <div
          className={cn(
            'text-xs mt-2 font-medium',
            trend === 'up' && 'text-violet-600',
            trend === 'down' && 'text-pink-600',
            trend === 'stable' && 'text-purple-400'
          )}
        >
          {trend === 'up' && '↑ '}
          {trend === 'down' && '↓ '}
          {trendValue}
        </div>
      )}
    </div>
  );
}
