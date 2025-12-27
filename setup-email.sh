#!/bin/bash

# Email Configuration Setup Script for FreeJira
# Helps configure SMTP settings on the server

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVER_IP="70.34.254.102"
SERVER_USER="root"
SERVER_PASSWORD="s5E(!C+x]MyWGQWs"
ENV_FILE="/root/freejira/backend/.env"

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}FreeJira Email Configuration${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Check if running locally or remotely
if [ "$1" == "remote" ]; then
    echo -e "${YELLOW}Configuring email on remote server...${NC}"
    
    # Get email service choice
    echo "Select email service:"
    echo "1) Gmail SMTP (Easiest for testing)"
    echo "2) SendGrid (Recommended for production)"
    echo "3) Mailgun"
    echo "4) Custom SMTP"
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1)
            echo -e "${YELLOW}Gmail SMTP Configuration${NC}"
            echo "You need:"
            echo "1. Gmail account with 2FA enabled"
            echo "2. App Password from: https://myaccount.google.com/apppasswords"
            echo ""
            read -p "Enter Gmail address: " email
            read -sp "Enter Gmail App Password: " password
            echo ""
            
            SMTP_HOST="smtp.gmail.com"
            SMTP_PORT="587"
            SMTP_SECURE="false"
            SMTP_USER="$email"
            SMTP_PASSWORD="$password"
            EMAIL_FROM="FreeJira <$email>"
            ;;
        2)
            echo -e "${YELLOW}SendGrid Configuration${NC}"
            echo "Get your API key from: https://app.sendgrid.com/settings/api_keys"
            echo ""
            read -sp "Enter SendGrid API Key: " api_key
            echo ""
            
            SMTP_HOST="smtp.sendgrid.net"
            SMTP_PORT="587"
            SMTP_SECURE="false"
            SMTP_USER="apikey"
            SMTP_PASSWORD="$api_key"
            EMAIL_FROM="FreeJira <noreply@freejira.online>"
            ;;
        3)
            echo -e "${YELLOW}Mailgun Configuration${NC}"
            read -p "Enter Mailgun SMTP username: " smtp_user
            read -sp "Enter Mailgun SMTP password: " smtp_pass
            echo ""
            
            SMTP_HOST="smtp.mailgun.org"
            SMTP_PORT="587"
            SMTP_SECURE="false"
            SMTP_USER="$smtp_user"
            SMTP_PASSWORD="$smtp_pass"
            EMAIL_FROM="FreeJira <noreply@freejira.online>"
            ;;
        4)
            echo -e "${YELLOW}Custom SMTP Configuration${NC}"
            read -p "Enter SMTP host: " SMTP_HOST
            read -p "Enter SMTP port [587]: " SMTP_PORT
            SMTP_PORT=${SMTP_PORT:-587}
            read -p "Use secure connection (SSL/TLS)? [y/N]: " secure_choice
            if [[ $secure_choice =~ ^[Yy]$ ]]; then
                SMTP_SECURE="true"
            else
                SMTP_SECURE="false"
            fi
            read -p "Enter SMTP username: " SMTP_USER
            read -sp "Enter SMTP password: " SMTP_PASSWORD
            echo ""
            read -p "Enter FROM email address: " from_email
            EMAIL_FROM="FreeJira <$from_email>"
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    # Add email configuration to server .env
    echo -e "${YELLOW}Adding email configuration to server...${NC}"
    
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << ENDSSH
# Add email configuration to .env
cat >> $ENV_FILE << EOF

# Email Configuration
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_SECURE=$SMTP_SECURE
SMTP_USER=$SMTP_USER
SMTP_PASSWORD=$SMTP_PASSWORD
EMAIL_FROM=$EMAIL_FROM
EOF

echo "✓ Email configuration added to .env"
ENDSSH
    
    echo -e "${GREEN}✓ Email configuration added${NC}"
    
    # Restart backend
    echo -e "${YELLOW}Restarting backend service...${NC}"
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" 'pm2 restart freejira-backend'
    
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}Email Configuration Complete!${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "Test password recovery at: https://freejira.online/forgot-password"
    echo ""
    
else
    echo "Usage: ./setup-email.sh remote"
    echo ""
    echo "This script will configure email on the remote server."
    echo "Run with 'remote' argument to configure server email settings."
fi

