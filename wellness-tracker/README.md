# Wellness Tracker

A comprehensive healthcare application for tracking symptoms, medications, and wellness patterns with AI-powered insights.

## 🏗️ Architecture

Built with modern full-stack architecture:
- **Frontend**: React 19 + TypeScript + TanStack Router
- **Backend**: TanStack Start (full-stack React)
- **Styling**: Tailwind CSS 4.0 + shadcn/ui
- **State**: TanStack Query + React Hook Form
- **Mobile**: Expo/React Native for iOS deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm
- Xcode (for iOS development)

### Installation

```bash
# Clone and install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env

# Start development server
pnpm run dev
```

Visit `http://localhost:3000` to see the app.

## 📱 iOS Development

### Setup Xcode Environment
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Configure for iOS development
npx expo install --fix
```

### Build for iOS
```bash
# Run on iOS simulator
npx expo run:ios

# Or build for device
npx expo build:ios
```

### App Store Deployment
```bash
# Build for production
npx expo build:ios --type archive

# Submit to App Store
npx expo submit --platform ios
```

## 🛠️ Development

### Project Structure
```
src/
├── routes/              # TanStack Router pages
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── pages/          # Feature components
│   └── common/         # Shared components
├── hooks/              # React Query hooks
├── lib/
│   ├── api/            # API client & services
│   ├── auth/           # Authentication
│   └── validation/     # Zod schemas
└── styles.css          # Global styles
```

### Environment Configuration

Create `.env` file:
```env
VITE_API_URL=http://localhost:8000
VITE_USE_MOCKS=true
VITE_DEV_TOOLS=true
```

### Available Scripts
```bash
pnpm run dev          # Start dev server
pnpm run build        # Production build
pnpm run test         # Run tests
pnpm run lint         # Lint code
pnpm run format       # Format code
```

## 🏥 Healthcare Features

### Symptom Tracking
- Multi-category symptom logging
- Severity ratings (1-10 scale)
- Context capture (weather, meals, sleep)
- Historical timeline view

### Medication Management
- Dosage and frequency tracking
- Side effect monitoring
- Adherence patterns
- Healthcare provider sharing

### AI-Powered Insights
- Pattern recognition
- Correlation analysis
- Predictive suggestions
- Wellness trend analysis

## 🔒 Security & Privacy

- HIPAA-compliant data handling
- End-to-end encryption
- Local data storage options
- Healthcare provider integration ready

## 📊 API Architecture

### Mock Development
- Environment-based mock switching
- Realistic test data
- API contract validation

### Production Ready
- RESTful API design
- Comprehensive error handling
- Rate limiting & caching
- Health data privacy compliance

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with TanStack ecosystem
- UI components from shadcn/ui
- Icons from Lucide React
- Healthcare insights powered by wellness science