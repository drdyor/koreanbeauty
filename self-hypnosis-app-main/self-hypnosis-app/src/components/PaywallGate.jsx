import React, { useState, useEffect } from 'react';
import authService from '../services/authService.js';

const PaywallGate = ({ 
  featureName, 
  children, 
  fallback = null, 
  showUpgradePrompt = true,
  customMessage = null 
}) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [featureData, setFeatureData] = useState(null);

  useEffect(() => {
    checkAccess();
  }, [featureName]);

  const checkAccess = async () => {
    if (!authService.isAuthenticated()) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await authService.checkFeatureAccess(featureName);
      setHasAccess(result.has_access);
      setFeatureData(result);
    } catch (error) {
      console.error('Error checking feature access:', error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasAccess) {
    return children;
  }

  // Show fallback if provided and no upgrade prompt requested
  if (fallback && !showUpgradePrompt) {
    return fallback;
  }

  // Show upgrade prompt
  return (
    <PaywallPrompt 
      featureName={featureName}
      featureData={featureData}
      customMessage={customMessage}
      fallback={fallback}
    />
  );
};

const PaywallPrompt = ({ featureName, featureData, customMessage, fallback }) => {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (tier = 'premium') => {
    try {
      setIsUpgrading(true);
      const checkoutData = await authService.createCheckoutSession(tier);
      
      // Redirect to Stripe checkout
      window.location.href = checkoutData.checkout_url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setIsUpgrading(true);
      await authService.startTrial();
      
      // Refresh the page to update access
      window.location.reload();
    } catch (error) {
      console.error('Error starting trial:', error);
      alert(error.message || 'Failed to start trial. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const getFeatureDisplayName = (name) => {
    const displayNames = {
      'fear_pattern_analysis_unlimited': 'Unlimited Fear Pattern Analysis',
      'audio_sessions_unlimited': 'Unlimited Audio Sessions',
      'light_frequency_advanced': 'Advanced Light Frequency Therapy',
      'momentum_flow_sync': 'MomentumFlow Integration',
      'encrypted_notes': 'Encrypted Notes',
      'streak_protection': 'Streak Protection',
      'biometric_monitoring': 'Biometric Monitoring',
      'api_access': 'API Access',
      'white_label': 'White Label Options'
    };
    
    return displayNames[name] || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isProfessionalFeature = featureData?.required_tier === 'professional';
  const canStartTrial = !authService.isAuthenticated() || (!authService.user?.trial_used && !authService.isPremium());

  return (
    <div className="relative">
      {/* Blurred content background */}
      {fallback && (
        <div className="filter blur-sm pointer-events-none opacity-50">
          {fallback}
        </div>
      )}
      
      {/* Paywall overlay */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card rounded-lg border shadow-lg max-w-md w-full p-6 text-center">
          {/* Lock icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-2">
            {isProfessionalFeature ? 'Professional Feature' : 'Premium Feature'}
          </h3>

          {/* Feature name */}
          <p className="text-lg text-muted-foreground mb-4">
            {getFeatureDisplayName(featureName)}
          </p>

          {/* Custom message or default */}
          <p className="text-sm text-muted-foreground mb-6">
            {customMessage || (
              isProfessionalFeature 
                ? 'This advanced feature is available with a Professional subscription.'
                : 'Unlock this feature and access the complete therapeutic experience with Premium.'
            )}
          </p>

          {/* Benefits list */}
          <div className="text-left mb-6">
            <h4 className="font-semibold text-foreground mb-2">
              {isProfessionalFeature ? 'Professional includes:' : 'Premium includes:'}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited therapeutic content
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced light frequency patterns
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                MomentumFlow integration
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Encrypted notes & data
              </li>
              {isProfessionalFeature && (
                <>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    HIPAA-compliant security
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    API access & integrations
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {/* Free trial button */}
            {canStartTrial && !isProfessionalFeature && (
              <button
                onClick={handleStartTrial}
                disabled={isUpgrading}
                className="w-full bg-gradient-to-r from-therapeutic-primary to-therapeutic-secondary text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isUpgrading ? 'Starting Trial...' : 'Start 7-Day Free Trial'}
              </button>
            )}

            {/* Upgrade button */}
            <button
              onClick={() => handleUpgrade(isProfessionalFeature ? 'professional' : 'premium')}
              disabled={isUpgrading}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isUpgrading ? 'Processing...' : (
                isProfessionalFeature 
                  ? 'Upgrade to Professional - $29.99/month'
                  : 'Upgrade to Premium - $9.99/month'
              )}
            </button>

            {/* Login prompt for unauthenticated users */}
            {!authService.isAuthenticated() && (
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <button 
                  className="text-primary hover:underline"
                  onClick={() => {
                    // This would trigger a login modal or redirect
                    window.location.href = '/login';
                  }}
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Pricing note */}
          <p className="text-xs text-muted-foreground mt-4">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </div>
    </div>
  );
};

// Higher-order component for easy feature gating
export const withPaywall = (featureName, options = {}) => {
  return (WrappedComponent) => {
    return (props) => (
      <PaywallGate 
        featureName={featureName} 
        {...options}
      >
        <WrappedComponent {...props} />
      </PaywallGate>
    );
  };
};

// Hook for checking feature access
export const useFeatureAccess = (featureName) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [featureData, setFeatureData] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!authService.isAuthenticated()) {
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await authService.checkFeatureAccess(featureName);
        setHasAccess(result.has_access);
        setFeatureData(result);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();

    // Listen for subscription changes
    const handleSubscriptionUpdate = () => {
      checkAccess();
    };

    authService.addEventListener('subscription:status-updated', handleSubscriptionUpdate);
    authService.addEventListener('subscription:trial-started', handleSubscriptionUpdate);

    return () => {
      authService.removeEventListener('subscription:status-updated', handleSubscriptionUpdate);
      authService.removeEventListener('subscription:trial-started', handleSubscriptionUpdate);
    };
  }, [featureName]);

  return { hasAccess, isLoading, featureData };
};

export default PaywallGate;

