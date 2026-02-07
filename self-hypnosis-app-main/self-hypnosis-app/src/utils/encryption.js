// Encryption utilities compatible with MomentumFlow Flutter app
// Uses Web Crypto API for AES encryption

class EncryptionUtils {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12; // 96 bits for GCM
  }

  // Convert string to ArrayBuffer
  stringToArrayBuffer(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }

  // Convert ArrayBuffer to string
  arrayBufferToString(buffer) {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }

  // Convert ArrayBuffer to base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Convert base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Derive key from password using PBKDF2 (compatible with Flutter implementation)
  async deriveKey(password, salt = null) {
    try {
      // Use provided salt or generate new one
      const saltBuffer = salt ? this.base64ToArrayBuffer(salt) : crypto.getRandomValues(new Uint8Array(16));
      
      // Import password as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        this.stringToArrayBuffer(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      // Derive key using PBKDF2 (100,000 iterations to match Flutter implementation)
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: this.algorithm,
          length: this.keyLength
        },
        false,
        ['encrypt', 'decrypt']
      );

      return {
        key,
        salt: this.arrayBufferToBase64(saltBuffer)
      };
    } catch (error) {
      console.error('Key derivation failed:', error);
      throw error;
    }
  }

  // Encrypt text using AES-GCM
  async encrypt(plaintext, password) {
    try {
      // Derive key from password
      const { key, salt } = await this.deriveKey(password);

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));

      // Encrypt the plaintext
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        this.stringToArrayBuffer(plaintext)
      );

      // Combine salt, IV, and encrypted data
      const result = {
        salt,
        iv: this.arrayBufferToBase64(iv),
        data: this.arrayBufferToBase64(encrypted)
      };

      // Return as base64-encoded JSON (compatible with Flutter)
      return btoa(JSON.stringify(result));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  // Decrypt text using AES-GCM
  async decrypt(encryptedData, password) {
    try {
      // Parse the encrypted data
      const parsed = JSON.parse(atob(encryptedData));
      const { salt, iv, data } = parsed;

      // Derive key from password and salt
      const { key } = await this.deriveKey(password, salt);

      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: this.base64ToArrayBuffer(iv)
        },
        key,
        this.base64ToArrayBuffer(data)
      );

      return this.arrayBufferToString(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  // Simple encrypt function for compatibility with existing code
  async simpleEncrypt(text, keyString) {
    try {
      // For compatibility with the simple key approach used in MomentumFlow
      // This uses a fixed salt and IV derivation for consistency
      const fixedSalt = 'selfhypnosis-salt-16bytes';
      const key = await crypto.subtle.importKey(
        'raw',
        this.stringToArrayBuffer(keyString.padEnd(32, '0').substring(0, 32)),
        { name: this.algorithm },
        false,
        ['encrypt']
      );

      // Use a deterministic IV for compatibility (not recommended for production)
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));

      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        this.stringToArrayBuffer(text)
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return this.arrayBufferToBase64(combined.buffer);
    } catch (error) {
      console.error('Simple encryption failed:', error);
      return text; // Fallback to plain text
    }
  }

  // Simple decrypt function for compatibility with existing code
  async simpleDecrypt(encryptedText, keyString) {
    try {
      const combined = this.base64ToArrayBuffer(encryptedText);
      const iv = combined.slice(0, this.ivLength);
      const data = combined.slice(this.ivLength);

      const key = await crypto.subtle.importKey(
        'raw',
        this.stringToArrayBuffer(keyString.padEnd(32, '0').substring(0, 32)),
        { name: this.algorithm },
        false,
        ['decrypt']
      );

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      );

      return this.arrayBufferToString(decrypted);
    } catch (error) {
      console.error('Simple decryption failed:', error);
      return encryptedText; // Fallback to encrypted text
    }
  }

  // Generate secure random key
  generateSecureKey(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return this.arrayBufferToBase64(array.buffer);
  }

  // Hash function for data integrity
  async hash(data) {
    try {
      const buffer = this.stringToArrayBuffer(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      return this.arrayBufferToBase64(hashBuffer);
    } catch (error) {
      console.error('Hashing failed:', error);
      throw error;
    }
  }

  // Verify data integrity
  async verifyHash(data, expectedHash) {
    try {
      const actualHash = await this.hash(data);
      return actualHash === expectedHash;
    } catch (error) {
      console.error('Hash verification failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const encryptionUtils = new EncryptionUtils();

// Export functions for compatibility
export const encrypt = (text, key) => encryptionUtils.simpleEncrypt(text, key);
export const decrypt = (encryptedText, key) => encryptionUtils.simpleDecrypt(encryptedText, key);
export const secureEncrypt = (text, password) => encryptionUtils.encrypt(text, password);
export const secureDecrypt = (encryptedText, password) => encryptionUtils.decrypt(encryptedText, password);
export const generateKey = (length) => encryptionUtils.generateSecureKey(length);
export const hash = (data) => encryptionUtils.hash(data);
export const verifyHash = (data, expectedHash) => encryptionUtils.verifyHash(data, expectedHash);

export default encryptionUtils;

