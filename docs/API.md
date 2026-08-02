# PasteBin API Documentation

This document describes the API routes exposed by the Express backend.

## Endpoints

### 1. Create Paste

Creates a new code snippet paste with optional security settings.

- **Method**: `POST`
- **URL**: `/api/pastes`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body (JSON validated via Zod)**:
  | Field              | Type      | Description                                                  |
  | ------------------ | --------- | ------------------------------------------------------------ |
  | `title`            | `string`  | (Optional) Title, max 100 characters                         |
  | `content`          | `string`  | (Required) Raw paste content, minimum 1 character            |
  | `language`         | `string`  | (Optional) Syntax highlighting format (default: `plaintext`) |
  | `isPublic`         | `boolean` | (Optional) Search indexing visibility (default: `true`)      |
  | `password`         | `string`  | (Optional) Password check protection, minimum 4 characters   |
  | `expiresInSeconds` | `integer` | (Optional) Lifespan of the paste in seconds                  |
- **Success Response (201 Created)**:
  ```json
  {
    "id": "clz4u3w...",
    "title": "Config file",
    "content": "const x = 5;",
    "language": "javascript",
    "isPublic": true,
    "passwordHash": "$2b$10$...",
    "expiresAt": "2026-07-31T09:12:00.000Z",
    "userId": null,
    "createdAt": "2026-07-31T08:12:00.000Z",
    "updatedAt": "2026-07-31T08:12:00.000Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Payload validation failed (e.g. empty content).
    ```json
    {
      "error": "ZodError",
      "message": "Content is required"
    }
    ```

---

### 2. Retrieve Paste

Fetches a single paste by its ID.

- **Method**: `GET`
- **URL**: `/api/pastes/:id`
- **Headers**:
  - `x-paste-password`: (Optional) Required if the paste is password-protected.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "clz4u3w...",
    "title": "Config file",
    "content": "const x = 5;",
    "language": "javascript",
    "isPublic": true,
    "userId": null,
    "expiresAt": "2026-07-31T09:12:00.000Z",
    "createdAt": "2026-07-31T08:12:00.000Z",
    "updatedAt": "2026-07-31T08:12:00.000Z"
  }
  ```
  _(Note: `passwordHash` is excluded from the returned object for security)._
- **Error Responses**:
  - `401 Unauthorized`: Password is required but was not provided in headers.
    ```json
    {
      "error": "UnauthorizedError",
      "message": "Password required to view this paste"
    }
    ```
  - `403 Forbidden`: Provided password does not match the hashed signature.
    ```json
    {
      "error": "ForbiddenError",
      "message": "Incorrect password"
    }
    ```
  - `404 Not Found`: Paste ID does not exist.
    ```json
    {
      "error": "NotFoundError",
      "message": "Paste not found"
    }
    ```
  - `410 Gone`: Paste lifespan has expired.
    ```json
    {
      "error": "ExpiredError",
      "message": "Paste has expired"
    }
    ```

---

### 3. List Public Pastes

Returns a paginated list of all active public pastes.

- **Method**: `GET`
- **URL**: `/api/pastes`
- **Query Parameters**:
  - `page`: (Optional, default `1`) Page number to fetch.
  - `limit`: (Optional, default `10`) Number of records per page.
  - `search`: (Optional) Case-insensitive search string matching titles or contents.
  - `language`: (Optional) Strict programming language filter.
- **Success Response (200 OK)**:
  ```json
  {
    "pastes": [
      {
        "id": "clz4u3w...",
        "title": "Public snippet",
        "content": "print('hello')",
        "language": "python",
        "isPublic": true,
        "userId": null,
        "expiresAt": null,
        "createdAt": "2026-07-31T08:00:00.000Z",
        "updatedAt": "2026-07-31T08:00:00.000Z"
      }
    ],
    "totalCount": 1,
    "totalPages": 1,
    "currentPage": 1
  }
  ```

---

### 4. Delete Paste

Removes a paste.

- **Method**: `DELETE`
- **URL**: `/api/pastes/:id`
- **Headers**:
  - `x-paste-password`: (Optional) Required if the paste is protected.
- **Success Response (204 No Content)**:
  _No response body returned._
- **Error Responses**:
  - `401 Unauthorized`: Password is required to delete.
  - `403 Forbidden`: Password mismatch.
  - `404 Not Found`: Paste does not exist.
  - `429 Too Many Requests`: Deletion frequency limit exceeded (maximum 5 deletions per minute per IP).
    ```json
    {
      "error": "TooManyRequests",
      "message": "Too many delete requests from this IP. Please try again after 1 minute."
    }
    ```

---

## Auth Endpoints

### 1. Register User

Creates a new user account with hashed passwords.

- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strong-password-here"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "id": "user-uuid-here",
    "email": "user@example.com",
    "createdAt": "2026-07-31T09:20:00.000Z",
    "updatedAt": "2026-07-31T09:20:00.000Z"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Email is already registered or request payload is invalid.

---

### 2. Login User

Verifies account credentials and dispatches session JWT.

- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strong-password-here"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "user-uuid-here",
      "email": "user@example.com",
      "createdAt": "2026-07-31T09:20:00.000Z",
      "updatedAt": "2026-07-31T09:20:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: Invalid email or password.

---

### 3. Retrieve User Pastes

Returns all active and expired pastes created by the authenticated user session.

- **Method**: `GET`
- **URL**: `/api/pastes/me`
- **Headers**:
  - `Authorization`: `Bearer <token>` (Required)
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "clz4u3w...",
      "title": "Private snippet",
      "content": "print('hello')",
      "language": "python",
      "isPublic": false,
      "userId": "user-uuid-here",
      "expiresAt": null,
      "createdAt": "2026-07-31T08:00:00.000Z",
      "updatedAt": "2026-07-31T08:00:00.000Z"
    }
  ]
  ```
- **Error Responses**:
  - `401 Unauthorized`: Access token required or signature verify check failed.

---

### 4. Global Search

Finds public pastes by title and users by username/email matching the query string. Results are sorted intelligently with priority given to exact matches.

- **Method**: `GET`
- **URL**: `/api/search`
- **Query Parameters**:
  - `q` (Required): The search term query string.
- **Success Response (200 OK)**:
  ```json
  {
    "users": [
      {
        "id": "user-uuid-1",
        "email": "blue@gmail.com",
        "username": "jusbyblue"
      }
    ],
    "pastes": [
      {
        "id": "paste-cuid-1",
        "title": "React Authentication",
        "isPublic": true,
        "language": "typescript",
        "createdAt": "2026-07-31T10:00:00.000Z"
      }
    ]
  }
  ```

---

### 5. Get User Profile

Returns a user profile and list of their public, non-expired pastes.

- **Method**: `GET`
- **URL**: `/api/users/:username`
- **Success Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "user-uuid-1",
      "email": "blue@gmail.com",
      "username": "jusbyblue",
      "createdAt": "2026-07-31T09:00:00.000Z",
      "updatedAt": "2026-07-31T09:00:00.000Z"
    },
    "pastes": [
      {
        "id": "paste-cuid-1",
        "title": "React Authentication",
        "language": "typescript",
        "createdAt": "2026-07-31T10:00:00.000Z",
        "expiresAt": null,
        "isPublic": true
      }
    ]
  }
  ```

---

### 6. Retrieve User Workspace

Returns all sections of the authenticated user's workspace dashboard (My Pastes, Shared With Me, Saved, and Recently Viewed).

- **Method**: `GET`
- **URL**: `/api/workspace`
- **Headers**:
  - `Authorization`: `Bearer <token>` (Required)
- **Success Response (200 OK)**:
  ```json
  {
    "myPastes": [
      {
        "id": "paste-cuid-1",
        "title": "Personal Code Snip",
        "content": "const a = 1;",
        "language": "javascript",
        "isPublic": false,
        "createdAt": "2026-08-01T00:00:00.000Z",
        "updatedAt": "2026-08-01T00:00:00.000Z"
      }
    ],
    "sharedWithMe": [
      {
        "id": "paste-cuid-2",
        "title": "Collaborative Plan",
        "language": "markdown",
        "isPublic": true,
        "createdAt": "2026-08-01T01:00:00.000Z",
        "ownerUsername": "alice",
        "sharedAt": "2026-08-01T01:10:00.000Z"
      }
    ],
    "saved": [
      {
        "id": "paste-cuid-3",
        "title": "Useful Cheat Sheet",
        "language": "plaintext",
        "isPublic": true,
        "createdAt": "2026-07-31T20:00:00.000Z",
        "ownerUsername": "bob",
        "savedAt": "2026-08-01T02:00:00.000Z"
      }
    ],
    "recentlyViewed": [
      {
        "id": "paste-cuid-1",
        "title": "Personal Code Snip",
        "language": "javascript",
        "isPublic": false,
        "viewedAt": "2026-08-01T02:30:00.000Z"
      }
    ]
  }
  ```

---

### 7. Update Paste

Allows the owner of a paste to edit its details and content.

- **Method**: `PUT`
- **URL**: `/api/pastes/:id`
- **Headers**:
  - `Authorization`: `Bearer <token>` (Required)
- **Request Body**:
  - `title` (Optional string): Paste title.
  - `content` (Required string): Code content.
  - `language` (Optional string): Language identifier.
  - `isPublic` (Optional boolean): Visibility status.
  - `password` (Optional string): Optional passcode protection.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "paste-cuid-1",
    "title": "Updated Title",
    "content": "const updated = true;",
    "language": "javascript",
    "isPublic": true,
    "createdAt": "2026-08-01T00:00:00.000Z",
    "updatedAt": "2026-08-01T03:00:00.000Z"
  }
  ```

---

### 8. Share Paste

Shares a paste owned by the authenticated user with another user by email or username.

- **Method**: `POST`
- **URL**: `/api/pastes/:id/share`
- **Headers**:
  - `Authorization`: `Bearer <token>` (Required)
- **Request Body**:
  - `usernameOrEmail` (Required string): Username or email address of target collaborator.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "share-uuid-1",
    "pasteId": "paste-cuid-1",
    "userId": "target-user-uuid",
    "createdAt": "2026-08-01T03:05:00.000Z"
  }
  ```

---

### 9. Bookmark Paste

Adds a reference link of a paste to the authenticated user's Saved bookmarks folder.

- **Method**: `POST`
- **URL**: `/api/pastes/:id/save`
- **Headers**:
  - `Authorization`: `Bearer <token>` (Required)
- **Success Response (200 OK)**:
  ```json
  {
    "id": "saved-uuid-1",
    "pasteId": "paste-cuid-1",
    "userId": "user-uuid-here",
    "createdAt": "2026-08-01T03:10:00.000Z"
  }
  ```

---

### 10. Remove Bookmarked Paste

Removes a bookmark reference link of a paste from the authenticated user's Saved folder.

- **Method**: `DELETE`
- **URL**: `/api/pastes/:id/save`
- **Headers**:
  - `Authorization`: `Bearer <token>` (Required)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true
  }
  ```

---

## Error Codes

The PasteBin API uses standard HTTP response status codes to indicate success or failure. Each status code maps to specific scenarios:

### 1. `400 Bad Request`

- **Context**: Schema validation check failed.
- **Scenarios**: Empty `content`, `title` exceeding 100 characters, or invalid Zod parameters.

### 2. `401 Unauthorized`

- **Context**: Authentication failed or is missing.
- **Scenarios**: Invalid login credentials, missing or malformed JWT token inside the `Authorization` header, or query requests targeting password-protected pastes without supplying a password verification token.

### 3. `403 Forbidden`

- **Context**: Permission checks rejected.
- **Scenarios**: Non-owner attempts to read or delete private pastes (`isPublic: false`).

### 4. `404 Not Found`

- **Context**: Resource could not be resolved.
- **Scenarios**: Non-existent paste ID or attempt to retrieve a paste that has already reached its expiration timestamp (`expiresAt < Now`).

### 5. `429 Too Many Requests`

- **Context**: Rate limiter threshold triggered.
- **Scenarios**: Exceeded the maximum allowance of requests (100 requests per 15 mins globally, 10 requests per 15 mins for auth/posts, or 5 requests per 1 min for delete).

### 6. `500 Internal Server Error`

- **Context**: Server error encountered.
- **Scenarios**: Database link failure, server crash, or runtime exceptions.

---

## Sharing & Advanced Configurations API

### 1. List Shared Access Users

Retrieves all users a paste is currently shared with.

- **Method**: `GET`
- **URL**: `/api/pastes/:id/shares`
- **Headers**:
  - `Authorization: Bearer <token>` (Required: must be the paste owner)
- **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "share-uuid-123",
      "pasteId": "paste-id-xyz",
      "userId": "user-uuid-456",
      "permission": "READ",
      "createdAt": "2026-08-01T09:12:00.000Z",
      "user": {
        "id": "user-uuid-456",
        "username": "alex",
        "email": "alex@example.com"
      }
    }
  ]
  ```

---

### 2. Share Paste with User

Grants or updates user access permissions for a specific paste.

- **Method**: `POST`
- **URL**: `/api/pastes/:id/share`
- **Headers**:
  - `Authorization: Bearer <token>` (Required: must be the paste owner)
- **Request Body**:
  | Field             | Type     | Description                                    |
  | ----------------- | -------- | ---------------------------------------------- |
  | `usernameOrEmail` | `string` | (Required) Username or email of target user    |
  | `permission`      | `string` | (Optional) `READ` or `WRITE` (default: `READ`) |
- **Success Response (200 OK)**:
  ```json
  {
    "id": "share-uuid-123",
    "pasteId": "paste-id-xyz",
    "userId": "user-uuid-456",
    "permission": "WRITE",
    "createdAt": "2026-08-01T09:12:00.000Z"
  }
  ```

---

### 3. Revoke Access (Unshare)

Revokes sharing access permissions for a specific user.

- **Method**: `DELETE`
- **URL**: `/api/pastes/:id/share/:userId`
- **Headers**:
  - `Authorization: Bearer <token>` (Required: must be the paste owner)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true
  }
  ```

---

## Guest Mode Rules & Endpoint Enforcement

To support anonymous tryouts while protecting security boundaries, the server restricts certain API operations for non-logged-in (Guest) users:

### 1. Anonymous Creations (`POST /api/pastes`)

- **Headers**: No `Authorization` header.
- **Enforced Constraints**:
  - `visibility` is forced to `PUBLIC`.
  - `expiresInSeconds` is forced to `3600` (exactly 1 hour expiration).
  - `password` is ignored (transient pastes cannot be PIN-protected).
  - `shares` is ignored (guest pastes cannot be shared with write access).
- **Result ID**: Generates a random, unique 8-character uppercase alphanumeric code (e.g. `A82XK4P9`) that serves as both the Paste Code and the direct link path identifier.

### 2. Immutability Restrictions (`PUT /api/pastes/:id` and `DELETE /api/pastes/:id`)

- **Behavior**: Any attempt to update or delete a paste where `userId === null` is blocked on the server, returning a `403 ForbiddenError` payload:
  ```json
  {
    "error": "ForbiddenError",
    "message": "Access denied. Guest pastes cannot be modified or deleted; they expire automatically after 1 hour."
  }
  ```

---

## CLI Client Integration

The Node.js CLI client (`pastebin`) acts as a consumer of these endpoints. The CLI handles request and response states as follows:

### 1. Authentication Handshake (`login`)

- **Action**: Dispatches a `POST /api/auth/login` containing user-typed inputs.
- **Outcome**: Captures the returned JSON `token` and persists it locally to `~/.pastebin-config.json`.

### 2. Secure Upload (`upload`)

- **Action**: Reads the specified file content, checks `~/.pastebin-config.json` for active tokens, and dispatches a `POST /api/pastes` request.
- **Headers**: Automatically injects `Authorization: Bearer <token>` if authenticated.
- **Clipboard integration**: On a `201 Created` response, automatically copies the paste URL to the user's OS clipboard.

### 3. Retrieve and View (`get <id>`)

- **Action**: Dispatches a `GET /api/pastes/:id`.
- **Password Check**: If the endpoint returns a `401 Unauthorized` with a "Password required" message, the CLI prompts the user for the password, verifies it via `POST /api/pastes/:id/verify`, and uses the returned token to complete the fetch.
