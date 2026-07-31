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
  | Field | Type | Description |
  |---|---|---|
  | `title` | `string` | (Optional) Title, max 100 characters |
  | `content` | `string` | (Required) Raw paste content, minimum 1 character |
  | `language` | `string` | (Optional) Syntax highlighting format (default: `plaintext`) |
  | `isPublic` | `boolean` | (Optional) Search indexing visibility (default: `true`) |
  | `password` | `string` | (Optional) Password check protection, minimum 4 characters |
  | `expiresInSeconds` | `integer` | (Optional) Lifespan of the paste in seconds |
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
  *(Note: `passwordHash` is excluded from the returned object for security).*
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
  *No response body returned.*
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

