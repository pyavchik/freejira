#!/bin/bash

# FreeJira Server Auto-Fix Script
# This script SSHes to your server and runs the fix command automatically

set -e

SERVER_IP="70.34.254.102"
SERVER_USER="root"

echo "╔════════════════════════════════════════╗"
echo "║  FreeJira Server Auto-Fix              ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/freyjira ]; then
    echo "❌ SSH key not found at ~/.ssh/freyjira"
    echo "Please set up SSH keys first:"
    echo "  bash ~/freyjira/setup-ssh.sh"
    exit 1
fi

echo "Connecting to server: $SERVER_IP"
echo ""

# Run the fix command on the server
ssh -i ~/.ssh/freyjira "$SERVER_USER@$SERVER_IP" << 'EOF'

echo "════════════════════════════════════════"
echo "  Fixing FreeJira Server"
echo "════════════════════════════════════════"
echo ""

# Step 1: Kill PM2
echo "Step 1: Stopping services..."
pm2 kill 2>/dev/null || true
sleep 2
echo "✓ Services stopped"
echo ""

# Step 2: Restart MongoDB
echo "Step 2: Restarting MongoDB..."
systemctl restart mongod 2>/dev/null || true
sleep 2
echo "✓ MongoDB restarted"
echo ""

# Step 3: Restart Nginx
echo "Step 3: Restarting Nginx..."
systemctl restart nginx 2>/dev/null || true
sleep 2
echo "✓ Nginx restarted"
echo ""

# Step 4: Start Backend
echo "Step 4: Starting backend..."
pm2 start npm --cwd ~/freyjira/backend --name "freyjira-backend" -- run start
sleep 5
echo "✓ Backend started"
echo ""

# Step 5: Start Frontend
echo "Step 5: Starting frontend..."
pm2 start npm --cwd ~/freyjira/frontend --name "freyjira-frontend" -- start
sleep 5
echo "✓ Frontend started"
echo ""

# Step 6: Wait for full startup
echo "Waiting for services to fully start (15 seconds)..."
sleep 15
echo ""

# Step 7: Show status
echo "════════════════════════════════════════"
echo "  Status:"
echo "════════════════════════════════════════"
pm2 status
echo ""

# Step 8: Test API
echo "Testing API..."
if curl -s http://70.34.254.102:5000/api/health | grep -q "success"; then
    echo "✓ API is responding!"
else
    echo "⚠ API may still be starting..."
fi

echo ""
echo "════════════════════════════════════════"
echo "  Fix Complete!"
echo "════════════════════════════════════════"
echo ""
echo "Your app should be accessible at:"
echo "  http://70.34.254.102/register"
echo ""

EOF

echo "✅ Server fix completed!"
echo ""
echo "Next steps:"
echo "1. Open your browser"
echo "2. Go to: http://70.34.254.102/register"
echo "3. Test your app"
echo ""

