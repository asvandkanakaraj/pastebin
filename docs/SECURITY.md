# PasteBin Security Philosophy & Design

This document details the visual and logical security constraints implemented across the PasteBin full-stack codebase.

## 1. Password Protection & Cryptographic Hashing

- **BCrypt Encryption**: Whenever a paste is created with custom password protections, the password is encrypted asynchronously via `bcrypt` using a work factor parameter of 10 (`saltRounds`) before saving.
- **Database Leaks Containment**: Even if the primary PostgreSQL database is compromised, raw paste passwords cannot be resolved since the database only persists the secure one-way salted bcrypt signatures (`passwordHash`).
- **Authorization Decrypt Handshakes**: Requester inputs verified against these signatures dynamically grant access and exclude hashes from returning inside query response packets.

## 2. Private Pastes & Scope Access Control

- **Owner Checks**: Snippets designated with public visibility disabled (`isPublic: false`) are restricted dynamically at the service layer:
  - If a requester is anonymous, access is rejected immediately returning a `403 Forbidden` response status.
  - If a requester is logged in, the service matches their JWT user ID claim against the paste owner (`userId`). Access is only granted if the claims are equal; otherwise, it returns a `403 Forbidden` response.
- **Stateless Decryption Verification**: In addition to standard owner validations, any password-protected entry requires verification. If a header `x-paste-password` is not present, it triggers `401 Unauthorized` responses forcing password decryption overlays in the client.

## 3. JWT Stateless Session Management

- **Token Signatures**: User registration and login validation dispatch stateless token keys signed via standard `HS256` HMAC signatures using the server's private `JWT_SECRET`.

## 4. API Rate Limiting Strategy

We implement layered rate limiting to secure public routes and prevent credential stuffing/spam:

- **Global Rate Limiter**: Applied globally across all API routes. Capped at a maximum of `100 requests per 15 minutes` per IP address.
- **Strict Rate Limiter**: Applied to sensitive write and credentials validation endpoints (`/api/auth/register`, `/api/auth/login`, and `POST /api/pastes`). Capped at a maximum of `10 requests per 15 minutes` per IP address to block brute-force and creation spam.
- **Deletion Rate Limiter**: Applied strictly to paste removals (`DELETE /api/pastes/:id`). Limits requests to `5 requests per 1 minute` per IP address.

## 5. Security Headers & CORS Controls

- **Helmet Middleware**: Configured globally in the Express server to set HTTP security headers, including:
  - Content Security Policy (CSP) configurations preventing cross-site scripting (XSS).
  - HTTP Strict Transport Security (HSTS) forcing SSL connections.
  - X-Content-Type-Options preventing MIME type sniffing.
- **CORS Constraints**: Restricts incoming API requests to trusted origins (`http://localhost:5173` and `http://localhost:3000`). Attempts from unapproved external scripts are rejected.
- **Input Sanitization**: Auth inputs (email, password) are trimmed and normalized to lowercase to eliminate whitespace bugs and prevent credential stuffing variations. Parameterized Prisma query builders secure against SQL injections.

---

## 6. Comprehensive Security Audit

We have performed a complete security audit across the monorepo workspaces and implemented the following hardening measures:

### 1. SQL Injection Protection (Prisma)

All database interactions are routed through the Prisma ORM. Prisma automatically parameterizes all queries and input arguments. Even for advanced raw pings (e.g. `/health`), query strings are parameterized (e.g. `db.$queryRaw`SELECT 1``), completely preventing SQL Injection vectors.

### 2. XSS (Cross-Site Scripting) Mitigation

- **Backend Title Sanitization**: The `sanitizeMiddleware` processes titles with a strict configuration (`allowedTags: []`), stripping all HTML tags entirely.
- **Backend Content Sanitization**: Raw paste content is sanitized via a regex-based script stripper (`cleanScriptTags`) inside [sanitize.middleware.ts](file:///e:/DEVS/PasteBin/apps/server/src/middleware/sanitize.middleware.ts). It removes `<script>`, `<iframe>` blocks, inline event handlers (`onload`, `onclick`), and `javascript:` URIs, while preserving valid math/code operators like `<` and `>` to avoid corrupting programming code pastes.
- **Frontend Safe Rendering**: React automatically escapes state bindings dynamically (e.g., `{paste.title}`). Content is rendered inside Monaco Editor (which treats inputs purely as plain text code) or standard escaped components, preventing client-side script execution.

### 3. Brute Force Mitigation (Rate Limiting)

Brute-force attempts are blocked by strict rate limits:

- Sensitive routes (`/api/auth/*` and `POST /api/pastes`) are limited to **10 requests per 15 minutes** per IP.
- Delete operations are capped at **5 requests per 1 minute** per IP.

### 4. CSRF (Cross-Site Request Forgery) Mitigation

- The application implements a **Header-based JWT Authentication Strategy** instead of browser cookies.
- Token keys are stored in client `localStorage` and attached to outgoing requests inside the HTTP `Authorization: Bearer <token>` header.
- Because web browsers do not automatically attach custom authorization headers to cross-site requests (unlike cookies), CSRF attacks are fundamentally mitigated.

### 5. Dependency Audit & Assessment

An audit check has been run via `npm audit` with the following outcomes:

- **Overrides**: Applied overrides to lock secure versions of nested transitive dependencies (`brace-expansion` and `tar`).
- **Inapplicable Vulnerabilities**:
  - `react-router` / `react-router-dom`: The reported RSC (React Server Components) CSRF bypass vulnerability is inapplicable because our React web app runs purely as a client-side Single Page Application (SPA).
  - `esbuild`: Resolves development-only local server options, not production Nginx or server runtime environments.
  - `tar` & `brace-expansion`: Only execute during pre-gyp compiles at local developer workstations, and do not execute inside production runtime environments.
