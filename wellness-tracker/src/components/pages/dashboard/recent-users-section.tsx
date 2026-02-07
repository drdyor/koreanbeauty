import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { UserRead } from '@/lib/api/types';

export interface RecentUsersSectionProps {
  users: UserRead[];
  totalUsersCount: number;
  isLoading?: boolean;
  className?: string;
}

export function RecentUsersSection({
  users,
  totalUsersCount,
  isLoading,
  className,
}: RecentUsersSectionProps) {
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-purple-100/80 to-pink-100/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl overflow-hidden shadow-lg shadow-purple-200/20',
        className
      )}
    >
      <div className="px-6 py-4 border-b border-purple-200/30">
        <h2 className="text-sm font-semibold text-purple-800">Recent Users</h2>
        <p className="text-xs text-purple-500/70 mt-1">
          Total users: {totalUsersCount}
        </p>
      </div>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 w-32 bg-purple-200/50 rounded mb-1" />
                <div className="h-3 w-48 bg-purple-200/30 rounded" />
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          users.map((user) => {
            const userName =
              user.first_name || user.last_name
                ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                : user.email || 'Unknown User';
            const date = new Date(user.created_at);
            const formattedDate = isNaN(date.getTime())
              ? 'Invalid date'
              : format(date, 'MMM d, yyyy');
            return (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    {userName}
                  </p>
                  <p className="text-xs text-purple-600/70">
                    {user.email || user.external_user_id || 'No email'}
                  </p>
                  <p className="text-xs text-purple-500/60 mt-0.5">
                    Created on {formattedDate}
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-[200px] text-purple-400">
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
