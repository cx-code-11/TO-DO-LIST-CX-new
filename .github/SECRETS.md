# ================================================================
#  GitHub Repository Secrets
#  Settings → Secrets and variables → Actions → New repository secret
# ================================================================
#
#  Add ALL of these before pushing to main branch.
#
# ── AWS credentials (create an IAM user with these permissions:) ─
#    AmazonS3FullAccess
#    CloudFrontFullAccess
#    (no EC2 access needed — SSH key handles that)
#
AWS_ACCESS_KEY_ID        = AKIA...your-access-key
AWS_SECRET_ACCESS_KEY    = your-secret-access-key
AWS_REGION               = us-east-1

# ── EC2 SSH access ───────────────────────────────────────────────
EC2_HOST                 = 54.123.45.67          # EC2 Elastic IP
EC2_USER                 = ubuntu
EC2_SSH_KEY              = -----BEGIN RSA PRIVATE KEY-----
                           (paste the full content of your .pem file)
                           -----END RSA PRIVATE KEY-----

# ── React build env vars ─────────────────────────────────────────
VITE_API_URL             = https://api.yourdomain.com

# ── S3 bucket names ──────────────────────────────────────────────
S3_BUCKET_CLIENT         = pern-todo-client-app
S3_BUCKET_ADMIN          = pern-todo-admin-dashboard

# ── CloudFront distribution IDs ──────────────────────────────────
CF_DISTRIBUTION_CLIENT   = E1ABCDEF1234567   # from CloudFront console
CF_DISTRIBUTION_ADMIN    = E2ABCDEF7654321   # from CloudFront console
