# API DevOps — Docker Setup

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Development (docker-compose.dev.yml)                   │
│                                                         │
│  ┌──────────┐   ┌─────────────┐   ┌──────────────────┐ │
│  │   App    │──▶│ Neon Proxy  │──▶│  PostgreSQL 17   │ │
│  │ :3000    │   │ :4444       │   │  :5432           │ │
│  └──────────┘   └─────────────┘   └──────────────────┘ │
│                                                         │
│  @neondatabase/serverless connects through the local    │
│  Neon proxy, identical API as production Neon Cloud.    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Production (docker-compose.prod.yml)                   │
│                                                         │
│  ┌──────────┐           ┌───────────────────────────┐   │
│  │   App    │──────────▶│  Neon Cloud Database      │   │
│  │ :3000    │  HTTPS    │  *.neon.tech              │   │
│  └──────────┘           └───────────────────────────┘   │
│                                                         │
│  Direct connection to Neon's serverless Postgres.       │
│  No proxy needed — production DATABASE_URL used.        │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- A [Neon](https://neon.tech) account (for production)

---

## Quick Start — Development

### 1. Configure environment

```bash
# Copy and edit the dev env file
cp .env.development .env.development.local   # optional: customize
```

The defaults in `.env.development` work out of the box with Docker Compose.

### 2. Start all services

```bash
docker compose -f docker-compose.dev.yml up --build
```

This starts:
| Service | Description | Port |
|---|---|---|
| **postgres** | PostgreSQL 17 database | `5432` |
| **neon-proxy** | Local Neon HTTP/WS proxy | `4444` |
| **app** | Your Express API (hot-reload) | `3000` |

### 3. Run database migrations

From your **host machine** (not inside the container):

```bash
# Point drizzle-kit at the local PostgreSQL directly
DATABASE_URL=postgres://postgres:postgres@localhost:5432/neondb npx drizzle-kit migrate
```

Or exec into the app container:

```bash
docker compose -f docker-compose.dev.yml exec app npx drizzle-kit migrate
```

### 4. Verify it works

```bash
curl http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@test.com","password":"password123"}'
```

### 5. Stop services

```bash
docker compose -f docker-compose.dev.yml down        # keep data
docker compose -f docker-compose.dev.yml down -v      # wipe volumes (fresh DB)
```

---

## Quick Start — Production

### 1. Configure environment

Edit `.env.production` with your real credentials:

```env
DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_strong_secret
ARCJET_KEY=your_arcjet_key
```

> ⚠️ **Never commit `.env.production`** — it's already in `.gitignore`.

### 2. Build and run

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### 3. Run migrations (one-time)

```bash
DATABASE_URL=<your-neon-cloud-url> npx drizzle-kit migrate
```

### 4. Stop

```bash
docker compose -f docker-compose.prod.yml down
```

---

## How the Environment Switch Works

The `DATABASE_URL` and `NEON_LOCAL_PROXY` variables control the behavior:

| Variable           | Development                                                | Production                                             |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`     | `postgres://postgres:postgres@db.localtest.me:5432/neondb` | `postgresql://...@...neon.tech/neondb?sslmode=require` |
| `NEON_LOCAL_PROXY` | `true`                                                     | _(not set)_                                            |
| `NODE_ENV`         | `development`                                              | `production`                                           |

When `NEON_LOCAL_PROXY=true`, the database driver configures `neonConfig.fetchEndpoint` to route HTTP queries through the local Neon proxy at port `4444`, which forwards them to the local PostgreSQL instance. In production, the driver connects directly to Neon Cloud over HTTPS — no extra configuration needed.

---

## File Overview

```
├── Dockerfile                  # Multi-stage build (dev + prod)
├── docker-compose.dev.yml      # Dev: app + postgres + neon-proxy
├── docker-compose.prod.yml     # Prod: app only (connects to Neon Cloud)
├── .dockerignore               # Excludes node_modules, .env, etc.
├── .env.development            # Dev environment variables
├── .env.production             # Prod environment variables (add secrets)
└── src/config/database.ts      # Dual-mode DB config (local proxy / cloud)
```

---

## Drizzle Studio

To inspect your local database with Drizzle Studio:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/neondb npx drizzle-kit studio
```

---

## Troubleshooting

| Issue                             | Solution                                                                 |
| --------------------------------- | ------------------------------------------------------------------------ |
| `neon-proxy` fails to start       | Ensure postgres is healthy first. Check `docker compose logs neon-proxy` |
| `ECONNREFUSED` on port 4444       | The Neon proxy isn't ready yet. It depends on postgres health check.     |
| Migrations fail inside container  | Run migrations from host with `localhost:5432` connection string         |
| `db.localtest.me` doesn't resolve | Add `127.0.0.1 db.localtest.me` to your hosts file (for offline use)     |
