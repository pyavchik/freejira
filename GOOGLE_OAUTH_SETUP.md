# 🔐 Google OAuth Setup Guide

## Overview

Google OAuth has been successfully integrated into FreeJira. Users can now sign in and sign up using their Google accounts.

---

## 📋 What Was Implemented

### Backend Changes
1. ✅ New Google OAuth handler in `authController.js`
2. ✅ Google token verification in `authService.js` 
3. ✅ Google OAuth utility function in `utils/googleAuth.js`
4. ✅ New `/auth/google` endpoint in auth routes
5. ✅ User model already supports OAuth (provider, providerId fields)
6. ✅ Added `google-auth-library` dependency

### Frontend Changes
1. ✅ Google Sign-In button on login page
2. ✅ Google Sign-Up button on register page
3. ✅ `loginWithGoogle` method in auth service
4. ✅ Google JavaScript SDK integration
5. ✅ Proper token handling and storage

---

## 🔑 Setting Up Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (name: "FreeJira")
3. Enable the "Google+ API"
4. Create OAuth 2.0 credentials:
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost`
     - `http://70.34.254.102` (your server IP)
     - `https://freejira.online` (your domain, after DNS)
   - Add authorized redirect URIs:
     - `http://localhost:3000/login`
     - `http://70.34.254.102/login` (your server IP)
     - `https://freejira.online/login` (your domain)
   - Copy your Client ID

### Step 2: Configure Environment Variables

#### Backend (`backend/.env`)
```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api
```

### Step 3: Install Dependencies

```bash
# Backend
cd ~/freejira/backend
npm install google-auth-library

# Frontend (already included, no action needed)
```

### Step 4: Restart Services

```bash
pm2 restart freyjira-backend
pm2 restart freyjira-frontend
```

---

## 🧪 Testing Google OAuth

### Local Testing (Development)

1. Start your frontend and backend
2. Go to http://localhost:3000/register
3. Click "Sign up with Google"
4. Select your Google account
5. You should be redirected to dashboard

### Production Testing

1. Update DNS records (if using domain)
2. Go to http://70.34.254.102/register
3. Click "Sign up with Google"
4. Select your Google account
5. You should be redirected to dashboard

---

## 🔄 How It Works

### Sign-In/Sign-Up Flow

```
User clicks "Sign in/up with Google"
    ↓
Google Sign-In dialog opens
    ↓
User authenticates with Google
    ↓
Google returns ID token
    ↓
Frontend sends ID token to `/auth/google` endpoint
    ↓
Backend verifies token with Google
    ↓
If user exists: Login user
If user doesn't exist: Create new user (auto-registration)
    ↓
Backend returns JWT tokens
    ↓
Frontend stores tokens in cookies
    ↓
User redirected to dashboard
```

### User Data Mapping

When a user authenticates with Google, the following data is extracted:

- **Google ID** → Stored in `providerId` field
- **Email** → Used as unique identifier
- **Name** → Stored in `name` field
- **Profile Picture** → Stored in `avatar` field
- **Provider** → Set to `'google'`

---

## 🔐 Security Features

✅ **Token Verification**: All Google ID tokens are verified with Google's servers  
✅ **OAuth 2.0 Standard**: Implements OAuth 2.0 best practices  
✅ **Secure Token Storage**: JWT tokens stored in secure HTTP-only cookies  
✅ **Email Verification**: Google handles email verification  
✅ **Account Linking**: Same email can be used for both OAuth and password auth  

---

## 📝 API Documentation

### Login with Google

**Endpoint**: `POST /api/auth/google`

**Request Body**:
```json
{
  "idToken": "google_id_token_here"
}
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "avatar": "https://...",
      "role": "user"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Invalid Google token"
}
```

---

## 🆘 Troubleshooting

### Issue: Google Sign-In button not showing

**Solution:**
1. Check if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
2. Verify Google API is enabled in Cloud Console
3. Check browser console for errors
4. Ensure Google Sign-In script loaded: `https://accounts.google.com/gsi/client`

### Issue: "Invalid Google token" error

**Solution:**
1. Verify `GOOGLE_CLIENT_ID` in backend `.env`
2. Make sure Client ID matches between frontend and backend
3. Check if token has expired (should be immediate)
4. Ensure `google-auth-library` is installed: `npm install google-auth-library`

### Issue: User not created after Google sign-up

**Solution:**
1. Check backend logs: `pm2 logs freyjira-backend`
2. Verify MongoDB is running
3. Check if user already exists with same email
4. Ensure email is valid

### Issue: CORS errors during Google login

**Solution:**
1. Check backend CORS configuration allows frontend origin
2. Verify `FRONTEND_URL` is set correctly in backend `.env`
3. Restart backend: `pm2 restart freyjira-backend`

---

## 📚 Files Modified

```
Backend:
- src/controllers/authController.js (added googleLogin handler)
- src/services/authService.js (added googleLoginUser function)
- src/routes/authRoutes.js (added /auth/google route)
- src/utils/googleAuth.js (NEW - token verification)
- package.json (added google-auth-library)

Frontend:
- app/login/page.tsx (added Google Sign-In button)
- app/register/page.tsx (added Google Sign-Up button)
- lib/auth.ts (added loginWithGoogle method)
```

---

## ✅ Checklist

Before deploying to production:

- [ ] Created Google OAuth credentials
- [ ] Added authorized JavaScript origins in Google Console
- [ ] Set `GOOGLE_CLIENT_ID` in backend `.env`
- [ ] Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in frontend `.env.local`
- [ ] Installed `google-auth-library`: `npm install google-auth-library`
- [ ] Tested locally at http://localhost:3000
- [ ] Tested on server at http://70.34.254.102
- [ ] Updated Google Console with production domain
- [ ] Restarted backend and frontend services

---

## 🚀 Deployment

After setting up Google OAuth credentials:

1. **Update backend .env**:
   ```bash
   echo "GOOGLE_CLIENT_ID=YOUR_CLIENT_ID" >> ~/freyjira/backend/.env
   ```

2. **Update frontend .env.local**:
   ```bash
   echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID" >> ~/freyjira/frontend/.env.local
   ```

3. **Install dependencies**:
   ```bash
   cd ~/freyjira/backend && npm install
   cd ~/freyjira/frontend && npm install
   ```

4. **Rebuild and restart**:
   ```bash
   pm2 restart freyjira-backend freyjira-frontend
   ```

5. **Test**:
   - Visit http://70.34.254.102/register
   - Click "Sign up with Google"
   - Verify it works

---

## 📖 Additional Resources

- [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Auth Library for Node.js](https://github.com/googleapis/google-auth-library-nodejs)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

---

**Status**: ✅ Google OAuth implementation complete!  
**Next Step**: Get Google Client ID and configure environment variables  
**Time to Deploy**: ~5 minutes

