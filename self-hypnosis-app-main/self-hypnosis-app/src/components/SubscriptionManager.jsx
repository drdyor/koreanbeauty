import React, { useState, useEffect } from 'react';
import authService from '../services/authService.js';

const SubscriptionManager = () => {
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [usageAnalytics, setUsageAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();

    // Listen for subscription updates
    const handleSubscriptionUpdate = (data) => {
      setSubscriptionStatus(data);
      setUser(data.user);
    };

    authService.addEventListener('subscription:status-updated', handleSubscriptionUpdate);
    authService.addEventListener('subscription:trial-started', handleSubscriptionUpdate);
    authService.addEventListener('subscription:cancelled', handleSubscriptionUpdate);

    return () => {
      authService.removeEventListener('subscription:status-updated', handleSubscriptionUpdate);
      authService.removeEventListener('subscription:trial-started', handleSubscriptionUpdate);
      authService.removeEventListener('subscription:cancelled', handleSubscriptionUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [statusData, analyticsData] = await Promise.all([
        authService.loadSubscriptionStatus(),
        authService.getUsageAnalytics().catch(() => null) // Analytics might fail for free users
      ]);

      setSubscriptionStatus(statusData);
      setUser(statusData.user);
      setUsageAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (tier, billingPeriod = 'monthly') => {
    try {
      setIsProcessing(true);
      const checkoutData = await authService.createCheckoutSession(tier, billingPeriod);
      
      // Redirect to Stripe checkout
      window.location.href = checkoutData.checkout_url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      setIsProcessing(true);
      await authService.startTrial();
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error starting trial:', error);
      alert(error.message || 'Failed to start trial. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      setIsProcessing(true);
      await authService.cancelSubscription();
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Please log in to manage your subscription.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Current Subscription Status */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">Subscription Status</h2>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user.is_premium 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)}
            </span>
            {user.is_on_trial && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Trial
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-background rounded border">
            <div className="text-2xl font-bold text-foreground">
              {user.subscription_tier === 'free' ? 'Free' : 
               user.subscription_tier === 'premium' ? '$9.99' : '$29.99'}
            </div>
            <div className="text-sm text-muted-foreground">
              {user.subscription_tier === 'free' ? 'Plan' : 'per month'}
            </div>
          </div>

          <div className="text-center p-4 bg-background rounded border">
            <div className="text-2xl font-bold text-foreground">
              {user.is_on_trial ? 'Trial' : 
               user.subscription_status === 'active' ? 'Active' :
               user.subscription_status === 'canceled' ? 'Cancelled' : 'Inactive'}
            </div>
            <div className="text-sm text-muted-foreground">Status</div>
          </div>

          <div className="text-center p-4 bg-background rounded border">
            <div className="text-2xl font-bold text-foreground">
              {user.trial_ends_at && user.is_on_trial
                ? new Date(user.trial_ends_at).toLocaleDateString()
                : user.subscription_expires_at
                ? new Date(user.subscription_expires_at).toLocaleDateString()
                : 'N/A'
              }
            </div>
            <div className="text-sm text-muted-foreground">
              {user.is_on_trial ? 'Trial Ends' : 'Next Billing'}
            </div>
          </div>
        </div>

        {/* Trial notification */}
        {user.is_on_trial && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-blue-800">Free Trial Active</p>
                <p className="text-sm text-blue-600">
                  Your trial ends on {new Date(user.trial_ends_at).toLocaleDateString()}. 
                  Upgrade now to continue enjoying premium features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {user.subscription_tier === 'free' && !user.is_on_trial && !user.trial_used && (
            <button
              onClick={handleStartTrial}
              disabled={isProcessing}
              className="bg-gradient-to-r from-therapeutic-primary to-therapeutic-secondary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing ? 'Starting...' : 'Start 7-Day Free Trial'}
            </button>
          )}

          {(user.subscription_tier === 'free' || user.is_on_trial) && (
            <button
              onClick={() => handleUpgrade('premium')}
              disabled={isProcessing}
              className="bg-gradient-to-r from-gold-400 to-gold-600 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Upgrade to Premium'}
            </button>
          )}

          {user.subscription_tier === 'premium' && (
            <button
              onClick={() => handleUpgrade('professional')}
              disabled={isProcessing}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Upgrade to Professional'}
            </button>
          )}

          {user.is_premium && user.subscription_status === 'active' && (
            <button
              onClick={handleCancelSubscription}
              disabled={isProcessing}
              className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Cancel Subscription'}
            </button>
          )}
        </div>
      </div>

      {/* Feature Access Overview */}
      {subscriptionStatus?.features && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Feature Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(subscriptionStatus.features).map(([featureName, feature]) => (
              <div key={featureName} className="flex items-center justify-between p-3 bg-background rounded border">
                <div>
                  <div className="font-medium text-foreground capitalize">
                    {featureName.replace(/_/g, ' ')}
                  </div>
                  {feature.limit && (
                    <div className="text-sm text-muted-foreground">
                      Limit: {feature.limit}
                      {feature.used_this_month !== undefined && ` (Used: ${feature.used_this_month})`}
                      {feature.used_this_week !== undefined && ` (Used: ${feature.used_this_week})`}
                      {feature.daily_limit && ` minutes/day`}
                    </div>
                  )}
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  feature.available ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Analytics */}
      {usageAnalytics && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Usage Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-background rounded border">
              <div className="text-2xl font-bold text-foreground">
                {usageAnalytics.total_features_used}
              </div>
              <div className="text-sm text-muted-foreground">Features Used</div>
            </div>

            {usageAnalytics.subscription_value && (
              <>
                <div className="text-center p-4 bg-background rounded border">
                  <div className="text-2xl font-bold text-foreground">
                    {usageAnalytics.subscription_value.estimated_monthly_value}
                  </div>
                  <div className="text-sm text-muted-foreground">Estimated Value</div>
                </div>

                <div className="text-center p-4 bg-background rounded border">
                  <div className="text-2xl font-bold text-foreground">
                    {usageAnalytics.subscription_value.subscription_cost}
                  </div>
                  <div className="text-sm text-muted-foreground">Subscription Cost</div>
                </div>
              </>
            )}
          </div>

          {usageAnalytics.features && usageAnalytics.features.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Recent Feature Usage</h4>
              <div className="space-y-2">
                {usageAnalytics.features.slice(0, 5).map((usage, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                    <span className="text-sm font-medium">
                      {usage.feature_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{usage.usage_count} times</div>
                      <div className="text-xs text-muted-foreground">
                        Last used: {new Date(usage.last_used_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pricing Plans */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-xl font-bold text-foreground mb-4">Available Plans</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free Plan */}
          <div className="border rounded-lg p-4">
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold">Free</h4>
              <div className="text-2xl font-bold">$0</div>
              <div className="text-sm text-muted-foreground">Forever</div>
            </div>
            <ul className="text-sm space-y-2 mb-4">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                3 fear pattern analyses/month
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                2 audio sessions/week
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Basic light frequency (3 patterns)
              </li>
            </ul>
            {user.subscription_tier !== 'free' && (
              <div className="text-center text-sm text-muted-foreground">Current Plan</div>
            )}
          </div>

          {/* Premium Plan */}
          <div className={`border rounded-lg p-4 ${user.subscription_tier === 'premium' ? 'border-gold-400 bg-gold-50' : ''}`}>
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold">Premium</h4>
              <div className="text-2xl font-bold">$9.99</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
            <ul className="text-sm space-y-2 mb-4">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited everything
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced light frequency (12+ patterns)
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
                Encrypted notes
              </li>
            </ul>
            {user.subscription_tier === 'premium' ? (
              <div className="text-center text-sm text-green-600 font-medium">Current Plan</div>
            ) : (
              <button
                onClick={() => handleUpgrade('premium')}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-white py-2 px-4 rounded font-semibold hover:opacity-90 disabled:opacity-50"
              >
                Upgrade
              </button>
            )}
          </div>

          {/* Professional Plan */}
          <div className={`border rounded-lg p-4 ${user.subscription_tier === 'professional' ? 'border-purple-400 bg-purple-50' : ''}`}>
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold">Professional</h4>
              <div className="text-2xl font-bold">$29.99</div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
            <ul className="text-sm space-y-2 mb-4">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Everything in Premium
              </li>
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
                API access
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
            </ul>
            {user.subscription_tier === 'professional' ? (
              <div className="text-center text-sm text-purple-600 font-medium">Current Plan</div>
            ) : (
              <button
                onClick={() => handleUpgrade('professional')}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 px-4 rounded font-semibold hover:opacity-90 disabled:opacity-50"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;

