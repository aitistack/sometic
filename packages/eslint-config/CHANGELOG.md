# @sometic/eslint-config

## 1.0.7

### Patch Changes

- be4b645: Harden client auth and HTTP so tokens stay out of errors and BroadcastChannel can omit them, OIDC redirect matching is exact with S256-only PKCE, Supabase redirectTo is allowlisted, and login/refresh URLs never receive Bearer.

## 1.0.6

### Patch Changes

- 1e941de: Point npm homepage and README docs links at https://sometic.dev, and ship IIFE plus ESM browser bundles for foundation engines and @sometic/dom so HTML-first pages can load Sometic without a bundler.

## 1.0.5

### Patch Changes

- f550946: Sometic.dev identity cutover plus System engine and elements CDN browser bundles (ESM + IIFE) for docs Usage and jsDelivr. ESLint ignores tsup.cdn.config.ts.

## 1.0.4

### Patch Changes

- b996efd: Clean package Install sections: commands only, no meta copy about npm clipboard limits.

## 1.0.3

### Patch Changes

- ea4e41a: Clarify npm README install CTAs and ship docs Installation sections with always-visible Copy buttons via InstallCommands (npm cannot host clipboard UI).

## 1.0.2

### Patch Changes

- c2f3d2b: Add docs Copy links on package Install sections. npm cannot host clipboard buttons, so READMEs point at docs install controls.

## 1.0.1

### Patch Changes

- adc1fbd: Fix npm package metadata and consumer READMEs: real GitHub repository and bugs URLs, keywords on every publishable package, and deep npm-facing documentation with install and usage examples.

## 1.0.0

### Major Changes

- 68c9d30: Rename the public package scope from `@aitistack` to `@sometic` and custom elements from `aiti-*` to `sometic-*` (Sometic product identity, ADR-0012). Update imports and element tags accordingly. No compatibility shims.

### Minor Changes

- 68c9d30: Beta Harden: Sometic-only public API and docs (`SometicError`, `sometic` defaults), professional component documentation, release workflow. Breaking for local clones that relied on `SometicError` / `aitistack` storage keys / `aiti-*` class names.

### Patch Changes

- 68c9d30: Initial Phase 1 monorepo packages: shared ESLint config and core environment primitives.
