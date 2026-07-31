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

---

## Decision #010: Frontend Performance Optimization & Accessibility Hardening

### Status

Accepted ✅

### Context

As the Single Page Application (SPA) grows, bundling all page components statically inside a single JS entry chunk degrades initial page load performance, increases Time to Interactive (TTI), and wastes bandwidth on resources the user might not visit. Heavy libraries like Monaco Editor can block UI threads if not loaded asynchronously. In addition, user experience must accommodate screen reader and keyboard accessibility standards (a11y).

### Decision

We implement SPA routing code splitting utilizing `React.lazy()` and `Suspense`, offload Monaco Editor chunk compiles to high-performance CDNs, implement client-side cache layers, and enrich HTML templates with descriptive accessibility tag elements.

### Details

- **Lazy Routes**: Dynamic imports split pages (`Browse`, `ViewPaste`, `Dashboard`, `Login`, `Register`) into separated browser chunks loaded on-demand during navigation.
- **UI Skeletons**: Wrapped routes with styled CSS spinners to preserve visually elegant transit states.
- **Monaco CDN Workers**: Configured `@monaco-editor/react` to pull editor core and worker files dynamically from jsdelivr CDNs, freeing main UI threads.
- **Query Caching**: Implemented a lightweight, in-memory TTL caching mechanism on the public Browse page to prevent redundant network round-trips.
- **A11y Enrichment**: Provided descriptive `aria-label` tags, role status indicators, and keyboard focus states across layout buttons and input fields.

### Consequences

- Time to Interactive (TTI) and initial page loads are optimized.
- Network overhead is minimized through client-side query caching.
- Screen readers and keyboard navigations are fully supported.
