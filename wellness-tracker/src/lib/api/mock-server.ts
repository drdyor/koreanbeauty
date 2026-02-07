// Mock server for development - replace with real backend
export const mockData = {
  dashboard: {
    stats: {
      total_users: { count: 1234 },
      total_api_calls: { count: 56789 },
      data_points: {
        top_series_types: [
          { name: 'Heart Rate', count: 45000, color: '#00E5FF' },
          { name: 'Steps', count: 38000, color: '#FF33AA' },
          { name: 'Sleep', count: 32000, color: '#9933FF' },
        ],
        top_workout_types: [
          { name: 'Running', count: 1200, color: '#00E5FF' },
          { name: 'Cycling', count: 800, color: '#FF33AA' },
          { name: 'Walking', count: 600, color: '#9933FF' },
        ],
      },
    },
  },
  users: {
    list: {
      users: [
        { id: '1', email: 'user1@example.com', created_at: '2024-01-01T00:00:00Z' },
        { id: '2', email: 'user2@example.com', created_at: '2024-01-02T00:00:00Z' },
        { id: '3', email: 'user3@example.com', created_at: '2024-01-03T00:00:00Z' },
        { id: '4', email: 'user4@example.com', created_at: '2024-01-04T00:00:00Z' },
        { id: '5', email: 'user5@example.com', created_at: '2024-01-05T00:00:00Z' },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1234,
        hasMore: true,
      },
    },
  },
  wellness: {
    symptoms: [
      {
        id: '1',
        userId: 'dev-user-123',
        category: 'mental',
        symptomType: 'Anxiety',
        severity: 7,
        notes: 'Worse in the mornings, better after exercise',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        context: {
          weather: 'sunny',
          recentMeals: ['coffee', 'toast'],
          sleepQuality: 6,
          stressLevel: 8,
        }
      },
      {
        id: '2',
        userId: 'dev-user-123',
        category: 'physical',
        symptomType: 'Headache',
        severity: 4,
        notes: 'Started after coffee, helped by rest',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        context: {
          weather: 'cloudy',
          recentMeals: ['coffee', 'sandwich'],
          sleepQuality: 7,
          stressLevel: 5,
        }
      },
    ],
    medications: [
      {
        id: '1',
        userId: 'dev-user-123',
        name: 'Sertraline',
        dosage: '50mg',
        frequency: 'Once daily',
        startDate: new Date('2024-01-01'),
        purpose: 'Anxiety and depression',
        sideEffects: [
          {
            symptom: 'Nausea',
            severity: 'mild',
            date: new Date('2024-01-02'),
            notes: 'Morning only, subsides after eating'
          },
        ]
      }
    ],
    patterns: {
      correlations: [
        {
          id: '1',
          type: 'correlation',
          title: 'Anxiety peaks with caffeine',
          description: 'Your anxiety levels are 2.3x higher on days with 3+ caffeinated drinks',
          confidence: 0.85,
          relatedSymptoms: ['Anxiety'],
          timeframe: 'Last 30 days',
          actionable: true,
          suggestion: 'Try reducing caffeine intake to 2 drinks per day',
        },
      ],
      trends: [],
      predictions: [],
    },
    providers: [],
    dashboard: {
      todaysEntries: 3,
      activePatterns: 5,
      medicationsTracked: 2,
      weeklyEntries: 12,
    },
  },
};