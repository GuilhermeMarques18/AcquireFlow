#!/bin/bash
set -euo pipefail

echo "🚀 Starting AcquireFlow in Production Mode"
echo "==========================================="

BUILD_FLAG=""
RUN_MIGRATE=false

for arg in "$@"; do
  case $arg in
    --build)   BUILD_FLAG="--build" ;;
    --migrate) RUN_MIGRATE=true ;;
    *)
      echo "⚠️  Unknown flag: $arg (use --build or --migrate)"
      exit 1
      ;;
  esac
done

if [ ! -f .env.production ]; then
  echo ""
  echo "❌ .env.production not found!"
  echo "   Create the file with production variables:"
  echo "   cp .env.example .env.production"
  echo ""
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo ""
  echo "❌ Docker is not running."
  echo "   Start Docker and try again."
  echo ""
  exit 1
fi

check_env_var() {
  local var="$1"
  if ! grep -qE "^${var}=.+" .env.production 2>/dev/null; then
    echo "❌ Missing or empty mandatory variable in .env.production: ${var}"
    exit 1
  fi
}

check_env_var "DB_URL"
check_env_var "NODE_ENV"

echo "✅ Environment variables validated"

mkdir -p logs

echo ""
echo "📦 Starting production container..."
echo "   • Database → Neon Cloud"
echo "   • App      → node dist/index.js at localhost:${PORT:-3000}"
echo ""

docker compose -f docker-compose.prod.yml up -d $BUILD_FLAG

echo "⏳ Waiting for application health..."

RETRIES=24
until curl -sf "http://localhost:${PORT:-3000}/health" >/dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -eq 0 ]; then
    echo ""
    echo "❌ Application did not respond at /health in time."
    echo "   Check logs: docker compose -f docker-compose.prod.yml logs app"
    exit 1
  fi
  sleep 5
done

echo "✅ Application healthy"

if [ "$RUN_MIGRATE" = true ]; then
  echo ""
  echo "📜 Running Drizzle migrations..."
  npm run db:migrate
  echo "✅ Migrations applied"
fi

echo ""
echo "🎉 AcquireFlow is running in production!"
echo ""
echo "   App    → http://localhost:${PORT:-3000}"
echo "   Health → http://localhost:${PORT:-3000}/health"
echo "   API    → http://localhost:${PORT:-3000}/api"
echo ""
echo "   Useful commands:"
echo "   • Real-time logs : docker compose -f docker-compose.prod.yml logs -f app"
echo "   • Status         : docker compose -f docker-compose.prod.yml ps"
echo "   • Shutdown       : docker compose -f docker-compose.prod.yml down"
echo ""