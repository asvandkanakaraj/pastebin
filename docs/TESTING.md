# Testing Guide — PasteBin

> **This document explains how we make sure PasteBin works correctly.**
> Think of tests as an automated checklist that runs every time we make a change.

---

## 1. Why We Have Tests (Plain English)

Imagine you build a feature — say, creating a paste. It works great.
Then a week later, you add a new feature — and accidentally break the paste creation.

Without tests, you wouldn't find out until a user reports it.
**With tests**, the broken behaviour is caught automatically within seconds of the change being made.

Our tests cover the most critical parts of the app:

- Creating, viewing, deleting, and editing pastes
- User registration and login
- Password protection logic
- Input validation (rejecting bad data)
- Expiration logic (expired pastes return the right error)

---

## 2. What Tools We Use

| Tool                      | What It Does                                                       |
| ------------------------- | ------------------------------------------------------------------ |
| **Vitest**                | The test runner — runs all our test files and reports pass/fail    |
| **Supertest**             | Makes fake HTTP requests to the server without actually running it |
| **React Testing Library** | Renders React components in a fake browser environment             |
| **jsdom**                 | Simulates a browser DOM for frontend component tests               |

---

## 3. What Gets Tested

### Backend Tests (the API)

**Unit Tests** — test individual service functions in isolation

- Location: `apps/server/src/services/__tests__/`
- These tests mock (fake) the database so they run fast without needing a real DB connection
- They verify business logic like: "if a paste has expired, return 410" or "if the password is wrong, throw a 403 error"

**Integration Tests** — test full API routes end-to-end

- Location: `apps/server/src/__tests__/`
- These send real HTTP requests to the Express app and check the responses
- They verify that the whole chain works: request → controller → service → response

### Frontend Tests (the UI)

**Component Tests** — test that React components render correctly

- Location: `apps/web/src/components/__tests__/`
- These check things like: "does the Navbar show the Login button when no user is logged in?"
- The `useAuth` context is mocked so we can test logged-in and logged-out states

---

## 4. How to Run the Tests

From the root of the project:

### Run Everything

```bash
npm test
```

### Run Only the Server Tests

```bash
npm run test -w @pastebin/server
```

### Run Only the Frontend Tests

```bash
npm run test -w web
```

---

## 5. How Tests Fit Into the CI Pipeline

Every time code is pushed to GitHub, the CI pipeline automatically:

1. Installs all dependencies
2. Generates the Prisma database client
3. Runs the full test suite (`npm test`)
4. Reports pass or fail directly on the pull request

If any test fails, the pipeline blocks the merge.

---

## 6. What's NOT Tested (Known Gaps)

| Area                        | Why It's Not Tested                                          |
| --------------------------- | ------------------------------------------------------------ |
| Monaco Editor behaviour     | Monaco relies on browser APIs that don't exist in jsdom      |
| Full login/register UI flow | Would require a real database — covered by manual QA instead |
| CLI tool commands           | CLI is tested manually                                       |
