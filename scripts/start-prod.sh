#!/bin/sh

# start-prod.sh
# Automated startup script executing database migration deploy and starting the production server

echo "=== PasteBin Production Startup ==="

# 1. Run database migrations using deploy to safely apply changes without reset checks
echo "Running Prisma Database migrations..."
npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma

if [ $? -ne 0 ]; then
  echo "❌ Database migration failed! Exiting startup."
  exit 1
fi

echo "✓ Database migrations applied successfully."

# 2. Launch production Node.js Express server process
echo "Starting Express REST API server..."
exec node apps/server/dist/index.js
