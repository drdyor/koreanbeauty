from flask import Blueprint, request, jsonify
import stripe
import os
from src.models.subscription import db, User, Subscription, Payment, SubscriptionStatus, SubscriptionTier
from datetime import datetime
import json

webhook_bp = Blueprint('webhooks', __name__)

# Stripe configuration
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_your_stripe_secret_key')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', 'whsec_your_webhook_secret')

@webhook_bp.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook events"""
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        # Invalid payload
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        return jsonify({'error': 'Invalid signature'}), 400
    
    # Handle the event
    if event['type'] == 'customer.subscription.created':
        handle_subscription_created(event['data']['object'])
    elif event['type'] == 'customer.subscription.updated':
        handle_subscription_updated(event['data']['object'])
    elif event['type'] == 'customer.subscription.deleted':
        handle_subscription_deleted(event['data']['object'])
    elif event['type'] == 'invoice.payment_succeeded':
        handle_payment_succeeded(event['data']['object'])
    elif event['type'] == 'invoice.payment_failed':
        handle_payment_failed(event['data']['object'])
    elif event['type'] == 'customer.subscription.trial_will_end':
        handle_trial_will_end(event['data']['object'])
    else:
        print(f'Unhandled event type: {event["type"]}')
    
    return jsonify({'status': 'success'}), 200

def handle_subscription_created(subscription):
    """Handle subscription creation"""
    try:
        # Find user by Stripe customer ID
        user = User.query.filter_by(stripe_customer_id=subscription['customer']).first()
        if not user:
            print(f"User not found for customer ID: {subscription['customer']}")
            return
        
        # Determine subscription tier based on price ID
        tier = get_tier_from_price_id(subscription['items']['data'][0]['price']['id'])
        
        # Create or update subscription record
        db_subscription = Subscription.query.filter_by(
            stripe_subscription_id=subscription['id']
        ).first()
        
        if not db_subscription:
            db_subscription = Subscription(
                user_id=user.id,
                stripe_subscription_id=subscription['id'],
                stripe_price_id=subscription['items']['data'][0]['price']['id'],
                status=SubscriptionStatus(subscription['status']),
                tier=tier
            )
            db.session.add(db_subscription)
        
        # Update subscription details
        db_subscription.current_period_start = datetime.fromtimestamp(subscription['current_period_start'])
        db_subscription.current_period_end = datetime.fromtimestamp(subscription['current_period_end'])
        
        if subscription.get('trial_start'):
            db_subscription.trial_start = datetime.fromtimestamp(subscription['trial_start'])
        if subscription.get('trial_end'):
            db_subscription.trial_end = datetime.fromtimestamp(subscription['trial_end'])
        
        # Update user subscription status
        user.subscription_status = SubscriptionStatus(subscription['status'])
        user.subscription_tier = tier
        user.subscription_expires_at = datetime.fromtimestamp(subscription['current_period_end'])
        
        db.session.commit()
        print(f"Subscription created for user {user.email}")
        
    except Exception as e:
        print(f"Error handling subscription created: {str(e)}")
        db.session.rollback()

def handle_subscription_updated(subscription):
    """Handle subscription updates"""
    try:
        # Find subscription record
        db_subscription = Subscription.query.filter_by(
            stripe_subscription_id=subscription['id']
        ).first()
        
        if not db_subscription:
            print(f"Subscription not found: {subscription['id']}")
            return
        
        # Update subscription status
        db_subscription.status = SubscriptionStatus(subscription['status'])
        db_subscription.current_period_start = datetime.fromtimestamp(subscription['current_period_start'])
        db_subscription.current_period_end = datetime.fromtimestamp(subscription['current_period_end'])
        db_subscription.cancel_at_period_end = subscription.get('cancel_at_period_end', False)
        
        # Update user status
        user = db_subscription.user
        user.subscription_status = SubscriptionStatus(subscription['status'])
        user.subscription_expires_at = datetime.fromtimestamp(subscription['current_period_end'])
        
        db.session.commit()
        print(f"Subscription updated for user {user.email}")
        
    except Exception as e:
        print(f"Error handling subscription updated: {str(e)}")
        db.session.rollback()

def handle_subscription_deleted(subscription):
    """Handle subscription cancellation"""
    try:
        # Find subscription record
        db_subscription = Subscription.query.filter_by(
            stripe_subscription_id=subscription['id']
        ).first()
        
        if not db_subscription:
            print(f"Subscription not found: {subscription['id']}")
            return
        
        # Update subscription status
        db_subscription.status = SubscriptionStatus.CANCELED
        
        # Update user status
        user = db_subscription.user
        user.subscription_status = SubscriptionStatus.CANCELED
        # Keep access until expiration date
        
        db.session.commit()
        print(f"Subscription canceled for user {user.email}")
        
    except Exception as e:
        print(f"Error handling subscription deleted: {str(e)}")
        db.session.rollback()

def handle_payment_succeeded(invoice):
    """Handle successful payment"""
    try:
        # Find user by customer ID
        user = User.query.filter_by(stripe_customer_id=invoice['customer']).first()
        if not user:
            print(f"User not found for customer ID: {invoice['customer']}")
            return
        
        # Create payment record
        payment = Payment(
            user_id=user.id,
            stripe_payment_intent_id=invoice.get('payment_intent'),
            stripe_invoice_id=invoice['id'],
            amount=invoice['amount_paid'],
            currency=invoice['currency'],
            status='succeeded',
            description=f"Payment for subscription {invoice.get('subscription')}"
        )
        
        db.session.add(payment)
        db.session.commit()
        print(f"Payment recorded for user {user.email}: ${invoice['amount_paid']/100}")
        
    except Exception as e:
        print(f"Error handling payment succeeded: {str(e)}")
        db.session.rollback()

def handle_payment_failed(invoice):
    """Handle failed payment"""
    try:
        # Find user by customer ID
        user = User.query.filter_by(stripe_customer_id=invoice['customer']).first()
        if not user:
            print(f"User not found for customer ID: {invoice['customer']}")
            return
        
        # Create payment record
        payment = Payment(
            user_id=user.id,
            stripe_invoice_id=invoice['id'],
            amount=invoice['amount_due'],
            currency=invoice['currency'],
            status='failed',
            description=f"Failed payment for subscription {invoice.get('subscription')}"
        )
        
        db.session.add(payment)
        
        # Update user subscription status if needed
        if invoice.get('subscription'):
            user.subscription_status = SubscriptionStatus.PAST_DUE
        
        db.session.commit()
        print(f"Failed payment recorded for user {user.email}")
        
    except Exception as e:
        print(f"Error handling payment failed: {str(e)}")
        db.session.rollback()

def handle_trial_will_end(subscription):
    """Handle trial ending soon"""
    try:
        # Find user by customer ID
        user = User.query.filter_by(stripe_customer_id=subscription['customer']).first()
        if not user:
            print(f"User not found for customer ID: {subscription['customer']}")
            return
        
        # Here you could send an email notification or update UI
        print(f"Trial ending soon for user {user.email}")
        
    except Exception as e:
        print(f"Error handling trial will end: {str(e)}")

def get_tier_from_price_id(price_id):
    """Map Stripe price ID to subscription tier"""
    # These would be your actual Stripe price IDs
    price_tier_mapping = {
        'price_premium_monthly': SubscriptionTier.PREMIUM,
        'price_premium_yearly': SubscriptionTier.PREMIUM,
        'price_professional_monthly': SubscriptionTier.PROFESSIONAL,
        'price_professional_yearly': SubscriptionTier.PROFESSIONAL,
    }
    
    return price_tier_mapping.get(price_id, SubscriptionTier.PREMIUM)

