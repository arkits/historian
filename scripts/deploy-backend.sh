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

echo ">>> killing previously running server"
if [ -f /opt/software/historian/historian.pid ]; then
    kill $(cat /opt/software/historian/historian.pid) 2>/dev/null || true
    rm /opt/software/historian/historian.pid
fi

echo ">>> restarting server"
bun start > logs/historian.log 2>&1 &
echo $! > /opt/software/historian/historian.pid