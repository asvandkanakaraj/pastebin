# How PasteBin Is Kept Secure

> **This document explains the security measures built into PasteBin.**
> The first few sections are written for anyone — no technical background needed.

---

## 1. The Simple Version (Plain English)

PasteBin handles real user passwords, private code, and personal accounts.
Here's how we make sure that's kept safe:

| Threat                                       | What We Do About It                                                        |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| Someone guessing passwords                   | We slow them down with **rate limiting** (max 10 tries per 15 minutes)     |
| Someone stealing your data from our database | Passwords are **encrypted one-way** — even we can't read them              |
| Someone injecting malicious code into pastes | We **strip dangerous scripts** from all content on the server              |
| Someone faking requests from another website | We use **header-based tokens** instead of cookies (immune to CSRF attacks) |
| Someone spamming the API                     | **Rate limiters** block IPs that send too many requests                    |
| SQL injection attacks                        | **Prisma ORM** automatically parameterizes all database queries            |

---

## 2. Password Protection (How It Actually Works)

When you set a password on a paste:

1. Your password is **never stored as plain text**
2. It's run through `bcrypt` — a one-way hashing algorithm
3. The resulting hash (a scrambled version) is stored in the database
4. When someone tries to unlock the paste, their input is hashed and **compared** to the stored hash
5. If they match → access granted. If not → `403 Forbidden`

Even if the database were completely leaked, no one could recover your original password from the hash.

---

## 3. Private & Secret Pastes

| Visibility  | Who Can Access It                                                          |
| ----------- | -------------------------------------------------------------------------- |
| **Public**  | Anyone on the internet                                                     |
| **Private** | Anyone with the link + the correct password                                |
| **Secret**  | Only the logged-in owner. Even with a direct link, no one else can view it |

The visibility check happens on the **server**, not the browser — so it can't be bypassed by a clever user.

---

## 4. Login Sessions (JWT Tokens)

When you log in:

1. The server verifies your email and password
2. It generates a **JWT token** — a signed, tamper-proof digital pass
3. That token is stored in your browser's `localStorage`
4. Every request you make attaches this token in the `Authorization: Bearer <token>` header
5. The server verifies the token's signature on every protected request
6. Tokens expire after **7 days**

Because we use header-based tokens (not cookies), cross-site request forgery (CSRF) attacks don't work here — browsers don't auto-attach custom headers to cross-site requests.

---

## 5. Rate Limiting

To prevent bots, brute-force attacks, and spam:

| Route            | Limit                              |
| ---------------- | ---------------------------------- |
| All API routes   | 100 requests per 15 minutes per IP |
| Login & Register | 10 requests per 15 minutes per IP  |
| Create Paste     | 10 requests per 15 minutes per IP  |
| Delete Paste     | 5 requests per 1 minute per IP     |

If you exceed these limits, you get a `429 Too Many Requests` response and must wait.

---

## 6. Input Sanitization

When a paste is created, the server cleans the data **before** saving it:

- **Title**: All HTML tags are completely stripped using `sanitize-html`
- **Content**: `<script>`, `<iframe>`, inline event handlers (`onclick`, `onload`), and `javascript:` URIs are removed via regex — but normal code characters like `<` and `>` are preserved so code isn't corrupted

This happens on the **server side**, so it can't be skipped by modifying the frontend.

---

## 7. Security Headers

Every response from the server includes these HTTP security headers (via Helmet):

| Header                      | What It Prevents                                          |
| --------------------------- | --------------------------------------------------------- |
| `Content-Security-Policy`   | Controls which scripts and resources the browser can load |
| `X-Content-Type-Options`    | Prevents MIME type sniffing attacks                       |
| `X-Frame-Options`           | Prevents clickjacking (embedding the site in an iframe)   |
| `Strict-Transport-Security` | Forces HTTPS connections                                  |

---

## 8. CORS (Who Can Talk to the API)

The API only accepts requests from trusted origins.
If a random website tries to make requests to our API, the browser blocks it.

Allowed origins are set via the `CORS_ORIGIN` environment variable:

```
CORS_ORIGIN=https://pastebin-frontend-tfjz.onrender.com
```

---

## 9. SQL Injection — Why It Can't Happen Here

All database queries go through **Prisma ORM**, which automatically parameterizes every query.
Even for raw SQL (like the health check `SELECT 1`), we use Prisma's tagged template `$queryRaw` which is parameterized by design.

No user input ever gets directly concatenated into a SQL query.

---

## 10. Dependency Audits

We run `npm audit` regularly. Known inapplicable vulnerabilities:

| Package                   | Why It's Not a Risk Here                                   |
| ------------------------- | ---------------------------------------------------------- |
| `react-router` RSC CSRF   | We run a pure client-side SPA — no React Server Components |
| `esbuild` local server    | Only runs in development, not in production                |
| `tar` / `brace-expansion` | Only run at install time, not in production runtime        |
