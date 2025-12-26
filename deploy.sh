#!/bin/bash

# FreeJira Quick Deployment Script
# Run this on your server: bash ~/freejira/deploy.sh

set -e

echo "========================================="
echo "FreeJira Deployment Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${YELLOW}Step 1: Installing system dependencies...${NC}"
apt update
apt upgrade -y
apt install -y curl git nginx

# Install Node.js 20
echo -e "${YELLOW}Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install MongoDB
echo -e "${YELLOW}Installing MongoDB...${NC}"
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod
echo -e "${GREEN}✓ MongoDB installed and started${NC}"

# Install PM2
echo -e "${YELLOW}Installing PM2...${NC}"
npm install -g pm2
pm2 install pm2-logrotate
echo -e "${GREEN}✓ PM2 installed${NC}"

# Step 2: Setup environment variables
echo -e "${YELLOW}Step 2: Setting up environment variables...${NC}"

cat > ~/freejira/backend/.env << 'EOF'
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/freejira
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://70.34.254.102:3000
EOF
echo -e "${GREEN}✓ Backend .env created${NC}"

cat > ~/freejira/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
EOF
echo -e "${GREEN}✓ Frontend .env.local created${NC}"

# Step 3: Install and build applications
echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"

cd ~/freejira/backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

cd ~/freejira/frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Step 4: Build frontend
echo -e "${YELLOW}Step 4: Building frontend...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

# Step 5: Start services
echo -e "${YELLOW}Step 5: Starting services with PM2...${NC}"

cd ~/freejira/backend
pm2 delete freejira-backend 2>/dev/null || true
pm2 start npm --name "freejira-backend" -- run start
echo -e "${GREEN}✓ Backend started${NC}"

cd ~/freejira/frontend
pm2 delete freejira-frontend 2>/dev/null || true
pm2 start npm --name "freejira-frontend" -- start
echo -e "${GREEN}✓ Frontend started${NC}"

pm2 save
pm2 startup

# Step 6: Configure Nginx
echo -e "${YELLOW}Step 6: Configuring Nginx...${NC}"

cat > /etc/nginx/sites-available/freejira << 'EOF'
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name 70.34.254.102 freejira.online www.freejira.online;

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/freejira /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx
echo -e "${GREEN}✓ Nginx configured and restarted${NC}"

# Step 7: Setup SSL (optional)
echo -e "${YELLOW}Step 7: Setting up SSL with Certbot (optional)...${NC}"
apt install -y certbot python3-certbot-nginx

echo -e "${YELLOW}Note: Run 'certbot --nginx -d freejira.online' once DNS propagates${NC}"

# Final status
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Your application is now running at:"
echo "  - Frontend: http://70.34.254.102"
echo "  - API: http://70.34.254.102/api"
echo "  - API Docs: http://70.34.254.102:5000/api-docs"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check service status"
echo "  pm2 logs            - View all logs"
echo "  pm2 logs freejira-backend  - View backend logs"
echo "  pm2 logs freejira-frontend - View frontend logs"
echo "  pm2 restart all     - Restart all services"
echo ""
echo "Next steps:"
echo "  1. Wait for DNS to propagate (24-48 hours)"
echo "  2. Run: certbot --nginx -d freejira.online"
echo "  3. Access via https://freejira.online"
echo ""

