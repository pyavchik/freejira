#!/bin/bash

# FreeJira SSH Key Setup - Quick Start
# This script sets up passwordless SSH access to your FreeJira server

set -e

SERVER_IP="70.34.254.102"
SERVER_USER="root"
KEY_NAME="freejira"
KEY_PATH="$HOME/.ssh/$KEY_NAME"

echo "╔════════════════════════════════════════╗"
echo "║   FreeJira SSH Key Setup               ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Step 1: Create SSH directory
echo "Step 1: Setting up SSH directory..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "✓ SSH directory ready"
echo ""

# Step 2: Check if key exists
if [ -f "$KEY_PATH" ]; then
    echo "⚠  Key already exists at: $KEY_PATH"
    read -p "Use existing key? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo "Removing old key..."
        rm -f "$KEY_PATH" "$KEY_PATH.pub"
        REGENERATE=true
    else
        REGENERATE=false
    fi
else
    REGENERATE=true
fi

# Step 3: Generate key if needed
if [ "$REGENERATE" = true ]; then
    echo "Step 2: Generating SSH key pair..."
    ssh-keygen -t ed25519 -f "$KEY_PATH" -N "" -C "freejira@$SERVER_IP"
    echo "✓ SSH key pair generated"
else
    echo "Step 2: Using existing SSH key"
fi
echo ""

# Step 4: Display public key
echo "Step 3: Public Key Generated:"
echo "════════════════════════════════════════"
cat "$KEY_PATH.pub"
echo "════════════════════════════════════════"
echo ""

# Step 5: Add to server
echo "Step 4: Adding public key to server..."
echo "You will be prompted for your server password:"
echo "(This is the LAST time you'll need to enter it!)"
echo ""

if cat "$KEY_PATH.pub" | ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" \
    'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh'; then
    echo ""
    echo "✓ Public key successfully added to server!"
else
    echo ""
    echo "✗ Failed to add key to server"
    echo "Make sure you entered the correct password"
    exit 1
fi
echo ""

# Step 6: Create SSH config
echo "Step 5: Creating SSH config alias..."
SSH_CONFIG="$HOME/.ssh/config"
mkdir -p "$(dirname "$SSH_CONFIG")"

if ! grep -q "Host $KEY_NAME" "$SSH_CONFIG" 2>/dev/null; then
    {
        echo ""
        echo "# FreeJira Server"
        echo "Host $KEY_NAME"
        echo "    HostName $SERVER_IP"
        echo "    User $SERVER_USER"
        echo "    IdentityFile ~/.ssh/$KEY_NAME"
        echo "    StrictHostKeyChecking no"
        echo "    UserKnownHostsFile=/dev/null"
    } >> "$SSH_CONFIG"
    chmod 600 "$SSH_CONFIG"
    echo "✓ SSH config created"
else
    echo "⚠  SSH config already has '$KEY_NAME' entry"
fi
echo ""

# Step 7: Test connection
echo "Step 6: Testing passwordless SSH..."
if timeout 5 ssh -o ConnectTimeout=5 "$KEY_NAME" "echo 'Connection successful!'" 2>/dev/null; then
    echo "✓ SSH connection works!"
    CONN_SUCCESS=true
else
    echo "⚠  Connection via alias failed, trying direct IP..."
    if timeout 5 ssh -o ConnectTimeout=5 -i "$KEY_PATH" "$SERVER_USER@$SERVER_IP" \
        "echo 'Connection successful!'" 2>/dev/null; then
        echo "✓ SSH works with direct key path"
        CONN_SUCCESS=true
    else
        echo "✗ SSH connection failed"
        CONN_SUCCESS=false
    fi
fi
echo ""

# Summary
echo "╔════════════════════════════════════════╗"
echo "║   Setup Complete!                      ║"
echo "╚════════════════════════════════════════╝"
echo ""

if [ "$CONN_SUCCESS" = true ]; then
    echo "✓ Passwordless SSH is working!"
    echo ""
    echo "You can now use:"
    echo ""
    echo "  ssh $KEY_NAME"
    echo ""
    echo "Or run deployment:"
    echo ""
    echo "  ssh $KEY_NAME 'bash ~/freejira/deploy.sh'"
    echo ""
    echo "Keys stored at:"
    echo "  Private: ~/.ssh/$KEY_NAME"
    echo "  Public:  ~/.ssh/$KEY_NAME.pub"
    echo ""
else
    echo "⚠  SSH test failed. Troubleshooting tips:"
    echo ""
    echo "1. Check your password was correct"
    echo "2. Verify key file:"
    echo "   cat ~/.ssh/$KEY_NAME.pub"
    echo ""
    echo "3. Check server permissions:"
    echo "   ssh -i ~/.ssh/$KEY_NAME $SERVER_USER@$SERVER_IP 'chmod 600 ~/.ssh/authorized_keys'"
    echo ""
    echo "4. Try direct connection:"
    echo "   ssh -i ~/.ssh/$KEY_NAME -vv $SERVER_USER@$SERVER_IP"
    echo ""
fi

echo "See SSH_KEY_SETUP.md for more details"
echo ""

