import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from src.models.subscription import db, User
from src.models.dopamine_chart import DopamineGoal, DopamineAchievement, GoalProgress, DopamineStats
from src.routes.user import user_bp
from src.routes.subscription import subscription_bp
from src.routes.stripe_webhooks import webhook_bp
from src.routes.dopamine_chart import dopamine_bp
import secrets

app = Flask(__name__)

# Remove static folder and serve route for Render deployment, as frontend will be a separate service

# Security configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', secrets.token_hex(32))

# CORS configuration - restrict in production
allowed_origins = os.getenv('CORS_ORIGINS', '*').split(',')
CORS(app, origins=allowed_origins, supports_credentials=True)

# Security headers middleware
@app.after_request
def after_request(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com"
    return response

# Rate limiting for sensitive endpoints
from functools import wraps
from time import time
import threading

rate_limit_storage = {}
rate_limit_lock = threading.Lock()

def rate_limit(max_requests=5, window=60):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            current_time = time()
            
            with rate_limit_lock:
                if client_ip not in rate_limit_storage:
                    rate_limit_storage[client_ip] = []
                
                # Clean old requests
                rate_limit_storage[client_ip] = [
                    req_time for req_time in rate_limit_storage[client_ip]
                    if current_time - req_time < window
                ]
                
                # Check rate limit
                if len(rate_limit_storage[client_ip]) >= max_requests:
                    return jsonify({'error': 'Rate limit exceeded'}), 429
                
                # Add current request
                rate_limit_storage[client_ip].append(current_time)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(subscription_bp, url_prefix='/api')
app.register_blueprint(webhook_bp, url_prefix='/api')
app.register_blueprint(dopamine_bp, url_prefix='/api')

# Apply rate limiting to authentication endpoints
@app.before_request
def apply_rate_limiting():
    if request.endpoint in ['subscription.login', 'subscription.register', 'subscription.create_checkout_session']:
        return rate_limit(max_requests=5, window=300)(lambda: None)()

# Database configuration
database_url = os.getenv('DATABASE_URL', f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}")
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 300,
}

db.init_app(app)

# Create database tables
with app.app_context():
    # Create database directory if it doesn't exist
    db_dir = os.path.join(os.path.dirname(__file__), 'database')
    os.makedirs(db_dir, exist_ok=True)
    db.create_all()

# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'environment': os.getenv('FLASK_ENV', 'production')
    }), 200

# WSGI entry point for Gunicorn
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)


