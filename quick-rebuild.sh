#!/bin/bash

# FreeJira Quick Rebuild and Run
# Run this on your server to rebuild and start everything

pm2 stop all 2>/dev/null || true

echo "Rebuilding backend..."
cd ~/freyjira/backend
npm install > /dev/null 2>&1
pm2 delete freyjira-backend 2>/dev/null || true
pm2 start npm --name "freyjira-backend" -- run start > /dev/null 2>&1
echo "✓ Backend ready"

echo "Rebuilding frontend..."
cd ~/freyjira/frontend

# Set environment
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
EOF

npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1
pm2 delete freyjira-frontend 2>/dev/null || true
pm2 start npm --name "freyjira-frontend" -- start > /dev/null 2>&1
echo "✓ Frontend ready"

echo ""
echo "Waiting for services to start..."
sleep 15

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  Rebuild Complete!                     ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Service Status:"
pm2 status
echo ""
echo "Test your app:"
echo "  http://70.34.254.102/register"
echo ""

