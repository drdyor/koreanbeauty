import {
  createRootRouteWithContext,
  Outlet,
} from '@tanstack/react-router';
import { queryClient } from '@/lib/query/client';
import { Toaster } from '@/components/ui/sonner';
import '../styles.css';

export const Route = createRootRouteWithContext<{
  queryClient: typeof queryClient;
}>()({
  beforeLoad: async () => {
    // Development mode: auto-setup authentication and onboarding
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('ow_auth_token');
      const onboardingComplete = localStorage.getItem('onboarding-complete') === 'true';

      // Auto-setup for development
      if (!isAuthenticated) {
        localStorage.setItem('ow_auth_token', 'dev-token-123');
        localStorage.setItem('ow_developer_id', 'dev-user-123');
        localStorage.setItem('ow_session_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
      }

      if (!onboardingComplete) {
        localStorage.setItem('onboarding-complete', 'true');
      }
    }
  },

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Wellness Tracker',
      },
      {
        name: 'description',
        content:
          'Comprehensive wellness and symptom tracking for better health insights',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
      },
    ],
  }),

  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Page not found</p>
        <a href="/" className="text-primary hover:underline">
          Go back home
        </a>
      </div>
    </div>
  );
}
