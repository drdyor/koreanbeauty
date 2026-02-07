import { Link, useLocation } from '@tanstack/react-router';
import {
  Home,
  Users,
  FileText,
  LogOut,
  Settings,
  ExternalLink,
  Heart,
  Sparkles,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

// Check if user is admin (you as the developer)
function isAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  const adminKey = localStorage.getItem('glowchi-admin');
  return adminKey === 'true';
}

// User-facing menu items
const userMenuItems = [
  {
    title: 'Home',
    url: '/',
    icon: Sparkles,
  },
  {
    title: 'Symptoms',
    url: '/symptoms',
    icon: Heart,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];

// Admin-only menu items
const adminMenuItems = [
  {
    title: 'Admin Dashboard',
    url: '/dashboard',
    icon: Shield,
  },
  {
    title: 'Manage Users',
    url: '/users',
    icon: Users,
  },
];

export function SimpleSidebar() {
  const location = useLocation();
  const { logout, isLoggingOut } = useAuth();
  const showAdmin = isAdmin();

  // Combine menu items based on admin status
  const menuItems = showAdmin
    ? [...userMenuItems, ...adminMenuItems]
    : userMenuItems;

  return (
    <aside className="relative w-64 bg-gradient-to-b from-purple-100 via-purple-50 to-pink-50 flex flex-col border-r border-purple-200/50">
      {/* Header */}
      <div className="p-4 border-b border-purple-200/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-purple-800 text-lg">GlowChi</span>
            <p className="text-xs text-purple-500">Wellness Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.url === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.url);

          return (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                isActive
                  ? 'bg-white/80 text-purple-800 shadow-md shadow-purple-200/50 border border-purple-200/50'
                  : 'text-purple-600/70 hover:bg-white/60 hover:text-purple-700'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  isActive ? 'text-purple-600' : 'text-purple-400'
                )}
              />
              <span className={isActive ? 'font-medium' : ''}>{item.title}</span>
            </Link>
          );
        })}

        {/* Admin toggle for you (hidden unless already admin) */}
        {!showAdmin && (
          <button
            onClick={() => {
              const password = prompt('Admin access code:');
              if (password === 'glowchi2026') {
                localStorage.setItem('glowchi-admin', 'true');
                window.location.reload();
              }
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-purple-400/50 hover:text-purple-500 transition-all duration-200 mt-4"
          >
            <Shield className="h-4 w-4" />
            <span className="text-xs">Admin</span>
          </button>
        )}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-purple-200/50" />

      {/* Footer */}
      <div className="p-3">
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-purple-500/70 hover:bg-pink-100/50 hover:text-pink-600 transition-colors disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}
