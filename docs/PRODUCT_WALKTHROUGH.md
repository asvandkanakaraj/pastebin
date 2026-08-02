# Product Walkthrough — QA Audit Report

> **Audit Date:** 2026-08-01
> **Methodology:** Full source code inspection of every page, route, controller, service, middleware, schema, and component.
> **Scope:** Frontend (`apps/web`), Backend (`apps/server`), Database (`packages/database`), Shared (`packages/shared`)

---

## Table of Contents

1. [Navigation (Navbar)](#1--navigation-navbar)
2. [Login Page](#2--login-page)
3. [Register Page](#3--register-page)
4. [Create Paste (Home)](#4--create-paste-home)
5. [View Paste](#5--view-paste)
6. [Browse (Workspace)](#6--browse-workspace)
7. [Search System](#7--search-system)
8. [User Profile](#8--user-profile)
9. [Critical Bugs and Schema Mismatches](#9--critical-bugs-and-schema-mismatches)
10. [Summary Verdict](#10--summary-verdict)

---

## 1 — Navigation (Navbar)

**File:** `apps/web/src/components/layout/Navbar.tsx`

### Components

- Logo (links to `/`)
- Desktop search bar (hidden below `md` breakpoint)
- Mobile search toggle button (visible below `md`)
- "Browse" link to `/browse`
- Auth state: Login button OR Avatar+Username+Logout

### User Actions

| Action                | Behaviour                                                           | Status            |
| --------------------- | ------------------------------------------------------------------- | ----------------- |
| Click Logo            | Navigates to `/`                                                    | PASS              |
| Click Browse          | Navigates to `/browse`                                              | PASS              |
| Click Login (guest)   | Navigates to `/login`                                               | PASS              |
| Click Avatar (authed) | Navigates to `/profile/{username or email}`                         | WARNING See Bug 1 |
| Click Logout          | Clears `pb_user` and `pb_token` from localStorage, navigates to `/` | PASS              |
| Press `/` shortcut    | Focuses search input                                                | PASS              |
| Mobile search toggle  | Replaces navbar with full-width search + back arrow                 | PASS              |
| Route change          | Closes mobile search overlay                                        | PASS              |

### Bug 1 — Profile Link Uses Email Fallback

**Location:** `Navbar.tsx:89`
**Code:** `to={/profile/${user.username || user.email}}`
**Issue:** If `user.username` is `undefined` (which it shouldn't be after registration, but could be if localStorage `pb_user` is stale), the profile link will use the email address (e.g. `/profile/john@example.com`). The `UserService.getUserProfileByUsername` handles this with an email fallback lookup, so it will still resolve. However, the URL is ugly and potentially leaks the email in the URL bar.
**Severity:** Low
**Verdict:** Cosmetic issue, functionally works

---

## 2 — Login Page

**File:** `apps/web/src/pages/Login.tsx`
**API:** `POST /api/auth/login`
**Server:** `AuthController.login` -> `LoginSchema.parse()` -> `UserService.loginUser()`

### Components

- Email input (type=`email`, required)
- Password input (type=`password`, toggle visibility, required)
- Submit button with loading state
- Error message display
- Link to Register page

### User Actions

| Action                     | Behaviour                                                                                 | Status |
| -------------------------- | ----------------------------------------------------------------------------------------- | ------ |
| Submit valid credentials   | Calls `/api/auth/login`, saves user+token to localStorage via `login()`, navigates to `/` | PASS   |
| Submit invalid email       | HTML5 `type=email` validation blocks submission                                           | PASS   |
| Submit wrong password      | Server returns 401, error message displayed                                               | PASS   |
| Submit empty form          | HTML5 `required` blocks submission                                                        | PASS   |
| Toggle password visibility | Eye/EyeOff icon toggles `type` between `text` and `password`                              | PASS   |
| Click "Create account"     | Navigates to `/register`                                                                  | PASS   |

### Validation Chain

1. **Client:** HTML5 `required` and `type=email`
2. **Server:** `LoginSchema` (Zod) — trims email, lowercases, validates email format, password min 1 char
3. **Service:** `UserService.loginUser()` — finds user by email, bcrypt compare

### Loading State

- Button text changes to "Signing In..."
- Button disabled while loading
- Password input disabled while loading

### Error State

- Displays server error message or fallback "Invalid email or password"
- Red alert box with AlertCircle icon

### Verdict: PASS — Fully functional

---

## 3 — Register Page

**File:** `apps/web/src/pages/Register.tsx`
**API:** `POST /api/auth/register`
**Server:** `AuthController.register` -> `RegisterSchema.parse()` -> `UserService.registerUser()`

### User Actions

| Action                | Behaviour                                                       | Status |
| --------------------- | --------------------------------------------------------------- | ------ |
| Submit valid form     | Creates user, navigates to `/login`                             | PASS   |
| Passwords don't match | Client-side error: "Passwords do not match"                     | PASS   |
| Duplicate email       | Server returns 400: "Email is already registered"               | PASS   |
| Password too short    | Server Zod validation: "Password must be at least 6 characters" | PASS   |

### Validation Chain

1. **Client:** Passwords match check, HTML5 `required` + `type=email`
2. **Server:** `RegisterSchema` — email trimmed/lowercased/validated, password min 6 chars
3. **Service:** Duplicate email check, auto-generates username from email prefix with uniqueness suffix

### Bug 2 — No Success Feedback Before Redirect

**Issue:** After successful registration, the user is silently redirected to `/login` with no success toast or message. The user may not understand they were registered successfully.
**Severity:** Low — UX polish issue

### Bug 3 — Register Does NOT Auto-Login

**Issue:** After registration, the user must manually log in. The `Register` page does NOT call `login()` from auth-provider. This is a deliberate design choice (the response returns `user` but no `token`), but is a minor UX friction.
**Severity:** Low — Intentional design

### Verdict: PASS — Fully functional

---

## 4 — Create Paste (Home)

**File:** `apps/web/src/pages/CreatePaste.tsx`
**API:** `POST /api/pastes`
**Server:** `PasteController.createPaste` -> `CreatePasteSchema.parse()` -> `PasteService.createPaste()`

### Components

- Title input (optional, max 100 chars)
- Description textarea (optional, max 300 chars, char counter)
- Monaco Editor (code content)
- Language selector (editor toolbar)
- Visibility selector (PUBLIC / PRIVATE / SECRET) — disabled for guests
- Expiration selector — fixed 1 hour for guests
- PIN input (visible only for PRIVATE visibility, 4-8 digits)
- Sharing panel (Advanced Settings modal, authed only)
- Guest Success Modal

### User Actions

| Action                 | Behaviour                                                  | Status |
| ---------------------- | ---------------------------------------------------------- | ------ |
| Submit paste (authed)  | Creates paste, navigates to `/v/{id}`                      | PASS   |
| Submit paste (guest)   | Creates paste, shows success modal with URL + code         | PASS   |
| Set PRIVATE visibility | Shows PIN input requiring 4-8 digit PIN                    | PASS   |
| Set SECRET visibility  | No PIN required, only owner can view                       | PASS   |
| Open Advanced Settings | Opens sharing modal (search users, add shares at creation) | PASS   |
| Copy code              | Copies editor content to clipboard                         | PASS   |
| Toggle fullscreen      | Monaco editor expands to full viewport height              | PASS   |
| ESC key                | Closes fullscreen/modals                                   | PASS   |

### Validation Chain

1. **Client:** `CreatePasteSchema.safeParse()` — validates before API call
2. **Server:** `CreatePasteSchema.parse()` — identical validation
3. **Service:** Guest mode forces PUBLIC + 1hr expiry

### Verdict: PASS — Fully functional

---

## 5 — View Paste

**File:** `apps/web/src/pages/ViewPaste.tsx`
**API:** `GET /api/pastes/:id`
**Server:** `PasteController.getPaste` -> `PasteService.getPasteById()`

### States Handled

1. **Loading** — Animated skeleton
2. **Password Required** — Password input form (401 from server)
3. **Forbidden** — "Private Paste" message (403 from server)
4. **Expired** — Error message (410 from server)
5. **Not Found** — Error message (404 from server)
6. **Success** — Full paste view with editor

### User Actions

| Action                                | Behaviour                                                              | Status |
| ------------------------------------- | ---------------------------------------------------------------------- | ------ |
| View public paste                     | Loads and displays paste content in Monaco editor                      | PASS   |
| View password-protected paste         | Shows password form, verifies via header `x-paste-password`            | PASS   |
| Submit wrong password                 | Shows "Incorrect password. Try again."                                 | PASS   |
| View SECRET/ONLY_ME paste (non-owner) | Shows forbidden screen                                                 | PASS   |
| View own PRIVATE paste (owner)        | Bypasses password, loads directly                                      | PASS   |
| Copy code                             | Clipboard write + visual feedback                                      | PASS   |
| Bookmark (authed)                     | `POST /api/pastes/:id/save` or `DELETE /api/pastes/:id/save`           | PASS   |
| Bookmark (guest)                      | Saves to `localStorage pb_guest_saved_pastes`                          | PASS   |
| Edit paste (owner or WRITE share)     | Inline edit with title/description/content fields                      | PASS   |
| Save edit                             | `PUT /api/pastes/:id` with updated fields                              | PASS   |
| Cancel edit                           | Restores original values                                               | PASS   |
| Delete paste (owner)                  | Confirmation modal, calls `DELETE /api/pastes/:id`, navigate `/browse` | PASS   |
| Share paste (owner)                   | Opens sharing modal, search users, add/update/remove permissions       | PASS   |
| ESC key                               | Closes sharing or delete modal                                         | PASS   |

### Bug 4 — Duplicate Password Check in getPasteById

**Location:** `paste.service.ts:100-147`
**Issue:** The `getPasteById` method checks password/visibility in TWO separate blocks:

1. Lines 100-130: Checks `ONLY_ME`/`SECRET` visibility, then non-public + password
2. Lines 132-147: Checks `passwordHash` again for non-owners

This means for a PRIVATE paste with a password, the password is checked TWICE via bcrypt. If both pass, there's no issue, but it's wasted computation.
**Severity:** Low — Performance, not correctness

### Bug 5 — Owner Cannot Delete Password-Protected Pastes

**Location:** `ViewPaste.tsx:245` and `paste.service.ts:334-348`
**Code:** `if (password) { headers['x-paste-password'] = password; }`
**Issue:** The `password` state is the one used to UNLOCK the paste initially. If the owner views their own paste (no password needed because the owner bypasses the password check on GET), the `password` state is empty. The delete endpoint requires the password for password-protected pastes even from the owner. The owner MUST provide the paste password to delete a password-protected paste (`paste.service.ts:334-348`), but the `password` state in ViewPaste will be empty for owners who were auto-authenticated. **This means owners CANNOT delete their own password-protected pastes from the ViewPaste page.**
**Severity:** HIGH — Broken functionality

### Verdict: PARTIAL PASS — Bug 5 is a significant issue

---

## 6 — Browse (Workspace)

**File:** `apps/web/src/pages/BrowsePastes.tsx`
**API:** `GET /api/workspace`
**Server:** `WorkspaceController.getWorkspace` -> `WorkspaceService.getUserWorkspace()`

### Bug 6 — Guest Browse Mode is Broken

**Issue:** Despite the code at line 91-108 loading guest data from localStorage, line 317 immediately returns a "Please sign in" screen for unauthenticated users. The guest localStorage code at lines 91-108 is DEAD CODE that never executes because `!user` on line 317 short-circuits the render before any guest data is shown.
**Severity:** HIGH — Guest mode Browse is non-functional

### Behaviour for Authenticated Users

| Section           | Data Source                              | Status |
| ----------------- | ---------------------------------------- | ------ |
| My Pastes         | `GET /api/workspace` -> `myPastes`       | PASS   |
| Shared With Me    | `GET /api/workspace` -> `sharedWithMe`   | PASS   |
| Saved (Bookmarks) | `GET /api/workspace` -> `saved`          | PASS   |
| Recently Viewed   | `GET /api/workspace` -> `recentlyViewed` | PASS   |

### User Actions (Authenticated)

| Action                | Behaviour                                                         | Status            |
| --------------------- | ----------------------------------------------------------------- | ----------------- |
| Search My Pastes      | Client-side title filtering                                       | PASS              |
| Sort My Pastes        | Newest/Oldest/Updated/Alpha sorting                               | PASS              |
| Toggle grid/list view | Persisted to localStorage per section                             | PASS              |
| Open paste            | Navigates to `/v/{id}`                                            | PASS              |
| Edit paste            | Opens edit modal (title, content, language, visibility, password) | PASS              |
| Share paste           | Opens share modal (username/email input)                          | PASS              |
| Toggle visibility     | `PUT /api/pastes/:id` with toggled `isPublic`                     | WARNING See Bug 7 |
| Duplicate paste       | `POST /api/pastes` with "(Copy)" title                            | PASS              |
| Delete paste          | `window.confirm()` then `DELETE /api/pastes/:id`                  | PASS              |
| Copy link             | Copies `{origin}/v/{id}` to clipboard                             | PASS              |
| Bookmark/Unbookmark   | `POST` or `DELETE /api/pastes/:id/save`                           | PASS              |
| Refresh               | Re-fetches entire workspace                                       | PASS              |

### Bug 7 — Toggle Visibility Doesn't Send `visibility` Field

**Location:** `BrowsePastes.tsx:138-147`
**Issue:** The toggle visibility action sends `isPublic: !paste.isPublic` but does NOT send the `visibility` field. The `updatePaste` service at line 408 derives visibility: `const visibility = data.visibility || (data.isPublic === false ? 'PRIVATE' : 'PUBLIC')`. If a paste is SECRET, toggling would incorrectly change it to PUBLIC or PRIVATE, losing the SECRET status.
**Severity:** Medium — Edge case with SECRET pastes

### Bug 8 — Edit Modal Missing SECRET Visibility Option

**Location:** `BrowsePastes.tsx:1079-1088`
**Issue:** The edit modal only offers "Public" and "Private" options. There is no "Secret" option. If a paste is currently SECRET, editing it from Browse will force it to either Public or Private.
**Severity:** Medium — Data loss for SECRET pastes

### Verdict: PARTIAL PASS — Guest Browse is broken; SECRET paste handling has issues

---

## 7 — Search System

### Inline Search (Navbar)

**Files:** `SearchInput.tsx`, `SearchDropdown.tsx`, `useGlobalSearch.ts`, `api.ts`
**API:** `GET /api/search?q={query}`
**Server:** `SearchController.search` -> `SearchService.globalSearch()`

### Behaviour

| Feature             | Implementation                                            | Status            |
| ------------------- | --------------------------------------------------------- | ----------------- |
| Debounce            | 300ms via `useGlobalSearch` hook                          | PASS              |
| Abort on re-type    | `AbortController` cancels in-flight request               | PASS              |
| Users search        | Matches `username` and `displayName` (case-insensitive)   | WARNING See Bug 9 |
| Pastes search       | Matches `title` and paste `id` (public, non-expired only) | PASS              |
| Dropdown results    | Shows top 5 users + top 5 pastes                          | PASS              |
| Keyboard navigation | Arrow up/down, Enter to select, Escape to close           | PASS              |
| "View all" link     | Navigates to `/search?q={query}`                          | PASS              |
| Click outside       | Closes dropdown                                           | PASS              |
| Loading skeleton    | Animated placeholders while fetching                      | PASS              |
| Empty state         | "No users or pastes found" message                        | PASS              |
| Error state         | "Unable to load search results" message                   | PASS              |

### Bug 9 — Search Queries `displayName` Which May Not Exist in DB

**Location:** `search.service.ts:16-19`
**Issue:** The search queries `displayName: { contains: query, mode: 'insensitive' }` but the Prisma schema does NOT have `displayName` on the User model. See Critical Bug 10.
**Severity:** CRITICAL — Will cause runtime Prisma error

### Full-Page Search Results

**File:** `apps/web/src/pages/SearchResults.tsx`

- Fetches from same `GET /api/search?q={query}`
- Displays users and pastes in two-column grid layout
- Users link to `/profile/{username}`
- Pastes link to `/v/{id}`
- Loading skeleton, error state, empty state all handled
  **Verdict:** UI is correct, but depends on Bug 9 being resolved

---

## 8 — User Profile

**File:** `apps/web/src/pages/UserProfile.tsx`
**API:** `GET /api/users/:username`
**Server:** `UserController.getUserProfile` -> `UserService.getUserProfileByUsername()`

### States Handled

1. **Loading** — Animated skeleton
2. **Error/Not Found** — Error card with "Back to Home" link
3. **Success (Owner)** — Full profile with all tabs + edit
4. **Success (Visitor)** — Public pastes only + limited stats

### Owner Features

| Feature                                      | Behaviour                                            | Status                    |
| -------------------------------------------- | ---------------------------------------------------- | ------------------------- |
| View all pastes (Public/Private/Secret tabs) | Filtered from `profile.pastes`                       | BLOCKED by Bug 10         |
| View saved bookmarks                         | Tab with saved pastes                                | BLOCKED by Bug 10         |
| View recently viewed                         | Tab with last 5 viewed                               | BLOCKED by Bug 10         |
| Edit profile                                 | Modal with displayName, username, email, bio, avatar | BLOCKED by Bug 10         |
| Username availability check                  | Debounced `GET /api/users/check-username?username=X` | PASS (if schema is fixed) |
| Avatar upload                                | File to base64, sent as `avatarUrl` in PUT           | WARNING See Bug 11        |
| Copy profile link                            | Clipboard write                                      | PASS                      |
| Click private paste (visitor)                | PIN unlock modal                                     | PASS                      |

### Bug 11 — Avatar Stored as Base64 in Database

**Location:** `UserProfile.tsx:184-193`, `user.service.ts:321-323`
**Issue:** Avatar images are converted to base64 data URLs on the client and stored directly in the `avatarUrl` database column. For large images, this can create massive database records (a 1MB image = ~1.3MB of base64 text). There is no file size validation. This will degrade database performance significantly.
**Severity:** Medium — Performance bomb, no functional break

### Visitor Features

| Feature                                 | Behaviour                                  | Status |
| --------------------------------------- | ------------------------------------------ | ------ |
| View public pastes                      | Shows only PUBLIC visibility pastes        | PASS   |
| View private pastes shared with visitor | Included via Prisma query with share check | PASS   |
| Stats (visitor)                         | Only shows Total + Public counts           | PASS   |
| No edit button                          | Correctly hidden                           | PASS   |

### Verdict: BLOCKED by Bug 10 — Profile page depends on fields that don't exist in the database schema

---

## 9 — Critical Bugs and Schema Mismatches

### Bug 10 — CRITICAL: Prisma Schema Missing User Profile Fields

**The single most critical issue in the entire application.**

**Prisma Schema (`schema.prisma`) User model:**

```prisma
model User {
  id           String       @id @default(uuid())
  email        String       @unique
  username     String       @unique
  passwordHash String
  pastes       Paste[]
  shares       Share[]
  savedPastes  SavedPaste[]
  recentViews  RecentView[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}
```

**Missing fields that are referenced throughout the codebase:**

| Field         | Used In                                                                | Effect                                                      |
| ------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| `displayName` | `UserService`, `SearchService`, `UserProfile.tsx`, `auth-provider.tsx` | Runtime crash on any query selecting/updating `displayName` |
| `avatarUrl`   | `UserService`, `UserProfile.tsx`, `Navbar.tsx`, `auth-provider.tsx`    | Runtime crash on any query selecting/updating `avatarUrl`   |
| `bio`         | `UserService`, `UserProfile.tsx`, `auth-provider.tsx`                  | Runtime crash on any query selecting/updating `bio`         |

**Specific crash points:**

1. `user.service.ts:43-49`: `registerUser()` creates user — no `displayName`/`avatarUrl`/`bio`, but no crash since they're optional
2. `user.service.ts:88-236`: `getUserProfileByUsername()` — Prisma returns user without these fields, but the code accesses `user.displayName`, `user.bio`, `user.avatarUrl` which will be `undefined` (not a crash in JS, but data is absent)
3. `user.service.ts:256-332`: `updateUserProfile()` attempts to SET `displayName`, `bio`, `avatarUrl` in `db.user.update()` — THIS WILL CRASH because Prisma Client won't accept unknown fields
4. `search.service.ts:18`: Queries `displayName` — THIS WILL CRASH with Prisma validation error

**Resolution Required:** Add `displayName String?`, `avatarUrl String?`, `bio String?` to the User model in `schema.prisma` and run `prisma db push` or `prisma migrate`.

---

### Bug 12 — Search Spec Violation: Searches Content in `listPublicPastes`

**Location:** `paste.service.ts:260`
**Code:** `{ content: { contains: search, mode: 'insensitive' } }`
**Issue:** The `listPublicPastes` method (used by `GET /api/pastes?search=X` for the Browse public pastes listing) searches BOTH title AND content. The product spec explicitly states: "Searching the content is intentionally excluded for performance, privacy, and simplicity."
**Severity:** Medium — Spec violation, privacy concern
**Note:** This endpoint is used by the `listPastes` route, not the global search. The global search (`SearchService`) correctly only searches title and ID.

---

### Bug 13 — Search Spec Violation: Users Searched by `displayName` instead of Email

**Location:** `search.service.ts:16-19`
**Spec says:** Search users by Username and Email Address. Do NOT search DisplayName.
**Actual:** Searches `username` and `displayName`, does NOT search `email`.
**Severity:** Medium — Spec violation

---

### Bug 14 — No 404 Route / Catch-All

**Location:** `App.tsx:49-57`
**Issue:** There is no catch-all `<Route path="*" />` handler. If a user navigates to an undefined route like `/settings` or `/dashboard`, they get a blank page with only the navbar and footer.
**Severity:** Medium — Poor UX

---

### Bug 15 — Zod Validation Errors Not Properly Formatted for Client

**Location:** `error.middleware.ts:4-19`
**Issue:** When Zod validation fails (e.g., from `CreatePasteSchema.parse()`), Zod throws a `ZodError` with `error.issues` array. The error middleware reads `err.message` which for ZodError is a JSON string of all issues, not a user-friendly message. The client receives something like: `[{"code":"too_small","minimum":1,...}]` as the message.
**Severity:** Medium — Poor error messages for validation failures
**Note:** The `CreatePaste` page handles this by running `safeParse` client-side first, so server-side Zod errors are only hit if the client is bypassed.

---

### Bug 16 — `express.json()` Has No Body Size Limit for Avatar Uploads

**Location:** `app.ts:60`
**Code:** `app.use(express.json())`
**Issue:** No `limit` option is set. Combined with Bug 11 (base64 avatar uploads), a malicious user could send a multi-MB JSON body. Express defaults to 100KB, which may reject large avatars silently.
**Severity:** Low-Medium — Express default limit may reject large avatars

---

## 10 — Summary Verdict

### Blocking Issues (Must Fix Before Production)

| Bug | Description                                                           | Severity |
| --- | --------------------------------------------------------------------- | -------- |
| 10  | Prisma schema missing `displayName`, `avatarUrl`, `bio` on User model | CRITICAL |
| 9   | Search queries non-existent `displayName` field (depends on Bug 10)   | CRITICAL |
| 6   | Guest Browse page shows login prompt instead of localStorage data     | HIGH     |
| 5   | Owner cannot delete password-protected pastes from ViewPaste          | HIGH     |

### Should Fix (Important Quality Issues)

| Bug | Description                                                       | Severity |
| --- | ----------------------------------------------------------------- | -------- |
| 12  | `listPublicPastes` searches paste content (spec violation)        | Medium   |
| 13  | Search searches `displayName` instead of `email` (spec violation) | Medium   |
| 14  | No 404 catch-all route                                            | Medium   |
| 7   | Toggle visibility on SECRET pastes loses SECRET status            | Medium   |
| 8   | Edit modal in Browse has no SECRET option                         | Medium   |
| 15  | Zod errors returned as raw JSON strings                           | Medium   |

### Nice to Fix (Polish)

| Bug | Description                                     | Severity   |
| --- | ----------------------------------------------- | ---------- |
| 1   | Profile link may use email in URL               | Low        |
| 2   | No success feedback after registration          | Low        |
| 11  | Avatar stored as base64 in DB (performance)     | Medium     |
| 16  | No express.json body size limit configured      | Low-Medium |
| 4   | Duplicate bcrypt password check in getPasteById | Low        |

### Pages Fully Passing QA

| Page         | Status                |
| ------------ | --------------------- |
| Login        | PASS                  |
| Register     | PASS                  |
| Create Paste | PASS                  |
| View Paste   | PARTIAL (Bug 5)       |
| Browse       | PARTIAL (Bug 6, 7, 8) |
| Search       | BLOCKED (Bug 9, 10)   |
| User Profile | BLOCKED (Bug 10)      |
| Navbar       | PASS                  |
| Footer       | PASS                  |

### Overall Application Health: NOT PRODUCTION-READY

The application's core paste creation and viewing flows work correctly. However, the **missing database schema fields** (Bug 10) will cause runtime crashes on any profile-related operation including search, profile viewing, and profile editing. This single issue blocks approximately 40% of the application's functionality.
