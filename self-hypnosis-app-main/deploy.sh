#!/bin/bash

# Self-Hypnosis Behavioral Rewiring App - Automated Deployment Script
# This script automates the deployment process on Ubuntu servers

set -e  # Exit on any error

echo "=== Self-Hypnosis App Deployment Script ==="
echo "This script will set up the Self-Hypnosis Behavioral Rewiring App on your server."
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Get user input
read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN
read -p "Enter your email for SSL certificate: " EMAIL
read -p "Enter the path where you want to install the app [/home/$USER/app]: " INSTALL_PATH
INSTALL_PATH=${INSTALL_PATH:-/home/$USER/app}

echo ""
echo "Configuration:"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo "Install Path: $INSTALL_PATH"
echo ""
read -p "Continue with installation? (y/N): " CONFIRM

if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo "=== Step 1: System Update ==="
sudo apt update && sudo apt upgrade -y

echo ""
echo "=== Step 2: Installing Dependencies ==="
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm nginx git curl certbot python3-certbot-nginx fail2ban ufw

echo ""
echo "=== Step 3: Creating Application Directory ==="
mkdir -p $INSTALL_PATH
cd $INSTALL_PATH

echo ""
echo "=== Step 4: Setting up Backend ==="
cd self-hypnosis-backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

echo ""
echo "=== Step 5: Building Frontend ==="
cd ../self-hypnosis-app
npm install
npm run build
cp -r dist/* ../self-hypnosis-backend/src/static/

echo ""
echo "=== Step 6: Database Setup ==="
cd ../self-hypnosis-backend
mkdir -p src/database
source venv/bin/activate
python3 -c "
from src.main import app
with app.app_context():
    from src.models.subscription import db
    db.create_all()
    print('Database initialized successfully')
"

echo ""
echo "=== Step 7: Generating Security Keys ==="
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
JWT_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")

echo ""
echo "=== Step 8: Creating Environment File ==="
cat > .env << EOF
# Production Configuration
FLASK_ENV=production
SECRET_KEY=$SECRET_KEY
JWT_SECRET=$JWT_SECRET
PORT=5000

# Database Configuration
DATABASE_URL=sqlite://$INSTALL_PATH/self-hypnosis-backend/src/database/app.db

# Stripe Configuration - YOU MUST UPDATE THESE WITH YOUR ACTUAL KEYS
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_ENDPOINT_SECRET_HERE

# CORS Configuration
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN

# Security Settings
RATE_LIMIT_ENABLED=true
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=Strict

# Logging
LOG_LEVEL=INFO
EOF

echo ""
echo "=== Step 9: Creating Systemd Service ==="
sudo tee /etc/systemd/system/selfhypnosis.service > /dev/null << EOF
[Unit]
Description=Self-Hypnosis Behavioral Rewiring App
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_PATH/self-hypnosis-backend
Environment=PATH=$INSTALL_PATH/self-hypnosis-backend/venv/bin
ExecStart=$INSTALL_PATH/self-hypnosis-backend/venv/bin/python src/main.py
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "=== Step 10: Configuring Nginx ==="
sudo tee /etc/nginx/sites-available/selfhypnosis > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }

    location /static/ {
        alias $INSTALL_PATH/self-hypnosis-backend/src/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo ""
echo "=== Step 11: Setting up SSL Certificate ==="
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

echo ""
echo "=== Step 12: Configuring Firewall ==="
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo ""
echo "=== Step 13: Starting Services ==="
sudo systemctl daemon-reload
sudo systemctl enable selfhypnosis
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo ln -sf /etc/nginx/sites-available/selfhypnosis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl start selfhypnosis

echo ""
echo "=== Step 14: Creating Backup Script ==="
mkdir -p $INSTALL_PATH/backups
cat > $INSTALL_PATH/backup.sh << EOF
#!/bin/bash
BACKUP_DIR="$INSTALL_PATH/backups"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Backup database
cp $INSTALL_PATH/self-hypnosis-backend/src/database/app.db \$BACKUP_DIR/app_\$DATE.db

# Keep only last 30 backups
find \$BACKUP_DIR -name "app_*.db" -mtime +30 -delete
EOF
chmod +x $INSTALL_PATH/backup.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * $INSTALL_PATH/backup.sh") | crontab -

echo ""
echo "=== Deployment Complete! ==="
echo ""
echo "Your Self-Hypnosis Behavioral Rewiring App has been deployed successfully!"
echo ""
echo "IMPORTANT NEXT STEPS:"
echo "1. Update Stripe keys in: $INSTALL_PATH/self-hypnosis-backend/.env"
echo "2. Set up Stripe webhook endpoint: https://$DOMAIN/api/stripe-webhook"
echo "3. Test your application: https://$DOMAIN"
echo "4. Check service status: sudo systemctl status selfhypnosis"
echo ""
echo "Your app should now be accessible at: https://$DOMAIN"
echo ""
echo "For troubleshooting, check logs with:"
echo "sudo journalctl -u selfhypnosis -f"
echo ""
echo "Remember to:"
echo "- Set up your Stripe products and pricing"
echo "- Configure your Stripe webhook endpoint"
echo "- Test payment processing thoroughly"
echo "- Monitor logs and system performance"
echo ""
echo "Deployment completed successfully!"

