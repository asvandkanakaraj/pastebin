# Development Journal - PasteBin

## Session 1: Initial Structure Setup
- **Date**: 2026-07-31
- **Status**: Completed ✅
- **Objective**: Scaffold the monorepo workspace configuration, establish the core workspaces and directory layout.
- **Outcomes**:
  - Initialized npm workspaces root configuration.
  - Setup `.gitignore`, `tsconfig.json`, and `README.md` at the root.
  - Created workspace folder structures (`apps/web`, `apps/server`, `packages/database`, `packages/shared`, `docker`, `scripts`).
  - Verified structure using `npm install`.

## Session 2: Heartbeat & Documentation Core
- **Date**: 2026-07-31
- **Status**: Completed ✅
- **Objective**: Establish development standards, create the documentation suite, configure Prettier/ESLint globally, and build the initial frontend-to-backend "Heartbeat" connection.
- **Outcomes**:
  - Initialized ESLint config, Prettier rules, and the complete documentation suite inside `/docs`.
  - Configured `@pastebin/shared` as an ESM package exporting global constants (like `APP_NAME`).
  - Bootstrapped `apps/server` with Express and health checks.
  - Scaffolded `apps/web` with Vite, React, TS, Tailwind CSS, and Axios.
  - Successfully connected the client to the API server health check and verified the heartbeat is **green** on `http://localhost:5173/`.
  - Blockers: Encountered peer dependency conflict with `lucide-react` on React 19, resolved using `--legacy-peer-deps`. Handled ESM syntax error in Vite by updating the workspace to build as ES modules (`"type": "module"`) and resolving `__dirname` using `import.meta.url`.

## Session 3: Database & API Core Layers
- **Date**: 2026-07-31
- **Status**: Completed ✅
- **Objective**: Integrate a database layer (Docker Compose, PostgreSQL, Prisma), build out the full layered API server (Services/Controllers/Routes/Errors), and add schema validation.
- **Outcomes**:
  - Created root `docker-compose.yml` defining the `db` (PostgreSQL 15) container service and volume paths.
  - Initialized Prisma schema in `@pastebin/database` defining `User` and `Paste` models.
  - Generated Prisma Client and exported it globally in the workspace.
  - **Shared Validation**: Implemented Zod validation schemas (`CreatePasteSchema` and `PasteResponseSchema`) in `@pastebin/shared`.
  - **Refactoring**: Refactored `apps/server` into a clean layered architecture (Controllers, Services, Routes, and global Error Handler).
  - **Security**: Integrated `bcrypt` for paste password hashing and implemented database query logic inside `PasteService`.
  - **Blockers**: Docker daemon was not running locally, preventing database container sync (P1001 database connection check). Express and Vite heartbeat checks ran successfully because healthchecks are independent of database connection checks.

## Session 4: UI System & Database Blocked Resolved
- **Date**: 2026-07-31
- **Status**: Completed ✅
- **Objective**: Resolve the database connection blocker, verify database tables schema, configure UI theme context, write styling definitions, and build layout scaffolding (Navbar, Footer, MainLayout) with dark/light themes.
- **Outcomes**:
  - Booted the database container via `docker compose up -d` successfully after the user launched the Docker daemon.
  - Executed `npm run db:push -w @pastebin/database` to verify database status. Sync succeeded and updated PostgreSQL tables.
  - Installed Tailwind and Radix primitives (slot, dropdown-menu, tabs) in `apps/web`.
  - Implemented `ThemeProvider` and `ModeToggle` theme switcher dropdown under `apps/web/src/components`.
  - Scaffolded layout elements (`Navbar`, `Footer`, `MainLayout`) to wrap main client content.
  - Fixed standard Tailwind compile error by renaming custom transition duration class to `duration-300`.
  - Blockers: Windows EPERM query engine lock occurred during DB sync because the Express process was actively holding the Prisma client binary. Resolved by killing the dev server process, running client generation, and restarting the API listener.

## Session 5: Editor Integration & Create Paste Flow
- **Date**: 2026-07-31
- **Status**: Completed ✅
- **Objective**: Integrate Monaco editor, implement new paste creation form (with validation via Zod), set up SPA routing, and verify end-to-end creation flow saving to PostgreSQL.
- **Outcomes**:
  - Installed `@monaco-editor/react` and `react-router-dom` in the client app.
  - Implemented the responsive [CodeEditor.tsx](file:///e:/DEVS/PasteBin/apps/web/src/components/editor/CodeEditor.tsx) component wrapping Monaco.
  - Created [CreatePaste.tsx](file:///e:/DEVS/PasteBin/apps/web/src/pages/CreatePaste.tsx) containing form inputs (Title, Language, Expiration, Visibility, Password).
  - Validated inputs on client-side using `@pastebin/shared` schemas (`CreatePasteSchema`) prior to submission.
  - Set up browser-based routes (`/` for creation, `/v/:id` for viewing).
  - Created [ViewPaste.tsx](file:///e:/DEVS/PasteBin/apps/web/src/pages/ViewPaste.tsx) displaying read-only codes in Monaco.
  - Verified end-to-end integration by posting a snippet from the browser and confirming database insertion.
  - Blockers: Monaco editor initial typing was sluggish in testing. Resolved by using standard clip board paste during script execution and adding input focus delays.

## Verification Report (Paste Creation)
- **Created Paste ID**: `cms8dg4z200008tapc880wwi4`
- **Database Entry Validation**: Checked via Node-Prisma client query and confirmed record fields matching inputs.
- **Redirect view screenshot**: Saved at `C:\Users\ASVAND\.gemini\antigravity-ide\brain\6ecd6fd9-479f-4835-ba00-17df96c2b859\created_paste_view_1785467841858.png`

## Verification Report (Heartbeat)
- **Vite Client URL**: http://localhost:5173/
- **Express API URL**: http://localhost:5000/health
- **Status**: **GREEN (Connected)**
- **Screenshot Proof**: Saved at `C:\Users\ASVAND\.gemini\antigravity-ide\brain\6ecd6fd9-479f-4835-ba00-17df96c2b859\connected_status_page_1785466161264.png`
- **Output JSON**:
  ```json
  {
    "status": "OK",
    "timestamp": "2026-07-31T02:46:49.770Z",
    "app": "PasteBin"
  }
  ```

## Session 6: Dynamic Routing View & Expiration Logic Refinement
- **Date**: 2026-07-31
- **Status**: Completed ✅
- **Objective**: Refine view page dynamic routing (`/v/:id`), implement loading skeleton states, add Clipboard Copy action, and strictly enforce database expiration checks during fetches.
- **Outcomes**:
  - Implemented responsive loading skeleton layout inside `ViewPaste.tsx`.
  - Added clipboard copy functionality via `navigator.clipboard.writeText` and a visual "Copied!" notification state.
  - Handled database query verification checks for paste expiration. Attempting to fetch a paste whose `expiresAt` date is in the past triggers a `410 Gone / Expired` HTTP error, displaying a clean "404 - Paste expired" warning block.
  - Refined route parsing of 404 (Not Found) and 410 (Expired) exceptions.
  - Verified expiration behavior: manually adjusted `expiresAt` record timestamps in PostgreSQL database and confirmed client redirection blocks.

## Session 7: Public Discovery & Backend Pagination
- **Date**: 2026-07-31
- **Status**: Completed ✅
- **Objective**: Refactor backend listing endpoint to support offset-based pagination and build a visual discovery grid view for exploring public pastes.
- **Outcomes**:
  - Refactored `listPublicPastes` in `@pastebin/database` / server service layer to execute counting queries and return `{ pastes, totalCount, totalPages, currentPage }` metadata wrappers.
  - Created [BrowsePastes.tsx](file:///e:/DEVS/PasteBin/apps/web/src/pages/BrowsePastes.tsx) showing responsive snippet cards (with title, metadata, line-sliced code block previews, and view route shortcuts).
  - Integrated dynamic route paths `/browse` in App Router and Navbar link lists.
  - Coded interactive footer pagination bars managing Prev/Next state bounds.
  - Verified compilation and output bundle sizes via `npm run build` client checks.

## Session 8: Destructive Operations & Rate Limiting (Delete Flow)
- **Date**: 2026-07-31
- **Status**: Completed ✅
- **Objective**: Implement secure paste deletion on both backend and frontend layers, and apply rate-limiting to prevent automated spam scripts.
- **Outcomes**:
  - Refactored `deletePaste` controller method to return a standard `204 No Content` status.
  - Implemented [rate-limit.middleware.ts](file:///e:/DEVS/PasteBin/apps/server/src/middleware/rate-limit.middleware.ts) enforcing a window limit of maximum 5 deletion attempts per minute per IP address.
  - Added a "Delete" option in `ViewPaste` details header.
  - Added an interactive **Delete Confirmation Modal** to safeguard against accidental clicks.
  - Verified deletion logic end-to-end: clicking confirm successfully deletes the database entry and navigates back to `/browse`.
