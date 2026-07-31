# Architectural Decisions Log

This document records the architectural and design decisions made during the development of the PasteBin monorepo.

---

## Decision #008: Automated CI/CD Pipelines

### Status
Accepted ✅

### Context
With multiple workspaces (web, server, database, shared packages) operating under a unified monorepo structures, verifying code changes manually becomes fragile and slow. Pre-commit manual tests do not guarantee that clean compilations, lints, and test suits are preserved on origin integrations.

### Decision
We implement a unified, automated CI/CD pipeline using **GitHub Actions** (`ci.yml`) triggering on:
- All pull requests targeting the `main` branch.
- All direct pushes to the `main` branch.

### Details & Flow
The pipeline is divided into parallel validation paths:
1. **Lint & Format**: Runs Prettier style checks and ESLint checks across workspace scopes.
2. **Execute Tests**: Installs root modules, compiles Prisma clients, and runs the full Vitest suite.
3. **Verify Docker Builds**: Compiles Docker images for both backend server and frontend client configurations to prevent regression bugs in Docker configuration scripts.
4. **Publish Stage**: Login and push verified images to Docker Hub when pushing directly to `main` branch.

### Consequences
- Only compilation-safe, fully formatted, and tested code is merged to the integration branch.
- Docker configuration shifts are caught early in the development lifecycle.
- Builds publish pipeline automation minimizes devops overhead.

---

## Decision #009: CLI Client Implementation

### Status
Accepted ✅

### Context
Developers often prefer interacting with pasting tools directly from the terminal without switching context to a web browser. Building a CLI client enables terminal uploads and retrievals and tests the REST API robustness under multiple distinct client implementations (Web and CLI).

### Decision
We develop a native CLI client under `apps/cli` using Commander, Axios, and Chalk.

### Details
- **Command coverage**: Commands to `login`, `upload`, `get`, and `list` pastes.
- **Config storage**: JWT persistence is written to `~/.pastebin-config.json`.
- **Typing validations**: Shares common TypeScript validation parameters from `@pastebin/shared`.

### Consequences
- Developer productivity is boosted with instant command line access.
- Proved backend APIs are fully client-agnostic and robust.
