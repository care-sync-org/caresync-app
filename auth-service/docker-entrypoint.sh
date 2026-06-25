#!/bin/sh
set -e

echo "=== [auth-service] Running database migrations ==="
./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma

echo "=== [auth-service] Seeding database (idempotent) ==="
node prisma/seed.js || echo "Seed failed, continuing"

echo "=== [auth-service] Starting service ==="
exec "$@"
