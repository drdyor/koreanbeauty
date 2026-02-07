import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { SimpleSidebar } from '@/components/layout/simple-sidebar';
import { isAuthenticated } from '@/lib/auth/session';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: () => {
    // Temporarily disable auth check for debugging
    // Skip auth check during SSR - localStorage is not available on the server
    // The check will run on the client after hydration
    if (typeof window === 'undefined') {
      return;
    }
    // Temporarily disabled for debugging
    // if (!isAuthenticated()) {
    //   throw redirect({ to: '/login' });
    // }
  },
});

function AuthenticatedLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <SimpleSidebar />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-purple-50 via-pink-50/50 to-purple-100/30">
        <Outlet />
      </main>
    </div>
  );
}
