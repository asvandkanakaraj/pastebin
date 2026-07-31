# Deployment, CI/CD Pipeline & Monitoring

This document details the configuration for deploying the PasteBin application, setting up automated CI checks, and verifying system health via health metrics endpoints.

## 1. Advanced Health Monitoring Endpoint

To support container liveness probes (e.g., Kubernetes livenessProbe / readinessProbe) and cloud load balancer check signals (e.g., AWS Route53 or target groups), the server exposes an advanced pinging endpoint:

- **Method**: `GET`
- **URL**: `/health`

### Health Check Responses

#### 1. Success State (200 OK)

Returned when both the API server is responsive and the PostgreSQL database ping succeeds.

```json
{
  "status": "up",
  "uptime": "542.12s",
  "services": {
    "database": "connected",
    "api": "healthy"
  },
  "timestamp": "2026-07-31T09:40:00.000Z"
}
```

#### 2. Connection Failure (503 Service Unavailable)

Returned if the API is active but cannot connect to the database or run SQL queries.

```json
{
  "status": "down",
  "uptime": "542.12s",
  "services": {
    "database": "disconnected",
    "api": "healthy"
  },
  "timestamp": "2026-07-31T09:40:00.000Z",
  "error": "Can't reach database server at localhost:5432"
}
```

---

## 2. Production Log Collection

The application writes structured logs in JSON format for production environments:

- **Combined Logs**: Mapped to `apps/server/logs/combined.log` capturing all `info` and above events.
- **Format**: All logs outputted to file are serialized as JSON objects containing `timestamp`, `level`, and `message` properties.

---

## 3. Production Docker Orchestration & Deployment Scripts

For containerized production deployments, the application leverages automated scripts and multi-stage `Dockerfiles` coordinated via `docker-compose.prod.yml`.

### Services Architecture

- **Web (`nginx:alpine`)**: Served on port `80`. Mapped index configurations resolve React Router fallback paths.
- **Server (`node:20-alpine`)**: Exposes port `5000` to the network, running under a secure non-root `node` user with devDependencies stripped.
- **Database (`postgres:15-alpine`)**: Serves DB connections on port `5432` with a persistent local storage volume mapping.

---

### Step-by-Step Production Deployment Guide

#### 1. Setup and Validate Environment Configurations

Run the environment verification script to check for required variables (`DATABASE_URL`, `JWT_SECRET`, etc.) and automatically scaffold a template `.env.production` file if it is missing:

```bash
sh scripts/setup-env.sh
```

#### 2. Run Order-Dependent Production Builds

Compile all monorepo packages in the correct dependency order (Shared -> Database -> Server -> Web) to verify build integrity:

```bash
npm run build:prod
```

#### 3. Build and Spin Up Docker Container Cluster

Deploy the container orchestrator. The containers will deploy in an ordered dependency queue utilizing Docker healthchecks to wait until Postgres is fully ready and the backend is verified healthy before spinning up dependent nodes:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

#### 4. Automated Startup & Database Migrations

The server container startup routine triggers the [start-prod.sh](file:///e:/DEVS/PasteBin/scripts/start-prod.sh) script, which runs:

- Database migrations (`npx prisma migrate deploy`) to apply the schema changes safely.
- Starts the production Node.js process (`node dist/index.js`).

#### 5. Verify Service Health Status

You can check if containers are active and healthy via:

```bash
docker-compose -f docker-compose.prod.yml ps
```

#### 6. Shutdown Services

To stop and tear down containers:

```bash
docker-compose -f docker-compose.prod.yml down
```

---

## 4. CI/CD Automated Pipelines (GitHub Actions)

The repository configures a multi-stage validation workflow in `.github/workflows/ci.yml` that acts as a quality gate on push and pull-request events targeting the `main` branch.

### Pipeline Workflow Jobs

1. **Lint & Format Check (`lint-format`)**:
   - Validates that code styling adheres to the Prettier standards via `npx prettier --check .`.
   - Runs `npm run lint` across all workspaces to check syntax correctness.
2. **Execute Automated Tests (`test-suite`)**:
   - Sets up Node.js, installs workspace dependencies, and runs `npx prisma generate` to populate typings.
   - Executes the full suite of backend and web component tests (`npm run test`).
3. **Verify Docker Builds (`build-docker`)**:
   - Sets up Docker build pipelines.
   - Compiles server and client Dockerfiles locally to ensure that changes do not break image compilation.
4. **Image Publishing (`publish-docker`)**:
   - Executed only on merges to `main`.
   - Authenticates to Docker Hub via credentials secrets and publishes target images automatically.
