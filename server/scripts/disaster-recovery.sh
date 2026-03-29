#!/bin/bash
# =============================================================
#  scripts/disaster-recovery.sh
#  Full rebuild from scratch on a NEW EC2 instance
#  Run this if your EC2 instance dies and you launch a fresh one
#
#  Usage:
#    1. Launch new EC2 Ubuntu 22.04 t2.micro
#    2. SSH in: ssh -i key.pem ubuntu@NEW_EC2_IP
#    3. Run: bash <(curl -s https://raw.githubusercontent.com/YOUR_USERNAME/pern-todo/main/server/scripts/disaster-recovery.sh)
#    OR copy this file to EC2 and run: bash disaster-recovery.sh
# =============================================================
set -e

echo "======================================================"
echo "  PERN Todo — Disaster Recovery"
echo "======================================================"
echo ""

# ── Prompt for config ─────────────────────────────────────
read -p "GitHub repo URL (e.g. https://github.com/user/pern-todo.git): " REPO_URL
read -p "DATABASE_URL (postgresql://...): " DB_URL
read -p "ADMIN_TOKEN: " ADMIN_TOKEN
read -p "ALLOWED_ORIGINS (e.g. https://acme.yourdomain.com,https://admin.yourdomain.com): " ORIGINS
read -p "API domain (e.g. api.yourdomain.com): " API_DOMAIN

echo ""
echo "▶ Installing system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx certbot python3-certbot-nginx
sudo npm install -g pm2

echo "▶ Creating directories..."
mkdir -p /home/ubuntu/logs

echo "▶ Cloning repository..."
git clone "$REPO_URL" /home/ubuntu/pern-todo
cd /home/ubuntu/pern-todo/server

echo "▶ Installing Node dependencies..."
npm install --omit=dev

echo "▶ Generating Prisma client..."
npx prisma generate

echo "▶ Writing .env file..."
cat > .env << ENV
DATABASE_URL="${DB_URL}"
ADMIN_TOKEN="${ADMIN_TOKEN}"
ALLOWED_ORIGINS="${ORIGINS}"
NODE_ENV="production"
PORT=4000
ENV

echo "▶ Running database migrations..."
npx prisma migrate deploy

echo "▶ Starting PM2..."
pm2 start ecosystem.config.js
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash
pm2 save

echo "▶ Configuring Nginx..."
sudo bash scripts/nginx-setup.sh "$API_DOMAIN"

echo "▶ Installing SSL certificate..."
sudo certbot --nginx -d "$API_DOMAIN" --non-interactive --agree-tos -m admin@yourdomain.com

echo "▶ Final health check..."
sleep 5
curl -f "https://${API_DOMAIN}/health" && echo "" || echo "⚠ Health check failed — check logs: pm2 logs pern-api"

echo ""
echo "======================================================"
echo "  ✅ Recovery complete!"
echo "  API is live at: https://${API_DOMAIN}"
echo ""
echo "  Next steps:"
echo "  1. Update Route 53 A record to this EC2's new Elastic IP"
echo "  2. Reassign Elastic IP to this instance in AWS console"
echo "  3. Verify: curl https://${API_DOMAIN}/health"
echo "======================================================"
