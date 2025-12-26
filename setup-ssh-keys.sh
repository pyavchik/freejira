#!/bin/bash

# SSH Key Setup Script for FreeJira Deployment
# This script generates SSH keys and configures passwordless SSH access

echo "======================================"
echo "FreeJira SSH Key Setup"
echo "======================================"
echo ""

# Step 1: Create SSH directory
echo "Step 1: Creating SSH directory..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "✓ SSH directory ready"
echo ""

# Step 2: Generate SSH key pair
echo "Step 2: Generating SSH key pair..."
KEY_FILE="$HOME/.ssh/freejira"

if [ -f "$KEY_FILE" ]; then
  echo "⚠ SSH key already exists at $KEY_FILE"
  read -p "Do you want to regenerate? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Using existing key"
  else
    rm -f "$KEY_FILE" "$KEY_FILE.pub"
    echo "✓ Old keys deleted"
  fi
fi

# Generate key if it doesn't exist
if [ ! -f "$KEY_FILE" ]; then
  ssh-keygen -t ed25519 -f "$KEY_FILE" -N "" -C "freejira@70.34.254.102"
  echo "✓ SSH key pair generated"
fi
echo ""

# Step 3: Display public key
echo "Step 3: Your Public Key:"
echo "======================================"
cat "$KEY_FILE.pub"
echo "======================================"
echo ""

# Step 4: Copy public key to server
echo "Step 4: Adding key to your server..."
echo ""
echo "Enter your server SSH password when prompted:"
echo "(This is the last time you'll need to enter it!)"
echo ""

cat "$KEY_FILE.pub" | ssh -o StrictHostKeyChecking=no root@70.34.254.102 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh'

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ Public key successfully added to server!"
else
  echo ""
  echo "✗ Failed to add key. Check your password and try again."
  exit 1
fi
echo ""

# Step 5: Create SSH config for easy access
echo "Step 5: Creating SSH config for easy access..."

SSH_CONFIG="$HOME/.ssh/config"

# Create or update SSH config
if ! grep -q "Host freejira" "$SSH_CONFIG" 2>/dev/null; then
  cat >> "$SSH_CONFIG" << 'EOF'

# FreeJira Server
Host freejira
    HostName 70.34.254.102
    User root
    IdentityFile ~/.ssh/freejira
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile=/dev/null
EOF
  chmod 600 "$SSH_CONFIG"
  echo "✓ SSH config updated"
else
  echo "⚠ SSH config already has freejira entry"
fi
echo ""

# Step 6: Test connection
echo "Step 6: Testing passwordless SSH connection..."
if ssh -o ConnectTimeout=5 freejira "echo 'SSH connection successful!'" 2>/dev/null; then
  echo "✓ Passwordless SSH works!"
else
  echo "⚠ Connection test failed. Trying direct IP..."
  if ssh -o ConnectTimeout=5 -i "$KEY_FILE" root@70.34.254.102 "echo 'SSH connection successful!'" 2>/dev/null; then
    echo "✓ SSH works with key file (use: ssh -i ~/.ssh/freejira root@70.34.254.102)"
  else
    echo "✗ SSH connection failed. Check your server and try again."
    exit 1
  fi
fi
echo ""

# Step 7: Summary
echo "======================================"
echo "✓ SSH Key Setup Complete!"
echo "======================================"
echo ""
echo "You can now connect with:"
echo ""
echo "  ssh freejira"
echo ""
echo "Or:"
echo ""
echo "  ssh -i ~/.ssh/freejira root@70.34.254.102"
echo ""
echo "Or directly run deployment:"
echo ""
echo "  ssh freejira 'bash ~/freejira/deploy.sh'"
echo ""
echo "Your keys are stored at:"
echo "  Private: ~/.ssh/freejira"
echo "  Public:  ~/.ssh/freejira.pub"
echo ""
echo "⚠ IMPORTANT: Backup your private key!"
echo "   Keep ~/.ssh/freejira in a safe place"
echo ""

