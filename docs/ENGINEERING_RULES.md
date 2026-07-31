# Engineering Guidelines & Rules

## 1. Code Standards
To maintain high code quality and consistency across all packages, developers must adhere to the following naming conventions:

- **Variables, Functions, Instances**: Use `camelCase`.
  *Example*: `const pasteData = fetchPaste(pasteId);`
- **React Components, Classes, Types, Interfaces**: Use `PascalCase`.
  *Example*: `interface PasteResponse {}`, `function PasteViewer() {}`
- **File Names**: Use `kebab-case`.
  *Example*: `paste-viewer.tsx`, `database-client.ts`

## 2. TypeScript Guidelines
- **Strict Mode**: `strict: true` must be enabled across all configuration levels.
- **No Explicit Any**: Avoid using `any` unless absolutely necessary. Use `unknown` or specify explicit types.
- **Null Safety**: Check for `undefined` and `null` values explicitly.

## 3. Documentation-First Philosophy
- Any new module, system architectural change, or API route MUST be documented before or during the implementation phase.
- Keep the `docs/` folder updated with architectural changes and decisions.

## 4. Linting and Formatting
- Format files using **Prettier** before committing changes (`npm run format`).
- Ensure the project compiles and passes all **ESLint** validations.
