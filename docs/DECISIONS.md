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

---

## Decision #011: Navigation Bar Refinement & Authentication UX Update

### Status

Accepted ✅

### Context

To streamline user experience, avoid visual clutter, and establish a clear workspace-oriented navigation, we need to finalize the navigation structure by removing unnecessary/redundant links (such as the broken static API link and placeholder About link) and action buttons (like "+ New Paste" which duplicated the home page link). In addition, authentication forms must provide modern password visibility controls that satisfy accessibility requirements (a11y), prevent input loss, and maintain focus states without visual layout shifts.

### Decision

We update the navigation menu layout to only include core elements: Logo, Search, Browse, Manage Workspace, Theme Toggle, and Authentication. For logged-in users, the "Dashboard" link is updated to "Manage Workspace". In auth forms (`Login.tsx` and `Register.tsx`), we add relative position containers to password input fields with an absolute-positioned visibility toggle button using Lucide `Eye`/`EyeOff` icons.

### Details

- **Navbar finalization**: Removed static "API" and "About" links, and the "+ New Paste" button. Renamed "Dashboard" to "Manage Workspace" to reinforce workspace-oriented design.
- **Toggle input compatibility**: Changed password inputs to toggle dynamic `type="password"` or `type="text"` values without clearing inputs.
- **A11y & Focus preservation**: Added `onMouseDown={(e) => e.preventDefault()}` on mouse click handlers to prevent default focus shifts from input fields, preserving cursor positions. Provided descriptive `aria-label` labels for screen reader compatibility, and included standard tab navigation and focus visible outlines for keyboard-only users.
- **Graceful states mapping**: Toggles correctly map onto disabled/loading state blocks (disabling buttons if loading states are active) with zero visual layout shifts or component height variations.

### Consequences

- Navigation layout is simplified, clean, and contains zero dead or broken links.
- Password input forms are modernized and highly secure.
- Full keyboard accessibility and screen reader support is guaranteed for password toggling.

---

## Decision #012: Editor Refinements (Phase 1)

### Status

Accepted ✅

### Context

To deliver a professional, developer-centric code editor experience, several controls inside the paste creation dashboard must be streamlined. Options that are redundant, unused, or visually confusing need to be replaced with high-value settings.

### Decision

We implement a series of refinements to the paste editor panel, including removing duplicate settings, adding a description field, persisting editor preferences, implementing fullscreen mode, and redesigning the visibility selection system.

### Details

1. **Remove Language Selector from Sidebar**: Removed the duplicate language selector from the settings sidebar. The language setting is already located inside the editor toolbar, making the sidebar input redundant.
2. **Add Optional Description**: Introduced a multiline `description` textarea inside the settings panel. Users can add context (up to 300 characters, validated inline with a live counter).
3. **Remove Tab Size Selection**: Removed the tab size setting. The majority of developers prefer a standard spacing size (defaulting to 2 spaces), and removing it simplifies the configuration panel.
4. **Persist User Preferences**: Persistent storage (`localStorage`) is integrated for both the line numbers toggle (`pb_editor_line_numbers`) and the dark/light editor theme mode (`pb_editor_theme`), ensuring settings survive tab closure or reload.
5. **Fullscreen Support**: Configured keydown event listeners to listen for the `Escape` key, permitting instant exit from fullscreen. Monaco editor dimensions dynamically adapt to viewport boundaries (`automaticLayout`).
6. **Visibility Selector Redesign**: Replaced the toggle switch with a segmented card button selector supporting three levels of access:
   - **Public**: Searchable, shareable, and listed on profile.
   - **Private**: Hidden from public feeds; prompts for PIN configuration (Auto-generated 6-digit PIN or custom 4-8 digit numeric PIN).
   - **Only Me**: Restricted strictly to the creator's logged-in session, bypasses all password/PIN requirements.
7. **Inline Validations**: Applied inline warnings preventing submissions of invalid titles, description lengths, or non-numeric/short Private PINs.

### Consequences

- Interface visual clutter is significantly reduced.
- Paste access visibility levels are secure, granular, and easy to configure.
- User configurations are preserved seamlessly across visits.
- Custom description fields provide helpful documentation for shared snippets.

---

## Decision #013: Editor System Refinement — Phase 2 (Advanced Settings & Sharing)

### Status

Accepted ✅

### Context

To transform the PasteBin workspace into a secure collaboration suite, we need to introduce granular, role-based sharing permissions, enable direct inline edits for authenticated writers, and simplify visibility settings. Unnecessary complexity (like redundant controls or auto-detect settings) must be eliminated, and advanced sharing options should be presented inside a modern focused dialog instead of cluttered vertical sidebar expansions.

### Decision

We implement database, route, and UI enhancements supporting segmented visibility models (Public, Private, Secret), an inline edit flow for write-access editors, and a centered sharing configurations dialog modal.

### Details

1. **Unnecessary Settings Removal**: Removed duplicate language selects, tab size dropdowns, and language auto-detect options from Create Paste views.
2. **Segmented Visibility Redesign**: Toggled visibility levels map directly onto `PUBLIC`, `PRIVATE`, and `SECRET` access rules. Secret pastes require logging in as the owner, bypass PINs, and are completely hidden from public indexers/feeds.
3. **Centered Sharing Modal Dialog**: Advanced Settings opens a responsive centered dialog modal where owners can manage sharing options dynamically.
4. **Real-time User Search**: Searching by username/email matches real-time debounced queries, displaying matched user suggestions immediately.
5. **Read Only vs Read & Write Roles**: Introduced a permission field (`READ` / `WRITE`) to the database schema.
   - `READ` (Read Only): Users can only view, copy, and bookmark the paste.
   - `WRITE` (Read & Write): Shared editors can edit the title, description, and Monaco content inline.
6. **Access Revocation**: Removing a user from the modal immediately revokes database sharing permissions.

### Consequences

- Sharing setups are intuitive, isolated, and visually distinct.
- Collaborative workspaces are enabled safely with strict permission validation layers.
- Admin dashboard layouts remain uncluttered.

---

## Decision #014: User Profile System (Deprecation of Dashboard)

### Status

Accepted ✅

### Context

Traditional administrative dashboards focus heavily on layout management, account configurations, and statistics. To build a product experience closer to modern developer portals (like GitHub or Notion), the platform needs to transition towards a profile-centric design. Additionally, anonymous users must remain first-class citizens in terms of simple paste creation and reading, while registered users receive dedicated profiles to showcase public work and manage collaborative permissions.

### Decision

We deprecate the obsolete vertical dashboard sidebar page and navigation items, replacing them with dynamic public-profile paths (`/profile/:username`).

### Details

1. **Anonymous Navigation Isolation**: Guests do not see any workspace, dashboard, or user dropdown items. They can create snippets, view public pastes, and use search bars safely.
2. **Avatar Navigation Header**: Logged-in users see a circular profile picture and `@username` in the navbar, linking directly to their public profile.
3. **Private Count Protection**: Visitors can view public paste lists and private pastes shared with them on profiles, but counts for private/secret/saved pastes are blocked at the API layer for non-owners.
4. **Modals over Multi-page Editing**: Edit profile capabilities are entirely contained in a keyboard-accessible modal, eliminating separate configuration screens.
5. **Username Validation**: Regulated alphanumeric username restrictions prevent formatting collusions.

### Consequences

- Navigating user content is consolidated, presenting a single, unified view.
- User data visibility constraints are securely protected at the database query level.
- Code complexity is reduced by deprecating the generic dashboard modules.

---

## 12. Restructured Dual-User-Experience Model (Guest vs. Authenticated)

### Status

Accepted ✅

### Context

Allowing immediate engagement is critical for developer adoption. Requiring mandatory credentials to try a tool adds friction. To maximize trial conversion rates, the platform must allow guests to immediately author and query snippets, while making authentication highly rewarding by unlocking permanent storage, encryption permissions, and collaborative features.

### Decision

We restructure the application into Guest Mode (transient local-cached state with strict safety boundaries) and Authenticated Mode (persistent cloud state).

### Details

1. **Guest Code Generation**: We generate random, unique 8-character uppercase alphanumeric codes on the server for all paste creations, serving as the ID key.
2. **Strict Expiration**: Guest pastes are locked to a fixed 1-hour expiration and public visibility.
3. **Immutability**: Guests cannot update, edit, or delete published pastes. The server rejects these endpoints with 403 Forbidden.
4. **Local Browser Fallback**: Guests browse workspaces powered by browser `localStorage` feeds (`pb_guest_recent_pastes`, `pb_guest_saved_pastes`, `pb_guest_recently_viewed_pastes`), allowing them to save bookmarks and history locally without signing up.

### Consequences

- Zero friction for onboarding new users.
- Substantial server resource savings by automatically expiring transient guest pastes after 1 hour.
- Strong encouragement to sign up to unlock private configurations and team sharing.
