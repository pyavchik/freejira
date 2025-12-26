# FreeJira Deployment Visual Guide

## 🎯 Your Deployment Path

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Run Deployment Script (Your Local Machine)        │
├─────────────────────────────────────────────────────────────┤
│  ssh root@70.34.254.102                                     │
│  bash ~/freejira/deploy.sh                                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
                   ⏳ 10-15 minutes
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Verify Deployment (Server)                         │
├─────────────────────────────────────────────────────────────┤
│  pm2 status                                                 │
│  curl http://70.34.254.102/api/health                       │
│  ✅ Should see: {"success":true,"message":"API is running"}│
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Test in Browser (Your Machine)                     │
├─────────────────────────────────────────────────────────────┤
│  http://70.34.254.102/register                              │
│  ✅ Should work WITHOUT CORS errors                         │
│  ✅ Can register new user                                   │
│  ✅ Can login                                               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Update DNS (Your Domain Registrar)                 │
├─────────────────────────────────────────────────────────────┤
│  Type: A                                                    │
│  Name: @ (root)                                             │
│  Value: 70.34.254.102                                       │
│  TTL: 3600                                                  │
└─────────────────────────────────────────────────────────────┘
                        ↓
                   ⏳ 24-48 hours
                   (DNS Propagation)
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Setup SSL (Server)                                 │
├─────────────────────────────────────────────────────────────┤
│  ssh root@70.34.254.102                                     │
│  certbot --nginx -d freejira.online                         │
│  ✅ Auto-configures HTTPS                                  │
│  ✅ Auto-renewal enabled                                   │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Enjoy Your App! 🎉                                 │
├─────────────────────────────────────────────────────────────┤
│  ✅ https://freejira.online (Secure!)                       │
│  ✅ Full functionality                                      │
│  ✅ Auto-scaling & monitoring with PM2                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture After Deployment

```
Your Machine (Browser)
         ↓
    HTTPS (Secure)
         ↓
┌────────────────────────────────────┐
│  freejira.online (Your Domain)     │
│  70.34.254.102 (Your Server IP)    │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  Nginx (Port 80/443)               │
│  - Reverse Proxy                   │
│  - SSL Termination                 │
│  - Load Balancing                  │
└────────────────────────────────────┘
    ↓               ↓
Frontend       Backend
(Port 3000)    (Port 5000)
Next.js +     Express +
React         MongoDB
    ↓               ↓
Browser         ┌─────────────────┐
Events          │  MongoDB        │
                │  (Port 27017)   │
                │  - Users        │
                │  - Projects     │
                │  - Tasks        │
                │  - Comments     │
                └─────────────────┘
```

---

## 📊 Traffic Flow Diagram

```
User Browser: http://70.34.254.102/register
                        ↓
                 Nginx (Port 80)
                        ↓
                   Frontend
                  (Next.js App)
                        ↓
            Renders registration form
                        ↓
    User fills form and clicks "Register"
                        ↓
        JavaScript sends POST request to:
       http://70.34.254.102:5000/api/auth/register
                        ↓
                 Nginx routes to Backend
                        ↓
                 Express Server
                   (Port 5000)
                        ↓
              authController.register()
                        ↓
              Hash password with bcrypt
                        ↓
                 Save to MongoDB
                        ↓
           Return JWT token to Frontend
                        ↓
        Frontend stores token in cookies
                        ↓
           User logged in! ✅
```

---

## 🔧 What Each Service Does

### **Nginx (Reverse Proxy)**
```
┌─────────────────────────────────────┐
│  Listens on: Port 80 (HTTP)         │
│             Port 443 (HTTPS)        │
├─────────────────────────────────────┤
│  Does:                              │
│  • Routes requests to frontend or   │
│    backend based on URL path        │
│  • Handles SSL/HTTPS termination    │
│  • Serves static files              │
│  • Manages concurrent connections   │
└─────────────────────────────────────┘
```

### **Frontend (Next.js React App)**
```
┌─────────────────────────────────────┐
│  Listens on: Port 3000              │
├─────────────────────────────────────┤
│  Does:                              │
│  • Renders user interface           │
│  • Handles user interactions        │
│  • Makes API calls to backend       │
│  • Stores auth tokens in cookies    │
│  • Manages client-side state        │
└─────────────────────────────────────┘
```

### **Backend (Express API)**
```
┌─────────────────────────────────────┐
│  Listens on: Port 5000              │
├─────────────────────────────────────┤
│  Does:                              │
│  • Provides REST API endpoints      │
│  • Authenticates users              │
│  • Manages database operations      │
│  • Validates business logic         │
│  • Returns JSON responses           │
└─────────────────────────────────────┘
```

### **MongoDB (Database)**
```
┌─────────────────────────────────────┐
│  Listens on: Port 27017             │
├─────────────────────────────────────┤
│  Stores:                            │
│  • User accounts & authentication   │
│  • Workspaces & projects            │
│  • Tasks & user stories             │
│  • Comments & activities            │
│  • All application data             │
└─────────────────────────────────────┘
```

### **PM2 (Process Manager)**
```
┌─────────────────────────────────────┐
│  Manages:                           │
│  • Frontend process (Next.js)       │
│  • Backend process (Express)        │
├─────────────────────────────────────┤
│  Features:                          │
│  ✓ Auto-restart on crash           │
│  ✓ Monitor memory/CPU usage        │
│  ✓ Cluster mode support            │
│  ✓ Zero-downtime restarts          │
│  ✓ Auto-start on reboot            │
│  ✓ Log rotation                     │
└─────────────────────────────────────┘
```

---

## 📈 Request/Response Flow Example

### User Registration Request:

```
1. Browser: GET /register
   └─→ Nginx → Frontend (port 3000)
       └─→ Next.js renders registration page

2. User enters email & password, clicks "Register"

3. Browser: POST http://70.34.254.102:5000/api/auth/register
            Content-Type: application/json
            {
              "email": "user@example.com",
              "password": "securePassword123"
            }
   └─→ Nginx → Backend (port 5000)
       └─→ authController.register()
           ├─→ Validate input
           ├─→ Check if user exists
           ├─→ Hash password (bcrypt)
           ├─→ Save to MongoDB
           └─→ Generate JWT token

4. Backend Response:
   HTTP 201 Created
   {
     "success": true,
     "token": "eyJhbGc...",
     "user": {
       "id": "507f1f77bcf86cd799439011",
       "email": "user@example.com"
     }
   }
   └─→ Browser receives response
       ├─→ Save token to cookies
       └─→ Redirect to dashboard

5. Browser: GET /dashboard
   └─→ Frontend checks if token exists in cookies
   ├─→ Token valid? Yes ✓
   └─→ Render dashboard

```

---

## 🚦 Service Status Indicators

After deployment, here's what you should see:

```bash
$ pm2 status

┌─────────┬─────┬──────┬────────┬────────┬─────────┐
│ id      │ pid │ name │ mode   │ status │ uptime  │
├─────────┼─────┼──────┼────────┼────────┼─────────┤
│ 0       │ ... │ fre..│ fork   │ online │ 2m      │
│ 1       │ ... │ fre..│ fork   │ online │ 2m      │
└─────────┴─────┴──────┴────────┴────────┴─────────┘

All should show: ✅ online
```

---

## 🎯 Testing Checklist

After running `deploy.sh`:

- [ ] `pm2 status` shows both processes as "online"
- [ ] `curl http://70.34.254.102/api/health` returns success
- [ ] Browser: `http://70.34.254.102` loads frontend
- [ ] `http://70.34.254.102/register` page opens
- [ ] Can fill form and submit (no CORS errors)
- [ ] Registration succeeds and redirects to login
- [ ] Can login with created credentials
- [ ] Dashboard loads and shows workspace options
- [ ] Can create a new project
- [ ] Can create a new task
- [ ] Can drag and drop tasks on Kanban board

---

## 🔐 Security Features

After full deployment:

```
✅ Passwords hashed with bcrypt
✅ JWT tokens for authentication
✅ HTTPS/SSL encryption (after certbot)
✅ CORS protection (configured)
✅ Environment variables secured (not in git)
✅ MongoDB connection secured
✅ Input validation on backend
✅ XSS protection with Next.js
✅ CSRF protection ready
✅ HTTP-only cookies for tokens
```

---

## 📞 Troubleshooting Flowchart

```
Getting an error?
    ↓
Is it a CORS error?
├─ YES → Run: pm2 restart freejira-backend
│        Check: cat ~/freejira/backend/.env
│        Verify: FRONTEND_URL=http://70.34.254.102:3000
│
└─ NO ──→ Is it a "Cannot connect" error?
     ├─ YES → Check: pm2 status
     │        If not online: pm2 start all
     │        Check MongoDB: systemctl status mongod
     │
     └─ NO ──→ Check logs:
          pm2 logs freejira-backend
          pm2 logs freejira-frontend
          tail -f /var/log/nginx/error.log
```

---

## 📱 Access Points

| Phase | URL | Status |
|-------|-----|--------|
| **Phase 1: Initial** | http://70.34.254.102 | ✅ Works immediately |
| **Phase 2: DNS Config** | freejira.online | ⏳ Waiting for DNS |
| **Phase 3: SSL Setup** | https://freejira.online | ✅ After certbot |
| **Development** | http://localhost:3000 | ✅ Local dev |

---

**Your deployment is ready to go!** 🚀

