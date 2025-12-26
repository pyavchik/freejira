# FreeJira Deployment Guide

## Server Details
- **IP**: 70.34.254.102
- **Domain**: freejira.online
- **User**: root

## Complete Deployment Steps

### Step 1: Install Node.js and Dependencies

```bash
# SSH into your server
ssh root@70.34.254.102

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Install Nginx and PM2
apt install -y nginx git
npm install -g pm2
```

### Step 2: Configure Environment Variables

```bash
# Backend .env
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

# Frontend .env.local
cat > ~/freejira/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
EOF
```

### Step 3: Install Dependencies and Build

```bash
# Backend
cd ~/freejira/backend
npm install

# Frontend
cd ~/freejira/frontend
npm install
npm run build
```

### Step 4: Start Services with PM2

```bash
# Backend
cd ~/freejira/backend
pm2 start npm --name "freejira-backend" -- run start

# Frontend
cd ~/freejira/frontend
pm2 start npm --name "freejira-frontend" -- start

# Save PM2 config
pm2 save
pm2 startup
```

### Step 5: Configure Nginx Reverse Proxy

```bash
cat > /etc/nginx/sites-available/freejira << 'EOF'
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name 70.34.254.102 freejira.online;

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

# Enable site
ln -s /etc/nginx/sites-available/freejira /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart
nginx -t
systemctl restart nginx
```

### Step 6: Setup SSL/HTTPS

```bash
apt install -y certbot python3-certbot-nginx

# Once DNS propagates, run:
certbot --nginx -d freejira.online
```

### Step 7: Verify Deployment

```bash
# Check all services
pm2 status
systemctl status nginx
systemctl status mongod

# Test the application
curl http://70.34.254.102
curl http://70.34.254.102/api/health

# Monitor logs
pm2 logs freejira-backend
pm2 logs freejira-frontend
```

## Accessing Your Application

- **Frontend**: http://70.34.254.102:3000 (direct) or http://70.34.254.102 (via Nginx)
- **API**: http://70.34.254.102:5000/api (direct) or http://70.34.254.102/api (via Nginx)
- **API Docs**: http://70.34.254.102:5000/api-docs

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure:
1. Backend `.env` has correct `FRONTEND_URL`
2. Frontend `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Both are rebuilt/restarted

### Domain Not Resolving
DNS propagation can take 24-48 hours. Check with:
```bash
nslookup freejira.online
dig freejira.online
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
systemctl status mongod

# Restart MongoDB
systemctl restart mongod
```

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

## Updating the Application

```bash
# Pull latest changes
cd ~/freejira
git pull origin main

# Rebuild frontend
cd ~/freejira/frontend
npm install
npm run build
pm2 restart freejira-frontend

# Restart backend
cd ~/freejira/backend
npm install
pm2 restart freejira-backend
```

