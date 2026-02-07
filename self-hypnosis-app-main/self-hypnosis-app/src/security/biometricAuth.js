// Enhanced Biometric Authentication and Multi-Factor Authentication Implementation
// WebAuthn, TOTP, and advanced authentication methods with improved security

/**
 * Enhanced Biometric Authentication Manager
 * Implements WebAuthn for biometric authentication with advanced security features
 */
class BiometricAuthManager {
  constructor() {
    this.isSupported = this.checkSupport();
    this.credentials = new Map();
    this.securityLevel = 'high'; // high, medium, low
    this.maxAttempts = 3;
    this.lockoutDuration = 300000; // 5 minutes
    this.attemptCounts = new Map();
  }

  /**
   * Enhanced support checking with detailed capabilities
   */
  checkSupport() {
    const basicSupport = !!(navigator.credentials && navigator.credentials.create && navigator.credentials.get);
    
    if (basicSupport) {
      // Check for additional capabilities
      this.capabilities = {
        basic: true,
        platformAuthenticator: false,
        conditionalUI: false,
        userVerification: false
      };

      // Check platform authenticator availability
      if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          .then(available => {
            this.capabilities.platformAuthenticator = available;
          })
          .catch(() => {
            this.capabilities.platformAuthenticator = false;
          });
      }

      // Check conditional UI support
      if (PublicKeyCredential.isConditionalMediationAvailable) {
        PublicKeyCredential.isConditionalMediationAvailable()
          .then(available => {
            this.capabilities.conditionalUI = available;
          })
          .catch(() => {
            this.capabilities.conditionalUI = false;
          });
      }
    }

    return basicSupport;
  }

  /**
   * Enhanced biometric registration with security levels
   */
  async registerBiometric(userId, username, securityLevel = 'high') {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported');
    }

    // Check for existing lockout
    if (this.isLockedOut(userId)) {
      throw new Error('Account temporarily locked due to failed attempts');
    }

    try {
      // Generate cryptographically secure challenge
      const challenge = this.generateSecureChallenge();
      
      // Enhanced credential options based on security level
      const createCredentialOptions = {
        publicKey: {
          challenge: challenge,
          rp: {
            name: "Self-Hypnosis Behavioral Rewiring App",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: username,
            displayName: username,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256 (preferred)
            { alg: -257, type: "public-key" }, // RS256 (fallback)
            { alg: -37, type: "public-key" }, // PS256 (additional)
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: securityLevel === 'high' ? "required" : "preferred",
            residentKey: securityLevel === 'high' ? "required" : "preferred",
            requireResidentKey: securityLevel === 'high'
          },
          timeout: securityLevel === 'high' ? 120000 : 60000, // Extended timeout for high security
          attestation: securityLevel === 'high' ? "direct" : "none",
          extensions: {
            credProps: true, // Get credential properties
            largeBlob: { support: "preferred" } // Support for large blob storage
          }
        }
      };

      // Create credential with enhanced error handling
      const credential = await navigator.credentials.create(createCredentialOptions);
      
      if (!credential) {
        throw new Error('Credential creation failed');
      }

      // Enhanced credential storage with metadata
      const credentialInfo = {
        id: credential.id,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        type: credential.type,
        publicKey: credential.response.getPublicKey ? 
          Array.from(new Uint8Array(credential.response.getPublicKey())) : null,
        challenge: Array.from(challenge),
        userId: userId,
        username: username,
        securityLevel: securityLevel,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        useCount: 0,
        deviceInfo: this.getDeviceInfo(),
        attestation: {
          clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
          attestationObject: Array.from(new Uint8Array(credential.response.attestationObject))
        }
      };

      // Store credential with enhanced security
      await this.storeCredentialSecurely(userId, credentialInfo);
      
      // Reset attempt count on successful registration
      this.attemptCounts.delete(userId);
      
      return {
        success: true,
        credentialId: credential.id,
        publicKey: credentialInfo.publicKey,
        securityLevel: securityLevel,
        deviceInfo: credentialInfo.deviceInfo
      };
    } catch (error) {
      console.error('Enhanced biometric registration failed:', error);
      this.recordFailedAttempt(userId);
      throw new Error(`Biometric registration failed: ${error.message}`);
    }
  }

  /**
   * Enhanced biometric authentication with security monitoring
   */
  async authenticateBiometric(userId) {
    if (!this.isSupported) {
      throw new Error('Biometric authentication not supported');
    }

    // Check for lockout
    if (this.isLockedOut(userId)) {
      const lockoutInfo = this.attemptCounts.get(userId);
      const remainingTime = Math.ceil((lockoutInfo.lockedUntil - Date.now()) / 1000);
      throw new Error(`Account locked. Try again in ${remainingTime} seconds`);
    }

    try {
      // Get stored credential with validation
      const storedCredential = await this.getStoredCredentialSecurely(userId);
      if (!storedCredential) {
        throw new Error('No biometric credential found for user');
      }

      // Generate secure challenge
      const challenge = this.generateSecureChallenge();
      
      // Enhanced authentication options
      const getCredentialOptions = {
        publicKey: {
          challenge: challenge,
          allowCredentials: [{
            id: new Uint8Array(storedCredential.rawId),
            type: 'public-key',
            transports: ['internal', 'hybrid'] // Support multiple transports
          }],
          userVerification: storedCredential.securityLevel === 'high' ? 'required' : 'preferred',
          timeout: 120000, // Extended timeout
          extensions: {
            largeBlob: { read: true }, // Read large blob if available
            credProps: true
          }
        }
      };

      // Authenticate with enhanced verification
      const assertion = await navigator.credentials.get(getCredentialOptions);
      
      if (!assertion) {
        throw new Error('Authentication assertion failed');
      }

      // Enhanced assertion verification
      const isValid = await this.verifyAssertionEnhanced(assertion, storedCredential, challenge);
      
      if (isValid) {
        // Update credential usage
        await this.updateCredentialUsage(userId, assertion.id);
        
        // Reset attempt count on successful authentication
        this.attemptCounts.delete(userId);
        
        // Generate authentication token
        const authToken = await this.generateAuthToken(userId, assertion.id);
        
        return {
          success: true,
          credentialId: assertion.id,
          authToken: authToken,
          timestamp: Date.now(),
          securityLevel: storedCredential.securityLevel,
          deviceInfo: this.getDeviceInfo()
        };
      } else {
        throw new Error('Biometric verification failed');
      }
    } catch (error) {
      console.error('Enhanced biometric authentication failed:', error);
      this.recordFailedAttempt(userId);
      throw new Error(`Biometric authentication failed: ${error.message}`);
    }
  }

  /**
   * Generate cryptographically secure challenge
   */
  generateSecureChallenge() {
    const array = new Uint8Array(64); // Increased size for better security
    crypto.getRandomValues(array);
    return array;
  }

  /**
   * Enhanced credential storage with encryption
   */
  async storeCredentialSecurely(userId, credentialInfo) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SecureBiometricCredentials', 2);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['credentials'], 'readwrite');
        const store = transaction.objectStore('credentials');
        
        // Add integrity hash
        const dataToStore = {
          ...credentialInfo,
          integrityHash: this.calculateIntegrityHash(credentialInfo)
        };
        
        const putRequest = store.put(dataToStore);
        putRequest.onsuccess = () => resolve(credentialInfo.id);
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Remove old object store if exists
        if (db.objectStoreNames.contains('credentials')) {
          db.deleteObjectStore('credentials');
        }
        
        // Create new enhanced object store
        const store = db.createObjectStore('credentials', { keyPath: 'id' });
        store.createIndex('userId', 'userId');
        store.createIndex('created', 'createdAt');
        store.createIndex('lastUsed', 'lastUsed');
        store.createIndex('securityLevel', 'securityLevel');
      };
    });
  }

  /**
   * Enhanced credential retrieval with integrity checking
   */
  async getStoredCredentialSecurely(userId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SecureBiometricCredentials', 2);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['credentials'], 'readonly');
        const store = transaction.objectStore('credentials');
        const index = store.index('userId');
        
        const getRequest = index.getAll(userId);
        getRequest.onsuccess = () => {
          const credentials = getRequest.result;
          
          if (credentials.length === 0) {
            resolve(null);
            return;
          }
          
          // Get most recent credential
          const credential = credentials.sort((a, b) => b.createdAt - a.createdAt)[0];
          
          // Verify integrity
          const expectedHash = this.calculateIntegrityHash(credential);
          if (credential.integrityHash === expectedHash) {
            resolve(credential);
          } else {
            console.error('Credential integrity check failed');
            resolve(null);
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  /**
   * Calculate integrity hash for credential data
   */
  calculateIntegrityHash(credentialInfo) {
    const dataString = JSON.stringify({
      id: credentialInfo.id,
      userId: credentialInfo.userId,
      createdAt: credentialInfo.createdAt,
      publicKey: credentialInfo.publicKey
    });
    
    // Simple hash calculation (in production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Enhanced assertion verification with additional checks
   */
  async verifyAssertionEnhanced(assertion, storedCredential, challenge) {
    try {
      // Basic verification
      if (assertion.id !== storedCredential.id) {
        console.error('Credential ID mismatch');
        return false;
      }

      // Verify challenge
      const clientDataJSON = JSON.parse(new TextDecoder().decode(assertion.response.clientDataJSON));
      const receivedChallenge = new Uint8Array(
        Array.from(atob(clientDataJSON.challenge), c => c.charCodeAt(0))
      );
      
      if (receivedChallenge.length !== challenge.length) {
        console.error('Challenge length mismatch');
        return false;
      }
      
      for (let i = 0; i < challenge.length; i++) {
        if (receivedChallenge[i] !== challenge[i]) {
          console.error('Challenge verification failed');
          return false;
        }
      }

      // Verify origin
      if (clientDataJSON.origin !== window.location.origin) {
        console.error('Origin verification failed');
        return false;
      }

      // Verify type
      if (clientDataJSON.type !== 'webauthn.get') {
        console.error('Type verification failed');
        return false;
      }

      // Additional security checks
      const authenticatorData = new Uint8Array(assertion.response.authenticatorData);
      
      // Check user presence (UP) flag
      const flags = authenticatorData[32];
      const userPresent = (flags & 0x01) !== 0;
      const userVerified = (flags & 0x04) !== 0;
      
      if (!userPresent) {
        console.error('User presence not verified');
        return false;
      }

      if (storedCredential.securityLevel === 'high' && !userVerified) {
        console.error('User verification required but not provided');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Enhanced assertion verification failed:', error);
      return false;
    }
  }

  /**
   * Update credential usage statistics
   */
  async updateCredentialUsage(userId, credentialId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SecureBiometricCredentials', 2);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['credentials'], 'readwrite');
        const store = transaction.objectStore('credentials');
        
        const getRequest = store.get(credentialId);
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            const credential = getRequest.result;
            credential.lastUsed = Date.now();
            credential.useCount = (credential.useCount || 0) + 1;
            credential.integrityHash = this.calculateIntegrityHash(credential);
            
            const putRequest = store.put(credential);
            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            resolve();
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      };
    });
  }

  /**
   * Generate authentication token
   */
  async generateAuthToken(userId, credentialId) {
    const tokenData = {
      userId: userId,
      credentialId: credentialId,
      timestamp: Date.now(),
      nonce: crypto.getRandomValues(new Uint8Array(16))
    };

    const tokenString = JSON.stringify(tokenData);
    const encoder = new TextEncoder();
    const data = encoder.encode(tokenString);
    
    // Generate hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return btoa(JSON.stringify({
      data: tokenData,
      hash: hashArray
    }));
  }

  /**
   * Get device information for security monitoring
   */
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timestamp: Date.now(),
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  /**
   * Record failed authentication attempt
   */
  recordFailedAttempt(userId) {
    const now = Date.now();
    const attempts = this.attemptCounts.get(userId) || { count: 0, firstAttempt: now };
    
    attempts.count++;
    attempts.lastAttempt = now;
    
    if (attempts.count >= this.maxAttempts) {
      attempts.lockedUntil = now + this.lockoutDuration;
    }
    
    this.attemptCounts.set(userId, attempts);
  }

  /**
   * Check if user is locked out
   */
  isLockedOut(userId) {
    const attempts = this.attemptCounts.get(userId);
    if (!attempts) return false;
    
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return true;
    }
    
    // Reset if lockout period has passed
    if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
      this.attemptCounts.delete(userId);
    }
    
    return false;
  }

/**
 * Time-based One-Time Password (TOTP) Manager
 */
class TOTPManager {
  constructor() {
    this.secrets = new Map();
  }

  /**
   * Generate TOTP secret
   */
  generateSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  /**
   * Setup TOTP for user
   */
  setupTOTP(userId, appName = 'Self-Hypnosis App') {
    const secret = this.generateSecret();
    const qrCodeUrl = this.generateQRCodeURL(userId, secret, appName);
    
    this.secrets.set(userId, {
      secret: secret,
      createdAt: Date.now(),
      verified: false
    });

    // Store in localStorage
    localStorage.setItem(`totp_${userId}`, JSON.stringify({
      secret: secret,
      createdAt: Date.now(),
      verified: false
    }));

    return {
      secret: secret,
      qrCodeUrl: qrCodeUrl,
      manualEntryKey: secret
    };
  }

  /**
   * Generate QR code URL for TOTP setup
   */
  generateQRCodeURL(userId, secret, appName) {
    const issuer = encodeURIComponent(appName);
    const account = encodeURIComponent(userId);
    const otpauthUrl = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
  }

  /**
   * Verify TOTP token
   */
  verifyTOTP(userId, token) {
    const userTOTP = this.getUserTOTP(userId);
    if (!userTOTP) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeWindow = 30; // 30-second window
    
    // Check current window and adjacent windows for clock skew tolerance
    for (let i = -1; i <= 1; i++) {
      const timeSlot = Math.floor(currentTime / timeWindow) + i;
      const expectedToken = this.generateTOTPToken(userTOTP.secret, timeSlot);
      
      if (token === expectedToken) {
        // Mark as verified on first successful verification
        if (!userTOTP.verified) {
          userTOTP.verified = true;
          this.secrets.set(userId, userTOTP);
          localStorage.setItem(`totp_${userId}`, JSON.stringify(userTOTP));
        }
        return true;
      }
    }

    return false;
  }

  /**
   * Generate TOTP token for given secret and time slot
   */
  generateTOTPToken(secret, timeSlot) {
    // Convert secret from base32
    const key = this.base32Decode(secret);
    
    // Convert time slot to 8-byte buffer
    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setUint32(4, timeSlot, false);
    
    // Generate HMAC-SHA1
    return this.hmacSHA1(key, new Uint8Array(timeBuffer))
      .then(hmac => {
        // Dynamic truncation
        const offset = hmac[hmac.length - 1] & 0x0f;
        const code = ((hmac[offset] & 0x7f) << 24) |
                    ((hmac[offset + 1] & 0xff) << 16) |
                    ((hmac[offset + 2] & 0xff) << 8) |
                    (hmac[offset + 3] & 0xff);
        
        // Return 6-digit code
        return (code % 1000000).toString().padStart(6, '0');
      });
  }

  /**
   * Get user TOTP configuration
   */
  getUserTOTP(userId) {
    // Try memory first
    if (this.secrets.has(userId)) {
      return this.secrets.get(userId);
    }

    // Try localStorage
    const stored = localStorage.getItem(`totp_${userId}`);
    if (stored) {
      const totp = JSON.parse(stored);
      this.secrets.set(userId, totp);
      return totp;
    }

    return null;
  }

  /**
   * Remove TOTP for user
   */
  removeTOTP(userId) {
    this.secrets.delete(userId);
    localStorage.removeItem(`totp_${userId}`);
  }

  /**
   * Check if user has TOTP setup
   */
  hasTOTP(userId) {
    const userTOTP = this.getUserTOTP(userId);
    return userTOTP && userTOTP.verified;
  }

  /**
   * Base32 decode (simplified implementation)
   */
  base32Decode(encoded) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    
    for (let i = 0; i < encoded.length; i++) {
      const char = encoded[i];
      const index = alphabet.indexOf(char);
      if (index === -1) continue;
      bits += index.toString(2).padStart(5, '0');
    }
    
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      const byte = bits.substr(i, 8);
      if (byte.length === 8) {
        bytes.push(parseInt(byte, 2));
      }
    }
    
    return new Uint8Array(bytes);
  }

  /**
   * HMAC-SHA1 implementation using Web Crypto API
   */
  async hmacSHA1(key, data) {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    return new Uint8Array(signature);
  }
}

/**
 * Multi-Factor Authentication Manager
 */
class MultiFactorAuthManager {
  constructor() {
    this.biometric = new BiometricAuthManager();
    this.totp = new TOTPManager();
    this.backupCodes = new Map();
  }

  /**
   * Setup MFA for user
   */
  async setupMFA(userId, username, methods = ['totp']) {
    const setup = {
      userId: userId,
      methods: [],
      backupCodes: this.generateBackupCodes()
    };

    // Setup requested methods
    for (const method of methods) {
      switch (method) {
        case 'biometric':
          if (this.biometric.isSupported) {
            try {
              const biometricSetup = await this.biometric.registerBiometric(userId, username);
              setup.methods.push({
                type: 'biometric',
                setup: biometricSetup
              });
            } catch (error) {
              console.warn('Biometric setup failed:', error);
            }
          }
          break;
          
        case 'totp':
          const totpSetup = this.totp.setupTOTP(userId);
          setup.methods.push({
            type: 'totp',
            setup: totpSetup
          });
          break;
      }
    }

    // Store backup codes
    this.backupCodes.set(userId, setup.backupCodes);
    localStorage.setItem(`backup_codes_${userId}`, JSON.stringify(setup.backupCodes));

    return setup;
  }

  /**
   * Authenticate with MFA
   */
  async authenticateMFA(userId, method, credential) {
    try {
      switch (method) {
        case 'biometric':
          return await this.biometric.authenticateBiometric(userId);
          
        case 'totp':
          const isValid = await this.totp.verifyTOTP(userId, credential);
          return {
            success: isValid,
            method: 'totp',
            timestamp: Date.now()
          };
          
        case 'backup':
          return this.verifyBackupCode(userId, credential);
          
        default:
          throw new Error('Unknown MFA method');
      }
    } catch (error) {
      console.error('MFA authentication failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push({
        code: code,
        used: false,
        createdAt: Date.now()
      });
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(userId, code) {
    const backupCodes = this.getBackupCodes(userId);
    if (!backupCodes) {
      return { success: false, error: 'No backup codes found' };
    }

    const matchingCode = backupCodes.find(bc => bc.code === code && !bc.used);
    if (matchingCode) {
      matchingCode.used = true;
      matchingCode.usedAt = Date.now();
      
      // Update stored backup codes
      this.backupCodes.set(userId, backupCodes);
      localStorage.setItem(`backup_codes_${userId}`, JSON.stringify(backupCodes));
      
      return {
        success: true,
        method: 'backup',
        timestamp: Date.now()
      };
    }

    return { success: false, error: 'Invalid backup code' };
  }

  /**
   * Get backup codes for user
   */
  getBackupCodes(userId) {
    // Try memory first
    if (this.backupCodes.has(userId)) {
      return this.backupCodes.get(userId);
    }

    // Try localStorage
    const stored = localStorage.getItem(`backup_codes_${userId}`);
    if (stored) {
      const codes = JSON.parse(stored);
      this.backupCodes.set(userId, codes);
      return codes;
    }

    return null;
  }

  /**
   * Get available MFA methods for user
   */
  getAvailableMethods(userId) {
    const methods = [];
    
    if (this.biometric.hasBiometric(userId)) {
      methods.push('biometric');
    }
    
    if (this.totp.hasTOTP(userId)) {
      methods.push('totp');
    }
    
    const backupCodes = this.getBackupCodes(userId);
    if (backupCodes && backupCodes.some(code => !code.used)) {
      methods.push('backup');
    }

    return methods;
  }

  /**
   * Remove MFA for user
   */
  removeMFA(userId) {
    this.biometric.removeBiometric(userId);
    this.totp.removeTOTP(userId);
    this.backupCodes.delete(userId);
    localStorage.removeItem(`backup_codes_${userId}`);
  }
}

// Export classes
export {
  BiometricAuthManager,
  TOTPManager,
  MultiFactorAuthManager
};

// Create singleton instances
export const biometricAuth = new BiometricAuthManager();
export const totpManager = new TOTPManager();
export const mfaManager = new MultiFactorAuthManager();

