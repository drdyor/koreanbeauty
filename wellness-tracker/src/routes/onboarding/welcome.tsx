import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const Route = createFileRoute('/onboarding/welcome')({
  component: WelcomeScreen,
});

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-8">
      {/* Animated Wellness Mascot */}
      <div className="w-48 h-48 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center shadow-lg">
        <div className="text-6xl">🌱</div>
      </div>

        <div className="space-y-6 max-w-md">
          <h1 className="text-3xl font-bold text-gray-800">
            Your wellness companion ✨
          </h1>

          <div className="space-y-4 text-lg text-gray-600">
            <p>🧠 Track what you notice about your mind</p>
            <p>💪 Monitor how your body feels</p>
            <p>📊 See patterns in your entries over time</p>
            <p>🤝 Keep records you can share when you want</p>
          </div>

          {/* Wellness Mascot Message */}
          <Card className="p-4 bg-white/90 shadow-md max-w-sm mx-auto">
            <p className="text-gray-700 italic text-center">
              "Hi! I'm here to help you keep track of what you notice.
              Your entries help you see patterns over time."
            </p>
          </Card>
        </div>

        <Button size="lg" className="px-8 py-4 text-lg">
          Get started
        </Button>

      {/* Progress Indicator */}
      <div className="flex space-x-2 mt-8">
        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}