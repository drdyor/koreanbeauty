import { Watch, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserConnection } from '@/lib/api/types';

interface ConnectedDevicesProps {
  connections: UserConnection[];
  onConnect?: () => void;
  onSync?: (connectionId: string) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

const providerColors: Record<string, string> = {
  garmin: 'from-blue-400 to-blue-600',
  suunto: 'from-orange-400 to-orange-600',
  polar: 'from-red-400 to-red-600',
  apple: 'from-slate-600 to-slate-800',
  whoop: 'from-teal-400 to-teal-600',
};

export function ConnectedDevices({
  connections,
  onConnect,
  onSync,
}: ConnectedDevicesProps) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-purple-100/50 p-6 shadow-lg shadow-purple-200/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
            <Watch className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-purple-900">Connected Devices</h3>
        </div>
        {connections.length > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-medium">
            {connections.length}
          </span>
        )}
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
            <Watch className="h-8 w-8 text-purple-300" />
          </div>
          <p className="text-purple-400 mb-4">No devices connected</p>
          <Button
            variant="outline"
            onClick={onConnect}
            className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Connect a Device
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map((conn) => (
            <div
              key={conn.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 hover:from-purple-50 hover:to-pink-50 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${
                    providerColors[conn.provider || ''] || 'from-purple-400 to-purple-600'
                  }`}
                >
                  <Watch className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium capitalize text-purple-900">
                    {conn.provider || 'Unknown'}
                  </div>
                  <div className="text-xs text-purple-400">
                    {conn.last_synced_at
                      ? `Synced ${formatTimeAgo(conn.last_synced_at)}`
                      : 'Never synced'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    conn.status === 'active'
                      ? 'bg-violet-100 text-violet-600'
                      : 'bg-purple-50 text-purple-400'
                  }`}
                >
                  {conn.status}
                </span>
                {onSync && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-purple-400 hover:text-purple-600 hover:bg-purple-100"
                    onClick={() => onSync(conn.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {onConnect && (
            <Button
              variant="outline"
              className="w-full mt-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-xl"
              onClick={onConnect}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Device
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
