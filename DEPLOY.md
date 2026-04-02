# Deploying Bunny Market

## Prerequisites

- Docker installed

## Build

```bash
docker build -t bunny-market .
```

## Run

```bash
docker run -p 3000:3000 -v bunny-data:/data -e JWT_SECRET="your-secret-here" bunny-market
```

The app will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `bunny-market-secret-change-in-production` | Secret for signing auth tokens. **Change this in production.** |
| `DATABASE_URL` | `file:/data/bunny-market.db` | SQLite database path. No need to change if using the volume mount. |
| `PORT` | `3000` | Port the server listens on. |

## Data Persistence

The SQLite database is stored at `/data/bunny-market.db` inside the container. Mount a volume to `/data` to persist data across container restarts:

```bash
-v bunny-data:/data
```

Without the volume mount, all data is lost when the container stops.

## Backup

To back up the database from a running container:

```bash
docker cp $(docker ps -qf "ancestor=bunny-market"):/data/bunny-market.db ./backup.db
```

## Local Development

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

The dev server runs at `http://localhost:3000` using a local `dev.db` file.
