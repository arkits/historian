#!/bin/bash

set -e

echo ">>> inside deploy-backend.sh"

cd /opt/software/historian/

source ~/.bashrc

nvm use

echo ">>> pulling latest"
git pull

echo ">>> installing dependencies"
npm ci --omit=dev

echo ">>> prisma migrations"
cd apps/backend/
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy --schema=prisma/schema.prisma
cd ../../

echo ">>> building backend"
npm run backend:build:prod

echo ">>> restarting backend with ecosystem config"
pm2 startOrReload ecosystem.config.js --update-env
