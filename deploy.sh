#!/usr/bin/env bash
set -e

# ==== CONFIG ====
VPS_USER=jide           # your VPS username
VPS_HOST=173.212.211.178    # or domain name
APP_DIR=~/projects/chatapp  # where the app will live on the VPS

# ==== DEPLOY ====
echo "Syncing files to VPS..."
rsync -az --delete --exclude=".git" ./ "$VPS_USER@$VPS_HOST:$APP_DIR/"

echo "Running deploy commands on VPS..."
ssh "$VPS_USER@$VPS_HOST" << 'EOF'
  cd /var/www/myapp

  # Example: Node.js
  if [ -f package.json ]; then
    npm install --omit=dev
    pm2 restart myapp || pm2 start npm --name myapp -- start
  fi

  # Example: Docker
  if [ -f docker-compose.yml ] || [ -f compose.yml ]; then
    docker compose down || docker-compose down || true
    docker compose up -d --build || docker-compose up -d --build
  fi
EOF

echo "✅ Deployment done!"