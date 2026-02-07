from src.models.subscription import User, FeatureUsage, SubscriptionTier
from functools import wraps
from flask import jsonify

# Feature limits for free tier
FREE_TIER_LIMITS = {
    'fear_patterns': 3,
    'audio_sessions': 2,
    'light_frequency_patterns': 3,
    'somatic_exercises': 1,
    'polyvagal_exercises': 1,
    'ifs_sessions': 1,
    'momentum_flow_sync': 0,  # Premium only
    'advanced_analytics': 0,  # Premium only
    'custom_affirmations': 0,  # Premium only
    'biometric_auth': 0,  # Professional only
    'hipaa_compliance': 0,  # Professional only
    'api_access': 0,  # Professional only
}

def check_feature_access(user, feature_name):
    """Check if user has access to a specific feature"""
    if not user:
        return False, "User not authenticated"
    
    # Professional tier has access to everything
    if user.is_professional:
        return True, "Professional access granted"
    
    # Premium tier has access to most features
    if user.is_premium:
        professional_only_features = ['biometric_auth', 'hipaa_compliance', 'api_access']
        if feature_name in professional_only_features:
            return False, "Professional subscription required"
        return True, "Premium access granted"
    
    # Free tier - check limits
    limit = FREE_TIER_LIMITS.get(feature_name, 0)
    if limit == 0:
        return False, "Premium subscription required"
    
    # Check usage count
    usage = FeatureUsage.query.filter_by(
        user_id=user.id,
        feature_name=feature_name
    ).first()
    
    if usage and usage.usage_count >= limit:
        return False, f"Free tier limit reached ({limit} uses)"
    
    return True, "Free tier access granted"

def track_feature_usage(user, feature_name, tier_required=SubscriptionTier.FREE):
    """Track feature usage for analytics and limits"""
    if user:
        FeatureUsage.track_usage(user.id, feature_name, tier_required)

def feature_gate(feature_name, tier_required=SubscriptionTier.PREMIUM):
    """Decorator to gate features based on subscription tier"""
    def decorator(f):
        @wraps(f)
        def decorated_function(current_user, *args, **kwargs):
            has_access, message = check_feature_access(current_user, feature_name)
            
            if not has_access:
                return jsonify({
                    'error': 'Access denied',
                    'message': message,
                    'feature': feature_name,
                    'tier_required': tier_required.value,
                    'current_tier': current_user.subscription_tier.value if current_user else 'none',
                    'upgrade_url': '/api/subscription/upgrade'
                }), 403
            
            # Track usage
            track_feature_usage(current_user, feature_name, tier_required)
            
            return f(current_user, *args, **kwargs)
        
        return decorated_function
    return decorator

def get_feature_limits(user):
    """Get feature limits for a user based on their subscription"""
    if not user:
        return FREE_TIER_LIMITS
    
    if user.is_professional:
        return {feature: -1 for feature in FREE_TIER_LIMITS.keys()}  # -1 means unlimited
    
    if user.is_premium:
        limits = FREE_TIER_LIMITS.copy()
        # Premium users get higher limits
        limits.update({
            'fear_patterns': -1,  # Unlimited
            'audio_sessions': -1,  # Unlimited
            'light_frequency_patterns': -1,  # Unlimited
            'somatic_exercises': -1,  # Unlimited
            'polyvagal_exercises': -1,  # Unlimited
            'ifs_sessions': -1,  # Unlimited
            'momentum_flow_sync': -1,  # Unlimited
            'advanced_analytics': -1,  # Unlimited
            'custom_affirmations': -1,  # Unlimited
        })
        return limits
    
    return FREE_TIER_LIMITS

def get_usage_analytics(user):
    """Get usage analytics for a user"""
    if not user:
        return {}
    
    usage_records = FeatureUsage.query.filter_by(user_id=user.id).all()
    analytics = {}
    
    for usage in usage_records:
        analytics[usage.feature_name] = {
            'usage_count': usage.usage_count,
            'last_used': usage.last_used_at.isoformat(),
            'tier_required': usage.tier_required.value
        }
    
    return analytics

