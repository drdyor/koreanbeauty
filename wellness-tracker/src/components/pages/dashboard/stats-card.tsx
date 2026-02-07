import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { NumberTicker } from '@/components/ui/number-ticker';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  description: string;
  icon: LucideIcon;
  growth?: number;
  decimalPlaces?: number;
  className?: string;
}

export function StatsCard({
  title,
  value,
  suffix,
  description,
  icon: Icon,
  growth,
  decimalPlaces = 0,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-white/70 backdrop-blur-sm border border-purple-100/50 rounded-2xl p-5',
        'shadow-lg shadow-purple-200/20 hover:shadow-xl hover:shadow-purple-200/30',
        'transition-all duration-300 group',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-purple-700">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-purple-100/80 flex items-center justify-center">
          <Icon className="h-4 w-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
        </div>
      </div>
      <div className="text-2xl font-bold text-purple-900">
        <NumberTicker
          value={value}
          decimalPlaces={decimalPlaces}
          className="text-purple-900"
        />
        {suffix && <span className="text-purple-400 ml-0.5">{suffix}</span>}
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-purple-500/70">{description}</p>
        {growth !== undefined && (
          <div
            className={cn(
              'flex items-center text-xs font-medium',
              growth >= 0 ? 'text-emerald-500' : 'text-pink-500'
            )}
          >
            {growth >= 0 ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            <span>{Math.abs(growth).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
