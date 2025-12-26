#!/bin/bash

# COPY THIS ENTIRE SCRIPT AND RUN IT ON YOUR SERVER
# This fixes the CORS error immediately

cat > ~/freejira/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
EOF

echo "✓ Environment file created"

cd ~/freyjira/frontend
npm run build

echo "✓ Frontend rebuilt"

pm2 restart freyjira-frontend

echo "✓ Frontend restarted"
echo ""
echo "Wait 15 seconds, then test:"
echo "  http://70.34.254.102/register"
echo ""
echo "✅ CORS error should be fixed!"

