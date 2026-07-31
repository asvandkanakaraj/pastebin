# Database Architecture & Schema

## Entity Relationship (ER) Diagram

```mermaid
erDiagram
    User {
        String id PK "UUID"
        String email UK
        String passwordHash
        DateTime createdAt
        DateTime updatedAt
    }
    Paste {
        String id PK "CUID"
        String title "Optional"
        String content
        String language "Default: 'plaintext'"
        Boolean isPublic "Default: true"
        String passwordHash "Optional"
        DateTime expiresAt "Optional"
        String userId FK "Optional"
        DateTime createdAt
        DateTime updatedAt
    }

    User ||--o{ Paste : "creates"
```

## Table Specifications

### 1. User Table
Stores user profile credentials.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(36)` | `PRIMARY KEY` (UUID) | Unique identifier for users |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Registered email address |
| `passwordHash` | `VARCHAR(255)` | `NOT NULL` | Securely hashed user password |
| `createdAt` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Signup timestamp |
| `updatedAt` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Last updated timestamp |

### 2. Paste Table
Stores code snippets, highlight details, access restrictions, and validation metadata.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `VARCHAR(30)` | `PRIMARY KEY` (CUID) | Short/clean slug for urls |
| `title` | `VARCHAR(100)` | `NULL` | Optional name of snippet |
| `content` | `TEXT` | `NOT NULL` | The raw source code/text |
| `language` | `VARCHAR(50)` | `DEFAULT 'plaintext'` | Syntax highlighting language |
| `isPublic` | `BOOLEAN` | `DEFAULT TRUE` | Search index visibility |
| `passwordHash` | `VARCHAR(255)` | `NULL` | Paste access password |
| `expiresAt` | `TIMESTAMP` | `NULL` | Cleanup target timestamp |
| `userId` | `VARCHAR(36)` | `FOREIGN KEY` (User) | Creator references |
| `createdAt` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Paste upload timestamp |
| `updatedAt` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Last updated timestamp |

---

## Relation Integrity

### User-Paste (1:N) Relationship
- Each `Paste` can optionally belong to a `User` (represented by `userId` foreign key). If the paste is created anonymously, `userId` will be stored as `null`.
- **Integrity Constraints**: The `userId` references the primary key `id` of the `User` table.
- **On Delete Action**: If a `User` record is deleted, all pastes created by that user are cascade-deleted (`onDelete: Cascade` relation strategy) to prevent orphaned records in the database.
