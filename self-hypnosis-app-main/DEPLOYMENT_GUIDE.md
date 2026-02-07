# Self-Hypnosis Behavioral Rewiring App - Self-Hosting Deployment Guide

## Overview
This guide will help you deploy the Self-Hypnosis Behavioral Rewiring App on your own server with full control over the infrastructure, data, and payment processing.

## Prerequisites

### Server Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Python 3.11+
- Node.js 18+
- Nginx or Apache web server
- SSL certificate (Let's Encrypt recommended)
- At least 2GB RAM, 20GB storage

### Required Accounts
- Stripe account (for payment processing)
- Domain name and DNS control
- Email service (for notifications)

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3.11 python3.11-venv python3-pip nodejs npm nginx git -y
```

### 1.2 Create Application User
```bash
sudo adduser selfhypnosis
sudo usermod -aG sudo selfhypnosis
su - selfhypnosis
```

## Step 2: Application Deployment

### 2.1 Clone/Upload Application Files
Upload the entire application package to `/home/selfhypnosis/app/`

### 2.2 Backend Setup
```bash
cd /home/selfhypnosis/app/self-hypnosis-backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2.3 Frontend Build
```bash
cd /home/selfhypnosis/app/self-hypnosis-app
npm install
npm run build
cp -r dist/* /home/selfhypnosis/app/self-hypnosis-backend/src/static/
```

## Step 3: Environment Configuration

### 3.1 Create Production Environment File
Create `/home/selfhypnosis/app/self-hypnosis-backend/.env`:

```env
# Production Configuration
FLASK_ENV=production
SECRET_KEY=your-super-secure-secret-key-256-bits
JWT_SECRET=your-super-secure-jwt-key-256-bits
PORT=5000

# Database Configuration
DATABASE_URL=sqlite:////home/selfhypnosis/app/self-hypnosis-backend/src/database/app.db

# Stripe Configuration (REPLACE WITH YOUR KEYS)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_endpoint_secret

# CORS Configuration (Restrict to your domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security Settings
RATE_LIMIT_ENABLED=true
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=Strict

# Logging
LOG_LEVEL=INFO
```

### 3.2 Generate Secure Keys
```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_hex(32))"

# Generate JWT_SECRET
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## Step 4: Stripe Configuration

### 4.1 Get Your Stripe Keys
1. Log into your Stripe Dashboard
2. Go to Developers > API Keys
3. Copy your Publishable key and Secret key
4. For live mode, toggle to "Live" mode

### 4.2 Create Stripe Products and Prices
```bash
# Install Stripe CLI
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-buster-debsig main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update && sudo apt install stripe

# Login to Stripe
stripe login

# Create products and prices (run these commands)
stripe products create --name="Premium Plan" --description="Premium features for Self-Hypnosis App"
stripe prices create --product=prod_xxx --unit-amount=999 --currency=usd --recurring-interval=month --lookup-key=premium_monthly

stripe products create --name="Professional Plan" --description="Professional features for Self-Hypnosis App"
stripe prices create --product=prod_yyy --unit-amount=2999 --currency=usd --recurring-interval=month --lookup-key=professional_monthly
```

### 4.3 Set Up Webhook Endpoint
1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events: `customer.subscription.*`, `invoice.payment_*`, `checkout.session.completed`
4. Copy the webhook signing secret to your `.env` file

## Step 5: Database Setup

### 5.1 Initialize Database
```bash
cd /home/selfhypnosis/app/self-hypnosis-backend
source venv/bin/activate
python3 -c "
from src.main import app
with app.app_context():
    from src.models.subscription import db
    db.create_all()
    print('Database initialized successfully')
"
```

## Step 6: Systemd Service Setup

### 6.1 Create Service File
Create `/etc/systemd/system/selfhypnosis.service`:

```ini
[Unit]
Description=Self-Hypnosis Behavioral Rewiring App
After=network.target

[Service]
Type=simple
User=selfhypnosis
WorkingDirectory=/home/selfhypnosis/app/self-hypnosis-backend
Environment=PATH=/home/selfhypnosis/app/self-hypnosis-backend/venv/bin
ExecStart=/home/selfhypnosis/app/self-hypnosis-backend/venv/bin/python src/main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

### 6.2 Enable and Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable selfhypnosis
sudo systemctl start selfhypnosis
sudo systemctl status selfhypnosis
```

## Step 7: Nginx Configuration

### 7.1 Create Nginx Site Configuration
Create `/etc/nginx/sites-available/selfhypnosis`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    location /static/ {
        alias /home/selfhypnosis/app/self-hypnosis-backend/src/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/selfhypnosis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 8: SSL Certificate Setup

### 8.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 8.3 Auto-renewal
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 9: Security Hardening

### 9.1 Firewall Setup
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 9.2 Fail2Ban Setup
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Step 10: Monitoring and Maintenance

### 10.1 Log Monitoring
```bash
# View application logs
sudo journalctl -u selfhypnosis -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 10.2 Database Backup
Create `/home/selfhypnosis/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/selfhypnosis/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
cp /home/selfhypnosis/app/self-hypnosis-backend/src/database/app.db $BACKUP_DIR/app_$DATE.db

# Keep only last 30 backups
find $BACKUP_DIR -name "app_*.db" -mtime +30 -delete
```

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * /home/selfhypnosis/backup.sh
```

## Step 11: Testing Deployment

### 11.1 Health Check
```bash
curl https://yourdomain.com/health
```

### 11.2 API Test
```bash
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

## Important Security Notes

1. **Never commit sensitive keys to version control**
2. **Use environment variables for all secrets**
3. **Regularly update dependencies and system packages**
4. **Monitor logs for suspicious activity**
5. **Set up proper backup procedures**
6. **Use strong passwords and 2FA where possible**

## Stripe Integration Notes

1. **Test Mode**: Use test keys during development
2. **Live Mode**: Switch to live keys only when ready for production
3. **Webhooks**: Ensure webhook endpoint is accessible and secure
4. **PCI Compliance**: Stripe handles PCI compliance for card data

## Support and Maintenance

- Monitor application logs regularly
- Keep dependencies updated
- Test payment flows periodically
- Monitor Stripe dashboard for payment issues
- Set up alerts for system failures

## Troubleshooting

### Common Issues:
1. **502 Bad Gateway**: Check if Python app is running
2. **SSL Issues**: Verify certificate installation
3. **Payment Failures**: Check Stripe webhook configuration
4. **Database Errors**: Verify database permissions and path

### Debug Commands:
```bash
# Check service status
sudo systemctl status selfhypnosis

# View recent logs
sudo journalctl -u selfhypnosis --since "1 hour ago"

# Test database connection
cd /home/selfhypnosis/app/self-hypnosis-backend
source venv/bin/activate
python3 -c "from src.models.subscription import db; print('DB OK')"
```

This deployment gives you complete control over your application, data, and payment processing while maintaining security and scalability.

