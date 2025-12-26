# ✅ FreeJira Deployment Checklist

## 📋 Pre-Deployment

- [x] Code reviewed and updated
- [x] CORS configuration fixed in backend
- [x] Environment variables configured
- [x] All documentation created
- [x] Deployment script prepared
- [x] No breaking changes introduced

## 🚀 Deployment Steps

### Phase 1: Run Deployment (Your Local Machine)

```bash
ssh root@70.34.254.102
# Password: s5E(!C+x]MyWGQWs

bash ~/freejira/deploy.sh
```

**Checklist:**
- [ ] Connected to server via SSH
- [ ] Running deployment script
- [ ] ⏳ Wait 10-15 minutes for completion

### Phase 2: Verify Services (On Server)

After deployment script completes, run:

```bash
pm2 status
```

**Checklist:**
- [ ] `freejira-backend` shows `online` ✓
- [ ] `freejira-frontend` shows `online` ✓
- [ ] Both have been running for at least 1 minute
- [ ] No `errored` or `stopped` status

### Phase 3: Test Application (On Your Machine)

From your local browser, test:

```
http://70.34.254.102
```

**Checklist:**
- [ ] Frontend loads (see FreeJira login page)
- [ ] No CORS errors in browser console
- [ ] Navigation works
- [ ] Can access http://70.34.254.102/register
- [ ] Can fill registration form
- [ ] Registration request goes through (no CORS error)
- [ ] Registration succeeds or shows validation error (not network error)
- [ ] Can login with test credentials
- [ ] Dashboard loads

### Phase 4: API Verification

From your local machine, test:

```bash
curl http://70.34.254.102/api/health
```

**Expected Response:**
```json
{"success":true,"message":"API is running"}
```

**Checklist:**
- [ ] API responds with success message
- [ ] No connection errors
- [ ] Response received within 1-2 seconds

### Phase 5: DNS Configuration

Go to your domain registrar for `freejira.online`:

**Checklist:**
- [ ] Logged into domain registrar
- [ ] Found DNS settings
- [ ] Added/Updated A record:
  - [ ] Type: A
  - [ ] Name/Host: @ (or leave blank for root)
  - [ ] Value: 70.34.254.102
  - [ ] TTL: 3600 (or default)
- [ ] Saved changes

### Phase 6: DNS Propagation (Wait)

⏳ DNS changes can take 24-48 hours to propagate globally

**Checklist:**
- [ ] Changed DNS records
- [ ] Waited at least 1 hour
- [ ] Check status periodically with:
  ```bash
  nslookup freejira.online
  dig freejira.online
  ```
- [ ] Returns: 70.34.254.102

### Phase 7: SSL/HTTPS Setup (After DNS Works)

Once DNS resolves to your server:

```bash
ssh root@70.34.254.102
certbot --nginx -d freejira.online
```

**Checklist:**
- [ ] DNS has propagated (verified with nslookup)
- [ ] Domain resolves to 70.34.254.102
- [ ] Certbot installed successfully
- [ ] SSL certificate obtained
- [ ] Nginx configured for HTTPS
- [ ] Auto-renewal enabled

### Phase 8: Final Verification with HTTPS

**Checklist:**
- [ ] Access https://freejira.online
- [ ] Shows secure padlock 🔒
- [ ] No SSL warnings
- [ ] Frontend loads properly
- [ ] Can register and login
- [ ] API works over HTTPS
- [ ] Auto-redirects HTTP to HTTPS

---

## 🔧 Troubleshooting Checklist

If something doesn't work:

### Services Not Starting

```bash
pm2 status
```

**Checklist:**
- [ ] Check if services are `online`
- [ ] If not, run: `pm2 restart all`
- [ ] Check logs: `pm2 logs`
- [ ] Verify MongoDB is running: `systemctl status mongod`

### CORS Errors Still Appearing

**Checklist:**
- [ ] Verify `.env` files exist:
  - [ ] `~/freejira/backend/.env` with `FRONTEND_URL=http://70.34.254.102:3000`
  - [ ] `~/freejira/frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://70.34.254.102:5000/api`
- [ ] Restart backend: `pm2 restart freejira-backend`
- [ ] Rebuild frontend:
  ```bash
  cd ~/freejira/frontend
  npm run build
  pm2 restart freejira-frontend
  ```

### Cannot Access Application

**Checklist:**
- [ ] Services running: `pm2 status`
- [ ] Check firewall allows ports 80/443
- [ ] Try direct API call: `curl http://70.34.254.102/api/health`
- [ ] Check Nginx errors: `tail -f /var/log/nginx/error.log`
- [ ] Restart Nginx: `systemctl restart nginx`

### MongoDB Connection Issues

**Checklist:**
- [ ] Check MongoDB status: `systemctl status mongod`
- [ ] Restart MongoDB: `systemctl restart mongod`
- [ ] Check if listening on 27017: `netstat -tlnp | grep 27017`
- [ ] Check backend logs: `pm2 logs freejira-backend`

### Port Conflicts

**Checklist:**
- [ ] Find process using port:
  ```bash
  lsof -i :3000    # Frontend
  lsof -i :5000    # Backend
  lsof -i :80      # Nginx
  lsof -i :443     # Nginx SSL
  ```
- [ ] Kill conflicting process: `kill -9 <PID>`
- [ ] Restart services: `pm2 restart all`

### DNS Not Propagating

**Checklist:**
- [ ] Waited at least 1-2 hours
- [ ] Checked with multiple tools:
  - [ ] `nslookup freejira.online`
  - [ ] `dig freejira.online`
  - [ ] Online checker: https://whatsmydns.net
- [ ] Contact domain registrar if still not working after 48 hours

---

## 📊 Service Status Summary

After successful deployment:

```
pm2 status output should show:

┌────────────────────────────────────────┐
│ id  │ name             │ status │ uptime
├─────┼──────────────────┼────────┼────────
│ 0   │ freejira-backend │ online │ 5m
│ 1   │ freejira-frontend│ online │ 5m
└────────────────────────────────────────┘

✅ Both should be "online"
✅ Both should have positive uptime
```

---

## 🎯 Success Criteria

Your deployment is successful when:

### Minimum Requirements
- [x] Application accessible at http://70.34.254.102
- [x] No CORS errors in browser console
- [x] User registration works
- [x] User login works
- [x] All services show `online` in `pm2 status`

### Full Requirements
- [x] All above +
- [x] DNS resolves freejira.online to 70.34.254.102
- [x] HTTPS works at https://freejira.online
- [x] SSL certificate auto-renews
- [x] Services auto-restart on reboot

---

## 📝 Post-Deployment Tasks

After successful deployment:

### Week 1
- [ ] Monitor application for errors
- [ ] Check logs regularly: `pm2 logs`
- [ ] Verify backups are working (if configured)
- [ ] Get user feedback on functionality

### Month 1
- [ ] Review performance metrics
- [ ] Check SSL certificate renewal is working
- [ ] Plan any additional features
- [ ] Setup monitoring/alerting (optional)

### Ongoing
- [ ] Regular security updates: `apt update && apt upgrade`
- [ ] Monitor disk space: `df -h`
- [ ] Monitor MongoDB size: `du -sh ~/freejira`
- [ ] Update application dependencies periodically

---

## 📞 Quick Reference

### Emergency Restart
```bash
pm2 restart all
systemctl restart nginx
systemctl restart mongod
```

### View Logs
```bash
pm2 logs                    # All logs
pm2 logs freejira-backend   # Backend only
pm2 logs freejira-frontend  # Frontend only
tail -f /var/log/nginx/error.log  # Nginx errors
```

### Check Status
```bash
pm2 status
systemctl status mongod
systemctl status nginx
netstat -tlnp | grep -E ':80|:443|:3000|:5000|:27017'
```

### Server Access
```bash
ssh root@70.34.254.102    # SSH to server
cd ~/freejira             # Go to app directory
pm2 logs                  # View all logs
pm2 status                # Check services
```

---

## ✨ You're All Set!

When you've completed all items above, your FreeJira application is:

✅ Fully deployed and running
✅ Accessible via domain (after DNS + SSL)
✅ Secure with HTTPS encryption
✅ Monitored and auto-restarting
✅ Ready for production use

---

**Deployment Date**: December 26, 2024
**Version**: 1.0
**Status**: Ready for Production ✅

