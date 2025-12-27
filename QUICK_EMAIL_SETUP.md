# Quick Email Setup Guide

## 🚀 Fastest Setup: Gmail

### Step 1: Get Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to your Google account
3. Select "Mail" and "Other (Custom name)"
4. Enter "FreeJira" as the name
5. Click "Generate"
6. Copy the 16-character password (no spaces)

### Step 2: Run Setup Script

```bash
./setup-email.sh remote
```

Select option 1 (Gmail), enter your email and the app password.

### Step 3: Test

1. Go to: https://freejira.online/forgot-password
2. Enter your email
3. Check your inbox for the reset link

---

## 📧 Alternative: SendGrid (Production)

### Step 1: Sign Up

1. Go to: https://sendgrid.com
2. Sign up (free tier: 100 emails/day)
3. Verify your account

### Step 2: Create API Key

1. Go to: Settings → API Keys
2. Click "Create API Key"
3. Name it "FreeJira"
4. Select "Full Access" or "Mail Send"
5. Copy the API key

### Step 3: Run Setup Script

```bash
./setup-email.sh remote
```

Select option 2 (SendGrid), paste your API key.

---

## 🔧 Manual Configuration

If you prefer to configure manually:

```bash
# SSH to server
ssh root@70.34.254.102

# Edit .env file
nano /root/freejira/backend/.env

# Add these lines (example for Gmail):
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=FreeJira <your-email@gmail.com>

# Save and exit (Ctrl+X, Y, Enter)

# Restart backend
pm2 restart freejira-backend
```

---

## ✅ Verify Configuration

Check if email is working:

1. Try password recovery
2. Check server logs: `pm2 logs freejira-backend`
3. Check email inbox (and spam folder)

---

## 🐛 Troubleshooting

**Email not received?**
- Check spam/junk folder
- Verify SMTP credentials are correct
- Check server logs for errors

**Gmail "Less secure app" error?**
- Use App Password (not regular password)
- Enable 2FA first

**Connection timeout?**
- Check firewall allows port 587
- Verify SMTP host is correct

