#!/bin/bash
set -e

REPO_DIR="/home/ubuntu/samurai-test-drive-epk"
DEPLOY_DIR="/var/www/samuritestdrive"

cd "$REPO_DIR"

echo "$(date): Pulling latest changes..."
git pull origin main

echo "$(date): Installing dependencies..."
npm install

echo "$(date): Building..."
npm run build

echo "$(date): Deploying to $DEPLOY_DIR..."
sudo cp -r dist/* "$DEPLOY_DIR/"
sudo chown -R www-data:www-data "$DEPLOY_DIR"

echo "$(date): Deploy complete!"
