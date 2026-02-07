import { cn } from '@/lib/utils';

export interface DashboardErrorStateProps {
  onRetry: () => void;
  className?: string;
}

export function DashboardErrorState({
  onRetry,
  className,
}: DashboardErrorStateProps) {
  return (
    <div className={cn('p-8', className)}>
      <div className="bg-white/70 backdrop-blur-sm border border-purple-100/50 rounded-2xl p-12 text-center shadow-lg shadow-purple-200/20">
        <p className="text-purple-600 mb-4">
          Failed to load dashboard data. Please try again.
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-medium hover:bg-purple-600 transition-colors shadow-md shadow-purple-300/40"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
