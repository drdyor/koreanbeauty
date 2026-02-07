/**
 * API service for connecting to the Self-Hypnosis Behavioral Rewiring App backend
 * Handles all communication with the Flask backend including encryption/decryption
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Make HTTP request to backend
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.request('/health');
  }

  /**
   * Get therapeutic content
   */
  async getTherapeuticContent(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.content_type) params.append('content_type', filters.content_type);
    if (filters.difficulty_level) params.append('difficulty_level', filters.difficulty_level);
    if (filters.fear_patterns) params.append('fear_patterns', JSON.stringify(filters.fear_patterns));
    
    const queryString = params.toString();
    const endpoint = queryString ? `/therapy/content?${queryString}` : '/therapy/content';
    
    return this.request(endpoint);
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    return this.request(`/therapy/profile/${userId}`);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    return this.request(`/therapy/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Analyze fear patterns
   */
  async analyzeFearPatterns(fearData) {
    return this.request('/therapy/fear-analysis', {
      method: 'POST',
      body: JSON.stringify(fearData),
    });
  }

  /**
   * Create session history
   */
  async createSession(sessionData) {
    return this.request('/therapy/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  /**
   * Get session history
   */
  async getSessionHistory(userId, limit = 10) {
    return this.request(`/therapy/sessions/${userId}?limit=${limit}`);
  }

  /**
   * Create safety alert
   */
  async createSafetyAlert(alertData) {
    return this.request('/therapy/safety-alert', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  /**
   * Get progress analytics
   */
  async getProgressAnalytics(userId) {
    return this.request(`/therapy/progress/${userId}`);
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId) {
    return this.request(`/therapy/recommendations/${userId}`);
  }

  /**
   * Create or update CBT exercise
   */
  async saveCBTExercise(exerciseData) {
    return this.request('/therapy/cbt-exercise', {
      method: 'POST',
      body: JSON.stringify(exerciseData),
    });
  }

  /**
   * Create or update Cartesian reflection
   */
  async saveCartesianReflection(reflectionData) {
    return this.request('/therapy/cartesian-reflection', {
      method: 'POST',
      body: JSON.stringify(reflectionData),
    });
  }

  /**
   * Get CBT exercises for user
   */
  async getCBTExercises(userId) {
    return this.request(`/therapy/cbt-exercises/${userId}`);
  }

  /**
   * Get Cartesian reflections for user
   */
  async getCartesianReflections(userId) {
    return this.request(`/therapy/cartesian-reflections/${userId}`);
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService;

// Mock data for offline development/testing
export const mockData = {
  therapeuticContent: [
    {
      id: 1,
      content_type: 'affirmation',
      category: 'authority',
      title: 'Authority Confidence Affirmations',
      content: 'I interact with authority figures as equals in human dignity.\nI can respect position while maintaining my self-respect.\nAuthority figures are fellow human beings, not superior beings.\nI speak my truth clearly and respectfully to all people.\nI am safe to express my thoughts and opinions.\nMy voice matters and deserves to be heard.\nI can disagree respectfully without fear of retaliation.\nI trust my own judgment and inner wisdom.\nI am confident in my abilities and contributions.\nI release the need to seek approval from authority figures.',
      audio_url: '/audio/authority_confidence_affirmations.wav',
      duration: 5,
      fear_patterns: ['authority_fear', 'submission'],
      difficulty_level: 2,
      is_active: true
    },
    {
      id: 2,
      content_type: 'affirmation',
      category: 'sovereignty',
      title: 'Sovereignty Activation',
      content: 'I am sovereign and equal to all others in fundamental worth.\nMy inherent value is not determined by external authority.\nI respect authority while maintaining my personal dignity.\nI am neither above nor below any other human being.\nMy sovereignty is balanced with compassion and connection.\nI stand confidently in my truth while respecting others.\nAuthority is a role, not a measure of human value.\nI have the right to be heard and respected.\nI choose cooperation over submission or domination.\nMy worth is inherent and cannot be diminished by others.',
      audio_url: '/audio/sovereignty_activation.wav',
      duration: 4,
      fear_patterns: ['authority_fear', 'submission', 'control'],
      difficulty_level: 1,
      is_active: true
    },
    {
      id: 3,
      content_type: 'exercise',
      category: 'cbt',
      title: 'Authority Figure Thought Record',
      content: 'This exercise helps you identify and challenge negative thought patterns about authority figures.\n\nStep 1: Identify the Situation\nThink of a recent interaction with an authority figure that caused you stress or anxiety. Write down:\n- Who was involved?\n- What happened?\n- When and where did it occur?\n\nStep 2: Notice Your Emotions\nWhat emotions did you feel? Rate their intensity from 1-10:\n- Anxiety: ___/10\n- Fear: ___/10\n- Anger: ___/10\n- Shame: ___/10\n- Other: ___/10\n\nStep 3: Identify Your Thoughts\nWhat thoughts went through your mind? Common examples:\n- "They think I\'m incompetent"\n- "I\'m going to get in trouble"\n- "I don\'t belong here"\n- "They\'re judging me"\n\nStep 4: Examine the Evidence\nFor each negative thought, ask:\n- What evidence supports this thought?\n- What evidence contradicts it?\n- What would I tell a friend in this situation?\n\nStep 5: Develop Balanced Thoughts\nCreate more balanced, realistic thoughts:\n- "They may be focused on their own concerns"\n- "I have valuable contributions to make"\n- "One interaction doesn\'t define my worth"\n- "I can handle this situation"\n\nStep 6: Notice the Change\nHow do you feel now with these balanced thoughts? Rate your emotions again from 1-10.',
      duration: 20,
      fear_patterns: ['authority_fear', 'criticism', 'perfectionism'],
      difficulty_level: 3,
      is_active: true
    }
  ],
  
  userProfile: {
    id: 1,
    user_id: 1,
    fear_pattern_count: 3,
    session_count: 5,
    last_session_date: new Date().toISOString(),
    preferred_difficulty: 2
  },
  
  sessionHistory: [
    {
      id: 1,
      user_id: 1,
      session_type: 'wake_mode',
      module_used: 'fear_analysis',
      duration_minutes: 15,
      completion_status: 'completed',
      created_at: new Date().toISOString()
    }
  ]
};

