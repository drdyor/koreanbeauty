# Render Deployment Guide for Self-Hypnosis Behavioral Rewiring App

This guide provides step-by-step instructions to deploy your full-stack Self-Hypnosis Behavioral Rewiring App (React frontend and Flask backend) on Render.com.

## Overview of Render Deployment

Render allows you to deploy web services, static sites, databases, and more. For this application, you will deploy two separate services:

1.  **Frontend (Static Site)**: Your React application, which will be built and served by Render.
2.  **Backend (Web Service)**: Your Flask API, which will handle all server-side logic, database interactions, and Stripe webhooks.

## Prerequisites

*   A Render.com account.
*   Your application code pushed to a GitHub repository (as you have already done).
*   Your Stripe API keys (publishable and secret) and webhook secret.

## Step 1: Deploy the Backend (Flask Web Service)

1.  **Log in to Render**: Go to [https://render.com/](https://render.com/) and log in to your account.
2.  **New Web Service**: From your Render dashboard, click "New" -> "Web Service."
3.  **Connect GitHub**: Connect your GitHub account and select the `Self-Hypnosis_App` repository.
4.  **Configuration**: Fill in the service details:
    *   **Name**: `self-hypnosis-backend` (or a name of your choice)
    *   **Region**: Choose a region close to your users.
    *   **Branch**: `main` (or your default branch)
    *   **Root Directory**: `self-hypnosis-backend` (This tells Render where your Flask app is located within your monorepo).
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn --workers 4 --bind 0.0.0.0:$PORT main:app`
        *   **Note**: Ensure `main:app` correctly points to your Flask application instance. In your `self-hypnosis-backend/src/main.py` file, your Flask app instance is named `app`, and the file is `main.py` within the `src` directory. Render expects the `startCommand` to point to the file relative to the `rootDir`, so `main:app` is correct for the `src` directory.

5.  **Environment Variables (Important!)**: Add the following environment variables under "Advanced" -> "Environment Variables":
    *   `PYTHON_VERSION`: `3.11.0` (or your preferred Python version)
    *   `FLASK_ENV`: `production`
    *   `SECRET_KEY`: Generate a strong, random string (e.g., using `secrets.token_hex(32)` in Python).
    *   `JWT_SECRET`: Generate another strong, random string.
    *   `STRIPE_SECRET_KEY`: Your **live** Stripe Secret Key (starts with `sk_live_...`).
    *   `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret (obtained from your Stripe dashboard after setting up the webhook endpoint).
    *   `STRIPE_PUBLISHABLE_KEY`: Your **live** Stripe Publishable Key (starts with `pk_live_...`).
    *   `CORS_ORIGINS`: This should be the URL of your deployed frontend service on Render (e.g., `https://self-hypnosis-frontend.onrender.com`). You will update this after deploying the frontend.
    *   `DATABASE_URL`: Render will automatically generate a PostgreSQL database for you. You can select "Add Database" during the service creation or connect to an existing one. If you choose to add a new internal database, Render will automatically inject its `DATABASE_URL` as an environment variable into your web service. If you use an external database, provide its connection string here.

6.  **Database (Optional but Recommended)**: Under "Advanced" -> "Databases", you can attach a Render PostgreSQL database. This is highly recommended for production. Render will automatically set the `DATABASE_URL` environment variable for your service.

7.  **Create Web Service**: Click "Create Web Service." Render will now build and deploy your backend.

8.  **Note the Backend URL**: Once deployed, note down the public URL of your backend service (e.g., `https://self-hypnosis-backend.onrender.com`). You will need this for the frontend configuration.

## Step 2: Deploy the Frontend (React Static Site)

1.  **New Static Site**: From your Render dashboard, click "New" -> "Static Site."
2.  **Connect GitHub**: Select the same `Self-Hypnosis_App` repository.
3.  **Configuration**: Fill in the service details:
    *   **Name**: `self-hypnosis-frontend` (or a name of your choice)
    *   **Region**: Choose the same region as your backend for better performance.
    *   **Branch**: `main` (or your default branch)
    *   **Root Directory**: `self-hypnosis-app` (This tells Render where your React app is located within your monorepo).
    *   **Build Command**: `npm install && npm run build`
    *   **Publish Directory**: `build` (This is the directory where Vite outputs the built frontend files, as configured in `vite.config.js`).

4.  **Environment Variables (Important!)**: Add the following environment variable under "Advanced" -> "Environment Variables":
    *   `VITE_API_BASE_URL`: Set this to the public URL of your deployed backend service (e.g., `https://self-hypnosis-backend.onrender.com/api`). **Remember to append `/api` to the backend URL.**

5.  **Create Static Site**: Click "Create Static Site." Render will now build and deploy your frontend.

## Step 3: Update Backend CORS_ORIGINS (Manual Step)

Once your frontend static site is deployed and you have its public URL (e.g., `https://self-hypnosis-frontend.onrender.com`):

1.  Go back to your `self-hypnosis-backend` service in Render.
2.  Navigate to "Environment" -> "Environment Variables."
3.  Edit the `CORS_ORIGINS` environment variable and set its value to your frontend URL (e.g., `https://self-hypnosis-frontend.onrender.com`). If you have multiple origins, separate them with commas.
4.  Save the changes. Render will automatically redeploy your backend with the updated CORS settings.

## Step 4: Configure Stripe Webhooks (Manual Step)

After your backend is deployed and accessible via its public URL:

1.  **Go to your Stripe Dashboard**: [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
2.  **Webhooks**: Navigate to "Developers" -> "Webhooks."
3.  **Add Endpoint**: Click "Add endpoint."
4.  **Endpoint URL**: Enter your backend webhook URL. This will be your Render backend URL followed by `/api/stripe-webhooks` (e.g., `https://self-hypnosis-backend.onrender.com/api/stripe-webhooks`).
5.  **Events to Send**: Select the events you want to receive. For subscription management, you will typically need:
    *   `checkout.session.completed`
    *   `customer.subscription.created`
    *   `customer.subscription.updated`
    *   `customer.subscription.deleted`
    *   `invoice.payment_succeeded`
    *   `invoice.payment_failed`
6.  **Get Secret**: After creating the endpoint, Stripe will provide you with a "Signing secret." Copy this secret.
7.  **Update Render Backend ENV**: Go back to your `self-hypnosis-backend` service in Render, navigate to "Environment" -> "Environment Variables," and update the `STRIPE_WEBHOOK_SECRET` environment variable with the secret you copied from Stripe.
8.  **Save and Redeploy**: Save the changes. Render will redeploy your backend. This is crucial for your backend to verify incoming Stripe webhooks.

## Step 5: Test the Deployed Application

1.  **Access Frontend**: Open your deployed frontend URL (e.g., `https://self-hypnosis-frontend.onrender.com`) in your browser.
2.  **Register/Login**: Test user registration and login.
3.  **Subscription Flow**: Test the paywall and subscription process using your Stripe test keys (if you used test keys for `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in Render) or live keys.
4.  **Dopamine Chart**: Verify that the dopamine chart functionality works, including adding goals and tracking progress.
5.  **Therapeutic Modules**: Ensure all therapeutic content and features are accessible based on subscription tiers.

## Troubleshooting Tips

*   **Check Render Logs**: Always check the logs for both your frontend and backend services on Render if you encounter deployment or runtime issues.
*   **Environment Variables**: Double-check that all environment variables are correctly set on Render, especially the API URLs and Stripe keys.
*   **CORS Issues**: If your frontend can't communicate with the backend, ensure `CORS_ORIGINS` on your backend is correctly set to your frontend URL.
*   **Database Migrations**: If you change your database models, you might need to manually run migrations or restart your backend service to ensure the database schema is updated. Your current Flask app automatically creates tables on startup (`db.create_all()`), which is convenient for initial deployment but might need more robust migration tools (like Flask-Migrate) for future updates in a production environment. For now, restarting the backend service after database changes should re-create/update tables if they don't exist. If you use a persistent database, ensure `db.create_all()` is only run if tables don't exist to avoid data loss.

This guide should provide you with all the necessary information to successfully deploy your application on Render!

