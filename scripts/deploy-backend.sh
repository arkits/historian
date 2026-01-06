#!/bin/bash

set -e

cd /opt/software/historian/

mkdir -p logs

echo ">>> pulling latest code"
git pull

echo ">>> installing dependencies"
bun install

echo ">>> running migrations"
bun run migrate

echo ">>> building"
bun run build

echo ">>> restarting server"
bun start > logs/historian.log 2>&1 &