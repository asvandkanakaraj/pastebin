# Changelog

All notable changes to the PasteBin project are documented in this file.

---

## [1.1.0] - 2026-08-02

### 🎨 UI & UX Polish

- **Custom Monochrome Logo**: Replaced the generic `lucide-react` Code icon with a bespoke developer-themed SVG logo component (`Logo.tsx`) used consistently in the Navbar and loading screen.
- **Premium Page Loader**: Replaced the plain spinning circle with the custom Logo icon and "Initializing workspace..." label for a more intentional first impression.
- **About Page Rewrite**: Completely rewrote the About page into four distinct sections — project story, technical architecture deep-dive, technology stack grid, and a personal builder note — with animated gradient accent badges and a structured call-to-action.
- **Micro-animations & CSS**: Added premium CSS transition curves, smooth fadeIn/scaleIn animation utilities, and clean keyboard focus ring styles to `App.css`.
- **Visual Consistency Audit**: Audited and harmonized hover effects, button sizing, spacing, and color contrast across all components.

### 🛡️ Stability & Safety

- **React ErrorBoundary**: Added a class-based `ErrorBoundary` component wrapping the Suspense/Routes tree in `App.tsx`. Prevents blank white-screen crashes from render-phase errors and shows a clean "Something went wrong — Reload Page" fallback UI.
- **Process Crash Guards**: Added `process.on('uncaughtException')` and `process.on('unhandledRejection')` handlers to `index.ts` so any unexpected escaped error is logged with a full stack trace before Node.js exits, enabling clean Render container restarts.

---

## [1.0.0-release] - 2026-07-31

Welcome to the **v1.0.0 Release** of PasteBin! This milestone marks the finalization of the high-performance, developer-centric full-stack monorepo featuring user accounts, password-protection, snippet self-destruction, command-line terminal client, rate-limiters, input sanitization, and production deployment on Render.

### 🚀 Added Features

- **Stateless Authentication**: Integrated JWT authorization mechanisms for user dashboards.
- **Monaco Code Workspace**: Created client interfaces mapping syntax highlighting, dynamic dark/light theme switching, and copy features.
- **Secure Password Protection**: Paste access secured using encrypted database hashes (`bcrypt`) and handshake endpoints.
- **Snippet Expirations**: Custom retention lifespan schedules (1h, 24h, 7d, 30d, custom) with expiration checks on every request.
- **Native CLI Client (`pastebin`)**: Installed binary Commander workspace providing commands to `login`, `upload`, `get`, and `list` directly from terminals. Employs ora progress spinners, custom ASCII art headers, and automated OS clipboard copies.
- **Visual Skeletons & Lazy Loading**: Enforced code splitting on client pages utilizing `React.lazy()` and `<Suspense>` loaders, reducing initial bundle payloads.
- **Public Query Caching**: Implemented a 30-second TTL client-side memory cache on search lists, bypassing redundant database queries.
- **User Profile System**: Full profile pages with avatar, bio, display name, paste history tabs (My Pastes, Saved, Recent), and per-owner statistics.
- **Collaborative Sharing**: Share modal allowing paste owners to grant READ or WRITE access to other registered users by username or email.
- **Segmented Visibility**: PUBLIC, PRIVATE (PIN-gated), and SECRET (owner-only) visibility levels.

### 🛡️ Security & Hardening

- **Layered Rate Limiting**: Ingress limits (100 req/15m global, 10 req/15m sensitive auth/posts, 5 req/1m delete) blocking brute-force attacks.
- **Input Sanitization**: Strip script tags from titles (`sanitize-html`) and event-listeners/scripts/iframes from code snippets via regular expressions without altering code brackets.
- **Helmet Headers**: Enforced Content-Security-Policy (CSP) settings.
- **Transitive Dependency Audits**: Resolved vulnerability alerts by defining overrides inside `package.json`.

### ⚙️ DevOps & Deployment

- **Render Cloud Deployment**: Frontend and Backend deployed as separate Render Web Services connected to a Neon serverless PostgreSQL database.
- **Automated CI Workflow**: GitHub Actions pipelines checking Prettier formats, running ESLint, and executing Vitest suites.
- **Container Topology**: Multi-stage Dockerfiles delivering lean, secure Node servers and Nginx reverse proxies with Docker Compose healthcheck dependencies (for local/self-hosted deployment).
- **Staging scripts**: Formulated `setup-env.sh` and `start-prod.sh` scripts for one-click production setups.
