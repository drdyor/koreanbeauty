import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding/_layout')({
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #FFF5F7 0%, #FFE8EB 50%, #FFF5F7 100%)',
      }}
    >
      <div className="container mx-auto px-6 py-8">
        <Outlet />
      </div>
    </div>
  );
}