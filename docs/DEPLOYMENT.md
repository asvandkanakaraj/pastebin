# Deployment Guide — PasteBin

> **This document explains how PasteBin is deployed and kept running live.**
> Section 1 is readable by anyone. Technical configuration details are in Section 2+.

---

## 1. Where the App Lives (Plain English)

PasteBin is split into two parts that run in the cloud:

| Part                     | Platform                      | URL                                         |
| ------------------------ | ----------------------------- | ------------------------------------------- |
| **Website (Frontend)**   | [Render](https://render.com/) | https://pastebin-frontend-tfjz.onrender.com |
| **API Server (Backend)** | [Render](https://render.com/) | https://pastebin-backend-yba9.onrender.com  |
| **Database**             | [Neon](https://neon.tech/)    | PostgreSQL serverless (no direct URL)       |

The **website** is just HTML, CSS, and JavaScript files — Render serves them like any web host.

The **API server** is a Node.js process that handles all the logic — creating pastes, checking passwords, logging in users, etc.

The **database** is hosted on Neon, which is a cloud PostgreSQL provider. It automatically scales and pauses when not in use.

---

## 2. Health Check Endpoint

The server exposes a `/health` route that tells you if everything is working:

- **URL**: `https://pastebin-backend-yba9.onrender.com/health`
- **Method**: `GET`

#### When Everything Is Working (200 OK)

```json
{
  "status": "up",
  "uptime": "542.12s",
  "services": {
    "database": "connected",
    "api": "healthy"
  },
  "timestamp": "2026-08-02T10:00:00.000Z"
}
```

#### When the Database Is Down (503 Service Unavailable)

```json
{
  "status": "down",
  "uptime": "542.12s",
  "services": {
    "database": "disconnected",
    "api": "healthy"
  },
  "timestamp": "2026-08-02T10:00:00.000Z",
  "error": "Can't reach database server"
}
```

---

## 3. Render Deployment Configuration

### Backend (API Server)

| Setting           | Value                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| **Build Command** | `npm run build -w @pastebin/shared && npm run build -w @pastebin/database && npm run build -w @pastebin/server` |
| **Start Command** | `node apps/server/dist/index.js`                                                                                |

**Environment Variables** (set in Render dashboard):

| Variable       | Description                                              |
| -------------- | -------------------------------------------------------- |
| `DATABASE_URL` | Neon PostgreSQL connection string                        |
| `JWT_SECRET`   | Secret key used to sign login tokens — keep this private |
| `CORS_ORIGIN`  | The frontend URL allowed to talk to the API              |
| `PORT`         | Render sets this automatically                           |

### Frontend (Website)

| Setting               | Value                          |
| --------------------- | ------------------------------ |
| **Root Directory**    | `apps/web`                     |
| **Build Command**     | `npm install && npm run build` |
| **Publish Directory** | `dist`                         |

**Environment Variables:**

| Variable       | Description                                                             |
| -------------- | ----------------------------------------------------------------------- |
| `VITE_API_URL` | The backend API URL (e.g. `https://pastebin-backend-yba9.onrender.com`) |

---

## 4. Local Development Setup

If you want to run PasteBin on your own computer:

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Create a `.env` file at the project root

```env
DATABASE_URL=postgresql://your-username:your-password@localhost:5432/pastebin
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=http://localhost:5173
PORT=5000
```

### Step 3 — Run database migrations

```bash
npx prisma migrate dev --schema=./packages/database/prisma/schema.prisma
```

### Step 4 — Start both servers at once

```bash
npm run dev
```

This starts:

- The Vite dev server at `http://localhost:5173` (the website)
- The Express API at `http://localhost:5000` (the backend)

---

## 5. Production Logs

The server writes structured logs in JSON format:

- **Location**: `apps/server/logs/combined.log`
- **Format**: Each log line is a JSON object with `timestamp`, `level`, and `message`

---

## 6. Docker (Self-Hosted Alternative)

If you want to run PasteBin on your own server using Docker:

```bash
# Build and start all containers
docker-compose -f docker-compose.prod.yml up --build -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# Shut down
docker-compose -f docker-compose.prod.yml down
```

The Docker setup includes:

- **Nginx** — serves the frontend and proxies API requests
- **Node.js server** — the API backend
- **PostgreSQL** — the database (or connect to an external one)

---

## 7. CI/CD — Automated Quality Checks

Every time code is pushed to GitHub, an automated pipeline runs:

| Job                       | What It Does                                                              |
| ------------------------- | ------------------------------------------------------------------------- |
| **Lint & Format Check**   | Makes sure code is formatted consistently with Prettier and passes ESLint |
| **Test Suite**            | Runs all automated tests (Vitest) to verify nothing is broken             |
| **Docker Build Verify**   | Checks that the Docker images still build correctly                       |
| **Publish Docker Images** | Only on main — pushes images to Docker Hub (if secrets are configured)    |
