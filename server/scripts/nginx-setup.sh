#!/bin/bash
# =============================================================
#  scripts/nginx-setup.sh
#  Sets up Nginx reverse proxy for the API
#  Usage: sudo bash scripts/nginx-setup.sh api.ciphermutex.com
# =============================================================
set -e

DOMAIN=${1:-"api.ciphermutex.com"}

echo "▶ Writing Nginx config for $DOMAIN..."

sudo tee /etc/nginx/sites-available/pern-api > /dev/null << NGINX
server {
    listen 80;
    server_name $DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass         http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }

    # Health check endpoint (no auth required)
    location /health {
        proxy_pass http://127.0.0.1:4000/health;
    }
}
NGINX

echo "▶ Enabling site..."
sudo ln -sf /etc/nginx/sites-available/pern-api /etc/nginx/sites-enabled/pern-api

echo "▶ Removing default site..."
sudo rm -f /etc/nginx/sites-enabled/default

echo "▶ Testing Nginx config..."
sudo nginx -t

echo "▶ Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ""
echo "✅ Nginx configured for $DOMAIN"
echo ""
echo "Now run SSL:"
echo "  sudo certbot --nginx -d $DOMAIN"
