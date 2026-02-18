# API DevOps

A production-ready RESTful API built with **Node.js**, **Express 5**, and **TypeScript**, featuring JWT authentication, role-based rate limiting, and a complete Docker-based development and production workflow powered by **Neon** serverless Postgres.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-Postgres-00E699?logo=postgresql&logoColor=white)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Development](#local-development)
  - [Docker Development](#docker-development)
  - [Production](#production)
- [API Reference](#api-reference)
- [Database](#database)
- [Security](#security)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Scripts](#scripts)
- [License](#license)

---

## Features

- **Express 5** with async error handling
- **JWT Authentication** — signup, login, logout with HTTP-only cookies
- **User CRUD** — full create, read, update, delete operations
- **Role-based Rate Limiting** — admin (20/min), user (10/min), guest (5/min)
- **Arcjet Security** — bot detection, shield protection, sliding window rate limiting
- **Neon Serverless Postgres** — cloud database with local development via Neon Local
- **Drizzle ORM** — type-safe queries with auto-generated migrations
- **Zod Validation** — request body validation on all endpoints
- **Winston Logging** — structured JSON logs with file and console transports
- **Docker Multi-stage Builds** — optimized images for development and production
- **GitHub Actions CI/CD** — automated tests, linting, and Docker image publishing
- **Health Checks** — built-in health endpoint for container orchestration

---

## Tech Stack

| Category         | Technology                                                    |
| ---------------- | ------------------------------------------------------------- |
| Runtime          | Node.js 20                                                    |
| Framework        | Express 5.2                                                   |
| Language         | TypeScript 5.9                                                |
| Database         | Neon Serverless Postgres (`@neondatabase/serverless`)         |
| ORM              | Drizzle ORM 0.45                                              |
| Auth             | JSON Web Tokens (`jsonwebtoken`) + bcrypt                     |
| Validation       | Zod 4                                                         |
| Security         | Arcjet (shield, bot detection, rate limiting) + Helmet + CORS |
| Logging          | Winston                                                       |
| Testing          | Jest 30 + Supertest + SWC                                     |
| Containerization | Docker + Docker Compose                                       |
| CI/CD            | GitHub Actions                                                |

---

## Project Structure

```
api-devops/
├── .github/workflows/
│   ├── docker-build-and-push.yml   # Build & push Docker image to Docker Hub
│   ├── lint-and-format-yml         # ESLint + Prettier checks
│   └── tests.yml                   # Automated test suite
├── drizzle/
│   └── 0000_absurd_lady_vermin.sql # Auto-generated migration
├── scripts/
│   ├── dev.sh                      # Docker dev environment startup
│   └── prod.sh                     # Docker prod environment startup
├── src/
│   ├── config/
│   │   ├── arcjet.ts               # Arcjet security configuration
│   │   ├── database.ts             # Neon DB connection + Drizzle setup
│   │   └── logger.ts               # Winston logger configuration
│   ├── controllers/
│   │   ├── auth.controllers.ts     # Signup, login, logout handlers
│   │   └── user.controllers.ts     # User CRUD handlers
│   ├── middleware/
│   │   └── security.middleware.ts   # Arcjet rate limiting + bot detection
│   ├── models/
│   │   └── user.model.ts           # Drizzle user table schema
│   ├── routes/
│   │   ├── auth.routes.ts          # POST /signup, /login, /logout
│   │   └── user.routes.ts          # GET, PUT, DELETE /users
│   ├── services/
│   │   ├── auth.service.ts         # Auth business logic (hash, compare, find)
│   │   └── user.services.ts        # User CRUD database operations
│   ├── utils/
│   │   ├── cookies.ts              # HTTP-only cookie helpers
│   │   └── format.ts               # Zod error formatting
│   ├── validations/
│   │   ├── auth.validation.ts      # Signup/login schemas
│   │   └── user.validation.ts      # Update user schema
│   ├── types.ts                    # Shared TypeScript interfaces
│   ├── app.ts                      # Express app configuration
│   ├── server.ts                   # HTTP server
│   └── index.ts                    # Entry point
├── tests/
│   ├── __mocks__/
│   │   ├── @arcjet/node.ts         # Arcjet mock for testing
│   │   └── arcjet.ts               # Arcjet core mock
│   └── app.test.ts                 # API endpoint tests
├── docker-compose.dev.yml          # Dev: Neon Local + app
├── docker-compose.prod.yml         # Prod: app only
├── Dockerfile                      # Multi-stage (development/production)
├── drizzle.config.ts               # Drizzle Kit configuration
├── jest.config.ts                  # Jest + SWC configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **Docker** & **Docker Compose**
- A **Neon** account ([neon.tech](https://neon.tech)) for the cloud database
- An **Arcjet** account ([arcjet.com](https://arcjet.com)) for the security key

### Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

| Variable         | Description                         | Required |
| ---------------- | ----------------------------------- | -------- |
| `PORT`           | Server port (default: `3000`)       | No       |
| `NODE_ENV`       | `development` / `production`        | Yes      |
| `LOG_LEVEL`      | Winston log level (default: `info`) | No       |
| `DATABASE_URL`   | Neon Postgres connection string     | Yes      |
| `JWT_SECRET`     | Secret key for signing JWTs         | Yes      |
| `JWT_EXPIRES_IN` | Token expiry (default: `1h`)        | No       |
| `ARCJET_KEY`     | Arcjet API key                      | Yes      |
| `ARCJET_ENV`     | Arcjet environment                  | No       |

### Local Development

```bash
# Install dependencies
npm install

# Generate database migrations (if schema changed)
npm run db:generate

# Apply migrations to your Neon database
npm run db:migrate

# Start development server with hot reload
npm run dev
```

The server starts at **http://localhost:3000**.

### Docker Development

The Docker dev environment uses **Neon Local** — a local proxy that creates ephemeral database branches from your Neon project, so you get a fresh DB copy tied to your Docker lifecycle.

```bash
# Start everything (Neon Local + app with hot reload)
npm run dev:docker
```

This starts:

- **Neon Local** on `localhost:5432` — local Postgres proxy with the Neon serverless driver
- **App** on `localhost:3000` — with source code mounted for live reloading

```bash
# Stop and clean up
docker compose -f docker-compose.dev.yml down -v
```

### Production

```bash
# Start production container
npm run prod:docker

# Or manually
docker compose -f docker-compose.prod.yml up --build -d
```

The production container uses a smaller image with only production dependencies and resource limits (512MB memory, 0.5 CPU).

---

## API Reference

### Health Check

| Method | Endpoint      | Description       |
| ------ | ------------- | ----------------- |
| GET    | `/health`     | Container health  |
| GET    | `/api/health` | API health status |
| GET    | `/`           | Welcome message   |

### Authentication

| Method | Endpoint           | Description           | Body                               |
| ------ | ------------------ | --------------------- | ---------------------------------- |
| POST   | `/api/auth/signup` | Register a new user   | `{ name, email, password, role? }` |
| POST   | `/api/auth/login`  | Login and receive JWT | `{ email, password }`              |
| POST   | `/api/auth/logout` | Clear auth cookie     | —                                  |

### Users

| Method | Endpoint         | Description    | Body                       |
| ------ | ---------------- | -------------- | -------------------------- |
| GET    | `/api/users`     | List all users | —                          |
| GET    | `/api/users/:id` | Get user by ID | —                          |
| PUT    | `/api/users/:id` | Update user    | `{ name?, email?, role? }` |
| DELETE | `/api/users/:id` | Delete user    | —                          |

### Example Requests

**Signup:**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "secret123"}'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secret123"}'
```

**Get all users:**

```bash
curl http://localhost:3000/api/users
```

---

## Database

The project uses **Neon Serverless Postgres** with **Drizzle ORM**.

### Schema

**Users table:**

| Column       | Type           | Constraints               |
| ------------ | -------------- | ------------------------- |
| `id`         | `serial`       | Primary key               |
| `name`       | `varchar(255)` | Not null                  |
| `email`      | `varchar(255)` | Not null, unique          |
| `password`   | `varchar(255)` | Not null (bcrypt hashed)  |
| `role`       | `varchar(50)`  | Not null, default `user`  |
| `created_at` | `timestamp`    | Not null, default `now()` |
| `updated_at` | `timestamp`    | Not null, default `now()` |

### Migration Commands

```bash
# Generate migration from schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Open Drizzle Studio (visual DB browser)
npm run db:studio
```

---

## Security

The API is protected by multiple security layers:

### Arcjet Integration

- **Shield** — protects against common attacks (SQLi, XSS, etc.)
- **Bot Detection** — blocks automated bot traffic (allows search engines and dev tools)
- **Sliding Window Rate Limiting** — global limit of 5 requests per 2 seconds

### Role-based Rate Limits

Applied per request via the security middleware:

| Role  | Limit             |
| ----- | ----------------- |
| Admin | 20 requests / min |
| User  | 10 requests / min |
| Guest | 5 requests / min  |

### Additional Protections

- **Helmet** — secure HTTP headers
- **CORS** — cross-origin request handling
- **bcrypt** — password hashing with salt rounds
- **HTTP-only cookies** — JWT stored securely, not accessible via JavaScript

---

## Testing

Tests use **Jest** with **SWC** for fast TypeScript transformation, and **Supertest** for HTTP assertions. Arcjet modules are mocked to avoid external dependencies in tests.

```bash
# Run all tests with coverage
npm test
```

### Test Structure

```
tests/
├── __mocks__/
│   ├── @arcjet/node.ts    # Mock: always allows requests through
│   └── arcjet.ts          # Mock: stub core exports
└── app.test.ts            # Health check and root endpoint tests
```

---

## CI/CD

Three GitHub Actions workflows automate the pipeline:

### 1. Tests (`tests.yml`)

- **Triggers:** Push to `main`/`staging`, pull requests
- Runs `npm test` with coverage
- Uploads coverage artifacts (30-day retention)
- Generates test summary in PR

### 2. Lint & Format (`lint-and-format-yml`)

- **Triggers:** Push to `main`/`staging`, pull requests
- Runs ESLint and Prettier checks

### 3. Docker Build & Push (`docker-build-and-push.yml`)

- **Triggers:** Push to `main`, manual dispatch
- Builds production Docker image (`linux/amd64`)
- Pushes to Docker Hub with auto-generated tags:
  - `latest` (main branch)
  - `main-<sha>` (commit SHA)
  - `prod-YYYYMMDD-HHmmss` (timestamp)
- Uses GitHub Actions cache for faster builds

**Required GitHub Secrets:**

| Secret            | Description                            |
| ----------------- | -------------------------------------- |
| `DOCKER_USERNAME` | Docker Hub username                    |
| `DOCKER_PASSWORD` | Docker Hub Personal Access Token (R/W) |

---

## Scripts

| Script        | Command                  | Description                         |
| ------------- | ------------------------ | ----------------------------------- |
| `dev`         | `tsx watch src/index.ts` | Start dev server with hot reload    |
| `build`       | `tsc`                    | Compile TypeScript to JavaScript    |
| `start`       | `node dist/index.js`     | Start production server             |
| `test`        | `jest`                   | Run test suite with coverage        |
| `db:generate` | `drizzle-kit generate`   | Generate SQL migrations from schema |
| `db:migrate`  | `drizzle-kit migrate`    | Apply pending migrations            |
| `db:studio`   | `drizzle-kit studio`     | Open Drizzle Studio                 |
| `dev:docker`  | `sh ./scripts/dev.sh`    | Start Docker dev environment        |
| `prod:docker` | `sh ./scripts/prod.sh`   | Start Docker prod environment       |

---

## License

ISC
