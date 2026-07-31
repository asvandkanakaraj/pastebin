# PasteBin — Full-System Functional Gap Report

> **Audit Date:** 2026-07-31  
> **Auditor Role:** Senior Lead Engineer & Technical Auditor  
> **Scope:** All frontend pages, backend endpoints, middleware, services, schemas, DevOps configurations  
> **Methodology:** Static code analysis of every file in the monorepo. Every button, link, form, route, and logic block has been inspected.

---

## Executive Summary

| Category | Critical | High | Medium | Low | Total |
| --- | --- | --- | --- | --- | --- |
| **A. Navigation Bar** | 1 | 2 | 1 | 0 | **4** |
| **B. Code Editor & Creation** | 1 | 2 | 2 | 1 | **6** |
| **C. View & Sharing** | 1 | 3 | 1 | 0 | **5** |
| **D. Browse & Search** | 0 | 1 | 2 | 0 | **3** |
| **E. Auth & User System** | 2 | 3 | 2 | 0 | **7** |
| **F. DevOps & Infrastructure** | 2 | 3 | 2 | 1 | **8** |
| **Totals** | **7** | **14** | **10** | **2** | **33** |

---

## PART A: NAVIGATION BAR

**Files Audited:** `Navbar.tsx`, `Footer.tsx`, `App.tsx`

### GAP A-1 — Navbar Search Bar is Disabled (DEAD ELEMENT) `HIGH`

- **Location:** [Navbar.tsx:32-36](file:///e:/DEVS/PasteBin/apps/web/src/components/layout/Navbar.tsx#L32-L36)
- **Status:** The search `<input>` element has `disabled` attribute hardcoded. The `cursor-not-allowed` CSS class confirms this is intentionally dead UI. There is no `onChange`, no `onSubmit`, no form action, and no keyboard shortcut handler for the `/` indicator badge.
- **Impact:** Users see a prominent search bar in the navbar that does absolutely nothing. This is misleading UX.

### GAP A-2 — "API" Link Points to Static File Path (BROKEN) `HIGH`

- **Location:** [Navbar.tsx:53-58](file:///e:/DEVS/PasteBin/apps/web/src/components/layout/Navbar.tsx#L53-L58)
- **Status:** The "API" link's `href` is `/docs/API.md`. This is a raw markdown file path — Vite/React Router does **not** serve this file. Clicking it in production (Nginx) will return a 404 Not Found.
- **Same issue in Footer:** [Footer.tsx:11-12](file:///e:/DEVS/PasteBin/apps/web/src/components/layout/Footer.tsx#L11-L12) — same broken `/docs/API.md` href.

### GAP A-3 — "About" Link is a Dead Anchor (EMPTY) `CRITICAL`

- **Location:** [Navbar.tsx:59-61](file:///e:/DEVS/PasteBin/apps/web/src/components/layout/Navbar.tsx#L59-L61)
- **Status:** The "About" navigation link has `href="#"`. This is a dead placeholder — there is no `/about` route in `App.tsx`, no About page component, and no content.

### GAP A-4 — Footer "Privacy" and "Terms" Links are Dead Anchors (EMPTY) `MEDIUM`

- **Location:** [Footer.tsx:22-27](file:///e:/DEVS/PasteBin/apps/web/src/components/layout/Footer.tsx#L22-L27)
- **Status:** Both "Privacy" and "Terms" links have `href="#"`. No corresponding routes or pages exist.

---

## PART B: CODE EDITOR & CREATION

**Files Audited:** `CreatePaste.tsx`, `CodeEditor.tsx`, `paste.schema.ts`, `paste.controller.ts`, `paste.service.ts`, `sanitize.middleware.ts`

### GAP B-1 — "Preview Paste" Button Has No Handler (EMPTY) `CRITICAL`

- **Location:** [CreatePaste.tsx:541-547](file:///e:/DEVS/PasteBin/apps/web/src/pages/CreatePaste.tsx#L541-L547)
- **Status:** The "Preview Paste" button has `type="button"` but **no `onClick` handler**. It is completely inert. There is no preview modal, no preview route, and no rendering logic anywhere in the codebase.

### GAP B-2 — "Auto-detect" Language Dropdown is Disabled (PLACEHOLDER) `HIGH`

- **Location:** [CreatePaste.tsx:234-242](file:///e:/DEVS/PasteBin/apps/web/src/pages/CreatePaste.tsx#L234-L242)
- **Status:** The "Auto-detect" select dropdown has `disabled` hardcoded. There is no language auto-detection logic anywhere in the codebase. The dropdown is purely decorative and misleading.

### GAP B-3 — Hardcoded API Base URL (INCOMPLETE) `HIGH`

- **Location:** [CreatePaste.tsx:158](file:///e:/DEVS/PasteBin/apps/web/src/pages/CreatePaste.tsx#L158)
- **Status:** The API call uses `'http://localhost:5000/api/pastes'` hardcoded inline. This exists in **every** page: `CreatePaste.tsx`, `ViewPaste.tsx`, `BrowsePastes.tsx`, `Dashboard.tsx`, `Login.tsx`, `Register.tsx`. There is no centralized API client, no environment variable for the API URL, and no `VITE_API_URL` in any `.env` file. **This will break in any deployment beyond local development.**

### GAP B-4 — Zod Validation Not Enforced Server-Side for Auth (INCOMPLETE) `MEDIUM`

- **Location:** [auth.controller.ts:7-13](file:///e:/DEVS/PasteBin/apps/server/src/controllers/auth.controller.ts#L7-L13)
- **Status:** The `register` and `login` endpoints perform manual `if (!email || !password)` checks instead of using Zod schema validation. There is no `RegisterSchema` or `LoginSchema` in the shared schemas package. Only `CreatePasteSchema` uses Zod. Auth inputs bypass shared validation, meaning email format is never validated (a string like `"abc"` would be accepted as an email address).

### GAP B-5 — Fullscreen Mode Has No Escape Mechanism (INCOMPLETE) `MEDIUM`

- **Location:** [CreatePaste.tsx:284-291](file:///e:/DEVS/PasteBin/apps/web/src/pages/CreatePaste.tsx#L284-L291)
- **Status:** The fullscreen toggle sets `isFullscreen` to true and applies `fixed inset-0 z-50` CSS. However, there is no `Escape` key listener to exit fullscreen mode. Users must locate and click the small minimize button, which is poor UX for a fullscreen overlay.

### GAP B-6 — Default Paste Content Contains Placeholder Code (LOW) `LOW`

- **Location:** [CreatePaste.tsx:62-74](file:///e:/DEVS/PasteBin/apps/web/src/pages/CreatePaste.tsx#L62-L74)
- **Status:** The editor initializes with pre-filled demo code (`// PasteBin is awesome! 🚀...`). While intentional as a demo, users who click "Create Paste" without clearing it will submit placeholder content.

---

## PART C: VIEW & SHARING

**Files Audited:** `ViewPaste.tsx`, `paste.service.ts`, `paste.controller.ts`

### GAP C-1 — Delete Button Has No Authorization Check (CRITICAL) `CRITICAL`

- **Location:** [ViewPaste.tsx:96-111](file:///e:/DEVS/PasteBin/apps/web/src/pages/ViewPaste.tsx#L96-L111) and [paste.service.ts:177-210](file:///e:/DEVS/PasteBin/apps/server/src/services/paste.service.ts#L177-L210)
- **Status:** The delete button on the View page is visible to **all visitors** regardless of ownership. On the server side, `PasteService.deletePaste()` only checks for password verification — it does **not** verify `userId` or JWT ownership. **Any anonymous user can delete any non-password-protected paste** simply by hitting `DELETE /api/pastes/:id`. This is a security vulnerability.

### GAP C-2 — Delete Button on ViewPaste Sends Password from Unlock (BROKEN LOGIC) `HIGH`

- **Location:** [ViewPaste.tsx:99-103](file:///e:/DEVS/PasteBin/apps/web/src/pages/ViewPaste.tsx#L99-L103)
- **Status:** The `handleDelete` function reads `password` from the password unlock state. However, once a paste is successfully unlocked, the password field's value is retained but not necessarily the same password the user entered — the state is shared with the unlock form. Additionally, the delete endpoint on the server requires the paste password in a header, but there is no prompt asking the user to re-enter the password specifically for deletion.

### GAP C-3 — No "Edit Paste" Functionality Exists (EMPTY) `HIGH`

- **Location:** Entire codebase
- **Status:** The Tip box in `CreatePaste.tsx` says: _"You can always edit or delete your paste from the link page."_ However, there is **no edit button, no edit route (`/edit/:id`), no edit endpoint (`PUT /api/pastes/:id`), and no edit controller method.** The tip is a false claim.

### GAP C-4 — No Share/Copy URL Button (MISSING FEATURE) `HIGH`

- **Location:** [ViewPaste.tsx:301-326](file:///e:/DEVS/PasteBin/apps/web/src/pages/ViewPaste.tsx#L301-L326)
- **Status:** The action bar has "Copy Code" and "Delete" buttons, but there is no "Copy Link" / "Share URL" button. For a paste-sharing application, the ability to copy the paste URL is a core feature that is entirely missing.

### GAP C-5 — ViewPaste Does Not Use Custom Monaco Theme (INCONSISTENCY) `MEDIUM`

- **Location:** [ViewPaste.tsx:329-344](file:///e:/DEVS/PasteBin/apps/web/src/pages/ViewPaste.tsx#L329-L344)
- **Status:** The View page uses `<Editor>` directly from `@monaco-editor/react` with `theme={theme === 'dark' ? 'vs-dark' : 'light'}`. It does **not** use the custom `<CodeEditor>` component or the custom `pastebin-dark`/`pastebin-light` Monaco themes defined in `CodeEditor.tsx`. This creates a visual inconsistency between the Create and View pages.

---

## PART D: BROWSE & SEARCH

**Files Audited:** `BrowsePastes.tsx`, `paste.service.ts`, `paste.controller.ts`

### GAP D-1 — Navbar Search Bar Disconnected from Browse Search (HIGH) `HIGH`

- **Location:** [Navbar.tsx:29-41](file:///e:/DEVS/PasteBin/apps/web/src/components/layout/Navbar.tsx#L29-L41) vs [BrowsePastes.tsx:178-187](file:///e:/DEVS/PasteBin/apps/web/src/pages/BrowsePastes.tsx#L178-L187)
- **Status:** The Browse page has a fully functional search bar with debounced URL parameter updates. However, the Navbar search bar (visible on every page) is completely disabled and is not connected to `/browse?search=...` navigation. Users have no way to discover that search functionality exists on the Browse page from the home page.

### GAP D-2 — Browse Page Has No Loading Timeout/Retry (MEDIUM) `MEDIUM`

- **Location:** [BrowsePastes.tsx:67-93](file:///e:/DEVS/PasteBin/apps/web/src/pages/BrowsePastes.tsx#L67-L93)
- **Status:** If the API server is down, the Browse page shows a loading skeleton indefinitely with no timeout, no retry button, and no offline detection.

### GAP D-3 — Client-Side Cache Never Invalidated on Mutations (MEDIUM) `MEDIUM`

- **Location:** [BrowsePastes.tsx:23-24](file:///e:/DEVS/PasteBin/apps/web/src/pages/BrowsePastes.tsx#L23-L24)
- **Status:** The `browseCache` Map with 30-second TTL is module-scoped. If a user creates a new paste and immediately navigates to Browse, the cached response will be served and the new paste won't appear until TTL expires. The cache is never explicitly invalidated after create/delete mutations.

---

## PART E: AUTH & USER SYSTEM

**Files Audited:** `auth-provider.tsx`, `Login.tsx`, `Register.tsx`, `Dashboard.tsx`, `user.service.ts`, `auth.middleware.ts`, `auth.controller.ts`

### GAP E-1 — No Protected Route Guard Component (CRITICAL) `CRITICAL`

- **Location:** [App.tsx:47-53](file:///e:/DEVS/PasteBin/apps/web/src/App.tsx#L47-L53)
- **Status:** The `/dashboard` route is open to anyone. Protection is handled inside the `Dashboard` component via a `useEffect` redirect ([Dashboard.tsx:26-29](file:///e:/DEVS/PasteBin/apps/web/src/pages/Dashboard.tsx#L26-L29)). This is an anti-pattern — the component briefly renders (and makes API calls) before redirecting. There is no `<ProtectedRoute>` wrapper component.

### GAP E-2 — JWT Token Never Validated on App Reload (CRITICAL) `CRITICAL`

- **Location:** [auth-provider.tsx:23-31](file:///e:/DEVS/PasteBin/apps/web/src/components/auth-provider.tsx#L23-L31)
- **Status:** On app reload, the `AuthProvider` reads `pb_token` from localStorage and trusts it unconditionally. There is **no server-side token validation call** (e.g., `GET /api/auth/me`). If the JWT is expired, revoked, or tampered with, the UI will show the user as logged in but every API call will fail with 401. There is no `/api/auth/me` or `/api/auth/verify` endpoint on the server.

### GAP E-3 — No Password Strength Validation on Registration (HIGH) `HIGH`

- **Location:** [Register.tsx:14-38](file:///e:/DEVS/PasteBin/apps/web/src/pages/Register.tsx#L14-L38) and [user.service.ts:8-29](file:///e:/DEVS/PasteBin/apps/server/src/services/user.service.ts#L8-L29)
- **Status:** The registration form accepts any password — there is no minimum length, no complexity requirement, and no Zod schema validation. The server's `registerUser` method also performs no password strength checks. A user can register with password `"a"`.

### GAP E-4 — No Email Format Validation on Registration (HIGH) `HIGH`

- **Location:** [auth.controller.ts:7-23](file:///e:/DEVS/PasteBin/apps/server/src/controllers/auth.controller.ts#L7-L23)
- **Status:** The register endpoint trims and lowercases the email, but never validates it against an email regex or Zod email schema. The `<input type="email">` on the frontend provides browser-level validation, but direct API calls bypass this entirely. A string like `"notanemail"` will be accepted and stored in the database.

### GAP E-5 — No "Forgot Password" Flow (INCOMPLETE) `HIGH`

- **Location:** [Login.tsx](file:///e:/DEVS/PasteBin/apps/web/src/pages/Login.tsx)
- **Status:** There is no "Forgot Password?" link on the login page. No password reset endpoint exists on the server. No email sending service is configured.

### GAP E-6 — Register Does Not Auto-Login (MEDIUM) `MEDIUM`

- **Location:** [Register.tsx:31-32](file:///e:/DEVS/PasteBin/apps/web/src/pages/Register.tsx#L31-L32)
- **Status:** After successful registration, the user is redirected to `/login`. The server's register endpoint returns user data but no JWT token. The user must fill in credentials again immediately after registering.

### GAP E-7 — No Logout API Call / Token Invalidation (MEDIUM) `MEDIUM`

- **Location:** [auth-provider.tsx:41-46](file:///e:/DEVS/PasteBin/apps/web/src/components/auth-provider.tsx#L41-L46)
- **Status:** The `logout()` function only clears localStorage on the client. There is no server-side token blacklist, no `POST /api/auth/logout` endpoint. JWTs remain valid for their full 7-day lifetime even after logout.

---

## PART F: DEVOPS & INFRASTRUCTURE

**Files Audited:** `.env`, `.env.production`, `docker-compose.yml`, `docker-compose.prod.yml`, `Dockerfile` (server & web), `nginx.conf`, `setup-env.sh`, `start-prod.sh`, `package.json`, `.gitignore`

### GAP F-1 — JWT_SECRET Missing from Development .env (CRITICAL) `CRITICAL`

- **Location:** [.env](file:///e:/DEVS/PasteBin/.env)
- **Status:** The development `.env` file contains only `DATABASE_URL` and `PORT`. There is no `JWT_SECRET` defined. The server falls back to a hardcoded string: `'pastebin-super-secret-key-development'` ([user.service.ts:5](file:///e:/DEVS/PasteBin/apps/server/src/services/user.service.ts#L5) and [auth.middleware.ts:4](file:///e:/DEVS/PasteBin/apps/server/src/middleware/auth.middleware.ts#L4)). This hardcoded secret is duplicated across two files and could easily fall out of sync.

### GAP F-2 — .env.production Committed to Git Repository (CRITICAL) `CRITICAL`

- **Location:** [.env.production](file:///e:/DEVS/PasteBin/.env.production) and [.gitignore](file:///e:/DEVS/PasteBin/.gitignore)
- **Status:** The `.gitignore` excludes `.env`, `.env.local`, `.env.development.local`, `.env.test.local`, and `.env.production.local`, but it does **NOT** exclude `.env.production`. The production environment file containing `JWT_SECRET` and database credentials is tracked and pushed to GitHub. This is a **security vulnerability** — production secrets are publicly visible.

### GAP F-3 — Nginx Does Not Proxy API Requests (BROKEN IN PRODUCTION) `HIGH`

- **Location:** [nginx.conf](file:///e:/DEVS/PasteBin/apps/web/nginx.conf)
- **Status:** The Nginx configuration only serves static files. There is no `location /api { proxy_pass http://server:5000; }` block. In the Docker production setup, the web container serves the React SPA, but all API calls in the frontend go to `http://localhost:5000` — which resolves to the **browser's localhost**, not the Docker server container. **The entire production deployment is non-functional.**

### GAP F-4 — Server Dockerfile Skips Prisma Migration Deploy (HIGH) `HIGH`

- **Location:** [apps/server/Dockerfile:45](file:///e:/DEVS/PasteBin/apps/server/Dockerfile#L45)
- **Status:** The server Docker CMD runs `node apps/server/dist/index.js` directly. It does not run `prisma migrate deploy` before startup. The `start-prod.sh` script handles this, but the Dockerfile does **not** use `start-prod.sh` as the entrypoint. Database tables may not exist when the server starts.

### GAP F-5 — Prisma Migration Files Not Copied in Server Dockerfile (HIGH) `HIGH`

- **Location:** [apps/server/Dockerfile:36](file:///e:/DEVS/PasteBin/apps/server/Dockerfile#L36)
- **Status:** The Dockerfile copies `packages/database` but relies on `npm prune --omit=dev` which removes Prisma CLI. Even if migration deploy was added, the Prisma CLI would not be available in the production image.

### GAP F-6 — No 404 Catch-All Route in React Router (MEDIUM) `MEDIUM`

- **Location:** [App.tsx:46-53](file:///e:/DEVS/PasteBin/apps/web/src/App.tsx#L46-L53)
- **Status:** There is no `<Route path="*" element={<NotFound />} />` fallback route. Navigating to any undefined URL (e.g., `/settings`, `/about`, `/anything`) will render a blank page inside the layout with no user feedback.

### GAP F-7 — No CORS Origin Configuration for Production (MEDIUM) `MEDIUM`

- **Location:** [app.ts:47-51](file:///e:/DEVS/PasteBin/apps/server/src/app.ts#L47-L51)
- **Status:** CORS is hardcoded to `['http://localhost:5173', 'http://localhost:3000']`. In a production deployment with a real domain, all cross-origin requests from the frontend will be blocked by the browser.

### GAP F-8 — `npm run build` in Root Does Not Guarantee Build Order (LOW) `LOW`

- **Location:** [package.json:12](file:///e:/DEVS/PasteBin/package.json#L12)
- **Status:** The `"build"` script uses `npm run build --workspaces --if-present` which runs workspaces in alphabetical order, not dependency order. The correct ordered build is available as `"build:prod"`, but the generic `"build"` target may fail if `@pastebin/server` compiles before `@pastebin/shared`.

---

## Cross-Cutting Concerns

### No Centralized API Client

Every page (`CreatePaste`, `ViewPaste`, `BrowsePastes`, `Dashboard`, `Login`, `Register`) imports `axios` directly and hardcodes `http://localhost:5000`. There is no shared API utility, no interceptors for automatic token injection, no error normalization, and no environment-aware base URL.

### No Global Error Boundary

The React app has no `<ErrorBoundary>` component. An unhandled runtime exception in any lazy-loaded page will crash the entire application with a white screen.

### No Expired Paste Cleanup Job

Expired pastes remain in the database indefinitely. The expiration check in `PasteService.getPasteById()` prevents viewing, but the rows are never deleted. Over time, the database will accumulate dead rows.

---

## Gap Severity Definitions

| Severity | Definition |
| --- | --- |
| **CRITICAL** | Security vulnerability, data integrity risk, or completely broken core feature |
| **HIGH** | Feature that exists in UI but is non-functional, or significant logic gap |
| **MEDIUM** | Missing quality-of-life feature or inconsistency that degrades UX |
| **LOW** | Minor polish issue or improvement opportunity |

---

*End of Gap Report. Total gaps identified: **33** across 6 system categories.*
