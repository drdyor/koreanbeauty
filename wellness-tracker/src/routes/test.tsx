import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/test')({
  component: TestPage,
});

function TestPage() {
  return (
    <div>
      <h1>Test Route</h1>
      <p>This should work!</p>
    </div>
  );
}