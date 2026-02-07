import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Sparkles, Heart, Brain, Moon, Utensils, Pill,
  Activity, Droplets, Camera, ChevronRight, ChevronLeft,
  Check, Shield, Smile, Zap, ThermometerSun
} from 'lucide-react';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

// Onboarding steps
type Step = 'welcome' | 'privacy' | 'personalize' | 'conditions' | 'tracking' | 'complete';

const welcomeSlides = [
  {
    illustration: '🌸',
    title: 'Your wellness journey starts here',
    subtitle: 'Track symptoms, mood, and habits all in one beautiful place',
    bullets: [
      'All health tracking in one app',
      'Spot patterns unique to you',
    ],
  },
  {
    illustration: '✨',
    title: 'Log entries in seconds',
    subtitle: 'Quick and easy tracking that fits your lifestyle',
    bullets: [
      'Record mood, symptoms, sleep & more',
      'Sync data from your wearables automatically',
    ],
  },
  {
    illustration: '💜',
    title: 'Discover your patterns',
    subtitle: 'Beautiful insights to help you understand your health',
    bullets: [
      'See correlations between habits and symptoms',
      'Share reports with your healthcare provider',
    ],
  },
];

const conditions = [
  'Anxiety', 'Depression', 'ADHD', 'Chronic Pain', 'Migraine', 'Fibromyalgia',
  'IBS', 'Insomnia', 'PCOS', 'Endometriosis', 'Thyroid issues', 'Allergies',
  'Chronic Fatigue', 'PMDD', 'Bipolar', 'Arthritis', 'Autoimmune', 'Skin condition',
  'Eating disorder', 'GERD', 'Diabetes', 'Heart condition', 'Other',
];

const trackingCategories = [
  { id: 'mood', icon: Smile, label: 'Mood', description: 'Track how you feel emotionally' },
  { id: 'symptoms', icon: ThermometerSun, label: 'Symptoms', description: 'Log physical symptoms' },
  { id: 'energy', icon: Zap, label: 'Energy', description: 'Monitor your energy levels' },
  { id: 'sleep', icon: Moon, label: 'Sleep', description: 'Track sleep quality & duration' },
  { id: 'pain', icon: Activity, label: 'Pain', description: 'Record pain levels & location' },
  { id: 'food', icon: Utensils, label: 'Food & Water', description: 'Log meals and hydration' },
  { id: 'medications', icon: Pill, label: 'Medications', description: 'Track meds & supplements' },
  { id: 'period', icon: Droplets, label: 'Period', description: 'Cycle tracking' },
  { id: 'photos', icon: Camera, label: 'Progress Photos', description: 'Visual progress tracking' },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  const [privacyConsent, setPrivacyConsent] = useState({ data: false, age: false, emails: false });
  const [motivation, setMotivation] = useState<'low' | 'moderate' | 'high' | null>(null);
  const [healthStatus, setHealthStatus] = useState<'healthy' | 'occasional' | 'chronic' | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedTracking, setSelectedTracking] = useState<string[]>(['mood', 'symptoms', 'energy', 'sleep']);

  const canProceedPrivacy = privacyConsent.data && privacyConsent.age;
  const canProceedPersonalize = motivation && healthStatus;

  // Map tracking category IDs to health contexts for the adaptive system
  const trackingToContextMap: Record<string, string> = {
    mood: 'focus_mental',
    symptoms: 'pain_discomfort',
    energy: 'energy_fatigue',
    sleep: 'sleep_rest',
    pain: 'pain_discomfort',
    food: 'food_reactions',
    medications: 'medications_supplements',
    period: 'cycle_rhythms',
    photos: 'open_tracking',
  };

  const savePreferences = () => {
    // Map selected tracking to health contexts
    const healthContexts = selectedTracking
      .map(id => trackingToContextMap[id])
      .filter(Boolean);

    // Save to localStorage
    const preferences = {
      healthContexts,
      selectedTracking,
      selectedConditions,
      motivation,
      healthStatus,
      onboardingComplete: true,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem('glowchi-preferences', JSON.stringify(preferences));
    localStorage.setItem('onboarding-complete', 'true');
  };

  const handleNext = () => {
    if (step === 'welcome') {
      if (welcomeIndex < welcomeSlides.length - 1) {
        setWelcomeIndex(welcomeIndex + 1);
      } else {
        setStep('privacy');
      }
    } else if (step === 'privacy' && canProceedPrivacy) {
      setStep('personalize');
    } else if (step === 'personalize' && canProceedPersonalize) {
      setStep('conditions');
    } else if (step === 'conditions') {
      setStep('tracking');
    } else if (step === 'tracking') {
      setStep('complete');
    } else if (step === 'complete') {
      savePreferences();
      navigate({ to: '/' });
    }
  };

  const handleBack = () => {
    if (step === 'welcome' && welcomeIndex > 0) {
      setWelcomeIndex(welcomeIndex - 1);
    } else if (step === 'privacy') {
      setStep('welcome');
      setWelcomeIndex(welcomeSlides.length - 1);
    } else if (step === 'personalize') {
      setStep('privacy');
    } else if (step === 'conditions') {
      setStep('personalize');
    } else if (step === 'tracking') {
      setStep('conditions');
    }
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleTracking = (id: string) => {
    setSelectedTracking(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  // Progress bar
  const getProgress = () => {
    const steps = ['welcome', 'privacy', 'personalize', 'conditions', 'tracking', 'complete'];
    const currentIndex = steps.indexOf(step);
    if (step === 'welcome') {
      return ((welcomeIndex + 1) / welcomeSlides.length) * (100 / steps.length);
    }
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-purple-100 flex flex-col">
      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div className="h-1.5 bg-purple-200/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-500"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Back Button */}
      {(step !== 'welcome' || welcomeIndex > 0) && step !== 'complete' && (
        <button
          onClick={handleBack}
          className="absolute top-16 left-4 p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-lg mx-auto w-full">

        {/* Welcome Slides */}
        {step === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-8xl mb-8 animate-float">{welcomeSlides[welcomeIndex].illustration}</div>
            <h1 className="text-2xl font-bold text-purple-900 mb-3">
              {welcomeSlides[welcomeIndex].title}
            </h1>
            <p className="text-purple-600/80 mb-8 max-w-sm">
              {welcomeSlides[welcomeIndex].subtitle}
            </p>
            <div className="space-y-3 text-left w-full max-w-sm">
              {welcomeSlides[welcomeIndex].bullets.map((bullet, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-purple-800">{bullet}</span>
                </div>
              ))}
            </div>
            {/* Dots */}
            <div className="flex gap-2 mt-8">
              {welcomeSlides.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === welcomeIndex ? 'w-6 bg-purple-500' : 'bg-purple-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Privacy Consent */}
        {step === 'privacy' && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-purple-900">Your privacy matters</h1>
                <p className="text-sm text-purple-600/70">Your data is safe and secure</p>
              </div>
            </div>

            <p className="text-purple-700 mb-6 leading-relaxed">
              Your data is encrypted and stored securely. You have full control and can export or delete it anytime.
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyConsent.data}
                  onChange={(e) => setPrivacyConsent({...privacyConsent, data: e.target.checked})}
                  className="w-5 h-5 rounded border-purple-300 text-purple-500 focus:ring-purple-400 mt-0.5"
                />
                <span className="text-purple-800 text-sm">
                  I understand my data protection rights and consent to my personal data being processed and stored.
                </span>
              </label>

              <label className="flex items-start gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyConsent.age}
                  onChange={(e) => setPrivacyConsent({...privacyConsent, age: e.target.checked})}
                  className="w-5 h-5 rounded border-purple-300 text-purple-500 focus:ring-purple-400 mt-0.5"
                />
                <span className="text-purple-800 text-sm">
                  I am 16 or older and agree to the terms and conditions.
                </span>
              </label>

              <label className="flex items-start gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyConsent.emails}
                  onChange={(e) => setPrivacyConsent({...privacyConsent, emails: e.target.checked})}
                  className="w-5 h-5 rounded border-purple-300 text-purple-500 focus:ring-purple-400 mt-0.5"
                />
                <span className="text-purple-800 text-sm">
                  Send me wellness tips and feature updates (optional)
                </span>
              </label>
            </div>

            <p className="text-xs text-purple-500/70 mt-auto">
              Note: GlowChi does not provide medical advice or diagnoses. Always consult a healthcare professional.
            </p>
          </div>
        )}

        {/* Personalize */}
        {step === 'personalize' && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-xl font-bold text-purple-900 mb-2">Tell us about yourself</h1>
            <p className="text-purple-600/70 mb-6">This helps us personalize your experience</p>

            {/* Motivation Level */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-purple-100/50 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-purple-800">Tracking motivation</h3>
              </div>
              <p className="text-sm text-purple-600/70 mb-4">How detailed do you want to track?</p>
              <div className="flex gap-2">
                {(['low', 'moderate', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setMotivation(level)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      motivation === level
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-300/40'
                        : 'bg-purple-100/50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Health Status */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-purple-100/50">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-pink-500" />
                <h3 className="font-semibold text-purple-800">Health status</h3>
              </div>
              <p className="text-sm text-purple-600/70 mb-4">Do you have ongoing health concerns?</p>
              <div className="space-y-2">
                {[
                  { value: 'healthy', label: 'Generally healthy', desc: 'Just optimizing my wellness' },
                  { value: 'occasional', label: 'Occasional issues', desc: 'Headaches, low energy, etc.' },
                  { value: 'chronic', label: 'Chronic condition', desc: 'Managing ongoing health needs' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setHealthStatus(option.value as typeof healthStatus)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      healthStatus === option.value
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-300/40'
                        : 'bg-purple-50/50 hover:bg-purple-100/50 text-purple-800'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className={`text-sm ${healthStatus === option.value ? 'text-purple-100' : 'text-purple-500'}`}>
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conditions */}
        {step === 'conditions' && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-xl font-bold text-purple-900 mb-2">Any conditions to track?</h1>
            <p className="text-purple-600/70 mb-6 text-sm">
              Select any that apply. This helps us suggest relevant symptoms. You can skip this.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {conditions.map((condition) => (
                <button
                  key={condition}
                  onClick={() => toggleCondition(condition)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedConditions.includes(condition)
                      ? 'bg-purple-500 text-white shadow-md shadow-purple-300/40'
                      : 'bg-white/70 text-purple-700 border border-purple-200/50 hover:border-purple-300'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tracking Categories */}
        {step === 'tracking' && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-xl font-bold text-purple-900 mb-2">What would you like to track?</h1>
            <p className="text-purple-600/70 mb-6 text-sm">
              You can change this anytime in settings
            </p>

            <div className="space-y-2 overflow-y-auto">
              {trackingCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleTracking(cat.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    selectedTracking.includes(cat.id)
                      ? 'bg-white/80 border-2 border-purple-400 shadow-md shadow-purple-200/30'
                      : 'bg-white/50 border-2 border-transparent hover:bg-white/70'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedTracking.includes(cat.id) ? 'bg-purple-100' : 'bg-purple-50'
                  }`}>
                    <cat.icon className={`w-5 h-5 ${
                      selectedTracking.includes(cat.id) ? 'text-purple-600' : 'text-purple-400'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${
                      selectedTracking.includes(cat.id) ? 'text-purple-900' : 'text-purple-700'
                    }`}>
                      {cat.label}
                    </div>
                    <div className="text-xs text-purple-500">{cat.description}</div>
                  </div>
                  {selectedTracking.includes(cat.id) && (
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-8xl mb-6 animate-float">🎉</div>
            <h1 className="text-2xl font-bold text-purple-900 mb-3">
              You're all set!
            </h1>
            <p className="text-purple-600/80 mb-8 max-w-sm">
              Welcome to GlowChi. Your wellness journey begins now.
            </p>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-300/40 mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="px-6 pb-8">
        <button
          onClick={handleNext}
          disabled={
            (step === 'privacy' && !canProceedPrivacy) ||
            (step === 'personalize' && !canProceedPersonalize)
          }
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-2xl
                     transition-all hover:from-purple-600 hover:to-pink-600
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-purple-300/40 flex items-center justify-center gap-2"
        >
          {step === 'complete' ? 'Start Tracking' : step === 'conditions' ? 'Continue' : 'Next'}
          <ChevronRight className="w-5 h-5" />
        </button>
        {step === 'conditions' && (
          <button
            onClick={() => setStep('tracking')}
            className="w-full text-purple-500 font-medium py-3 mt-2 hover:text-purple-600 transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
