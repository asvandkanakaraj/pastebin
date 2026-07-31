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

---

## ADR #006: Choosing JWT for Stateless Authentication

### Status
Accepted ✅

### Context
PasteBin requires secure user accounts to manage paste creations, trace private history, and manage personal settings. A scalable authentication strategy is needed to ensure zero session overhead on the API server, enabling simple horizontal scaling and straightforward integrations with external clients (e.g. desktop CLIs).

### Decision
We will use **JSON Web Tokens (JWT)** for stateless authentication.

### Consequences
- **Pros**:
  - Stateless: The API server does not need to query a Redis session store or database to check token validity on every request (self-contained verification using the signing secret).
  - Scalability: Easy horizontal scaling of backend servers since no shared session state is required.
  - Future Proof: Easy integration with a CLI tool (clients can simply supply the JWT inside the `Authorization` header).
- **Cons**:
  - Token Revocation: Hard to invalidate a token before its expiration window (mitigated by configuring short lifetimes, e.g. 7 days).
  - Security Risk: If a token is stolen, the attacker has access until expiration. We will enforce TLS/HTTPS in staging and production to secure tokens in transit.

---

## ADR #007: BCrypt Hashing for Paste-Level Passwords

### Status
Accepted ✅

### Context
PasteBin supports password-protected snippets. Storing passwords in plain-text format inside the database violates security best practices. If a database dump is leaked, attackers would immediately gain read access to private, restricted user codes.

### Decision
We will hash paste-level passwords using **BCrypt** (10 salt rounds) before database insertion, storing only the hash signature in the `passwordHash` field.

### Consequences
- **Pros**:
  - Secure: Even in the event of database compromise, raw paste passwords remain safe from retrieval since bcrypt is highly resistant to brute-force dictionary attacks.
  - Consistent: Reuses the same encryption engine (`bcrypt`) employed in user account signups, minimizing system dependency footprints.
- **Cons**:
  - Computational Cost: Hashing passwords with bcrypt incurs small CPU costs per creation and verification. Since PasteBin operations are not mass-frequency, this overhead is negligible.
