import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The localStorage key
 * @param {*} initialValue - The initial value if no stored value exists
 * @returns {[*, function]} - [storedValue, setValue]
 */
export function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook for managing user profile data with localStorage persistence
 * @param {object} defaultProfile - Default user profile structure
 * @returns {[object, function, function]} - [userProfile, setUserProfile, updateProfile]
 */
export function useUserProfile(defaultProfile) {
  const [userProfile, setUserProfile] = useLocalStorage('userProfile', defaultProfile);

  // Helper function to update specific parts of the profile
  const updateProfile = (updates) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      ...updates
    }));
  };

  // Helper function to add a fear pattern
  const addFearPattern = (patternId) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      fearPatterns: [...new Set([...prevProfile.fearPatterns, patternId])]
    }));
  };

  // Helper function to remove a fear pattern
  const removeFearPattern = (patternId) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      fearPatterns: prevProfile.fearPatterns.filter(id => id !== patternId)
    }));
  };

  // Helper function to update progress for a specific pattern
  const updateProgress = (patternId, progress) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      progress: {
        ...prevProfile.progress,
        [patternId]: Math.max(0, Math.min(100, progress)) // Clamp between 0-100
      }
    }));
  };

  // Helper function to add session to history
  const addSessionToHistory = (sessionData) => {
    const session = {
      ...sessionData,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    setUserProfile(prevProfile => ({
      ...prevProfile,
      sessionHistory: [session, ...prevProfile.sessionHistory].slice(0, 50) // Keep last 50 sessions
    }));
  };

  return {
    userProfile,
    setUserProfile,
    updateProfile,
    addFearPattern,
    removeFearPattern,
    updateProgress,
    addSessionToHistory
  };
}

/**
 * Hook for managing app settings with localStorage persistence
 * @returns {[object, function]} - [settings, updateSettings]
 */
export function useAppSettings() {
  const defaultSettings = {
    theme: 'light',
    audioVolume: 0.5,
    sessionDuration: 30,
    preferredVoice: 'neutral',
    enableNotifications: true,
    autoSave: true,
    privacyMode: false
  };

  const [settings, setSettings] = useLocalStorage('appSettings', defaultSettings);

  const updateSettings = (newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  return [settings, updateSettings];
}

