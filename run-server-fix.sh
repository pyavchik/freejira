#!/bin/bash

# Simple server fix - runs the commands directly via SSH

ssh -i ~/.ssh/freyjira root@70.34.254.102 'bash -s' << 'SCRIPT'
pm2 kill 2>/dev/null || true
sleep 2
systemctl restart mongod
systemctl restart nginx
sleep 5
pm2 start npm --cwd ~/freyjira/backend --name "freyjira-backend" -- run start
pm2 start npm --cwd ~/freyjira/frontend --name "freyjira-frontend" -- start
sleep 15
echo ""
echo "Server Fix Complete!"
echo ""
pm2 status
SCRIPT

