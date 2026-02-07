// Deep Link Handler Service for Self-Hypnosis Behavioral Rewiring App
// Handles incoming deep links from MomentumFlow and other sources

class DeepLinkHandler {
  constructor() {
    this.listeners = new Map();
    this.isInitialized = false;
    this.pendingLinks = [];
  }

  // Initialize deep link handling
  initialize() {
    if (this.isInitialized) return;

    // Register custom protocol handler for web
    if ('serviceWorker' in navigator) {
      this.registerProtocolHandler();
    }

    // Listen for URL changes (for web-based deep links)
    window.addEventListener('hashchange', this.handleHashChange.bind(this));
    window.addEventListener('popstate', this.handlePopState.bind(this));

    // Check for initial deep link on page load
    this.checkInitialDeepLink();

    this.isInitialized = true;
    console.log('Deep Link Handler initialized');
  }

  // Register protocol handler for selfhypnosis:// scheme
  registerProtocolHandler() {
    try {
      if ('registerProtocolHandler' in navigator) {
        navigator.registerProtocolHandler(
          'selfhypnosis',
          window.location.origin + '/deeplink?url=%s',
          'Self-Hypnosis Behavioral Rewiring App'
        );
      }
    } catch (error) {
      console.warn('Protocol handler registration failed:', error);
    }
  }

  // Parse deep link URL and extract parameters
  parseDeepLink(url) {
    try {
      const urlObj = new URL(url.replace('selfhypnosis://', 'https://'));
      const action = urlObj.pathname.replace('/', '');
      const params = Object.fromEntries(urlObj.searchParams);
      
      return {
        action,
        params,
        isValid: true
      };
    } catch (error) {
      console.error('Failed to parse deep link:', error);
      return { isValid: false };
    }
  }

  // Handle different types of deep link actions
  async handleDeepLink(url) {
    const parsed = this.parseDeepLink(url);
    
    if (!parsed.isValid) {
      console.error('Invalid deep link:', url);
      return false;
    }

    const { action, params } = parsed;
    console.log('Handling deep link:', action, params);

    try {
      switch (action) {
        case 'open':
          return this.handleOpenApp(params);
        
        case 'habit/track':
          return this.handleHabitTracking(params);
        
        case 'session/start':
          return this.handleSessionStart(params);
        
        case 'progress/view':
          return this.handleProgressView(params);
        
        case 'sync/data':
          return this.handleDataSync(params);
        
        default:
          console.warn('Unknown deep link action:', action);
          return false;
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      return false;
    }
  }

  // Handle app opening
  handleOpenApp(params) {
    // Navigate to main app
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    
    // Trigger app focus/activation
    this.notifyListeners('app:open', params);
    return true;
  }

  // Handle habit tracking from MomentumFlow
  async handleHabitTracking(params) {
    const { id, status, source } = params;
    
    if (!id) {
      console.error('Habit ID required for tracking');
      return false;
    }

    // Import data sync service
    const { DataSyncService } = await import('./dataSyncService.js');
    const syncService = new DataSyncService();
    
    try {
      // Update habit status
      await syncService.updateHabitStatus(id, status === 'true', source);
      
      // Navigate to habits view
      this.notifyListeners('habit:track', { id, status, source });
      
      // Show success notification
      this.showNotification('Habit updated successfully', 'success');
      
      return true;
    } catch (error) {
      console.error('Failed to track habit:', error);
      this.showNotification('Failed to update habit', 'error');
      return false;
    }
  }

  // Handle therapy session start
  async handleSessionStart(params) {
    const { type, duration, source } = params;
    
    if (!type) {
      console.error('Session type required');
      return false;
    }

    // Validate session type
    const validTypes = ['hypnosis', 'meditation', 'cbt', 'somatic', 'polyvagal', 'ifs'];
    if (!validTypes.includes(type)) {
      console.error('Invalid session type:', type);
      return false;
    }

    // Navigate to appropriate session
    const sessionData = {
      type,
      duration: parseInt(duration) || 15,
      source: source || 'deeplink'
    };

    this.notifyListeners('session:start', sessionData);
    
    // Show session preparation notification
    this.showNotification(`Starting ${type} session`, 'info');
    
    return true;
  }

  // Handle progress view request
  async handleProgressView(params) {
    const { userId, timeframe } = params;
    
    // Navigate to progress view
    this.notifyListeners('progress:view', { userId, timeframe });
    
    return true;
  }

  // Handle data synchronization request
  async handleDataSync(params) {
    const { source, force } = params;
    
    // Import data sync service
    const { DataSyncService } = await import('./dataSyncService.js');
    const syncService = new DataSyncService();
    
    try {
      this.showNotification('Synchronizing data...', 'info');
      
      await syncService.syncWithMomentumFlow(force === 'true');
      
      this.notifyListeners('data:sync', { source, success: true });
      this.showNotification('Data synchronized successfully', 'success');
      
      return true;
    } catch (error) {
      console.error('Data sync failed:', error);
      this.showNotification('Data synchronization failed', 'error');
      return false;
    }
  }

  // Handle hash change events
  handleHashChange(event) {
    const hash = window.location.hash;
    if (hash.startsWith('#selfhypnosis://')) {
      const url = hash.substring(1);
      this.handleDeepLink(url);
    }
  }

  // Handle popstate events
  handlePopState(event) {
    if (event.state && event.state.deepLink) {
      this.handleDeepLink(event.state.deepLink);
    }
  }

  // Check for initial deep link on page load
  checkInitialDeepLink() {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const deepLinkUrl = urlParams.get('url');
    
    if (deepLinkUrl) {
      this.handleDeepLink(decodeURIComponent(deepLinkUrl));
    }

    // Check hash
    const hash = window.location.hash;
    if (hash.startsWith('#selfhypnosis://')) {
      const url = hash.substring(1);
      this.handleDeepLink(url);
    }
  }

  // Add event listener for deep link events
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in deep link listener:', error);
        }
      });
    }
  }

  // Generate deep link for MomentumFlow
  generateMomentumFlowLink(action, params = {}) {
    const baseUrl = 'momentumflow://';
    const paramString = new URLSearchParams(params).toString();
    return `${baseUrl}${action}${paramString ? '?' + paramString : ''}`;
  }

  // Open MomentumFlow app with deep link
  openMomentumFlow(action, params = {}) {
    const deepLink = this.generateMomentumFlowLink(action, params);
    
    try {
      // Try to open the deep link
      window.open(deepLink, '_blank');
      
      // Fallback: show instructions if app doesn't open
      setTimeout(() => {
        this.showNotification(
          'If MomentumFlow didn\'t open, please install the app first',
          'info'
        );
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Failed to open MomentumFlow:', error);
      this.showNotification('Failed to open MomentumFlow app', 'error');
      return false;
    }
  }

  // Show notification to user
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    `;

    // Set background color based on type
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  // Cleanup
  destroy() {
    window.removeEventListener('hashchange', this.handleHashChange.bind(this));
    window.removeEventListener('popstate', this.handlePopState.bind(this));
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Create singleton instance
const deepLinkHandler = new DeepLinkHandler();

export default deepLinkHandler;

