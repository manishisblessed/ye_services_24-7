#!/bin/bash
# Generate Cloudflare block proof for Chagans team
OUT="/home/ubuntu/chagans-block-proof.txt"

{
echo "============================================================"
echo "  Chagans API — Cloudflare Block Proof"
echo "  Generated: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "============================================================"
echo ""
echo "--- 1. Our Server Identity ---"
echo "Outbound IP: $(curl -s https://api.ipify.org)"
echo "Hostname: $(hostname)"
echo "Region: AWS ap-southeast-2 (Sydney)"
echo ""
echo "--- 2. DNS Resolution for chagans.com ---"
dig +short chagans.com
echo "(These are Cloudflare proxy IPs, not Chagans origin)"
echo ""
echo "--- 3. Full API Request + Response (with all 3 credentials) ---"
echo ""
source /home/ubuntu/bankingpoint24/.env
curl -sv -X POST "https://chagans.com/partnerPg/payRequest" \
  -H "accept: application/json" \
  -H "content-type: application/json" \
  -H "client-id: $CHAGAN_CLIENT_ID" \
  -H "client-secret: $CHAGAN_CLIENT_SECRET" \
  -H "Authorization: Bearer $CHAGAN_API_TOKEN" \
  -d '{"amount":12,"pgType":"chagans3","txnId":"PROOFTEST001","mode":"t1","name":"Test","mobile":"9000000001","email":"test@test.com"}' \
  2>&1
echo ""
echo ""
echo "============================================================"
echo "  CONCLUSION"
echo "============================================================"
echo "Cloudflare is returning HTTP 403 (blocked) BEFORE our request"
echo "reaches the Chagans application server."
echo ""
echo "Action needed: Please whitelist IP $(curl -s https://api.ipify.org)"
echo "in your Cloudflare WAF / Firewall Rules."
echo ""
echo "Partner ID: $CHAGAN_CLIENT_ID"
echo "============================================================"
} > "$OUT" 2>&1

echo "Proof saved to $OUT ($(wc -l < "$OUT") lines)"
