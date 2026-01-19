#!/bin/bash

set -e

cd /opt/software/historian/

echo ">>> pulling latest code"
git pull

echo ">>> installing dependencies"
bun install

echo ">>> running migrations"
bun run migrate

echo ">>> building frontend"
bun run build

echo ">>> restarting server with PM2"
pm2 restart historian-backend || pm2 start ecosystem.config.json
pm2 save