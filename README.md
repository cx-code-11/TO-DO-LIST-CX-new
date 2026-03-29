# PERN Multi-Tenant Todo — AWS Deployment Guide

## Architecture

```
GitHub (main branch)
       │
       ├── GitHub Actions ──► EC2 (SSH git pull + pm2 restart)  ← api.yourdomain.com
       │                              │
       │                         RDS PostgreSQL (free tier)
       │
       ├── GitHub Actions ──► S3 + CloudFront  ← acme.yourdomain.com
       └── GitHub Actions ──► S3 + CloudFront  ← admin.yourdomain.com
```

## AWS Services Used (all free tier eligible)

| Service      | What For               | Free Tier                  |
|--------------|------------------------|----------------------------|
| EC2 t2.micro | API server (Node.js)   | 750 hrs/month, 12 months   |
| RDS t3.micro | PostgreSQL database    | 750 hrs/month, 12 months   |
| S3           | React static files     | 5 GB storage               |
| CloudFront   | CDN for React apps     | 1 TB transfer/month        |
| ACM          | SSL certificates       | Free forever               |
| Route 53     | DNS                    | $0.50/hosted zone/month    |

---

## STEP 1 — RDS PostgreSQL

1. AWS Console → RDS → Create database
2. Engine: **PostgreSQL 15**
3. Template: **Free tier** (db.t3.micro, 20GB gp2)
4. DB instance identifier: `pern-todo-db`
5. Master username: `postgres`
6. Master password: (set a strong password)
7. Connectivity:
   - VPC: default
   - Public access: **Yes** (temporary — restrict after EC2 is set up)
   - VPC security group: create new → allow port **5432** from EC2 SG only
8. Initial database name: `pern_todo`
9. Click Create — wait ~5 minutes
10. Copy the **Endpoint URL** — this goes in your `DATABASE_URL`

```
DATABASE_URL=postgresql://postgres:PASSWORD@YOUR-RDS-ENDPOINT.rds.amazonaws.com:5432/pern_todo
```

---

## STEP 2 — EC2 Instance (API Server)

### 2a. Launch EC2

1. EC2 → Launch Instance
2. Name: `pern-todo-api`
3. AMI: **Ubuntu Server 22.04 LTS**
4. Instance type: **t2.micro** (free tier)
5. Key pair: Create new → download `.pem` file → keep safe
6. Security group — inbound rules:

| Port | Protocol | Source        | Purpose           |
|------|----------|---------------|-------------------|
| 22   | TCP      | Your IP/32    | SSH               |
| 80   | TCP      | 0.0.0.0/0     | HTTP (Nginx)      |
| 443  | TCP      | 0.0.0.0/0     | HTTPS (Nginx+SSL) |

7. Storage: 8GB gp2 (free tier default)
8. Launch → wait ~1 minute

### 2b. Allocate Elastic IP (important — prevents IP changing on reboot)

1. EC2 → Elastic IPs → Allocate
2. Associate with your EC2 instance
3. Copy this IP → use in Route 53 A record

### 2c. SSH and run setup script

```bash
# Make key file secure
chmod 400 your-key.pem

# SSH in
ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP

# On the EC2 instance — run the setup script
git clone https://github.com/YOUR_USERNAME/pern-todo.git
bash pern-todo/server/scripts/ec2-setup.sh
```

### 2d. Create .env file on EC2

```bash
cd /home/ubuntu/pern-todo/server
cp .env.example .env
nano .env
# Fill in: DATABASE_URL, ADMIN_TOKEN, ALLOWED_ORIGINS, NODE_ENV=production
```

### 2e. Migrate database and start server

```bash
npx prisma migrate deploy
npm run db:seed

pm2 start ecosystem.config.js
pm2 startup   # copy-paste the printed command and run it
pm2 save
```

### 2f. Configure Nginx + SSL

```bash
sudo bash scripts/nginx-setup.sh api.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

Test it:
```bash
curl https://api.yourdomain.com/health
# → {"ok":true,"env":"production"}
```

---

## STEP 3 — S3 Buckets for React Apps

### Create bucket for client-app

1. S3 → Create bucket
2. Name: `pern-todo-client-app` (must be globally unique)
3. Region: `us-east-1`
4. Uncheck **Block all public access** → confirm
5. Create bucket
6. Properties tab → **Static website hosting** → Enable
   - Index document: `index.html`
   - Error document: `index.html` (required for React Router)
7. Permissions tab → Bucket policy → paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::pern-todo-client-app/*"
  }]
}
```

### Repeat for admin-dashboard

Same steps, bucket name: `pern-todo-admin-dashboard`

---

## STEP 4 — ACM SSL Certificate

1. ACM → Request certificate (must be in **us-east-1** for CloudFront)
2. Certificate type: Public
3. Domain names — add all:
   ```
   yourdomain.com
   *.yourdomain.com
   ```
4. Validation: DNS validation
5. Click Create records in Route 53 (auto-creates CNAME records)
6. Wait ~5 minutes for status: **Issued**

---

## STEP 5 — CloudFront Distributions

### For client-app

1. CloudFront → Create distribution
2. Origin domain: S3 **website endpoint** (not the bucket ARN)
   - Looks like: `pern-todo-client-app.s3-website-us-east-1.amazonaws.com`
3. Viewer protocol policy: **Redirect HTTP to HTTPS**
4. Alternate domain names (CNAMEs): `acme.yourdomain.com`
5. Custom SSL certificate: select your ACM cert
6. Default root object: `index.html`
7. Create → wait ~10 minutes for deployment
8. Error Pages tab → Add:
   - 403 → `/index.html` → 200
   - 404 → `/index.html` → 200
9. Copy the **Distribution ID** → goes in GitHub secret `CF_DISTRIBUTION_CLIENT`

### For admin-dashboard

Same steps, alternate domain: `admin.yourdomain.com`
Copy Distribution ID → `CF_DISTRIBUTION_ADMIN`

---

## STEP 6 — Route 53 DNS

1. Route 53 → Hosted zones → Create hosted zone
2. Domain name: `yourdomain.com`
3. Copy the **4 NS records** → paste into your domain registrar's nameserver settings
4. Create records:

| Name                   | Type  | Value                              |
|------------------------|-------|------------------------------------|
| api.yourdomain.com     | A     | YOUR_EC2_ELASTIC_IP                |
| acme.yourdomain.com    | CNAME | CloudFront domain (client-app)     |
| admin.yourdomain.com   | CNAME | CloudFront domain (admin-dash)     |
| *.yourdomain.com       | CNAME | CloudFront domain (client-app)     |

---

## STEP 7 — GitHub Actions CI/CD

### 7a. Create IAM user for GitHub Actions

1. IAM → Users → Create user
2. Name: `github-actions-pern-todo`
3. Attach policies:
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
4. Create access key → copy Key ID and Secret

### 7b. Add GitHub Secrets

Go to: GitHub repo → Settings → Secrets and variables → Actions

Add all secrets listed in `.github/SECRETS.md`:

| Secret                  | Value                                |
|-------------------------|--------------------------------------|
| AWS_ACCESS_KEY_ID       | IAM access key ID                    |
| AWS_SECRET_ACCESS_KEY   | IAM secret access key                |
| AWS_REGION              | us-east-1                            |
| EC2_HOST                | Your EC2 Elastic IP                  |
| EC2_USER                | ubuntu                               |
| EC2_SSH_KEY             | Full content of your .pem key file   |
| VITE_API_URL            | https://api.yourdomain.com           |
| S3_BUCKET_CLIENT        | pern-todo-client-app                 |
| S3_BUCKET_ADMIN         | pern-todo-admin-dashboard            |
| CF_DISTRIBUTION_CLIENT  | CloudFront distribution ID (client)  |
| CF_DISTRIBUTION_ADMIN   | CloudFront distribution ID (admin)   |

### 7c. Deploy

```bash
git add .
git commit -m "deploy: initial AWS setup"
git push origin main
```

GitHub Actions runs 3 parallel jobs. Watch progress at:
GitHub repo → Actions tab

---

## Ongoing: Update Workflows

### Frontend change only
```bash
# Edit any file in client-app/ or admin-dashboard/
git add . && git commit -m "fix: update UI" && git push
# → GitHub Actions rebuilds React + syncs S3 + invalidates CloudFront
# → Live in ~2 minutes
```

### Backend change only (no schema change)
```bash
# Edit any file in server/src/
git add . && git commit -m "fix: update API" && git push
# → GitHub Actions SSHs into EC2, git pull, pm2 restart
# → Live in ~30 seconds
```

### Prisma schema change
```bash
# 1. Edit server/prisma/schema.prisma locally
# 2. Create migration locally:
npx prisma migrate dev --name describe_your_change
# 3. Commit the new migration file:
git add . && git commit -m "db: add new field" && git push
# → GitHub Actions runs: npx prisma migrate deploy on EC2
# → NEVER run prisma migrate dev on production
```

### Add a new client subdomain
```bash
# 1. In admin dashboard → + New Client → enter name + subdomain
# 2. Route 53 → add CNAME: newclient.yourdomain.com → CloudFront domain
# 3. CloudFront → Alternate domains → add newclient.yourdomain.com
# 4. ACM wildcard cert already covers *.yourdomain.com — no action needed
# Done — same S3 build serves all subdomains
```

---

## Monthly Cost Estimate

| Service    | Free Tier (12 months) | After Free Tier |
|------------|-----------------------|-----------------|
| EC2        | Free                  | ~$8/month       |
| RDS        | Free                  | ~$15/month      |
| S3         | Free (5GB)            | ~$0.50/month    |
| CloudFront | Free (1TB)            | ~$1/month       |
| Route 53   | $0.50/zone            | $0.50/month     |
| ACM        | Free                  | Free            |
| **Total**  | **~$0.50/month**      | **~$25/month**  |

---

## Troubleshooting

```bash
# Check API is running
curl https://api.yourdomain.com/health

# Check PM2 logs on EC2
ssh -i key.pem ubuntu@EC2_IP
pm2 logs pern-api --lines 50

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart everything on EC2
pm2 restart pern-api
sudo systemctl restart nginx

# Check database connection
cd /home/ubuntu/pern-todo/server
npx prisma db pull   # should list your tables
```
