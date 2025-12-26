# ✅ MANUAL SERVER FIX - STEP BY STEP

## You Need To Do These 3 Steps:

### STEP 1: Open Your Terminal

Open a terminal on your **local machine** (not inside any editor)

```bash
# On Mac/Linux, open Terminal
# On Windows, open PowerShell or Git Bash
```

---

### STEP 2: Generate SSH Key (One-Time Only)

If you haven't set up SSH keys yet, run this:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/freyjira -N "" -C "freyjira@70.34.254.102"
```

Then add it to your server:

```bash
ssh-copy-id -i ~/.ssh/freyjira.pub root@70.34.254.102
```

**When prompted, enter your server password:** `s5E(!C+x]MyWGQWs`

---

### STEP 3: Run The Server Fix

Copy and paste this entire command in your **local terminal**:

```bash
ssh -i ~/.ssh/freyjira root@70.34.254.102 'bash -s' << 'FIXSCRIPT'
pm2 kill 2>/dev/null || true
sleep 2
systemctl restart mongod
systemctl restart nginx
sleep 5
pm2 start npm --cwd ~/freyjira/backend --name "freyjira-backend" -- run start
pm2 start npm --cwd ~/freyjira/frontend --name "freyjira-frontend" -- start
sleep 15
echo ""
echo "════════════════════════════════════════"
echo "  ✅ Server Fix Complete!"
echo "════════════════════════════════════════"
echo ""
pm2 status
FIXSCRIPT
```

---

## ⏱️ What Will Happen

1. SSH will connect to your server
2. PM2 services will be killed
3. MongoDB will restart
4. Nginx will restart
5. Backend will start (port 5000)
6. Frontend will start (port 3000)
7. Services will show as `online`

**Total time: ~40-50 seconds**

---

## ✅ Success = Both Services Online

You should see output like:

```
freyjira-backend  │ online ✅
freyjira-frontend │ online ✅
```

---

## 🧪 Then Test

Open your browser and go to:

```
http://70.34.254.102/register
```

Should load perfectly! ✅

---

## 🆘 Troubleshooting

### "SSH key not found"
Run Step 2 first to generate and add the key

### "Connection refused"
Make sure your server IP and password are correct:
- IP: `70.34.254.102`
- User: `root`
- Password: `s5E(!C+x]MyWGQWs`

### "Command not found"
Make sure you're running the command in your local terminal, not on the server

---

## 📝 Summary

**3 Commands To Run:**

```bash
# 1. Generate SSH key (one-time)
ssh-keygen -t ed25519 -f ~/.ssh/freyjira -N "" -C "freyjira@70.34.254.102"

# 2. Add to server (one-time, will ask for password)
ssh-copy-id -i ~/.ssh/freyjira.pub root@70.34.254.102

# 3. Fix server (run this whenever needed)
ssh -i ~/.ssh/freyjira root@70.34.254.102 'bash -s' << 'FIXSCRIPT'
pm2 kill 2>/dev/null || true
sleep 2
systemctl restart mongod
systemctl restart nginx
sleep 5
pm2 start npm --cwd ~/freyjira/backend --name "freyjira-backend" -- run start
pm2 start npm --cwd ~/freyjira/frontend --name "freyjira-frontend" -- start
sleep 15
pm2 status
FIXSCRIPT
```

---

**Run these commands now in your local terminal!** 🚀

