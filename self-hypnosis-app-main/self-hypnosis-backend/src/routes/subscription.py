from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from src.models.subscription import db, User, Subscription, Payment, FeatureUsage, SubscriptionTier, SubscriptionStatus
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import stripe
import os
from functools import wraps

subscription_bp = Blueprint('subscription', __name__)

# Stripe configuration
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_your_stripe_secret_key')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', 'whsec_your_webhook_secret')

# JWT configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your-jwt-secret-key')
JWT_ALGORITHM = 'HS256'

def token_required(f):
    """Decorator to require JWT token for protected routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def premium_required(f):
    """Decorator to require premium subscription"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_premium:
            return jsonify({
                'error': 'Premium subscription required',
                'upgrade_url': '/api/subscription/upgrade'
            }), 403
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def professional_required(f):
    """Decorator to require professional subscription"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_professional:
            return jsonify({
                'error': 'Professional subscription required',
                'upgrade_url': '/api/subscription/upgrade-professional'
            }), 403
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@subscription_bp.route('/auth/register', methods=['POST'])
@cross_origin()
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'User already exists'}), 409
        
        # Create new user
        password_hash = generate_password_hash(data['password'])
        user = User(
            email=data['email'],
            password_hash=password_hash
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=30)
        }, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/auth/login', methods=['POST'])
@cross_origin()
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=30)
        }, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/user/profile', methods=['GET'])
@cross_origin()
@token_required
def get_profile(current_user):
    """Get user profile and subscription status"""
    return jsonify({
        'user': current_user.to_dict()
    }), 200

@subscription_bp.route('/subscription/status', methods=['GET'])
@cross_origin()
@token_required
def get_subscription_status(current_user):
    """Get detailed subscription status"""
    subscription = Subscription.query.filter_by(user_id=current_user.id).order_by(Subscription.created_at.desc()).first()
    
    return jsonify({
        'user': current_user.to_dict(),
        'subscription': subscription.to_dict() if subscription else None,
        'features': {
            'fear_pattern_analysis': {
                'available': True,
                'limit': None if current_user.is_premium else 3,
                'used_this_month': 0  # TODO: Calculate actual usage
            },
            'audio_sessions': {
                'available': True,
                'limit': None if current_user.is_premium else 2,
                'used_this_week': 0  # TODO: Calculate actual usage
            },
            'light_frequency': {
                'available': True,
                'patterns': 12 if current_user.is_premium else 3,
                'daily_limit': None if current_user.is_premium else 15  # minutes
            },
            'momentum_flow_sync': {
                'available': current_user.is_premium,
                'full_integration': current_user.is_premium
            },
            'encrypted_notes': {
                'available': current_user.is_premium
            },
            'biometric_monitoring': {
                'available': current_user.is_professional
            }
        }
    }), 200

@subscription_bp.route('/subscription/start-trial', methods=['POST'])
@cross_origin()
@token_required
def start_trial(current_user):
    """Start free trial"""
    try:
        if current_user.trial_used:
            return jsonify({'error': 'Trial already used'}), 400
        
        if current_user.start_trial():
            db.session.commit()
            return jsonify({
                'message': 'Trial started successfully',
                'user': current_user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Unable to start trial'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/subscription/create-checkout-session', methods=['POST'])
@cross_origin()
@token_required
def create_checkout_session(current_user):
    """Create Stripe checkout session"""
    try:
        data = request.get_json()
        tier = data.get('tier', 'premium')
        
        # Define price IDs (these would be your actual Stripe price IDs)
        price_ids = {
            'premium_monthly': 'price_premium_monthly',
            'premium_yearly': 'price_premium_yearly',
            'professional_monthly': 'price_professional_monthly',
            'professional_yearly': 'price_professional_yearly'
        }
        
        price_id = price_ids.get(f"{tier}_{data.get('billing_period', 'monthly')}")
        
        if not price_id:
            return jsonify({'error': 'Invalid subscription plan'}), 400
        
        # Create or get Stripe customer
        if not current_user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={'user_id': current_user.id}
            )
            current_user.stripe_customer_id = customer.id
            db.session.commit()
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=current_user.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=request.host_url + 'subscription/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=request.host_url + 'subscription/cancel',
            metadata={
                'user_id': current_user.id,
                'tier': tier
            }
        )
        
        return jsonify({
            'checkout_url': checkout_session.url,
            'session_id': checkout_session.id
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/subscription/cancel', methods=['POST'])
@cross_origin()
@token_required
def cancel_subscription(current_user):
    """Cancel user subscription"""
    try:
        subscription = Subscription.query.filter_by(
            user_id=current_user.id,
            status=SubscriptionStatus.ACTIVE
        ).first()
        
        if not subscription:
            return jsonify({'error': 'No active subscription found'}), 404
        
        # Cancel in Stripe
        if subscription.stripe_subscription_id:
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=True
            )
        
        # Update local subscription
        subscription.cancel_at_period_end = True
        current_user.cancel_subscription()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Subscription cancelled successfully',
            'user': current_user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/feature/check-access', methods=['POST'])
@cross_origin()
@token_required
def check_feature_access(current_user):
    """Check if user has access to a specific feature"""
    try:
        data = request.get_json()
        feature_name = data.get('feature_name')
        
        if not feature_name:
            return jsonify({'error': 'Feature name is required'}), 400
        
        # Define feature requirements
        feature_requirements = {
            'fear_pattern_analysis_unlimited': SubscriptionTier.PREMIUM,
            'audio_sessions_unlimited': SubscriptionTier.PREMIUM,
            'light_frequency_advanced': SubscriptionTier.PREMIUM,
            'momentum_flow_sync': SubscriptionTier.PREMIUM,
            'encrypted_notes': SubscriptionTier.PREMIUM,
            'streak_protection': SubscriptionTier.PREMIUM,
            'biometric_monitoring': SubscriptionTier.PROFESSIONAL,
            'api_access': SubscriptionTier.PROFESSIONAL,
            'white_label': SubscriptionTier.PROFESSIONAL
        }
        
        required_tier = feature_requirements.get(feature_name)
        
        if not required_tier:
            # Feature doesn't exist or is free
            return jsonify({
                'has_access': True,
                'feature_name': feature_name
            }), 200
        
        # Check access based on user's subscription
        has_access = False
        
        if required_tier == SubscriptionTier.PREMIUM:
            has_access = current_user.is_premium
        elif required_tier == SubscriptionTier.PROFESSIONAL:
            has_access = current_user.is_professional
        
        # Track feature usage
        if has_access:
            FeatureUsage.track_usage(current_user.id, feature_name, required_tier)
        
        return jsonify({
            'has_access': has_access,
            'feature_name': feature_name,
            'required_tier': required_tier.value,
            'current_tier': current_user.subscription_tier.value,
            'upgrade_url': '/api/subscription/upgrade' if not has_access else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/webhook/stripe', methods=['POST'])
@cross_origin()
def stripe_webhook():
    """Handle Stripe webhooks"""
    try:
        payload = request.get_data()
        sig_header = request.headers.get('Stripe-Signature')
        
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        
        # Handle different event types
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            handle_successful_payment(session)
            
        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            handle_successful_payment(invoice)
            
        elif event['type'] == 'invoice.payment_failed':
            invoice = event['data']['object']
            handle_failed_payment(invoice)
            
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            handle_subscription_cancelled(subscription)
        
        return jsonify({'status': 'success'}), 200
        
    except ValueError as e:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        return jsonify({'error': 'Invalid signature'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def handle_successful_payment(session_or_invoice):
    """Handle successful payment from Stripe"""
    try:
        customer_id = session_or_invoice.get('customer')
        user = User.query.filter_by(stripe_customer_id=customer_id).first()
        
        if not user:
            print(f"User not found for customer {customer_id}")
            return
        
        # Get subscription details from Stripe
        if 'subscription' in session_or_invoice:
            stripe_subscription = stripe.Subscription.retrieve(session_or_invoice['subscription'])
            
            # Update user subscription
            if 'professional' in stripe_subscription.metadata.get('tier', ''):
                user.upgrade_to_professional(
                    expires_at=datetime.fromtimestamp(stripe_subscription.current_period_end)
                )
            else:
                user.upgrade_to_premium(
                    expires_at=datetime.fromtimestamp(stripe_subscription.current_period_end)
                )
            
            # Create or update subscription record
            subscription = Subscription.query.filter_by(
                stripe_subscription_id=stripe_subscription.id
            ).first()
            
            if not subscription:
                subscription = Subscription(
                    user_id=user.id,
                    stripe_subscription_id=stripe_subscription.id,
                    status=SubscriptionStatus.ACTIVE,
                    tier=user.subscription_tier,
                    current_period_start=datetime.fromtimestamp(stripe_subscription.current_period_start),
                    current_period_end=datetime.fromtimestamp(stripe_subscription.current_period_end)
                )
                db.session.add(subscription)
            else:
                subscription.status = SubscriptionStatus.ACTIVE
                subscription.current_period_start = datetime.fromtimestamp(stripe_subscription.current_period_start)
                subscription.current_period_end = datetime.fromtimestamp(stripe_subscription.current_period_end)
            
            db.session.commit()
            print(f"Successfully updated subscription for user {user.id}")
            
    except Exception as e:
        print(f"Error handling successful payment: {e}")

def handle_failed_payment(invoice):
    """Handle failed payment from Stripe"""
    try:
        customer_id = invoice.get('customer')
        user = User.query.filter_by(stripe_customer_id=customer_id).first()
        
        if user:
            user.subscription_status = SubscriptionStatus.PAST_DUE
            db.session.commit()
            print(f"Marked user {user.id} as past due")
            
    except Exception as e:
        print(f"Error handling failed payment: {e}")

def handle_subscription_cancelled(subscription):
    """Handle subscription cancellation from Stripe"""
    try:
        user = User.query.filter_by(stripe_customer_id=subscription['customer']).first()
        
        if user:
            user.cancel_subscription()
            
            # Update subscription record
            sub_record = Subscription.query.filter_by(
                stripe_subscription_id=subscription['id']
            ).first()
            
            if sub_record:
                sub_record.status = SubscriptionStatus.CANCELED
            
            db.session.commit()
            print(f"Cancelled subscription for user {user.id}")
            
    except Exception as e:
        print(f"Error handling subscription cancellation: {e}")

@subscription_bp.route('/analytics/usage', methods=['GET'])
@cross_origin()
@token_required
def get_usage_analytics(current_user):
    """Get user's feature usage analytics"""
    try:
        usage_data = FeatureUsage.query.filter_by(user_id=current_user.id).all()
        
        analytics = {
            'total_features_used': len(usage_data),
            'features': [usage.to_dict() for usage in usage_data],
            'subscription_value': calculate_subscription_value(current_user, usage_data)
        }
        
        return jsonify(analytics), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_subscription_value(user, usage_data):
    """Calculate the value user gets from their subscription"""
    if not user.is_premium:
        return {'message': 'Upgrade to premium to see subscription value'}
    
    # Simple value calculation based on usage
    premium_features_used = len([u for u in usage_data if u.tier_required != SubscriptionTier.FREE])
    estimated_value = premium_features_used * 2.99  # $2.99 per premium feature used
    
    return {
        'estimated_monthly_value': f"${estimated_value:.2f}",
        'premium_features_used': premium_features_used,
        'subscription_cost': "$9.99" if user.subscription_tier == SubscriptionTier.PREMIUM else "$29.99"
    }



@subscription_bp.route('/feature-access/<feature_name>', methods=['GET'])
@cross_origin()
@token_required
def check_feature_access_endpoint(current_user, feature_name):
    """Check if user has access to a specific feature"""
    try:
        from src.utils.feature_gating import check_feature_access, get_feature_limits
        
        has_access, message = check_feature_access(current_user, feature_name)
        limits = get_feature_limits(current_user)
        
        return jsonify({
            'has_access': has_access,
            'message': message,
            'feature': feature_name,
            'current_tier': current_user.subscription_tier.value,
            'is_premium': current_user.is_premium,
            'is_professional': current_user.is_professional,
            'limits': limits
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/feature-usage/<feature_name>', methods=['POST'])
@cross_origin()
@token_required
def track_feature_usage_endpoint(current_user, feature_name):
    """Track feature usage for a user"""
    try:
        from src.utils.feature_gating import track_feature_usage, check_feature_access
        
        # Check access first
        has_access, message = check_feature_access(current_user, feature_name)
        
        if not has_access:
            return jsonify({
                'error': 'Access denied',
                'message': message,
                'upgrade_required': True
            }), 403
        
        # Track usage
        track_feature_usage(current_user, feature_name)
        
        return jsonify({
            'success': True,
            'message': 'Usage tracked successfully',
            'feature': feature_name
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/usage-analytics', methods=['GET'])
@cross_origin()
@token_required
def get_usage_analytics_endpoint(current_user):
    """Get detailed usage analytics for a user"""
    try:
        from src.utils.feature_gating import get_usage_analytics, get_feature_limits
        
        analytics = get_usage_analytics(current_user)
        limits = get_feature_limits(current_user)
        
        return jsonify({
            'user_id': current_user.id,
            'subscription_tier': current_user.subscription_tier.value,
            'is_premium': current_user.is_premium,
            'is_professional': current_user.is_professional,
            'usage_analytics': analytics,
            'feature_limits': limits,
            'trial_status': {
                'is_on_trial': current_user.is_on_trial,
                'trial_ends_at': current_user.trial_ends_at.isoformat() if current_user.trial_ends_at else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

