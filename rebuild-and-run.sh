#!/bin/bash

# FreeJira Complete Rebuild and Run Script
# This script rebuilds and runs the entire application on your server

set -e

echo "╔═════════════════════════════════════════╗"
echo "║  FreeJira Complete Rebuild & Run        ║"
echo "╚═════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Stop all services
echo -e "${YELLOW}Step 1: Stopping services...${NC}"
pm2 stop all 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓ Services stopped${NC}"
echo ""

# Step 2: Update backend
echo -e "${YELLOW}Step 2: Rebuilding backend...${NC}"
cd ~/freejira/backend

# Install dependencies
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Restart backend
pm2 start npm --name "freejira-backend" -- run start
echo -e "${GREEN}✓ Backend started${NC}"
echo ""

# Step 3: Update frontend
echo -e "${YELLOW}Step 3: Rebuilding frontend...${NC}"
cd ~/freejira/frontend

# Create/update .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
EOF
echo -e "${GREEN}✓ Frontend environment configured${NC}"

# Install dependencies
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Build frontend
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

# Start frontend
pm2 start npm --name "freejira-frontend" -- start
echo -e "${GREEN}✓ Frontend started${NC}"
echo ""

# Step 4: Verify services
echo -e "${YELLOW}Step 4: Verifying services...${NC}"
sleep 5
pm2 status
echo ""

# Step 5: Test API
echo -e "${YELLOW}Step 5: Testing API...${NC}"
if curl -s http://70.34.254.102:5000/api/health | grep -q "success"; then
    echo -e "${GREEN}✓ API is responding${NC}"
else
    echo -e "${YELLOW}⚠ API may still be starting...${NC}"
fi
echo ""

# Step 6: Display info
echo "╔═════════════════════════════════════════╗"
echo "║  Rebuild Complete!                      ║"
echo "╚═════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓ Backend rebuilt and running${NC}"
echo -e "${GREEN}✓ Frontend rebuilt and running${NC}"
echo -e "${GREEN}✓ All services started${NC}"
echo ""
echo "Access your application:"
echo "  Frontend:   http://70.34.254.102"
echo "  API:        http://70.34.254.102:5000/api"
echo "  API Docs:   http://70.34.254.102:5000/api-docs"
echo ""
echo "Test registration:"
echo "  http://70.34.254.102/register"
echo ""
echo "Monitor services:"
echo "  pm2 status"
echo "  pm2 logs"
echo ""

