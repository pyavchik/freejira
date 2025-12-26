# 🔴 SERVER NOT RESPONDING - DIAGNOSTIC & FIX GUIDE

## ⚠️ The Error You're Seeing

```
This site can't be reached - ERR_CONNECTION_TIMED_OUT
```

**Causes:**
1. Services crashed or not running
2. Nginx not running
3. MongoDB not accessible
4. Server connection issue
5. Firewall blocking ports

---

## 🔧 STEP 1: SSH to Your Server and Diagnose

SSH to your server:
```bash
ssh root@70.34.254.102
```

Or with key:
```bash
ssh -i ~/.ssh/freejira root@70.34.254.102
```

---

## ✅ STEP 2: Check Service Status

Once SSH'd in, run:

```bash
# Check if services exist and their status
pm2 status
```

**Expected output:**
```
freyjira-backend  │ online
freyjira-frontend │ online
```

If not online, go to Step 3.

---

## 🔧 STEP 3: Check What's Running

```bash
# List all PM2 apps
pm2 list

# View detailed status
pm2 describe freyjira-backend
pm2 describe freyjira-frontend

# Check logs
pm2 logs freyjira-backend --lines 20
pm2 logs freyjira-frontend --lines 20
```

---

## 🚨 STEP 4: If Services Are Crashed

```bash
# Kill all PM2 services
pm2 kill

# Wait 2 seconds
sleep 2

# Check if services auto-start
pm2 list

# If not, start them manually
pm2 start npm --cwd ~/freyjira/backend --name "freyjira-backend" -- run start
pm2 start npm --cwd ~/freyjira/frontend --name "freyjira-frontend" -- start

# Wait for startup
sleep 15

# Check status
pm2 status
```

---

## 🔍 STEP 5: Check Ports

```bash
# Check if ports are listening
netstat -tlnp | grep -E '3000|5000|80|443'

# Or use:
lsof -i :3000
lsof -i :5000
lsof -i :80
```

**Expected:**
- Port 3000: Frontend (Node.js)
- Port 5000: Backend (Node.js)
- Port 80: Nginx

---

## 🌐 STEP 6: Check Nginx

```bash
# Check if Nginx is running
systemctl status nginx

# If not, start it
systemctl start nginx

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

---

## 🗄️ STEP 7: Check MongoDB

```bash
# Check if MongoDB is running
systemctl status mongod

# If not, start it
systemctl start mongod

# Check if it's listening
netstat -tlnp | grep 27017
```

---

## 🚀 STEP 8: Full Restart Everything

```bash
# Stop all PM2 apps
pm2 stop all

# Kill PM2
pm2 kill

# Restart MongoDB
systemctl restart mongod

# Restart Nginx
systemctl restart nginx

# Wait 5 seconds
sleep 5

# Start backend
pm2 start npm --cwd ~/freyjira/backend --name "freyjira-backend" -- run start

# Start frontend
pm2 start npm --cwd ~/freyjira/frontend --name "freyjira-frontend" -- start

# Wait for startup
sleep 15

# Check everything
pm2 status
systemctl status nginx
systemctl status mongod
```

---

## ✅ STEP 9: Test Connection

```bash
# Test API
curl http://70.34.254.102:5000/api/health

# Test frontend (should return HTML)
curl http://70.34.254.102:3000

# Test Nginx (should route to frontend)
curl http://70.34.254.102
```

---

## 🎯 Quick Fix - Copy This Entire Command

```bash
pm2 kill 2>/dev/null || true
sleep 2
systemctl restart mongodb || systemctl restart mongod
systemctl restart nginx
sleep 5
pm2 start npm --cwd ~/freyjira/backend --name "freyjira-backend" -- run start
pm2 start npm --cwd ~/freyjira/frontend --name "freyjira-frontend" -- start
sleep 15
pm2 status
curl http://70.34.254.102:5000/api/health
```

---

## 📊 Troubleshooting Checklist

- [ ] SSH to server successfully
- [ ] `pm2 status` shows both services online
- [ ] `netstat -tlnp` shows ports 3000, 5000 listening
- [ ] `systemctl status nginx` shows active
- [ ] `systemctl status mongod` shows active
- [ ] `curl http://70.34.254.102:5000/api/health` returns success
- [ ] `curl http://70.34.254.102` returns HTML
- [ ] Browser: `http://70.34.254.102/register` loads

---

## 🆘 If Still Not Working

```bash
# View all logs
pm2 logs

# Check for errors
pm2 describe freyjira-backend
pm2 describe freyjira-frontend

# Check server resources
free -h
df -h

# Check port conflicts
netstat -tlnp | grep -E ':3000|:5000|:80|:443'

# Kill any processes on those ports
lsof -i :3000 -t | xargs kill -9
lsof -i :5000 -t | xargs kill -9
```

---

## 📝 Common Issues & Fixes

### Issue: Port already in use
```bash
lsof -i :5000 -t | xargs kill -9
pm2 restart freyjira-backend
```

### Issue: PM2 daemon not working
```bash
pm2 kill
pm2 start ...
```

### Issue: Out of memory
```bash
free -h
pm2 monit
```

### Issue: MongoDB not accessible
```bash
systemctl restart mongod
mongo --eval "db.adminCommand('ping')"
```

### Issue: Nginx not configured
```bash
nginx -t
systemctl restart nginx
```

---

## ✨ Success Indicators

When everything works:

✅ `pm2 status` shows both services `online`  
✅ Ports 3000, 5000, 80 are listening  
✅ `curl http://70.34.254.102/api/health` returns success  
✅ `http://70.34.254.102/register` loads in browser  
✅ No errors in `pm2 logs`  

---

**Go through these steps on your server and report back what you find!** 🚀

