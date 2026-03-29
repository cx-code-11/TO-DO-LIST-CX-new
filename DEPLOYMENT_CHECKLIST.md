# AWS Deployment Checklist

Work through this top to bottom. Check each box as you complete it.

---

## Phase 1 — AWS Infrastructure Setup

### RDS (PostgreSQL Database)
- [ ] Go to RDS → Create database
- [ ] Engine: PostgreSQL 15, Template: Free tier (db.t3.micro)
- [ ] DB name: `pern_todo`, Username: `postgres`
- [ ] Enable public access: Yes (for now)
- [ ] Create new security group: `pern-todo-rds-sg`
- [ ] Wait for status: Available (~5 min)
- [ ] Copy endpoint → save as DATABASE_URL:
      `postgresql://postgres:PASSWORD@ENDPOINT.rds.amazonaws.com:5432/pern_todo`

### EC2 (API Server)
- [ ] Launch EC2 → Ubuntu 22.04 → t2.micro
- [ ] Create key pair → download `.pem` file → store safely
- [ ] Security group: allow SSH (port 22) from your IP only
- [ ] Security group: allow HTTP (80) and HTTPS (443) from anywhere
- [ ] Launch instance
- [ ] Allocate Elastic IP → associate with this instance
- [ ] Update RDS security group: allow port 5432 from EC2 security group
- [ ] Update RDS: disable public access (now only EC2 can reach it)

### ACM SSL Certificate
- [ ] Go to ACM (must be in us-east-1)
- [ ] Request public certificate
- [ ] Add domains: `yourdomain.com` and `*.yourdomain.com`
- [ ] DNS validation → Create records in Route 53
- [ ] Wait for status: Issued (~5 min)

### S3 Buckets
- [ ] Create bucket: `pern-todo-client-app`
  - [ ] Unblock public access
  - [ ] Enable static website hosting (index doc: `index.html`, error doc: `index.html`)
  - [ ] Add bucket policy from `infra/s3-bucket-policy.json`
- [ ] Create bucket: `pern-todo-admin-dashboard`
  - [ ] Same settings as above

### CloudFront Distributions
- [ ] Create distribution for client-app
  - [ ] Origin: S3 website endpoint (NOT bucket ARN)
  - [ ] Viewer protocol: Redirect HTTP to HTTPS
  - [ ] Alternate domain: `acme.yourdomain.com`
  - [ ] SSL cert: select ACM cert
  - [ ] Default root: `index.html`
  - [ ] After creating: Error Pages → 403 → `/index.html` → 200
  - [ ] After creating: Error Pages → 404 → `/index.html` → 200
  - [ ] Copy Distribution ID → save as `CF_DISTRIBUTION_CLIENT`
  - [ ] Copy CloudFront domain name (e.g. `xxxx.cloudfront.net`)
- [ ] Create distribution for admin-dashboard
  - [ ] Alternate domain: `admin.yourdomain.com`
  - [ ] Same settings as above
  - [ ] Copy Distribution ID → save as `CF_DISTRIBUTION_ADMIN`
  - [ ] Copy CloudFront domain name

### Route 53 DNS
- [ ] Create hosted zone for `yourdomain.com`
- [ ] Copy NS records → paste into domain registrar nameservers
- [ ] Add record: `api.yourdomain.com` → A → EC2 Elastic IP
- [ ] Add record: `admin.yourdomain.com` → CNAME → admin CloudFront domain
- [ ] Add record: `acme.yourdomain.com` → CNAME → client CloudFront domain
- [ ] Add record: `*.yourdomain.com` → CNAME → client CloudFront domain

### IAM User for GitHub Actions
- [ ] IAM → Create user: `github-actions-pern-todo`
- [ ] Attach inline policy from `infra/iam-github-actions-policy.json`
- [ ] Create access key → copy Key ID and Secret

---

## Phase 2 — Server Setup on EC2

```bash
# SSH into EC2
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP
```

- [ ] Run setup script:
      `bash <(curl -s https://raw.githubusercontent.com/YOUR_USERNAME/pern-todo/main/server/scripts/ec2-setup.sh)`
- [ ] Create `.env` file:
      `cp /home/ubuntu/pern-todo/server/.env.example /home/ubuntu/pern-todo/server/.env`
      `nano /home/ubuntu/pern-todo/server/.env`
      Fill in: `DATABASE_URL`, `ADMIN_TOKEN`, `ALLOWED_ORIGINS`, `NODE_ENV=production`
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Run seed: `npm run db:seed`
- [ ] Start with PM2: `pm2 start ecosystem.config.js`
- [ ] Enable PM2 on reboot: `pm2 startup` → copy-paste the printed command → run it
- [ ] Save PM2 state: `pm2 save`
- [ ] Configure Nginx: `sudo bash scripts/nginx-setup.sh api.yourdomain.com`
- [ ] Install SSL: `sudo certbot --nginx -d api.yourdomain.com`
- [ ] Test health check: `curl https://api.yourdomain.com/health`
  - [ ] Expected response: `{"ok":true,"env":"production"}`

---

## Phase 3 — GitHub Actions CI/CD

- [ ] Push code to GitHub repo
- [ ] Go to repo → Settings → Secrets and variables → Actions
- [ ] Add all secrets from `.github/SECRETS.md`:
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_REGION`
  - [ ] `EC2_HOST`
  - [ ] `EC2_USER`
  - [ ] `EC2_SSH_KEY`
  - [ ] `VITE_API_URL`
  - [ ] `S3_BUCKET_CLIENT`
  - [ ] `S3_BUCKET_ADMIN`
  - [ ] `CF_DISTRIBUTION_CLIENT`
  - [ ] `CF_DISTRIBUTION_ADMIN`
- [ ] Push to main branch
- [ ] Watch Actions tab — all 3 jobs should go green
- [ ] Test client app: `https://acme.yourdomain.com`
- [ ] Test admin dashboard: `https://admin.yourdomain.com`

---

## Phase 4 — Final Verification

- [ ] `curl https://api.yourdomain.com/health` → `{"ok":true}`
- [ ] Client app loads at `https://acme.yourdomain.com`
- [ ] Can add / complete / delete a todo
- [ ] Admin dashboard loads at `https://admin.yourdomain.com`
- [ ] Admin login works with ADMIN_TOKEN
- [ ] Acme's todos appear in admin under the Acme tab
- [ ] "+ New Client" creates a new client in the database
- [ ] SSL padlock showing on all 3 domains

---

## Phase 5 — Ongoing Operations

### Every code push to main
- Frontend changes → auto-rebuild + S3 sync + CloudFront invalidation (~2 min)
- Backend changes → auto SSH + git pull + pm2 restart (~30 sec)
- Schema changes → auto prisma migrate deploy + pm2 restart

### Add a new client
```bash
bash server/scripts/add-client.sh
# Then add CNAME in Route 53 + add to CloudFront alternate domains
```

### Rollback a bad deploy
- GitHub → Actions → Rollback workflow → Run workflow
- Enter commit SHA + choose what to rollback

### Monitor
- GitHub → Actions → Health Check workflow (runs every 5 min)
- EC2 logs: `pm2 logs pern-api`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`

### Disaster recovery
- Launch fresh EC2 → run `server/scripts/disaster-recovery.sh`
- Reassign Elastic IP to new instance in AWS console
