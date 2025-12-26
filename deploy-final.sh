#!/bin/bash

# Final Complete Server Setup - Direct Deployment

echo "═════════════════════════════════════════"
echo "  FreeJira - Complete Server Fix"
echo "═════════════════════════════════════════"
echo ""

SERVER_IP="70.34.254.102"
SERVER_USER="root"
PASSWORD='s5E(!C+x]MyWGQWs'

# Step 1: Copy application to server
echo "Step 1: Uploading application to server..."
echo "This may take 1-2 minutes..."
echo ""

# Using expect to handle password
cat > /tmp/deploy.exp << 'EXPECTSCRIPT'
#!/usr/bin/expect

set server "70.34.254.102"
set user "root"
set password "s5E(!C+x]MyWGQWs"
set source "/home/ubuntu/workspace/freejira"
set timeout 300

spawn scp -r $source $user@$server:/root/

expect {
    "password:" {
        send "$password\r"
        expect eof
    }
    eof { exit 0 }
    timeout { puts "Timeout!"; exit 1 }
}
EXPECTSCRIPT

chmod +x /tmp/deploy.exp
expect /tmp/deploy.exp

echo "✓ Application uploaded"
echo ""

# Step 2: Install and configure server
echo "Step 2: Installing dependencies and configuring server..."
echo ""

cat > /tmp/server-setup.sh << 'SETUPSCRIPT'
#!/bin/bash

echo "Starting server configuration..."
echo ""

# Update system
apt-get update -qq
apt-get upgrade -y -qq > /dev/null 2>&1

# Install Node.js
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs > /dev/null 2>&1
fi
echo "✓ Node.js installed"

# Install MongoDB
apt-get install -y mongodb > /dev/null 2>&1 || apt-get install -y mongodb-org > /dev/null 2>&1
systemctl start mongodb 2>/dev/null || systemctl start mongod 2>/dev/null || true
systemctl enable mongodb 2>/dev/null || systemctl enable mongod 2>/dev/null || true
echo "✓ MongoDB installed"

# Install Nginx
apt-get install -y nginx > /dev/null 2>&1
systemctl start nginx
systemctl enable nginx
echo "✓ Nginx installed"

# Install PM2
npm install -g pm2 > /dev/null 2>&1
echo "✓ PM2 installed"

echo ""
echo "Building FreeJira application..."
echo ""

# Stop any existing PM2 apps
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 2

# Backend setup
echo "Building backend..."
cd /root/freejira/backend
cat > .env << 'ENV'
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/freejira
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://70.34.254.102:3000
ENV

npm install > /dev/null 2>&1
pm2 start npm --name "freyjira-backend" -- run start

# Frontend setup
echo "Building frontend..."
cd /root/freejira/frontend
cat > .env.local << 'ENV'
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
ENV

npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1
pm2 start npm --name "freyjira-frontend" -- start

# Nginx configuration
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/freyjira << 'NGINX'
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name 70.34.254.102 freyjira.online www.freyjira.online;

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
NGINX

ln -sf /etc/nginx/sites-available/freyjira /etc/nginx/sites-enabled/ 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t 2>&1 | grep -q "successful" && systemctl restart nginx || systemctl restart nginx
echo "✓ Nginx configured"

# PM2 setup
pm2 save
pm2 startup -u root --hp /root > /dev/null 2>&1

# Wait and check
echo ""
echo "Waiting for services to start (20 seconds)..."
sleep 20

echo ""
echo "═════════════════════════════════════════"
echo "  Setup Complete!"
echo "═════════════════════════════════════════"
echo ""
pm2 status
echo ""
echo "Your FreeJira app is live at:"
echo "  ✓ http://70.34.254.102"
echo "  ✓ http://70.34.254.102/register"
echo ""

SETUPSCRIPT

# Send setup script to server
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no /tmp/server-setup.sh root@$SERVER_IP:/tmp/
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP 'bash /tmp/server-setup.sh'

echo ""
echo "✅ Server is now ready!"
echo ""
echo "Test your app at: http://70.34.254.102/register"
echo ""

