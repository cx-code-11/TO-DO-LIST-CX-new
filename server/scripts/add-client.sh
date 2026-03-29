#!/bin/bash
# =============================================================
#  scripts/add-client.sh
#  Registers a new client via the API
#  Run this locally (not on EC2)
#
#  Usage: bash add-client.sh
# =============================================================

read -p "API URL (e.g. https://api.yourdomain.com): " API_URL
read -p "Admin token: " ADMIN_TOKEN
read -p "Client name (e.g. Acme Corp): " CLIENT_NAME
read -p "Subdomain (e.g. acme): " SUBDOMAIN

echo ""
echo "▶ Registering client '${CLIENT_NAME}' at ${SUBDOMAIN}.yourdomain.com ..."

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${API_URL}/admin/clients" \
  -H "X-Admin-Token: ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${CLIENT_NAME}\",\"subdomain\":\"${SUBDOMAIN}\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Client created: $BODY"
  echo ""
  echo "Next steps:"
  echo "  1. Route 53 → add CNAME: ${SUBDOMAIN}.yourdomain.com → your CloudFront domain"
  echo "  2. CloudFront → Alternate domains → add ${SUBDOMAIN}.yourdomain.com"
  echo "  3. Wait ~5 min for DNS propagation"
  echo "  4. Test: curl https://${SUBDOMAIN}.yourdomain.com"
else
  echo "❌ Failed (HTTP $HTTP_CODE): $BODY"
fi
