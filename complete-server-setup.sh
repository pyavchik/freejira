#!/bin/bash

# FreeJira Server Complete Setup
# Installs everything and fixes the server

PASSWORD='s5E(!C+x]MyWGQWs'
SERVER='root@70.34.254.102'

echo "Starting FreeJira server setup..."
echo ""

# Connect and run all setup commands
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER" << 'EOF'

echo "=========================================="
echo "  FreeJira Server Complete Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs > /dev/null 2>&1
    echo "✓ Node.js installed"
else
    echo "✓ Node.js already installed"
fi

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "Installing MongoDB..."
    apt install -y mongodb > /dev/null 2>&1
    systemctl start mongodb
    systemctl enable mongodb
    echo "✓ MongoDB installed"
else
    echo "✓ MongoDB already installed"
    systemctl start mongodb || true
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt install -y nginx > /dev/null 2>&1
    systemctl start nginx
    systemctl enable nginx
    echo "✓ Nginx installed"
else
    echo "✓ Nginx already installed"
    systemctl start nginx || true
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2 > /dev/null 2>&1
    echo "✓ PM2 installed"
else
    echo "✓ PM2 already installed"
fi

echo ""
echo "Building and starting FreeJira..."
echo ""

# Kill any existing PM2 processes
pm2 kill 2>/dev/null || true
sleep 2

# Setup backend
echo "Setting up backend..."
cd ~/freyjira/backend
npm install > /dev/null 2>&1
cat > .env << 'ENVFILE'
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/freejira
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://70.34.254.102:3000
ENVFILE
pm2 start npm --name "freyjira-backend" -- run start
echo "✓ Backend started"

# Setup frontend
echo "Setting up frontend..."
cd ~/freyjira/frontend
cat > .env.local << 'ENVFILE'
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
ENVFILE
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1
pm2 start npm --name "freyjira-frontend" -- start
echo "✓ Frontend started"

# Setup Nginx
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
rm -f /etc/nginx/sites-enabled/default
nginx -t > /dev/null 2>&1
systemctl restart nginx
echo "✓ Nginx configured"

# Save PM2 state
pm2 save
pm2 startup -u root --hp /root > /dev/null 2>&1

# Wait for services to start
echo ""
echo "Waiting for services to start (15 seconds)..."
sleep 15

# Show status
echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
pm2 status
echo ""
echo "Testing API..."
curl -s http://70.34.254.102:5000/api/health | head -c 50
echo ""
echo ""
echo "Your FreeJira app is live at:"
echo "  http://70.34.254.102"
echo "  http://70.34.254.102/register"
echo ""

EOF

echo "✅ Server setup complete!"

