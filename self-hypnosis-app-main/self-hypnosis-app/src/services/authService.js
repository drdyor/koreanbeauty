// Authentication Service for Self-Hypnosis Behavioral Rewiring App
// Handles user authentication and subscription management

class AuthService {
  constructor() {
    this.baseURL = 'https://19hninc0jz8v.manus.space/api';
    this.token = localStorage.getItem('auth_token');
    this.user = null;
    this.subscriptionStatus = null;
    this.listeners = new Map();
  }

  // Initialize authentication service
  async initialize() {
    if (this.token) {
      try {
        await this.loadUserProfile();
      } catch (error) {
        console.error('Failed to load user profile:', error);
        this.logout();
      }
    }
  }

  // Register new user
  async register(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('auth_token', this.token);
      
      this.notifyListeners('auth:login', this.user);
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('auth_token', this.token);
      
      // Load subscription status
      await this.loadSubscriptionStatus();
      
      this.notifyListeners('auth:login', this.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  logout() {
    this.token = null;
    this.user = null;
    this.subscriptionStatus = null;
    localStorage.removeItem('auth_token');
    
    this.notifyListeners('auth:logout');
  }

  // Load user profile
  async loadUserProfile() {
    try {
      const response = await fetch(`${this.baseURL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load profile');
      }

      this.user = data.user;
      this.notifyListeners('auth:profile-updated', this.user);
      
      return data.user;
    } catch (error) {
      console.error('Profile loading error:', error);
      throw error;
    }
  }

  // Load subscription status
  async loadSubscriptionStatus() {
    try {
      const response = await fetch(`${this.baseURL}/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load subscription status');
      }

      this.subscriptionStatus = data;
      this.user = data.user; // Update user info
      
      this.notifyListeners('subscription:status-updated', data);
      
      return data;
    } catch (error) {
      console.error('Subscription status loading error:', error);
      throw error;
    }
  }

  // Start free trial
  async startTrial() {
    try {
      const response = await fetch(`${this.baseURL}/subscription/start-trial`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start trial');
      }

      this.user = data.user;
      await this.loadSubscriptionStatus();
      
      this.notifyListeners('subscription:trial-started', data);
      
      return data;
    } catch (error) {
      console.error('Trial start error:', error);
      throw error;
    }
  }

  // Create checkout session for subscription
  async createCheckoutSession(tier, billingPeriod = 'monthly') {
    try {
      const response = await fetch(`${this.baseURL}/subscription/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ tier, billing_period: billingPeriod }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      return data;
    } catch (error) {
      console.error('Checkout session creation error:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await fetch(`${this.baseURL}/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      this.user = data.user;
      await this.loadSubscriptionStatus();
      
      this.notifyListeners('subscription:cancelled', data);
      
      return data;
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      throw error;
    }
  }

  // Check feature access
  async checkFeatureAccess(featureName) {
    try {
      const response = await fetch(`${this.baseURL}/feature/check-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify({ feature_name: featureName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check feature access');
      }

      return data;
    } catch (error) {
      console.error('Feature access check error:', error);
      throw error;
    }
  }

  // Get usage analytics
  async getUsageAnalytics() {
    try {
      const response = await fetch(`${this.baseURL}/analytics/usage`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load usage analytics');
      }

      return data;
    } catch (error) {
      console.error('Usage analytics loading error:', error);
      throw error;
    }
  }

  // Helper methods for subscription status
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  isPremium() {
    return this.user?.is_premium || false;
  }

  isProfessional() {
    return this.user?.is_professional || false;
  }

  isOnTrial() {
    return this.user?.is_on_trial || false;
  }

  getSubscriptionTier() {
    return this.user?.subscription_tier || 'free';
  }

  getTrialEndsAt() {
    return this.user?.trial_ends_at ? new Date(this.user.trial_ends_at) : null;
  }

  getSubscriptionExpiresAt() {
    return this.user?.subscription_expires_at ? new Date(this.user.subscription_expires_at) : null;
  }

  // Feature access helpers
  canAccessFeature(featureName) {
    if (!this.subscriptionStatus) return false;
    
    const features = this.subscriptionStatus.features;
    const feature = features[featureName];
    
    return feature?.available || false;
  }

  getFeatureLimit(featureName) {
    if (!this.subscriptionStatus) return null;
    
    const features = this.subscriptionStatus.features;
    const feature = features[featureName];
    
    return feature?.limit || null;
  }

  // Event listeners
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in auth listener:', error);
        }
      });
    }
  }

  // Utility method to make authenticated requests
  async makeAuthenticatedRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...options, headers: defaultOptions.headers });
    
    if (response.status === 401) {
      // Token expired or invalid
      this.logout();
      throw new Error('Authentication required');
    }

    return response;
  }

  // Cleanup
  destroy() {
    this.listeners.clear();
    this.user = null;
    this.subscriptionStatus = null;
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;

