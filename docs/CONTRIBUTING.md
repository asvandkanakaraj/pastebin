# Contributing Guidelines

Thank you for your interest in contributing to PasteBin! This document outlines the standards, workflow, and guidelines for making contributions to this project.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pastebin.git
   cd pastebin
   ```
3. **Install dependencies** from the monorepo root:
   ```bash
   npm install
   ```
4. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## Commit Message Format

All commits must follow the **Conventional Commits** specification:

```
<type>(<scope>): <short description>
```

| Type | Use Case |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, or dependency updates |
| `style` | Formatting, whitespace, or cosmetic changes |

**Examples:**
```
feat(paste): add visibility toggle for ONLY_ME pastes
fix(auth): handle expired JWT tokens with 401 response
docs(README): add live demo URLs and Render deployment guide
```

---

## Code Style

- **TypeScript** is used everywhere. No `any` types unless explicitly required.
- **ESLint + OxLint** enforced across all workspaces. Run `npm run lint` before committing.
- **Prettier** formats all files. Run `npx prettier --write .` to auto-format.
- **React** components use functional components with hooks — no class components except ErrorBoundary.
- **Services** must never directly return Prisma objects containing sensitive fields (e.g., `passwordHash`). Always destructure and exclude sensitive fields before returning.

---

## Pull Request Guidelines

1. Make sure `npm run build` passes with zero TypeScript errors.
2. Make sure `npm run lint` returns 0 warnings and 0 errors.
3. Run `npm test` to confirm all existing tests pass.
4. Write or update tests for any logic you add or change.
5. Keep PRs focused — one feature or fix per PR.
6. Add a clear description of **what** changed and **why**.

---

## Monorepo Structure

```
pastebin/
├── apps/
│   ├── server/          # Express API backend
│   └── web/             # React + Vite frontend
├── packages/
│   ├── shared/          # Zod schemas, shared types
│   ├── database/        # Prisma client and schema
│   └── cli/             # CLI tool (pastebin command)
├── docs/                # Project documentation
└── scripts/             # Shell utility scripts
```

---

## Questions?

Open a GitHub Issue or Discussion if you have questions or suggestions.
