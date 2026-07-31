# Product Requirements Document (PRD) - PasteBin

## 1. Vision & Core Value Proposition
PasteBin is a high-performance, developer-centric code-sharing platform designed for seamless snippet sharing, rich styling, collaborative review, and speed.

## 2. Problem Statement
Existing snippet sharing utilities are either cluttered with ads, slow, lack proper syntax highlighting/themes, or fail to support critical developer ergonomics such as private access control, expiration periods, and quick CLI pushes.

## 3. High-Level Goals
- **Developer Ergonomics**: Quick, keyboard-first UI, robust syntax highlighting, auto-detection of languages.
- **Privacy & Security**: Secure links, optional password protection, self-destructing pastes.
- **Performance**: Near-instant paste rendering and lightweight frontend bundles.
- **Scale**: Architected to handle millions of active pastes efficiently using indexed database tables and optimization strategies.

## 4. Key Implemented Features

### 1. Anonymous & Authenticated Paste Sharing
- **Anonymous sharing**: Instantly create pastes without registration.
- **Account history**: User signup and stateless JWT session auth locks user-created pastes to their dashboard history.

### 2. Rich Code Editor (Monaco)
- **Ergonomics**: Monaco Editor integration supporting tab mappings, dynamic dark/light theme switching, code copying, and reading-only visualizations.
- **Syntax highlight**: Support for standard programming languages (JavaScript, Python, Rust, etc.).

### 3. Expiration Logic & Self-Destruction
- **Timestamps mapping**: Set snippet expiration offsets (10m, 1h, 1d, 1w, 1m).
- **Background Sweeps**: Query runs verify expirations before resolving objects, deleting expired items automatically to release database tables space.

### 4. Advanced Password Protection
- **One-way hashing**: Secures pastes with user passwords encrypted via `bcrypt` (saltRounds=10).
- **Verify Handshakes**: Intercepts requests for password-locked nodes, requiring verify checks and returning access tokens.

### 5. Multi-Client Ergonomics
- **CLI Client Tool**: SC CLI executables (`pastebin`) supporting:
  - `login`: Fetch and save credentials tokens.
  - `upload`: Direct post snippet files, returning public links.
  - `get`: Retrieve codes with comment highlights.
  - `list`: Show recent public pastes.
  - **Polish features**: Ora progress spinners, automatic clipboard URL copying (`clipboardy`), and high-impact ASCII branding art.

### 6. Hardened Security & Audits
- **Rate Limit layers**: Strict ingress thresholds mapping (100 req/15m global, 10 req/15m sensitive auth/posts, 5 req/1m delete).
- **Input Sanitization**: Strip script tags from titles via `sanitize-html` and script payloads from code blocks using custom regexes without corrupting brackets.
- **Response Headers**: Enforced Helmet Content-Security-Policy (CSP).

---

## 5. Non-Functional Requirements & Architecture Metrics
- **Automated CI Workflow**: GitHub Actions validating lints/Prettier rules, running workspaces Vitest, and verifying Docker compile scripts.
- **Microservice Containerization**: Multi-stage Docker configurations deploying Nginx SPA assets and Node.js REST nodes.
- **Health Checks & Liveness**: Integrated `/health` endpoints querying database status and process uptime.
- **Sub-millisecond db access**: Optimized indexing layouts targeting unique columns and query indices.
