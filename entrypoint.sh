#!/bin/sh

# If no DB exists in the volume yet, copy the seed DB
if [ ! -f /data/bunny-market.db ]; then
  cp /app/seed.db /data/bunny-market.db
  echo "Initialized new database"
fi

# Run any pending migrations (as root so it can write)
npx prisma migrate deploy 2>&1 || echo "Migration warning (may be fine for SQLite)"

# Ensure DB is owned by nextjs so the app can write
chown nextjs:nodejs /data/bunny-market.db

# Start the server as nextjs
exec su -s /bin/sh nextjs -c "node server.js"
