# Changelog

All notable changes to the PasteBin project are documented in this file.

---

## [1.0.0-release] - 2026-07-31

Welcome to the **v1.0.0 Release** of PasteBin! This milestone marks the finalization of the high-performance, developer-centric full-stack monorepo featuring user accounts, password-protection, snippet self-destruction, command-line terminal client, rate-limiters, input sanitization, and production container topologies.

### 🚀 Added Features

- **Stateless Authentication**: Integrated JWT authorization mechanisms for user dashboards.
- **Monaco Code Workspace**: Created client interfaces mapping syntax highlighting, Dynamic dark/light theme switching, and copy features.
- **Secure Password Protection**: Paste access secured using encrypted database hashes (`bcrypt`) and handshake endpoints.
- **Snippet Expirations**: Custom retention lifespan schedules (10m, 1h, 1d, 1w, 1m) with background expiration sweeps checks.
- **Native CLI Client (`pastebin`)**: Installed binary Commander workspace providing commands to `login`, `upload`, `get`, and `list` directly from terminals. Employs ora progress spinners, custom ASCII art headers, and automated OS clipboard copies.
- **Visual Skeletons & Lazy Loading**: Enforced code splitting on client pages utilizing `React.lazy()` and `<Suspense>` loaders, reducing initial bundle payloads.
- **Public Query Caching**: Implemented a 30-second TTL client-side memory cache on search lists, bypassing redundant database queries.

### 🛡️ Security & Hardening

- **Layered Rate Limiting**: Ingress limits (100 req/15m global, 10 req/15m sensitive auth/posts, 5 req/1m delete) blocking brute-force attacks.
- **Input Sanitization**: Strip script tags from titles (`sanitize-html`) and event-listeners/scripts/iframes from code snippets via regular expressions without altering code brackets.
- **Helmet Headers**: Enforced Content-Security-Policy (CSP) settings.
- **Transitive Dependency Audits**: Resolved vulnerability alerts by defining overrides inside `package.json`.

### ⚙️ DevOps & Containment

- **Automated CI Workflow**: GitHub Actions pipelines compiling Docker verification targets, checking Prettier formats, running ESLint, and executing Vitest suites.
- **Container Topology**: Multi-stage Docker files delivering lean, secure Node servers and Nginx reverse proxies with Docker Compose healthcheck dependencies.
- **Staging scripts**: Formulated `setup-env.sh` and `start-prod.sh` scripts for one-click production setups.
