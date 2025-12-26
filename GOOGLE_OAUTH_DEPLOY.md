# 🚀 GOOGLE OAUTH - DEPLOYMENT GUIDE

## ✅ Implementation Status: COMPLETE ✓

All code is ready. Just need to:
1. Get Google Client ID (5 min)
2. Add to environment (1 min)
3. Install dependencies (2 min)
4. Restart services (2 min)
5. Test (1 min)

**Total Time: 11 minutes**

---

## 📋 Step-by-Step Deployment

### Step 1: Get Google Client ID (5 minutes)

1. **Open Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Create New Project**
   - Click "Select a Project"
   - Click "New Project"
   - Name: `FreeJira`
   - Click "Create"

3. **Enable Google+ API**
   - Search: "Google+ API"
   - Click Result
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "Credentials" (left menu)
   - Click "Create Credentials"
   - Select "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Click "Create"

5. **Configure Origins & Redirects**

   **Authorized JavaScript Origins:**
   ```
   http://localhost:3000
   http://localhost
   http://70.34.254.102
   https://freejira.online
   ```

   **Authorized Redirect URIs:**
   ```
   http://localhost:3000/login
   http://70.34.254.102/login
   https://freejira.online/login
   ```

6. **Copy Client ID**
   - You'll see something like: `123456789-abc...apps.googleusercontent.com`
   - Copy this value
   - You'll need it in Step 2

---

### Step 2: Add Environment Variables (1 minute)

**SSH to your server:**
```bash
ssh root@70.34.254.102
```

**Add to backend .env:**
```bash
# Replace YOUR_CLIENT_ID with actual value
echo "GOOGLE_CLIENT_ID=YOUR_CLIENT_ID" >> ~/freyjira/backend/.env
```

**Add to frontend .env.local:**
```bash
# Replace YOUR_CLIENT_ID with actual value
echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID" >> ~/freyjira/frontend/.env.local
```

**Verify they were added:**
```bash
tail -5 ~/freyjira/backend/.env
tail -5 ~/freyjira/frontend/.env.local
```

---

### Step 3: Install Dependencies (2 minutes)

**On your server:**
```bash
# Go to backend
cd ~/freyjira/backend

# Install google-auth-library
npm install google-auth-library

# Verify installation
npm list google-auth-library
```

---

### Step 4: Rebuild & Restart (2 minutes)

**Rebuild frontend:**
```bash
cd ~/freyjira/frontend
npm run build
```

**Restart services:**
```bash
pm2 restart freyjira-backend freyjira-frontend

# Wait for startup
sleep 15

# Check status
pm2 status
```

Both should show as **online** ✅

---

### Step 5: Test (1 minute)

**Open your browser:**
```
http://70.34.254.102/register
```

**Look for:**
- ✅ Google Sign-Up button should appear
- ✅ Google logo visible
- ✅ Button is clickable

**Click the button:**
- Google Sign-In dialog should appear
- Select your Google account
- You should be redirected to dashboard
- **Success!** ✅

---

## 🎯 Complete Command Sequence

**Copy and paste this entire block on your server:**

```bash
# 1. Add environment variables
echo "GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE" >> ~/freyjira/backend/.env
echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE" >> ~/freyjira/frontend/.env.local

# 2. Install dependencies
cd ~/freyjira/backend && npm install google-auth-library

# 3. Rebuild frontend
cd ~/freyjira/frontend && npm run build

# 4. Restart services
pm2 restart freyjira-backend freyjira-frontend

# 5. Wait and check
sleep 15 && pm2 status

# 6. Done!
echo "✅ Google OAuth is ready!"
```

Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID from Google Cloud.

---

## ✅ Verification Checklist

After deployment:

- [ ] `pm2 status` shows both services `online`
- [ ] Backend `.env` has `GOOGLE_CLIENT_ID`
- [ ] Frontend `.env.local` has `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] `npm list google-auth-library` shows installed
- [ ] Frontend built successfully
- [ ] Google button visible at http://70.34.254.102/register
- [ ] Clicking button opens Google Sign-In dialog
- [ ] Can authenticate and redirect to dashboard
- [ ] User created in database (check MongoDB)

---

## 🆘 Troubleshooting

### "Google button not appearing"
```bash
# Check environment variable
cat ~/freyjira/frontend/.env.local | grep GOOGLE_CLIENT_ID

# Rebuild frontend
cd ~/freyjira/frontend && npm run build

# Restart frontend
pm2 restart freyjira-frontend
```

### "Invalid token error"
```bash
# Check backend environment
cat ~/freyjira/backend/.env | grep GOOGLE_CLIENT_ID

# Both should be identical
# If different, update and restart:
pm2 restart freyjira-backend
```

### "Google script not loading"
```bash
# Check browser console (F12)
# Look for errors loading https://accounts.google.com/gsi/client
# Clear browser cache and reload
```

### "User not created"
```bash
# Check backend logs
pm2 logs freyjira-backend --lines 50

# Check MongoDB connection
mongo --eval "db.adminCommand('ping')"

# Verify database exists
mongo --eval "db.getDatabase()"
```

---

## 📊 Files Modified

### Code Changes (Already Done) ✅
```
backend/src/controllers/authController.js    ✅ Modified
backend/src/services/authService.js          ✅ Modified
backend/src/routes/authRoutes.js             ✅ Modified
backend/src/utils/googleAuth.js              ✅ Created
backend/package.json                         ✅ Modified
frontend/app/login/page.tsx                  ✅ Modified
frontend/app/register/page.tsx               ✅ Modified
frontend/lib/auth.ts                         ✅ Modified
```

### Dependencies (Need to Install) ⏳
```
npm install google-auth-library   ← Run this
```

---

## 🔄 How It Works After Deployment

```
User visits /register
     ↓
User clicks "Sign up with Google"
     ↓
Google Sign-In dialog opens
     ↓
User selects Google account
     ↓
Google returns ID token
     ↓
Frontend sends token to /api/auth/google
     ↓
Backend verifies token with Google
     ↓
Backend creates new user (if doesn't exist)
     ↓
Backend returns JWT tokens
     ↓
Frontend stores tokens
     ↓
User redirected to /dashboard ✅
```

---

## 🎁 What Users Get

- One-click sign-up
- One-click sign-in
- Auto profile picture from Google
- No password needed
- Email verification by Google
- Instant account creation

---

## 📝 Environment Variables Reference

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/freejira
JWT_SECRET=...
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID  ← Add this
FRONTEND_URL=http://70.34.254.102:3000
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID  ← Add this
```

---

## ✨ That's It!

**Your Google OAuth is now fully deployed!** 🎉

### Recap:
1. ✅ Code implemented (done for you)
2. ⏳ Get Google Client ID (5 min)
3. ⏳ Add environment variables (1 min)
4. ⏳ Install dependencies (2 min)
5. ⏳ Restart services (2 min)
6. ⏳ Test (1 min)

**Total: 11 minutes from now!**

---

## 📚 Documentation

- `GOOGLE_OAUTH_SETUP.md` - Detailed setup
- `GOOGLE_OAUTH_COMPLETE.md` - Feature overview
- `GOOGLE_AUTH_READY.md` - Quick summary

---

**Ready to deploy?** Get your Client ID and run the commands above! 🚀

