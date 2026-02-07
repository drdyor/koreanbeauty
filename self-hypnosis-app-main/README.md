# Self-Hypnosis Behavioral Rewiring App

## Overview

This is a comprehensive therapeutic application designed to help users overcome various psychological challenges, including brain damage, PTSD, anxiety, and irrational fears. It integrates advanced methodologies from Chase Hughes, Cognitive Behavioral Therapy (CBT), Somatic Experiencing, Polyvagal Theory, Internal Family Systems (IFS), and Cartesian philosophical inquiry. The app aims to empower users to recognize their sovereign nature through guided self-hypnosis, light frequency therapy, audio therapy, and interactive behavioral rewiring modules.

## Features

### Core Therapeutic Modules
- **Fear Pattern Analysis**: Utilizes Chase Hughes' Behavioral Table of Elements to identify and rewire fear-based patterns.
- **Somatic Experiencing**: Guided exercises to release trauma and regulate the nervous system.
- **Polyvagal Theory Practices**: Techniques to enhance vagal tone and promote emotional regulation.
- **Internal Family Systems (IFS) Journaling**: Self-exploration tools to understand and integrate internal parts.
- **Cognitive Behavioral Therapy (CBT)**: Exercises to challenge and reframe negative thought patterns.
- **Cartesian Philosophical Inquiry**: Promotes critical thinking and self-reflection.

### Advanced Therapy Modalities
- **Light Frequency Therapy**: Utilizes specific light frequencies to influence brain states and promote healing.
- **Audio Therapy**: Personalized subliminal affirmations, binaural beats, and Rife healing frequencies for deep subconscious programming.
- **Enhanced Sleep Mode**: Features for delta wave deep sleep induction and subconscious reprogramming.
- **Enhanced Wake Mode**: Tools for conscious behavioral rewiring and active engagement.

### Gamification & Motivation (Dopamine Chart)
- **Achievement Dashboard**: Track total points, achievements, completed goals, and current streaks.
- **Goal Management**: Set and track personal, therapeutic, health, learning, social, creative, and professional goals with progress visualization.
- **Achievement System**: Earn points and badges for milestones and goal completion.
- **Motivation Trend**: Visualize weekly activity and motivation levels.

### Paywall & Subscription System
- **Three-Tier Model**: Free, Premium ($9.99/mo), and Professional ($29.99/mo) subscription tiers.
- **Stripe Integration**: Secure payment processing for subscriptions.
- **Feature Gating**: Access control based on subscription level.
- **Subscription Management**: User dashboard to manage plans.

### Security & Privacy
- **HIPAA-Grade Data Protection**: Ensures the highest standards for medical and mental health data privacy.
- **JWT Authentication**: Secure user authentication.
- **End-to-End Encryption**: For sensitive user data.

### Integration
- **Deep Linking**: Planned integration with MomentumFlow Flutter application for seamless user experience.

## Technical Stack

- **Frontend**: React.js (Vite), HTML, CSS (TailwindCSS/Custom CSS), Recharts (for data visualization)
- **Backend**: Flask (Python), SQLAlchemy, Flask-CORS, PyJWT, python-dotenv
- **Database**: SQLite (default, easily upgradeable to PostgreSQL for production)
- **Payment Gateway**: Stripe

## Project Structure

```
. (root)
├── self-hypnosis-app/             # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/           # React components (e.g., DopamineChart.jsx, PaywallGate.jsx)
│   │   ├── services/             # API services, deep linking, data sync
│   │   ├── utils/                # Utility functions
│   │   ├── styles/               # CSS files
│   │   ├── App.jsx               # Main application component
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── self-hypnosis-backend/         # Backend Flask API
│   ├── src/
│   │   ├── models/               # Database models (e.g., subscription.py, dopamine_chart.py)
│   │   ├── routes/               # API endpoints (e.g., user.py, subscription.py, dopamine_chart.py)
│   │   ├── utils/                # Backend utilities
│   │   └── main.py               # Flask application entry point
│   ├── venv/                     # Python virtual environment
│   ├── requirements.txt
│   └── .env                      # Environment variables (local/production)
├── DEPLOYMENT_GUIDE.md           # Comprehensive guide for self-hosting
├── STRIPE_SETUP_GUIDE.md         # Detailed Stripe configuration instructions
├── production.env.template       # Template for production environment variables
├── deploy.sh                     # Automated deployment script for Linux servers
├── DELIVERY_SUMMARY.md           # Summary of the complete delivery package
├── DOPAMINE_CHART_FEATURE_SUMMARY.md # Summary of the Dopamine Chart feature
└── README.md (this file)
```

## Getting Started (Self-Hosting)

This project is designed for self-hosting to give you complete control over your application, data, and payment processing. A detailed `DEPLOYMENT_GUIDE.md` and an automated `deploy.sh` script are provided.

### Prerequisites
- A Linux server (e.g., Ubuntu 20.04+) with Python 3.11+, Node.js 18+, Nginx.
- Your own Stripe account (for live API keys and webhook setup).
- A domain name for your application.

### Manual Setup (Recommended if `deploy.sh` fails or for custom environments)

1.  **Clone the repository or extract the package:**
    ```bash
    git clone <your-github-repo-url>
    # OR extract self-hypnosis-app-complete-deployment.tar.gz
    ```

2.  **Frontend `.gitignore` (create manually in `self-hypnosis-app/`):**
    ```
    # dependencies
    /node_modules
    /.pnp
    .pnp.js

    # testing
    /coverage

    # production
    /build

    # misc
    .DS_Store
    .env
    .env.local
    .env.development.local
    .env.test.local
    .env.production.local

    npm-debug.log*
yarn-debug.log*
yarn-error.log*

    # Editor directories and files
    .idea
    .vscode
    *.suo
    *.ntvs*
    *.njsproj
    *.sln
    *.bak

    # Vite-specific
    /dist
    .vite/

    # Recharts temporary files
    *.log
    ```

3.  **Backend `.gitignore` (create manually in `self-hypnosis-backend/`):**
    ```
    venv/
    __pycache__/
    *.pyc
    .env
    .DS_Store
    ```

4.  **Follow the `DEPLOYMENT_GUIDE.md`:**
    This document provides step-by-step instructions for setting up your server, configuring the backend and frontend, setting up environment variables, integrating Stripe, configuring Nginx, and securing your deployment with SSL.

5.  **Configure Stripe:**
    Refer to `STRIPE_SETUP_GUIDE.md` for detailed instructions on obtaining API keys, creating products/prices, and setting up webhooks in your Stripe Dashboard.

6.  **Environment Variables:**
    Use `production.env.template` as a guide to create your `.env` file in the `self-hypnosis-backend/` directory. **Ensure you replace all placeholder values with your actual secure keys and domain.**

### Automated Setup (Using `deploy.sh`)

1.  **Extract the deployment package** to your server.
2.  **Make the script executable and run it:**
    ```bash
    chmod +x deploy.sh
    ./deploy.sh
    ```
3.  **Follow the prompts** to enter your domain and email for SSL.
4.  **Manually update the Stripe keys** in the generated `.env` file (`/path/to/your/app/self-hypnosis-backend/.env`).
5.  **Manually set up Stripe products and webhooks** as detailed in `STRIPE_SETUP_GUIDE.md`.

## Netlify Deployment (Frontend Only)

For frontend-only deployment to Netlify, you will need to configure your Netlify site settings. The backend will need to be hosted separately (e.g., on your own server as described above, or a cloud platform).

1.  **Connect to GitHub**: Link your frontend repository (`self-hypnosis-app/`) to Netlify.
2.  **Build Settings**: 
    - **Base directory**: `.` (assuming you connect the `self-hypnosis-app` directory as your Netlify site)
    - **Build command**: `npm run build`
    - **Publish directory**: `./dist`
3.  **Environment Variables**: Configure environment variables in Netlify for your frontend (e.g., `VITE_API_BASE_URL` pointing to your deployed backend API).
4.  **Redirects**: You might need a `netlify.toml` file for client-side routing (e.g., for React Router):
    ```toml
    # netlify.toml (place in self-hypnosis-app/)
    [[redirects]]
      from = "/*"
      to = "/index.html"
      status = 200
    ```

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For any issues or questions, please refer to the `DEPLOYMENT_GUIDE.md` or open an issue on the GitHub repository.

