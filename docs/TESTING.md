# Testing Infrastructure & Strategy

This document details the automated testing configuration, mocking principles, and verification execution processes implemented across the PasteBin full-stack codebase.

## 1. Testing Framework Stack
- **Test Runner**: [Vitest](https://vitest.dev/) — a high-performance Vitest ESM test execution engine.
- **API Integration Tests**: [Supertest](https://github.com/ladjs/supertest) — mock routing dispatches without ports collision.
- **UI Component Rendering**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) & [jsdom](https://github.com/jsdom/jsdom) — standard DOM environment mocks.

---

## 2. Test Architecture

### 1. Backend Unit Tests (`apps/server`)
- **Location**: `src/services/__tests__/`
- **Focus**: Business logic verification (creating pastes, expiration checks, validation mapping).
- **Mocks**: Mocks the database package (`@pastebin/database`) using Vitest's `vi.mock()` function, ensuring tests execute in milliseconds without database connectivity.

### 2. Backend Integration Tests (`apps/server`)
- **Location**: `src/__tests__/`
- **Focus**: API HTTP responses, routing flow parameters, and payload formatting.
- **Mocks**: Imports the Express app configuration directly (refactored out of the server listener boot script into `app.ts`) and dispatches using Supertest `request(app)`.

### 3. Frontend Component Tests (`apps/web`)
- **Location**: `src/components/__tests__/`
- **Focus**: Visual layout and state rendering (logo display, dashboard listings, login buttons).
- **Mocks**: Wraps test elements in `MemoryRouter` mock context configurations and mocks Context state wrappers (such as `useAuth`) using Vitest overrides.

---

## 3. Running the Test Suites

Execute test suites from the root directory of the monorepo:

### Run All Tests (Full Monorepo)
```bash
npm run test
```

### Run Server Tests Only
```bash
npm run test -w @pastebin/server
```

### Run Web Client Tests Only
```bash
npm run test -w web
```
