# @sometic/core

## 1.0.1

### Patch Changes

- adc1fbd: Fix npm package metadata and consumer READMEs: real GitHub repository and bugs URLs, keywords on every publishable package, and deep npm-facing documentation with install and usage examples.

## 1.0.0

### Major Changes

- 68c9d30: Rename the public package scope from `@aitistack` to `@sometic` and custom elements from `aiti-*` to `sometic-*` (Sometic product identity, ADR-0012). Update imports and element tags accordingly. No compatibility shims.

### Minor Changes

- 68c9d30: Beta Harden: Sometic-only public API and docs (`SometicError`, `sometic` defaults), professional component documentation, release workflow. Breaking for local clones that relied on `AitiStackError` / `aitistack` storage keys / `aiti-*` class names.
- 68c9d30: Phase 2 foundation primitives across core subpaths and new typed event emitter package.

### Patch Changes

- 68c9d30: Initial Phase 1 monorepo packages: shared ESLint config and core environment primitives.

## 0.0.1

- Environment primitives with capability detection
- Id, disposable, error, result, and contract types
- Controllable state and async operation controller
- Shared utilities (debounce/throttle/once/abort/json helpers)
