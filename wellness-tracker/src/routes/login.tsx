import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { isAuthenticated } from '@/lib/auth/session';
import { ArrowRight, Mail, Lock, Sparkles } from 'lucide-react';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: () => {
    if (typeof window !== 'undefined' && isAuthenticated()) {
      throw redirect({ to: '/users' });
    }
  },
});

function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-purple-300/30 rounded-full blur-[80px]" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-300/30 rounded-full blur-[80px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/20 rounded-full blur-[100px]" />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-200/40 border border-white/50 p-8 sm:p-10">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-300/40">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-purple-800 text-2xl">GlowChi</span>
              <p className="text-xs text-purple-500">Wellness Tracker</p>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-purple-900 mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-purple-600/70">
              Sign in to continue your wellness journey
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-purple-700"
              >
                Email address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-purple-50/50 border border-purple-200/50 rounded-xl px-4 py-3 text-sm text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 transition-all"
                  placeholder="you@example.com"
                  required
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-purple-700"
              >
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-purple-50/50 border border-purple-200/50 rounded-xl px-4 py-3 text-sm text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-300 transition-all"
                  placeholder="••••••••"
                  required
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm py-3 rounded-xl transition-all hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 shadow-lg shadow-purple-300/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-purple-400 mt-8">
            Your wellness journey starts here
          </p>
        </div>
      </div>
    </div>
  );
}
