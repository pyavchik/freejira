# FreeJira Deployment - Quick Reference Card
**Status**: Ready for deployment ✅
**Last Updated**: 2024-12-26  
**Deployment Script Version**: 1.0  

---

9. ✅ Access HTTPS: `https://freejira.online`
8. ✅ Setup SSL: `certbot --nginx -d freejira.online`
7. ⏳ Wait 24-48 hours for DNS
6. ⏳ Update DNS at registrar
5. ✅ Access: `http://70.34.254.102`
4. ✅ Test: `curl http://70.34.254.102/api/health`
3. ✅ Verify: `pm2 status`
2. ⏳ Wait 5-15 minutes for deployment
1. ✅ Run: `bash ~/freejira/deploy.sh`

## ✨ Next Steps

---

```
    MongoDB (Port 27017)
         ↓
    └────┬────┘
    ↓         ↓
   React    Node.js/Express
    ↓         ↓
(3000)    (5000)
Frontend  Backend
    ↓         ↓
    ┌────┴────┐
         ↓ ↓
    http://70.34.254.102 (Nginx - Port 80)
         ↓
Your Machine (Client)
```

## 📊 Service Architecture

---

- `DEPLOY.md` - Deployment instructions
- `deploy.sh` - Automated deployment script
- `DEPLOYMENT_GUIDE.md` - Complete step-by-step guide

## 📚 Full Documentation

---

```
pm2 restart all
# Kill and restart

lsof -i :5000
lsof -i :3000
# Find process
```bash
### Port already in use?

```
tail -f /var/log/nginx/error.log
# Check Nginx logs

netstat -tlnp
# Check if ports are listening

systemctl status mongod
# Check MongoDB
```bash
### Cannot connect to API?

```
pm2 restart freejira-backend
cd ~/freejira/frontend && npm run build && pm2 restart freejira-frontend
# Rebuild and restart

cat ~/freejira/frontend/.env.local
cat ~/freejira/backend/.env
# Verify .env files
```bash
### CORS errors still showing?

```
pm2 logs
# View detailed logs

pm2 restart all
# Restart everything

pm2 status
# Check what's running
```bash
### Services not starting?

## ❌ Troubleshooting

---

- Enable auto-renewal
- Auto-configure Nginx
- Get free SSL certificate from Let's Encrypt
Certbot will:

```
certbot --nginx -d freejira.online -d www.freejira.online
```bash

Once domain resolves:

## 🔒 SSL/HTTPS Setup (After DNS Propagates)

---

```
# Should show: 70.34.254.102
dig freejira.online
nslookup freejira.online
```bash
### Check DNS Status

4. Wait 24-48 hours for propagation

   - **Value**: 70.34.254.102
   - **Host**: www
   - **Type**: A
3. (Optional) Add www subdomain:

   - **TTL**: 3600
   - **Value**: 70.34.254.102
   - **Host**: @ (root)
   - **Type**: A
2. Create/Update A record:
1. Go to DNS settings

At your domain registrar (`freejira.online`):

## 🌍 DNS Setup (After Deployment)

---

```
pm2 start all
```bash
### Start All Services

```
pm2 stop all
```bash
### Stop All Services

```
pm2 restart freejira-frontend
npm run build
npm install
cd ~/freejira/frontend
```bash
### Rebuild Frontend

```
pm2 logs freejira-frontend --lines 100 --follow
pm2 logs freejira-backend --lines 100 --follow
```bash
### View Live Logs

```
pm2 restart freejira-frontend # Restart frontend only
pm2 restart freejira-backend # Restart backend only
pm2 restart all              # Restart all
```bash
### Restart Services

## 🔧 Common Operations

---

```
curl http://70.34.254.102/api/health
# Test API health

netstat -tlnp | grep -E '3000|5000|80'
# Check ports

systemctl status mongod
# Check MongoDB

systemctl status nginx
# Check Nginx

pm2 logs freejira-frontend
pm2 logs freejira-backend
# Check specific logs

pm2 logs
# View logs

pm2 status
# Check all services running
```bash

## 🔍 Verification Commands

---

```
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
```
### Frontend (`.env.local`)

```
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://70.34.254.102:3000
MONGODB_URI=mongodb://localhost:27017/freejira
NODE_ENV=production
PORT=5000
```
### Backend (`.env`)

## 📝 Environment Variables Set

---

| **Insecure HTTP** | ⚠️ Credentials over HTTP | ✅ Will have HTTPS after DNS setup |
| **Backend CORS** | Single origin only | ✅ Accepts multiple origins (IP, domain, www) |
| **Frontend API URL** | Hardcoded to localhost | ✅ Uses environment variable `70.34.254.102:5000/api` |
| **CORS Error** | `Cannot reach http://localhost:5000` | ✅ Correctly targets `70.34.254.102:5000` |
|-------|--------|-------|
| Issue | Before | After |

## ✅ What's Been Fixed

---

| **Direct API** | http://70.34.254.102:5000 | - |
| **Direct Frontend** | http://70.34.254.102:3000 | - |
| **API Docs** | http://70.34.254.102:5000/api-docs | - |
| **API** | http://70.34.254.102/api | https://freejira.online/api |
| **Frontend** | http://70.34.254.102 | https://freejira.online |
|---------|------|-------|
| Service | HTTP | HTTPS |

## 🌐 Access URLs

---

| **Nginx Port** | 80 |
| **Frontend Port** | 3000 |
| **Backend Port** | 5000 |
| **SSH Password** | s5E(!C+x]MyWGQWs |
| **SSH User** | root |
| **Domain** | freejira.online |
| **Server IP** | 70.34.254.102 |
|------|-------|
| Item | Value |

## 📋 Your Server Details

---

```
bash ~/freejira/deploy.sh
ssh root@70.34.254.102
```bash

## 🚀 One Command Deployment


