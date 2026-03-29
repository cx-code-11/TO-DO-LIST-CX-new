#!/bin/bash
# =============================================================
#  scripts/deploy.sh
#  Run on EC2 whenever you push new server code
#  Usage: bash scripts/deploy.sh
# =============================================================
set -e

APP_DIR="/home/ubuntu/pern-todo/server"

echo "▶ Pulling latest code..."
cd /home/ubuntu/pern-todo
git pull origin main

echo "▶ Installing dependencies..."
cd "$APP_DIR"
npm install --omit=dev

echo "▶ Generating Prisma client..."
npx prisma generate

echo "▶ Running database migrations..."
npx prisma migrate deploy

echo "▶ Restarting PM2..."
pm2 restart pern-api || pm2 start ecosystem.config.js

echo "▶ Saving PM2 state..."
pm2 save

echo ""
echo "✅ Deployed successfully!"
pm2 status
