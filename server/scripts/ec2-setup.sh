#!/bin/bash
# =============================================================
#  scripts/ec2-setup.sh
#  Run ONCE on a fresh Ubuntu 22.04 EC2 instance
#  Usage: bash ec2-setup.sh
# =============================================================
set -e

echo "▶ Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

echo "▶ Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "▶ Installing Git, Nginx, Certbot..."
sudo apt-get install -y git nginx certbot python3-certbot-nginx

echo "▶ Installing PM2 globally..."
sudo npm install -g pm2

echo "▶ Creating log directory..."
mkdir -p /home/ubuntu/logs

echo "▶ Cloning repository..."
# Replace with your actual GitHub repo URL
git clone https://github.com/cx-code-11/TO-DO-LIST-CX-new.git /home/ubuntu/pern-todo

echo "▶ Installing server dependencies..."
cd /home/ubuntu/pern-todo/server
npm install

echo "▶ Generating Prisma client..."
npx prisma generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Create /home/ubuntu/pern-todo/server/.env  (copy from .env.example)"
echo "  2. Run: cd /home/ubuntu/pern-todo/server && npx prisma migrate deploy"
echo "  3. Run: npm run db:seed"
echo "  4. Run: pm2 start ecosystem.config.js"
echo "  5. Run: pm2 startup  (then copy-paste the printed command)"
echo "  6. Run: pm2 save"
echo "  7. Configure Nginx:  sudo bash scripts/nginx-setup.sh api.ciphermutex.com"
echo "  8. SSL:              sudo certbot --nginx -d api.ciphermutex.com"
