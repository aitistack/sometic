# Changelog

## 1.1.3

### Patch Changes

- 5f7cddb: Republish packages whose current npm versions were not produced by GitHub Actions trusted publishing, so the latest line gets provenance.
- Updated dependencies [5f7cddb]
    - @sometic/core@1.0.7
    - @sometic/validation@1.0.6

## 1.1.2

### Patch Changes

- 8beb20b: Consumer CDN copy: concrete jsDelivr versions, Simple script vs Module script sections, no pin-in-production jargon.
- Updated dependencies [8beb20b]
    - @sometic/core@1.0.6

## 1.1.1

### Patch Changes

- 1e941de: Point npm homepage and README docs links at https://sometic.dev, and ship IIFE plus ESM browser bundles for foundation engines and @sometic/dom so HTML-first pages can load Sometic without a bundler.
- Updated dependencies [1e941de]
    - @sometic/core@1.0.5
    - @sometic/validation@1.0.5

## 1.1.0

### Minor Changes

- ba36fbf: Phase 21 Data & business catalog: table, query-builder, upload, schema-form, permission matrix, activity, approval, notifications, and status surfaces with Wave A adapters.

## 1.0.4

### Patch Changes

- b996efd: Clean package Install sections: commands only, no meta copy about npm clipboard limits.
- Updated dependencies [b996efd]
    - @sometic/core@1.0.4
    - @sometic/validation@1.0.4

## 1.0.3

### Patch Changes

- ea4e41a: Clarify npm README install CTAs and ship docs Installation sections with always-visible Copy buttons via InstallCommands (npm cannot host clipboard UI).
- Updated dependencies [ea4e41a]
    - @sometic/core@1.0.3
    - @sometic/validation@1.0.3

## 1.0.2

### Patch Changes

- c2f3d2b: Add docs Copy links on package Install sections. npm cannot host clipboard buttons, so READMEs point at docs install controls.
- Updated dependencies [c2f3d2b]
    - @sometic/core@1.0.2
    - @sometic/validation@1.0.2

## 1.0.1

### Patch Changes

- adc1fbd: Fix npm package metadata and consumer READMEs: real GitHub repository and bugs URLs, keywords on every publishable package, and deep npm-facing documentation with install and usage examples.
- Updated dependencies [adc1fbd]
    - @sometic/core@1.0.1
    - @sometic/validation@1.0.1

## 1.0.0

### Major Changes

- 68c9d30: Rename the public package scope from `@aitistack` to `@sometic` and custom elements from `aiti-*` to `sometic-*` (Sometic product identity, ADR-0012). Update imports and element tags accordingly. No compatibility shims.

### Minor Changes

- 68c9d30: Beta Harden: Sometic-only public API and docs (`SometicError`, `sometic` defaults), professional component documentation, release workflow. Breaking for local clones that relied on `SometicError` / `aitistack` storage keys / `aiti-*` class names.
- 68c9d30: Phase 9: validation API + form engine with Wave A adapters and playground coverage.

### Patch Changes

- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
    - @sometic/core@1.0.0
    - @sometic/validation@1.0.0

## 0.0.1

- Initial Phase 9 release: form controller, field arrays, drafts, steps, FormData, a11y helpers.
