# PasteBin Security Philosophy & Design

This document details the visual and logical security constraints implemented across the PasteBin full-stack codebase.

## 1. Password Protection & Cryptographic Hashing
- **BCrypt Encryption**: Whenever a paste is created with custom password protections, the password is encrypted asynchronously via `bcrypt` using a work factor parameter of 10 (`saltRounds`) before saving.
- **Database Leaks Containment**: Even if the primary PostgreSQL database is compromised, raw paste passwords cannot be resolved since the database only persists the secure one-way salted bcrypt signatures (`passwordHash`).
- **Authorization Decrypt Handshakes**: Requester inputs verified against these signatures dynamically grant access and exclude hashes from returning inside query response packets.

## 2. Private Pastes & Scope Access Control
- **Owner Checks**: Snippets designated with public visibility disabled (`isPublic: false`) are restricted dynamically at the service layer:
  - If a requester is anonymous, access is rejected immediately returning a `403 Forbidden` response status.
  - If a requester is logged in, the service matches their JWT user ID claim against the paste owner (`userId`). Access is only granted if the claims are equal; otherwise, it returns a `403 Forbidden` response.
- **Stateless Decryption Verification**: In addition to standard owner validations, any password-protected entry requires verification. If a header `x-paste-password` is not present, it triggers `401 Unauthorized` responses forcing password decryption overlays in the client.

## 3. JWT Stateless Session Management
- **Token Signatures**: User registration and login validation dispatch stateless token keys signed via standard `HS256` HMAC signatures using the server's private `JWT_SECRET`.
- **IP Rate Limiting**: Destructive operations (such as delete requests) are shielded via custom in-memory middleware tracking remote IPs. Attempts are capped at a maximum of 5 deletion dispatches per minute per IP, protecting the system from mass-deletion scripts.
