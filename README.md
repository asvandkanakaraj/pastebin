# PasteBin - Enterprise Code Sharing Platform

[![CI Status](https://github.com/asvandkanakaraj/PasteBin/actions/workflows/ci.yml/badge.svg)](https://github.com/asvandkanakaraj/PasteBin/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Welcome to **PasteBin**, a high-performance, developer-centric code-sharing platform designed for seamless snippet sharing, rich typography, collaborative review, and speed. Built from the ground up as a robust TypeScript monorepo, it delivers state-of-the-art security, terminal access, and containment.

---

## 🛠️ Technology Stack

Our platform leverages a modern, cohesive tech stack across all layers:

- **Monorepo Manager**: [npm Workspaces](https://docs.npmjs.com/specifying-workspaces)
- **Frontend**: [React 19](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Backend API**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [Winston Logging](https://github.com/winstonjs/winston), [Helmet](https://helmetjs.github.io/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/), [Prisma ORM](https://www.prisma.io/)
- **Orchestration**: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/), [Nginx](https://www.nginx.com/)
- **Testing**: [Vitest](https://vitest.dev/), [Supertest](https://github.com/ladjs/supertest)

---

## ✨ Key Features

- **Monaco Code Editor**: Fully integrated code-sharing panel supporting dynamic language syntax highlighting, dark/light theme switching, and Esc-triggered fullscreen overlays.
- **Developer CLI Client (`pastebin`)**: Upload local files, retrieve snippets with syntax highlighting, list public entries, and login directly from your terminal. Includes automated OS clipboard copying.
- **JWT Stateless Authentication**: User registration, login, and secure user dashboards displaying past paste history.
- **Personal Workspace Dashboard**: Structured workspace sections (My Pastes, Shared With Me, Saved bookmarks, and Recently Viewed logs) containing in-memory filtering, sort orders, and card action modals.
- **Collaborative Sharing & Permissions**: Centered Sharing modal dialog allowing owners to manage read-only or read-and-write permissions. Guests with write access can edit Monaco content inline.
- **Segmented Visibility Levels**: Select between Public (searchable), Private (PIN code protection), and Secret (visible strictly to logged-in owner).
- **Dynamic Paste Expirations**: Set lifespan durations (1h, 24h, 7d, 30d, or Custom Date) with automatic cleanup.
- **BCrypt Password Protection**: Lock sensitive paste entries with custom passwords checked via secure hashes (`bcrypt`) and handshake verify routes.
- **Public Directory & Search**: Browse public snippets with real-time text searches, programming language filtering, and page pagination.
- **Layered Rate Limiting**: Ingress limits (100 req/15m global, 10 req/15m sensitive auth/posts, 5 req/1m delete) blocking brute-force attacks.
- **Input Sanitization**: Backend cleaning of script tags from titles (`sanitize-html`) and custom regex script stripping on code content.
- **Performance Optimizations**: SPA route code-splitting, lazy route skeletons, CDN Monaco worker loading, and client-side TTL query caches.

---

## 📐 Architecture Overview

The system employs a multi-tier decoupled structure. Requests flow from client instances through security proxy limits into controllers, which query database tables utilizing optimized PostgreSQL indexes.

```
Client Layer (React/CLI) ──> Ingress (Nginx) ──> Rate Limit / Sanitizer ──> Express Controllers ──> Prisma ORM ──> PostgreSQL
```

For full details, sequence diagrams, and design rules, see the **[Architecture Manual](file:///e:/DEVS/PasteBin/docs/ARCHITECTURE.md)**.

---

## 🚀 Getting Started

### 1. Docker Setup (Recommended)

You can build and spin up the complete production network (Postgres Database, Backend API, and Nginx Web proxy) using a single command:

1. **Scaffold and Verify Environment**:
   ```bash
   sh scripts/setup-env.sh
   ```
2. **Launch Services**:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```
3. Open your browser and navigate to **`http://localhost`** to view the app!

---

### 2. Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Database**: Ensure you have PostgreSQL running locally, set the `DATABASE_URL` in `.env` at root, and run migrations:
   ```bash
   npx prisma migrate dev --schema=packages/database/prisma/schema.prisma
   ```
3. **Start Dev Servers**: Spin up both the Express API and Vite web dev server concurrently:
   ```bash
   npm run dev
   ```
4. **Compile Production Build**: Validate monorepo builds in dependency sequence:
   ```bash
   npm run build:prod
   ```
5. **Run Workspaces Tests**: Execute all Vitest automated integration and component suites:
   ```bash
   npm run test
   ```

---

## 💻 CLI Usage

Link the command-line tool globally to your system:

```bash
npm link -w @pastebin/cli
```

### Commands Reference

- **Authenticate**: `pastebin login`
- **Upload File**: `pastebin upload src/index.js -l javascript -t "Production Script"`
- **Retrieve Content**: `pastebin get <paste-id>`
- **List Public**: `pastebin list`

For command flags and token details, refer to the **[CLI Reference Manual](file:///e:/DEVS/PasteBin/docs/CLI.md)**.

---

## 📖 Documentation Index

All details regarding project decisions and architecture designs are cataloged in our developer documentation:

| Document                                                             | Description                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **[ARCHITECTURE.md](file:///e:/DEVS/PasteBin/docs/ARCHITECTURE.md)** | System diagrams, layered components, and execution flows             |
| **[API.md](file:///e:/DEVS/PasteBin/docs/API.md)**                   | Full endpoint request/response models and HTTP error codes           |
| **[DATABASE.md](file:///e:/DEVS/PasteBin/docs/DATABASE.md)**         | Prisma schemas mapping, ER diagrams, and performance indexes         |
| **[DEPLOYMENT.md](file:///e:/DEVS/PasteBin/docs/DEPLOYMENT.md)**     | Containment topologies, shell scripts commands, and monitoring guide |
| **[DECISIONS.md](file:///e:/DEVS/PasteBin/docs/DECISIONS.md)**       | Log of architectural choices and ADR records                         |
| **[DEVELOPMENT.md](file:///e:/DEVS/PasteBin/docs/DEVELOPMENT.md)**   | Chronological history log of development sessions                    |
| **[PRD.md](file:///e:/DEVS/PasteBin/docs/PRD.md)**                   | Product vision, features matrix, and requirements log                |
| **[TODO.md](file:///e:/DEVS/PasteBin/docs/TODO.md)**                 | Roadmap phases and checklists milestones status                      |
| **[CONTRIBUTING.md](file:///e:/DEVS/PasteBin/docs/CONTRIBUTING.md)** | Developer standards, coding guidelines, and style checklists         |
| **[CHANGELOG.md](file:///e:/DEVS/PasteBin/docs/CHANGELOG.md)**       | Historical version release logs                                      |

---

## 📄 License

Distributed under the MIT License. See [LICENSE](file:///e:/DEVS/PasteBin/LICENSE) for more information.
