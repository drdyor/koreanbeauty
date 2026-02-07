from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from enum import Enum
import uuid

db = SQLAlchemy()

class SubscriptionTier(Enum):
    FREE = "free"
    PREMIUM = "premium"
    PROFESSIONAL = "professional"

class SubscriptionStatus(Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    UNPAID = "unpaid"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Subscription fields
    subscription_status = db.Column(db.Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    subscription_tier = db.Column(db.Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    subscription_expires_at = db.Column(db.DateTime)
    
    # Stripe integration
    stripe_customer_id = db.Column(db.String(255), unique=True)
    
    # Trial information
    trial_ends_at = db.Column(db.DateTime)
    trial_used = db.Column(db.Boolean, default=False)
    
    # Premium status (computed property)
    @property
    def is_premium(self):
        if self.subscription_tier == SubscriptionTier.FREE:
            return False
        
        # Check if subscription is active and not expired
        if self.subscription_status not in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]:
            return False
            
        # Check expiration
        if self.subscription_expires_at and self.subscription_expires_at < datetime.utcnow():
            return False
            
        return True
    
    @property
    def is_professional(self):
        return self.is_premium and self.subscription_tier == SubscriptionTier.PROFESSIONAL
    
    @property
    def is_on_trial(self):
        return (self.subscription_status == SubscriptionStatus.TRIALING and 
                self.trial_ends_at and 
                self.trial_ends_at > datetime.utcnow())
    
    def start_trial(self, days=7):
        """Start a free trial for the user"""
        if self.trial_used:
            return False
            
        self.subscription_status = SubscriptionStatus.TRIALING
        self.subscription_tier = SubscriptionTier.PREMIUM
        self.trial_ends_at = datetime.utcnow() + timedelta(days=days)
        self.trial_used = True
        return True
    
    def upgrade_to_premium(self, expires_at=None):
        """Upgrade user to premium tier"""
        self.subscription_tier = SubscriptionTier.PREMIUM
        self.subscription_status = SubscriptionStatus.ACTIVE
        if expires_at:
            self.subscription_expires_at = expires_at
        else:
            # Default to 1 month from now
            self.subscription_expires_at = datetime.utcnow() + timedelta(days=30)
    
    def upgrade_to_professional(self, expires_at=None):
        """Upgrade user to professional tier"""
        self.subscription_tier = SubscriptionTier.PROFESSIONAL
        self.subscription_status = SubscriptionStatus.ACTIVE
        if expires_at:
            self.subscription_expires_at = expires_at
        else:
            # Default to 1 month from now
            self.subscription_expires_at = datetime.utcnow() + timedelta(days=30)
    
    def cancel_subscription(self):
        """Cancel the user's subscription"""
        self.subscription_status = SubscriptionStatus.CANCELED
        # Keep access until expiration date
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'subscription_status': self.subscription_status.value,
            'subscription_tier': self.subscription_tier.value,
            'subscription_expires_at': self.subscription_expires_at.isoformat() if self.subscription_expires_at else None,
            'is_premium': self.is_premium,
            'is_professional': self.is_professional,
            'is_on_trial': self.is_on_trial,
            'trial_ends_at': self.trial_ends_at.isoformat() if self.trial_ends_at else None
        }

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Stripe subscription details
    stripe_subscription_id = db.Column(db.String(255), unique=True)
    stripe_price_id = db.Column(db.String(255))
    
    # Subscription details
    status = db.Column(db.Enum(SubscriptionStatus), nullable=False)
    tier = db.Column(db.Enum(SubscriptionTier), nullable=False)
    
    # Billing period
    current_period_start = db.Column(db.DateTime)
    current_period_end = db.Column(db.DateTime)
    cancel_at_period_end = db.Column(db.Boolean, default=False)
    
    # Trial information
    trial_start = db.Column(db.DateTime)
    trial_end = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('subscriptions', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stripe_subscription_id': self.stripe_subscription_id,
            'status': self.status.value,
            'tier': self.tier.value,
            'current_period_start': self.current_period_start.isoformat() if self.current_period_start else None,
            'current_period_end': self.current_period_end.isoformat() if self.current_period_end else None,
            'cancel_at_period_end': self.cancel_at_period_end,
            'trial_start': self.trial_start.isoformat() if self.trial_start else None,
            'trial_end': self.trial_end.isoformat() if self.trial_end else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    subscription_id = db.Column(db.String(36), db.ForeignKey('subscriptions.id'))
    
    # Stripe payment details
    stripe_payment_intent_id = db.Column(db.String(255), unique=True)
    stripe_invoice_id = db.Column(db.String(255))
    
    # Payment details
    amount = db.Column(db.Integer, nullable=False)  # Amount in cents
    currency = db.Column(db.String(3), default='USD')
    status = db.Column(db.String(50), nullable=False)
    
    # Metadata
    description = db.Column(db.Text)
    payment_metadata = db.Column(db.JSON)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('payments', lazy=True))
    subscription = db.relationship('Subscription', backref=db.backref('payments', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'subscription_id': self.subscription_id,
            'stripe_payment_intent_id': self.stripe_payment_intent_id,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status,
            'description': self.description,
            'payment_metadata': self.payment_metadata,
            'created_at': self.created_at.isoformat()
        }

class FeatureUsage(db.Model):
    __tablename__ = 'feature_usage'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    
    # Feature details
    feature_name = db.Column(db.String(255), nullable=False)
    usage_count = db.Column(db.Integer, default=1)
    last_used_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Access control
    tier_required = db.Column(db.Enum(SubscriptionTier), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('feature_usage', lazy=True))
    
    @classmethod
    def track_usage(cls, user_id, feature_name, tier_required):
        """Track feature usage for a user"""
        usage = cls.query.filter_by(user_id=user_id, feature_name=feature_name).first()
        
        if usage:
            usage.usage_count += 1
            usage.last_used_at = datetime.utcnow()
        else:
            usage = cls(
                user_id=user_id,
                feature_name=feature_name,
                tier_required=tier_required,
                usage_count=1
            )
            db.session.add(usage)
        
        db.session.commit()
        return usage
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'feature_name': self.feature_name,
            'usage_count': self.usage_count,
            'last_used_at': self.last_used_at.isoformat(),
            'tier_required': self.tier_required.value,
            'created_at': self.created_at.isoformat()
        }

