#!/bin/bash

# FreeJira CORS Error Quick Fix
# Run this on your server to fix CORS errors

set -e

echo "╔═════════════════════════════════════╗"
echo "║  FreeJira CORS Error Quick Fix      ║"
echo "╚═════════════════════════════════════╝"
echo ""

# Step 1: Create/Update Frontend Environment
echo "Step 1: Setting up frontend environment..."
cat > ~/freejira/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
EOF
echo "✓ Frontend .env.local updated"
echo ""

# Step 2: Rebuild Frontend
echo "Step 2: Rebuilding frontend (this may take 1-2 minutes)..."
cd ~/freejira/frontend
npm run build > /dev/null 2>&1
echo "✓ Frontend rebuilt successfully"
echo ""

# Step 3: Restart Frontend Service
echo "Step 3: Restarting frontend service..."
pm2 restart freyjira-frontend > /dev/null 2>&1
echo "✓ Frontend restarted"
echo ""

# Step 4: Verify Services
echo "Step 4: Verifying services..."
echo ""
pm2 status
echo ""

# Step 5: Wait for startup
echo "Step 5: Waiting for frontend to start (15 seconds)..."
sleep 15
echo "✓ Ready to test"
echo ""

# Step 6: Test API
echo "Step 6: Testing API connection..."
if curl -s http://70.34.254.102:5000/api/health | grep -q "success"; then
    echo "✓ API is responding"
else
    echo "⚠ API may not be responding (check MongoDB)"
fi
echo ""

# Summary
echo "╔═════════════════════════════════════╗"
echo "║  Fix Complete!                      ║"
echo "╚═════════════════════════════════════╝"
echo ""
echo "✓ Frontend configuration updated"
echo "✓ Frontend rebuilt"
echo "✓ Frontend service restarted"
echo ""
echo "Next steps:"
echo "1. Open your browser"
echo "2. Go to: http://70.34.254.102/register"
echo "3. Check browser console (F12) for CORS errors"
echo "4. Try registering"
echo ""
echo "If still having issues:"
echo "  Check logs: pm2 logs freyjira-frontend"
echo "  Verify API: curl http://70.34.254.102:5000/api/health"
echo ""

