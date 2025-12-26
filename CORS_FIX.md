# 🔧 QUICK FIX - CORS Error Still Happening

## ⚡ The Problem

Your frontend is still calling `http://localhost:5000` instead of `http://70.34.254.102:5000`

The frontend `.env.local` file with the correct API URL wasn't created or rebuilt.

## 🚀 Quick Fix - Run These Commands On Your Server

### Step 1: SSH to Your Server
```bash
ssh root@70.34.254.102
# Or use: ssh -i ~/.ssh/freejira root@70.34.254.102
# Or if you set up alias: ssh freejira
```

### Step 2: Create/Fix Frontend Environment File
```bash
cat > ~/freejira/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
EOF

echo "✓ Frontend .env.local updated"
```

### Step 3: Rebuild Frontend
```bash
cd ~/freejira/frontend
npm run build
echo "✓ Frontend rebuilt"
```

### Step 4: Restart Frontend Service
```bash
pm2 restart freejira-frontend
echo "✓ Frontend restarted"
```

### Step 5: Wait and Test
```bash
# Wait 10-15 seconds for frontend to start
sleep 15

# Test in your browser
# Open: http://70.34.254.102/register
# Should NOT show CORS errors anymore!
```

---

## 🎯 All In One Command (Fastest)

Copy and paste this entire command on your server:

```bash
cat > ~/freejira/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
EOF
cd ~/freejira/frontend && npm run build && pm2 restart freejira-frontend && echo "✓ Done! Wait 15 seconds then refresh your browser"
```

---

## ✅ What This Fixes

| Error | Fixed? |
|-------|--------|
| **CORS Error** | ✅ YES - Frontend calls correct API URL |
| **HTTP Warning** | ⏳ Still there (need HTTPS after DNS) |
| **Font Warning** | ✅ YES - Resolves after CORS fix |

---

## 🔍 Verify It Works

After running the commands above:

1. **Open your browser:**
   ```
   http://70.34.254.102/register
   ```

2. **Check browser console (F12):**
   - ❌ Should NOT see "CORS request did not succeed"
   - ✅ Should see the registration form load properly

3. **Try registering:**
   - ✅ Should work without errors
   - ✅ Should either succeed or show validation error (not CORS error)

---

## 🛠️ Alternative: Full Restart

If the above doesn't work, restart everything:

```bash
# Stop all services
pm2 stop all

# Restart MongoDB
systemctl restart mongod

# Rebuild backend
cd ~/freejira/backend && npm install

# Rebuild frontend
cd ~/freejira/frontend && npm install && npm run build

# Start all
pm2 start all

# Wait 30 seconds
sleep 30

# Check status
pm2 status
```

---

## 🔧 Verify Configuration

Check if your files are correct:

```bash
# Check frontend .env.local
echo "=== Frontend .env.local ==="
cat ~/freejira/frontend/.env.local

# Check backend .env
echo "=== Backend .env ==="
cat ~/freejira/backend/.env | grep FRONTEND_URL

# Check if services are running
echo "=== Service Status ==="
pm2 status
```

Expected output:
```
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
FRONTEND_URL=http://70.34.254.102:3000
```

---

## 📋 Troubleshooting

### Still getting CORS error?

1. **Verify npm build completed:**
   ```bash
   ls -la ~/freejira/frontend/.next/
   ```
   Should show `.next` directory with build files

2. **Check frontend is actually running:**
   ```bash
   pm2 logs freejira-frontend | tail -20
   ```

3. **Check backend CORS config:**
   ```bash
   grep -A 10 "allowedOrigins" ~/freejira/backend/src/server.js
   ```

4. **Test API directly:**
   ```bash
   curl http://70.34.254.102:5000/api/health
   ```
   Should return: `{"success":true,"message":"API is running"}`

### Frontend won't rebuild?

```bash
# Clear npm cache
cd ~/freejira/frontend
rm -rf node_modules
rm package-lock.json
npm install
npm run build
pm2 restart freejira-frontend
```

---

## 🚀 Quick One-Liner for Everything

```bash
cat > ~/freejira/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
EOF && cd ~/freejira/frontend && npm run build && pm2 restart freyjira-frontend && pm2 logs freyjira-frontend --lines 10
```

---

## ✨ Success Indicators

After the fix, you should see:

✅ Frontend loads at http://70.34.254.102:3000  
✅ No CORS errors in browser console  
✅ Registration form visible  
✅ Can fill and submit form  
✅ Request goes to backend (check Network tab in F12)  
✅ Either succeeds or shows validation error (not CORS)  

---

## 📞 Need More Help?

Check these files:
- See: `DEPLOYMENT_GUIDE.md` → Troubleshooting section
- See: `ERROR_ANALYSIS.md` → CORS Error section
- See: `QUICK_REFERENCE.md` → Common commands

---

**Status**: 🔧 Ready to fix  
**Time Required**: 5-10 minutes  
**Difficulty**: Easy 🟢  
**Impact**: Removes CORS error completely ✅

