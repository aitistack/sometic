# `@sometic/eslint-config`

Shared ESLint flat config for Sometic packages.

## Install

```bash
pnpm add -D @sometic/eslint-config eslint typescript
```

## Usage

```js
import { createPackageConfig } from "@sometic/eslint-config";

export default createPackageConfig({
    tsconfigRootDir: import.meta.dirname,
});
```

## Rules of note

- Four-space indentation is enforced via Prettier at the repo root (not ESLint indent).
- `sometic/no-implementation-comments` forbids comments in TypeScript implementation files except license headers and required tooling directives.
- `any` is forbidden; prefer `unknown` and narrowing.

## License

MIT
