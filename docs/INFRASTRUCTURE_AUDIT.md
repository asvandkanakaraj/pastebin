# Infrastructure Audit Report

This report evaluates the databases, authentication middleware, storage systems, environment configurations, and deployment readiness of the PasteBin application.

---

## Database

### 1. Is Prisma installed?

Yes. The Prisma CLI (`prisma`) is installed in the database package workspace as a devDependency.

- **Evidence:** `packages/database/package.json` contains `"prisma": "^5.16.1"`.

### 2. Is @prisma/client installed?

Yes. `@prisma/client` is installed in the database package workspace as a runtime dependency.

- **Evidence:** `packages/database/package.json` contains `"@prisma/client": "^5.16.1"`.

### 3. Where is schema.prisma located?

It is located at `packages/database/prisma/schema.prisma`.

### 4. Is there a valid Prisma schema?

Yes. It defines five database models with relational foreign key references:

- `User` (Stores accounts)
- `Paste` (Stores snippets)
- `Share` (Stores collaboration permissions)
- `SavedPaste` (Stores user bookmarks)
- `RecentView` (Stores viewed paste history)

### 5. Which database provider is configured?

PostgreSQL.

- **Evidence:** `packages/database/prisma/schema.prisma` configures:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```

### 6. Does an .env file exist?

Yes, a `.env` file exists in the workspace root directory. A `.env` file is also present at `packages/database/.env`.

### 7. Is DATABASE_URL configured?

Yes, inside the root `.env`:
`DATABASE_URL="postgresql://postgres:postgres_pass@localhost:5432/pastebin_db?schema=public"`

### 8. Does the backend actually use Prisma Client?

Yes. The `@pastebin/database` package initializes and exports a single instantiated `PrismaClient` database wrapper (`db`) which is imported directly throughout the server codebase.

- **Evidence:** `packages/database/src/index.ts` contains:
  ```typescript
  import { PrismaClient } from '@prisma/client';
  export const db = new PrismaClient();
  export * from '@prisma/client';
  ```
  And server services import `db` from `@pastebin/database`.

### 9. Which services/controllers write to the database?

- `user.service.ts`: Writes to `User` table (`createUser`, `updateUserProfile`).
- `paste.service.ts`: Writes to `Paste` and `Share` tables (`createPaste`, `updatePaste`, `deletePaste`, `incrementViews`, `sharePaste`, `removePasteShare`).
- `workspace.service.ts`: Writes to `SavedPaste` and `RecentView` tables (`savePaste`, `unsavePaste`, `addToRecentViews`).
- `AuthController` (`auth.controller.ts`): Triggers writes via the user service during account registration.

### 10. Which services/controllers read from the database?

- `user.service.ts`: Reads `User` records (`findUserById`, `findUserByEmail`, `findUserByUsername`).
- `paste.service.ts`: Reads `Paste` details (`getPasteById`, `listPublicPastes`, `checkPasteAccess`).
- `search.service.ts`: Queries public pastes and user profiles (`searchUsersAndPastes`).
- `workspace.service.ts`: Queries user-associated items (`getUserWorkspace`, `getUserSavedPastes`, etc.).

### 11. Is any feature still using localStorage or in-memory storage instead of the database?

Yes. **Guest Mode features** bypass database storage entirely. When a guest creates a paste, saves/bookmarks a paste, or views a paste, the information is stored in the browser's `localStorage` on the frontend under key prefixes.

- **Evidence:** `apps/web/src/pages/BrowsePastes.tsx` reads and writes:
  - `pb_guest_recent_pastes`
  - `pb_guest_saved_pastes`
  - `pb_guest_recently_viewed_pastes`

### 12. Are Prisma migrations present, or is the project using prisma db push?

The project does not contain a `migrations` directory. It uses `prisma db push` to push schema alterations directly to the database.

- **Evidence:** `packages/database/package.json` configures scripts to push schemas:
  ```json
  "scripts": {
    "build": "tsc",
    "db:push": "prisma db push",
    "db:generate": "prisma generate"
  }
  ```

### 13. Have the database tables actually been created?

Yes, database tables have been pushed to PostgreSQL and verified by running integration tests.

---

## Authentication

### 1. Is JWT configured?

Yes, JSON Web Tokens are implemented using the `jsonwebtoken` library.

### 2. Is JWT_SECRET required?

Yes. It is used to sign and verify user authentication tokens. In the codebase, it falls back to a development secret if omitted:

```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'pastebin-super-secret-key-development';
```

However, a unique value is required for production environments to secure access tokens.

### 3. Which routes require authentication?

Routes requiring the `authMiddleware` verification step:

- `GET /api/pastes/me` (Fetch current user's pastes)
- `PUT /api/pastes/:id` (Edit paste details)
- `GET /api/pastes/:id/shares` (Get paste collaborators)
- `POST /api/pastes/:id/share` (Add collaborator)
- `DELETE /api/pastes/:id/share/:userId` (Remove collaborator)
- `POST /api/pastes/:id/save` (Bookmark paste)
- `DELETE /api/pastes/:id/save` (Remove bookmark)
- `PUT /api/users/profile` (Update display name, avatar, or bio)
- `GET /api/workspace` (Load logged-in workspace data)

### 4. Which routes allow guest access?

- `POST /api/auth/register` (Public sign up)
- `POST /api/auth/login` (Public login)
- `POST /api/pastes` (Optional auth: permits anonymous paste creation)
- `GET /api/pastes` (Fetch public lists of pastes)
- `GET /api/pastes/:id` (Optional auth: viewing public pastes or entering protected PINs)
- `POST /api/pastes/:id/verify` (Submit PIN verification check)
- `DELETE /api/pastes/:id` (Optional auth: allows guest/owner deletion)
- `GET /api/search` (Public metadata search)
- `GET /api/users/check-username` (Username availability checks)
- `GET /api/users/:username` (Optional auth: view public profile stats)

---

## Storage

Below is the storage location mapped for each application element:

| Feature             | Storage Medium | Database Table / Key              |
| ------------------- | -------------- | --------------------------------- |
| **Users**           | PostgreSQL     | `User` table                      |
| **Pastes**          | PostgreSQL     | `Paste` table                     |
| **Shares**          | PostgreSQL     | `Share` table                     |
| **Saved Pastes**    | PostgreSQL     | `SavedPaste` table                |
| **Recently Viewed** | PostgreSQL     | `RecentView` table                |
| **Search History**  | Not Stored     | N/A (Not logged)                  |
| **Guest Pastes**    | `localStorage` | `pb_guest_recent_pastes`          |
| **Guest Recent**    | `localStorage` | `pb_guest_recently_viewed_pastes` |
| **Guest Saved**     | `localStorage` | `pb_guest_saved_pastes`           |

---

## Environment Variables

The application references the following environment variables:

| Variable Name  | Required? | Purpose                                         | Example Value                           |
| -------------- | --------- | ----------------------------------------------- | --------------------------------------- |
| `DATABASE_URL` | **Yes**   | Connection URL for target PostgreSQL database   | `postgresql://postgres:pass@db:5432/db` |
| `JWT_SECRET`   | **Yes**   | Signing key for JWT auth tokens                 | `super-secret-production-hash-key`      |
| `PORT`         | No        | Port the backend Express app binds to           | `5000` (default)                        |
| `CORS_ORIGIN`  | No        | Configures origin domains allowed by CORS       | `http://localhost:5173`                 |
| `NODE_ENV`     | No        | Dictates mode (e.g. logging and error levels)   | `production`                            |
| `VITE_API_URL` | No        | Base API endpoint for the React frontend client | `http://localhost:5000`                 |

---

## Deployment Readiness

### Status: Ready

The application codebase is prepared for deployment. All configuration artifacts (production docker-compose definitions, Dockerfiles, and Nginx configurations) are present.

### Required Infrastructure / Configuration Deployment Steps

1. **Database Provisioning:** Deploy a managed PostgreSQL database instance and retrieve its connection URI.
2. **Environment Variables Configuration:** Inject production values for `DATABASE_URL` and generate a cryptographically secure `JWT_SECRET` string.
3. **DNS and Port Mapping:** Map domain routing records to Nginx on port `80` (or setup HTTPS/SSL reverse proxy via port `443` using Certbot/Let's Encrypt).
4. **Database Push:** Run `npx prisma db push` on the production database endpoint to instantiate the schema tables.
