#!/bin/bash
chmod +x start.sh
set -e
 
echo "🔗  Checking shared Docker network 'credify-net'..."
if ! docker network inspect credify-net &>/dev/null; then
  echo ""
  echo "❌  Network 'credify-net' not found!"
  echo "    The backend must be started first."
  echo "    → cd ../credify-backend && ./start.sh"
  echo ""
  exit 1
fi
echo "✅  Network found."
 
echo "🧹 Cleaning up local virtual environment..."
rm -rf venv

echo "🛑 Stopping any running Docker containers..."
docker compose -f docker-deploy.yaml stop

echo "🔨 Rebuilding Docker containers..."
docker compose -f docker-deploy.yaml build

echo "🚀 Starting Docker services..."
docker compose -f docker-deploy.yaml up --remove-orphans --force-recreate