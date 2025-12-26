# SSH Key Setup Guide - Passwordless Access

## Quick Setup (Copy & Paste Commands)

### Step 1: Generate SSH Key Pair

Run this on your local machine (not the server):

```bash
# Create SSH key
ssh-keygen -t ed25519 -f ~/.ssh/freejira -N "" -C "freejira@70.34.254.102"
```

This creates:
- `~/.ssh/freejira` (private key - keep secret!)
- `~/.ssh/freejira.pub` (public key - safe to share)

### Step 2: Add Public Key to Server

Run this command (you'll be prompted for your server password one last time):

```bash
# Add your public key to the server
ssh-copy-id -i ~/.ssh/freejira.pub root@70.34.254.102
```

OR manually:

```bash
# Pipe your public key to the server
cat ~/.ssh/freejira.pub | ssh root@70.34.254.102 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
```

Enter password: `s5E(!C+x]MyWGQWs`

### Step 3: Create SSH Config (Optional but Recommended)

Create/edit `~/.ssh/config`:

```bash
cat >> ~/.ssh/config << 'EOF'

# FreeJira Server
Host freejira
    HostName 70.34.254.102
    User root
    IdentityFile ~/.ssh/freejira
    StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/config
```

### Step 4: Test Passwordless SSH

```bash
# Test with config alias
ssh freejira

# OR test with key file directly
ssh -i ~/.ssh/freejira root@70.34.254.102

# OR use the direct command
ssh freejira 'bash ~/freejira/deploy.sh'
```

You should connect **WITHOUT entering a password**! ✅

---

## Usage Examples

### Connect to Server (No Password)
```bash
ssh freejira
```

### Run Deployment (No Password)
```bash
ssh freejira 'bash ~/freejira/deploy.sh'
```

### Copy Files to Server
```bash
scp -i ~/.ssh/freejira myfile.txt root@70.34.254.102:~/
```

### View Server Logs Remotely
```bash
ssh freejira 'pm2 logs' 
```

---

## Troubleshooting

### Still asking for password?

**Check 1: Permissions**
```bash
# On your local machine
chmod 600 ~/.ssh/freejira
chmod 600 ~/.ssh/freejira.pub
chmod 700 ~/.ssh

# On server
ssh root@70.34.254.102
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
exit
```

**Check 2: Key was added correctly**
```bash
# Check your public key
cat ~/.ssh/freejira.pub

# Verify it's on the server
ssh root@70.34.254.102 'cat ~/.ssh/authorized_keys'
```

**Check 3: SSH config issue**
```bash
# Try without config
ssh -i ~/.ssh/freejira root@70.34.254.102
```

### Key permission issues?

```bash
# Fix permissions (run on your local machine)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/freejira
chmod 644 ~/.ssh/freejira.pub
chmod 600 ~/.ssh/config 2>/dev/null || true
```

### Server side issues?

```bash
# On the server
ssh root@70.34.254.102

# Once connected, run:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
exit
```

---

## Key Security

### ⚠️ IMPORTANT SECURITY NOTES

1. **Never share your private key** (`~/.ssh/freejira`)
2. **Backup your keys** in a safe place
3. **Use strong passphrase** (optional but recommended for extra security)
4. **Disable password login** on server (once keys are working):
   ```bash
   ssh freejira
   sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
   sudo systemctl restart ssh
   ```

### Backup Your Keys
```bash
# Make a backup
cp ~/.ssh/freejira ~/freejira_backup_key
cp ~/.ssh/freejira.pub ~/freejira_backup_key.pub

# Keep them safe (external drive, password manager, etc)
```

---

## What Each File Does

| File | Purpose | Permissions |
|------|---------|-------------|
| `~/.ssh/freejira` | Private key (SECRET!) | 600 (read-write owner only) |
| `~/.ssh/freejira.pub` | Public key (safe) | 644 (readable by all) |
| `~/.ssh/authorized_keys` | Server's approved keys | 600 (read-write owner only) |
| `~/.ssh/config` | SSH shortcuts | 600 (read-write owner only) |

---

## Advanced: Using Passphrase

If you want extra security, use a passphrase:

```bash
# Generate with passphrase
ssh-keygen -t ed25519 -f ~/.ssh/freejira -C "freejira@70.34.254.102"
# When prompted, enter a passphrase

# Add to SSH agent (so you don't type it every time)
ssh-add ~/.ssh/freejira
# Enter passphrase once per session
```

---

## Complete Setup One-Liner

If you want to do everything at once:

```bash
# Generate key, add to server, and test
ssh-keygen -t ed25519 -f ~/.ssh/freejira -N "" && \
ssh-copy-id -i ~/.ssh/freejira.pub root@70.34.254.102 && \
ssh -i ~/.ssh/freejira root@70.34.254.102 'echo "SSH setup successful!"'
```

---

## Quick Reference

```bash
# Generate key
ssh-keygen -t ed25519 -f ~/.ssh/freejira -N ""

# Add to server
ssh-copy-id -i ~/.ssh/freejira.pub root@70.34.254.102

# Test connection
ssh -i ~/.ssh/freejira root@70.34.254.102

# Create alias (optional)
echo 'Host freejira
    HostName 70.34.254.102
    User root
    IdentityFile ~/.ssh/freejira' >> ~/.ssh/config

# Use alias
ssh freejira

# Run deployment
ssh freejira 'bash ~/freejira/deploy.sh'
```

---

## FAQ

**Q: Do I need a passphrase?**
A: Optional. Without passphrase = convenience. With passphrase = extra security.

**Q: Can I use multiple keys?**
A: Yes! Generate different keys for different servers.

**Q: What if I lose my private key?**
A: Generate a new one and update the server's `~/.ssh/authorized_keys`

**Q: How do I revoke a key?**
A: Remove the key from `~/.ssh/authorized_keys` on the server

**Q: Can I use RSA instead of Ed25519?**
A: Yes, but Ed25519 is more secure and faster. Use: `-t rsa -b 4096`

---

## Success Indicators ✅

When everything is set up correctly:

- [x] No password prompt when running `ssh freejira`
- [x] Prompt disappears immediately
- [x] Can run commands like: `ssh freejira 'pm2 status'`
- [x] Private key at `~/.ssh/freejira` exists
- [x] Public key exists on server in `~/.ssh/authorized_keys`

---

## Next Steps

1. Follow Step 1-2 above
2. Test with: `ssh freejira` (or `ssh root@70.34.254.102`)
3. Should connect WITHOUT password ✅
4. Then run: `ssh freejira 'bash ~/freejira/deploy.sh'`
5. Done! No more password prompts 🎉

---

**Time needed**: 5-10 minutes  
**Difficulty**: Easy  
**One-time setup**: Yes  
**Benefit**: Saves time on every SSH connection!

