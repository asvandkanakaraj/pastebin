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
