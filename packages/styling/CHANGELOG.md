# Changelog

## 1.0.7

### Patch Changes

- 5f7cddb: Republish packages whose current npm versions were not produced by GitHub Actions trusted publishing, so the latest line gets provenance.

## 1.0.6

### Patch Changes

- 8beb20b: Consumer CDN copy: concrete jsDelivr versions, Simple script vs Module script sections, no pin-in-production jargon.

## 1.0.5

### Patch Changes

- 1e941de: Point npm homepage and README docs links at https://sometic.dev, and ship IIFE plus ESM browser bundles for foundation engines and @sometic/dom so HTML-first pages can load Sometic without a bundler.

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
- 68c9d30: Phase 4 styling engine: class/style resolvers, slots, state attributes, and polymorphic as contract.

## 0.0.1

- Initial Phase 4 release: class/style resolvers, slots, state attributes, polymorphic contract.
