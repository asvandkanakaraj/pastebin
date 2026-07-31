# PasteBin CLI Client User Manual

The PasteBin CLI Client (`@pastebin/cli`) provides developer-centric terminal access to upload, fetch, and inspect code pastes.

---

## 1. Installation

You can install the CLI globally on your system directly from the repository:

### Installation via Global Linking
1. From the repository root directory, run:
   ```bash
   npm link -w @pastebin/cli
   ```
2. Verify that the global executable command works by running:
   ```bash
   pastebin --help
   ```

### Global Installation via Tarball/Directory
```bash
npm install -g apps/cli
```

---

## 2. Command Reference

### 1. `login`
Authenticate against the backend REST API server and save session configurations.
- **Command**:
  ```bash
  pastebin login
  ```
- **Description**: Prompts you for email and password. Upon validation, saves the retrieved JWT locally to `~/.pastebin-config.json`.

---

### 2. `upload`
Create a new code paste snippet from a local file.
- **Command**:
  ```bash
  pastebin upload <file-path> [options]
  ```
- **Options**:
  - `-t, --title <string>`: Specify paste title (defaults to filename).
  - `-l, --language <string>`: Highlight parser language (defaults to `plaintext`).
  - `-p, --private`: Create a private paste (defaults to false).
  - `--password <string>`: Secure the paste with a password.
- **Example**:
  ```bash
  pastebin upload src/index.js -l javascript -t "Production Index"
  ```
- **Note**: Successful uploads will automatically copy the public paste URL to your clipboard!

---

### 3. `get`
Fetch and print the content of a paste to your terminal.
- **Command**:
  ```bash
  pastebin get <paste-id> [options]
  ```
- **Options**:
  - `--password <string>`: Supply password check directly.
- **Description**: Displays the paste content. If the paste is password-protected and no password option is provided, the CLI will prompt you for the password dynamically.
- **Example**:
  ```bash
  pastebin get cms8y87n400034ps38n163kba
  ```

---

### 4. `list`
Fetch and display the most recent public pastes in a clean format.
- **Command**:
  ```bash
  pastebin list
  ```

---

## 3. Environment Configurations

You can configure the target API host URL using environment variables:
- **`PASTEBIN_API_URL`**: Target REST API endpoint server (defaults to `http://localhost:5000/api`).
