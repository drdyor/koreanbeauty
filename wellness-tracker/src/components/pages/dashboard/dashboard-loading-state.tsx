import { cn } from '@/lib/utils';

export interface DashboardLoadingStateProps {
  className?: string;
}

export function DashboardLoadingState({
  className,
}: DashboardLoadingStateProps) {
  return (
    <div className={cn('p-8', className)}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-900">Dashboard</h1>
        <p className="text-sm text-purple-600/70 mt-1">Your wellness overview</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-sm border border-purple-100/50 rounded-2xl p-6 shadow-lg shadow-purple-200/20"
          >
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-24 bg-purple-200/50 rounded" />
              <div className="h-8 w-16 bg-purple-200/50 rounded" />
              <div className="h-3 w-32 bg-purple-100/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
