#!/bin/bash
set -euo pipefail

GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
log() { echo -e "\n${CYAN}$1${NC}"; }
ok()  { echo -e "${GREEN}  ✅ $1${NC}"; }

echo ""
echo -e "${CYAN}══════════════════════════════════════════${NC}"
echo -e "${CYAN}  BankingPoint24 — EC2 One-Time Setup${NC}"
echo -e "${CYAN}══════════════════════════════════════════${NC}"

# ── 1. System update ──────────────────────────────────────────────────
log "[1/7] Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
ok "System updated"

# ── 2. Node.js 20 LTS ─────────────────────────────────────────────────
log "[2/7] Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - > /dev/null 2>&1
sudo apt-get install -y nodejs > /dev/null 2>&1
ok "Node $(node -v) | npm $(npm -v)"

# ── 3. PM2 ────────────────────────────────────────────────────────────
log "[3/7] Installing PM2..."
sudo npm install -g pm2 > /dev/null 2>&1
ok "PM2 $(pm2 -v)"

# ── 4. Nginx ─────────────────────────────────────────────────────────
log "[4/7] Installing Nginx..."
sudo apt-get install -y nginx > /dev/null 2>&1
sudo systemctl enable nginx
sudo systemctl start nginx
ok "Nginx installed & running"

# ── 5. ffmpeg (KYC video) ─────────────────────────────────────────────
log "[5/7] Installing ffmpeg..."
sudo apt-get install -y ffmpeg > /dev/null 2>&1
ok "$(ffmpeg -version 2>&1 | head -1)"

# ── 6. Clone repo ─────────────────────────────────────────────────────
log "[6/7] Cloning BankingPoint24 repo..."
if [ -d "/home/ubuntu/bankingpoint24/.git" ]; then
  echo "  Repo already cloned — skipping"
else
  git clone https://github.com/manishisblessed/ye_services_24-7.git /home/ubuntu/bankingpoint24
  ok "Repo cloned to /home/ubuntu/bankingpoint24"
fi

# ── 7. PM2 startup on boot ────────────────────────────────────────────
log "[7/7] Configuring PM2 to start on boot..."
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash || true
ok "PM2 startup configured"

# ── Create logs dir ───────────────────────────────────────────────────
mkdir -p /home/ubuntu/logs

echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  SERVER SETUP COMPLETE! 🎉${NC}"
echo -e "${GREEN}  Node: $(node -v) | PM2: $(pm2 -v)${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo ""
echo "  Next: run ./deploy.sh inside /home/ubuntu/bankingpoint24"
echo ""
