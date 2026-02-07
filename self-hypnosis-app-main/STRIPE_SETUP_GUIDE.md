# Stripe Setup Guide for Self-Hypnosis App

## Overview
This guide will help you set up Stripe payment processing for your Self-Hypnosis Behavioral Rewiring App.

## Step 1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification (required for live payments)
3. Set up your business profile and bank account details

## Step 2: Get API Keys

### Test Mode Keys (for development/testing)
1. In Stripe Dashboard, ensure you're in "Test mode" (toggle in top left)
2. Go to Developers > API Keys
3. Copy your "Publishable key" (starts with `pk_test_`)
4. Reveal and copy your "Secret key" (starts with `sk_test_`)

### Live Mode Keys (for production)
1. Switch to "Live mode" in Stripe Dashboard
2. Go to Developers > API Keys
3. Copy your "Publishable key" (starts with `pk_live_`)
4. Reveal and copy your "Secret key" (starts with `sk_live_`)

## Step 3: Create Products and Pricing

### Using Stripe Dashboard
1. Go to Products in your Stripe Dashboard
2. Click "Add product"

#### Premium Plan
- **Name**: Premium Plan
- **Description**: Premium features for Self-Hypnosis App
- **Pricing**: $9.99/month recurring
- **Lookup Key**: `premium_monthly`

#### Professional Plan
- **Name**: Professional Plan  
- **Description**: Professional features for Self-Hypnosis App
- **Pricing**: $29.99/month recurring
- **Lookup Key**: `professional_monthly`

### Using Stripe CLI (Alternative)
```bash
# Install Stripe CLI
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-buster-debsig main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update && sudo apt install stripe

# Login to Stripe
stripe login

# Create Premium Plan
stripe products create --name="Premium Plan" --description="Premium features for Self-Hypnosis App"
# Note the product ID (prod_xxx)

stripe prices create --product=prod_xxx --unit-amount=999 --currency=usd --recurring-interval=month --lookup-key=premium_monthly

# Create Professional Plan
stripe products create --name="Professional Plan" --description="Professional features for Self-Hypnosis App"
# Note the product ID (prod_yyy)

stripe prices create --product=prod_yyy --unit-amount=2999 --currency=usd --recurring-interval=month --lookup-key=professional_monthly
```

## Step 4: Set Up Webhook Endpoint

### Create Webhook
1. In Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://yourdomain.com/api/stripe-webhook`
4. **Description**: Self-Hypnosis App Webhook

### Select Events
Select these events to listen for:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `checkout.session.completed`
- `customer.subscription.trial_will_end`

### Get Webhook Secret
1. After creating the webhook, click on it
2. In the "Signing secret" section, click "Reveal"
3. Copy the webhook signing secret (starts with `whsec_`)

## Step 5: Update Environment Variables

Update your `.env` file with your Stripe keys:

```env
# For Testing (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# For Production (Live Mode)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 6: Update Price IDs in Code

In your backend code (`src/routes/subscription.py`), update the price IDs:

```python
# Define price IDs (replace with your actual Stripe price IDs)
price_ids = {
    'premium_monthly': 'price_your_premium_monthly_price_id',
    'premium_yearly': 'price_your_premium_yearly_price_id',  # if you create yearly plans
    'professional_monthly': 'price_your_professional_monthly_price_id',
    'professional_yearly': 'price_your_professional_yearly_price_id'  # if you create yearly plans
}
```

## Step 7: Test Payment Flow

### Test Mode Testing
1. Use test card numbers from [Stripe's testing guide](https://stripe.com/docs/testing)
2. **Successful payment**: `4242424242424242`
3. **Declined payment**: `4000000000000002`
4. **Requires authentication**: `4000002500003155`

### Test Scenarios
1. **Successful subscription**: Use `4242424242424242`
2. **Failed payment**: Use `4000000000000002`
3. **Webhook delivery**: Check webhook logs in Stripe Dashboard

## Step 8: Go Live Checklist

### Before Going Live
- [ ] Complete Stripe account verification
- [ ] Add bank account for payouts
- [ ] Set up tax settings (if applicable)
- [ ] Test all payment flows thoroughly
- [ ] Verify webhook endpoint is working
- [ ] Update environment variables to live keys
- [ ] Test with real payment methods (small amounts)

### Security Checklist
- [ ] Use HTTPS for all payment pages
- [ ] Verify webhook signatures
- [ ] Store sensitive data securely
- [ ] Implement proper error handling
- [ ] Set up monitoring and alerts

## Step 9: Monitoring and Maintenance

### Stripe Dashboard Monitoring
- Monitor payment success rates
- Check for failed payments
- Review webhook delivery logs
- Monitor subscription metrics

### Application Monitoring
- Check application logs for payment errors
- Monitor webhook endpoint health
- Set up alerts for payment failures
- Regular backup of subscription data

## Common Issues and Solutions

### Webhook Not Receiving Events
1. Check webhook URL is accessible from internet
2. Verify SSL certificate is valid
3. Check webhook endpoint logs
4. Ensure correct events are selected

### Payment Failures
1. Check Stripe logs for error details
2. Verify API keys are correct
3. Check if customer's card is valid
4. Review payment method restrictions

### Subscription Issues
1. Verify product and price IDs are correct
2. Check subscription status in Stripe Dashboard
3. Review webhook event handling
4. Check database synchronization

## Support Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Community](https://github.com/stripe)
- [Payment Testing Guide](https://stripe.com/docs/testing)

## Important Notes

1. **Never expose secret keys** in frontend code or public repositories
2. **Always validate webhooks** using Stripe's signature verification
3. **Handle edge cases** like failed payments and subscription changes
4. **Monitor payment flows** regularly for issues
5. **Keep Stripe libraries updated** for security patches

This setup will give you a robust payment system with proper subscription management and webhook handling.

