#!/bin/bash
set -euo pipefail

echo "🚀 Starting AcquireFlow in Development Mode"
echo "____________________________________________"

BUILD_FLAG=""
RESET=false

for arg in "$@"; do
  case $arg in
    --build) BUILD_FLAG="--build" ;;
    --reset) RESET=true ;;
    *)
      echo "⚠️  Unknown flag: $arg (use --build or --reset)"
      exit 1
      ;;
  esac
done

if [ ! -f .env.development ]; then
  echo ""
  echo "❌ .env.development not found!"
  echo "   Copy the template and fill it with your Neon credentials:"
  echo "   cp .env.example .env.development"
  echo ""
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo ""
  echo "❌ Docker is not running."
  echo "   Please start Docker Desktop and try again."
  echo ""
  exit 1
fi

mkdir -p .neon_local logs

if ! grep -q "\.neon_local/" .gitignore 2>/dev/null; then
  echo ".neon_local/" >> .gitignore
  echo "✅ Added .neon_local/ to .gitignore"
fi

if [ "$RESET" = true ]; then
  echo ""
  echo "🧹 Resetting development environment..."
  docker compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true
  rm -rf .neon_local && mkdir -p .neon_local
  echo "✅ Reset complete"
fi

echo ""
echo "📦 Starting containers..."
echo "   • neon-local  → Postgres proxy at localhost:5432"
echo "   • app          → Express + tsx watch at localhost:${PORT:-3000}"
echo ""

docker compose -f docker-compose.dev.yml up -d $BUILD_FLAG

echo "⏳ Waiting for Neon Local..."

RETRIES=30
until docker compose -f docker-compose.dev.yml exec -T neon-local \
    pg_isready -h localhost -p 5432 -U neon >/dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -eq 0 ]; then
    echo ""
    echo "❌ Neon Local failed to start in time."
    echo "   Check logs: docker compose -f docker-compose.dev.yml logs neon-local"
    exit 1
  fi
  sleep 2
done

echo "✅ Database ready"

echo ""
echo "📜 Applying migrations with Drizzle..."
npm run db:migrate
echo "✅ Migrations applied"

echo ""
echo "🎉 AcquireFlow is running!"
echo ""
echo "   App       → http://localhost:${PORT:-3000}"
echo "   Health    → http://localhost:${PORT:-3000}/health"
echo "   API       → http://localhost:${PORT:-3000}/api"
echo "   Database  → postgres://neon:npg@localhost:5432/neondb"
echo ""
echo "   Tailing app logs (Ctrl+C to stop tailing — containers will keep running)"
echo "   To shut down: docker compose -f docker-compose.dev.yml down"
echo ""

docker compose -f docker-compose.dev.yml logs -f app