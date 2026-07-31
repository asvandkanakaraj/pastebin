# Architecture Decisions (ADR) - PasteBin

## ADR #001: Choosing a Monorepo Structure with npm Workspaces

### Status
Accepted ✅

### Context
PasteBin is built as a split architecture with a React-based frontend and an Express-based REST API backend. Over time, shared concepts like schema validation (e.g. Zod schemas for input validation), data transfer objects (DTOs), types, and error codes will be needed by both applications. Keeping these in sync manually across separate repositories causes code duplication and integration bugs.

### Decision
We will organize the repository as a Monorepo using npm Workspaces. Workspaces will be partitioned as:
- `apps/` for deployable applications (web, server).
- `packages/` for internal shared modules (shared utilities, database configuration/schema).

### Consequences
- **Pros**:
  - Full end-to-end type safety across the stack. A type change in `@pastebin/shared` is immediately reflected in both client and server code.
  - Simplified dependency management (single root `node_modules` and shared dependency resolution).
  - Single-repository commit logs for features touching both frontend and backend.
- **Cons**:
  - Requires build tooling configurations to build workspace linkages during CI/CD.
  - Increased repository size over time, which can be mitigated with shallow clones and git optimizations.

---

## ADR #002: Using Prisma ORM with PostgreSQL

### Status
Accepted ✅

### Context
PasteBin requires a database to store users and pastes with low-latency reads. We need a system that supports schemas, migrations, relations, and type safety in the server application code.

### Decision
We will use **Prisma ORM** with a **PostgreSQL** database. 

### Consequences
- **Pros**:
  - Full TypeScript type safety generated directly from our `schema.prisma`.
  - Easy migrations via declarative schemas (`prisma migrate dev` or `prisma db push`).
  - Seamless support for standard developer setups via Docker Compose.
- **Cons**:
  - Prisma client generation introduces a tiny overhead during monorepo builds.
  - Raw sql queries are less performant than typed queries in specialized cases, though standard client features are highly optimized.

---

## ADR #003: Implementing a Service-Repository Pattern

### Status
Accepted ✅

### Context
In many Express codebases, request parsing, database querying, business validations, and error formatting are all mixed together inside controllers. This makes the codebase difficult to test, hard to maintain, and couples HTTP transport with database storage.

### Decision
We will enforce a layered Controller-Service-Repository pattern:
- **Routes**: Define URL paths and register handlers.
- **Controllers**: Handle HTTP-specific concepts (headers, response codes, Zod schema validation parse exceptions).
- **Services**: Execute business logic, compute timeouts, run password checks, and call database repositories.
- **Repositories (Prisma)**: Read and write models directly from database layers.

### Consequences
- **Pros**:
  - Easier testing: Business logic can be unit-tested without mock Express requests.
  - Reusability: Services can be used in CLIs, cron jobs, or other controllers.
  - Clean separation of concerns.
- **Cons**:
  - Requires writing slightly more file structure boilerplate for simple CRUD operations.

---

## ADR #004: Choosing Monaco Editor for Code Sharing

### Status
Accepted ✅

### Context
PasteBin is built as a developer-centric code sharing service. Code editing and viewing require robust syntax highlighting, theme options, indentation controls, line numbering, and overall ease of text manipulation. Using simple `<textarea>` blocks fails to deliver a premium development experience.

### Decision
We will use **Monaco Editor** via `@monaco-editor/react` as the primary editor panel.

### Consequences
- **Pros**:
  - Provides the same engine that powers VS Code (built-in language intelligence, shortcuts, theme controls, scrollbars).
  - Out-of-the-box support for 50+ languages.
  - Zero manual canvas or syntax parsing code required on the client side.
- **Cons**:
  - Incremental increase in frontend download bundle size (mitigated by Monaco loading lazily from CDNs).
  - Heavy canvas rendering load on lower-spec mobile devices. We will disable heavy elements (minimap, etc.) to optimize rendering times.

---

## ADR #005: Using Confirmation Dialogs for Destructive Actions

### Status
Accepted ✅

### Context
Destructive actions, such as deleting a created paste snippet, permanently remove content from the database. Accidental triggers (clicking delete instead of copy/new) lead to permanent data loss and bad UX. Safeguarding checks are required before dispatches.

### Decision
We will enforce **Confirmation Dialogs** (custom mock Alert-Dialog overlay) before dispatches of any destructive requests (such as DELETE /api/pastes/:id).

### Consequences
- **Pros**:
  - Eliminates accidental deletions by adding an explicit double-confirmation checkpoint.
  - Improves User Experience by confirming action outcomes.
  - No complex visual library dependencies needed (styled inline using native flex layout and blur backdrop).
- **Cons**:
  - Introduces one extra click for users who explicitly want to delete a paste. This is standard design practice for data-loss mitigation.
