# Changelog

## 3.0.2

### Patch Changes

- Updated dependencies [5f7cddb]
    - @sometic/accessibility@1.0.7
    - @sometic/core@1.0.7
    - @sometic/data-table@0.2.3
    - @sometic/date-core@1.0.6
    - @sometic/notifications@0.2.3
    - @sometic/positioning@0.1.7
    - @sometic/styling@1.0.7
    - @sometic/auth@1.2.2
    - @sometic/upload@2.0.2

## 3.0.1

### Patch Changes

- Updated dependencies [be4b645]
    - @sometic/auth@1.2.1
    - @sometic/upload@2.0.1
    - @sometic/accessibility@1.0.6
    - @sometic/core@1.0.6
    - @sometic/data-table@0.2.2
    - @sometic/date-core@1.0.5
    - @sometic/notifications@0.2.2
    - @sometic/positioning@0.1.6
    - @sometic/styling@1.0.6

## 3.0.0

### Patch Changes

- Updated dependencies [100c5c9]
    - @sometic/auth@1.2.0
    - @sometic/upload@2.0.0

## 2.0.2

### Patch Changes

- 8beb20b: Consumer CDN copy: concrete jsDelivr versions, Simple script vs Module script sections, no pin-in-production jargon.
- Updated dependencies [8beb20b]
    - @sometic/accessibility@1.0.6
    - @sometic/auth@1.1.2
    - @sometic/core@1.0.6
    - @sometic/positioning@0.1.6
    - @sometic/styling@1.0.6
    - @sometic/data-table@0.2.2
    - @sometic/notifications@0.2.2
    - @sometic/upload@1.0.2

## 2.0.1

### Patch Changes

- 1e941de: Point npm homepage and README docs links at https://sometic.dev, and ship IIFE plus ESM browser bundles for foundation engines and @sometic/dom so HTML-first pages can load Sometic without a bundler.
- Updated dependencies [1e941de]
    - @sometic/accessibility@1.0.5
    - @sometic/auth@1.1.1
    - @sometic/core@1.0.5
    - @sometic/data-table@0.2.1
    - @sometic/date-core@1.0.5
    - @sometic/notifications@0.2.1
    - @sometic/positioning@0.1.5
    - @sometic/styling@1.0.5
    - @sometic/upload@1.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [f550946]
    - @sometic/auth@1.1.0
    - @sometic/upload@1.0.0
    - @sometic/accessibility@1.0.4
    - @sometic/core@1.0.4
    - @sometic/data-table@0.2.0
    - @sometic/date-core@1.0.4
    - @sometic/notifications@0.2.0
    - @sometic/positioning@0.1.4
    - @sometic/styling@1.0.4

## 1.2.0

### Minor Changes

- ba36fbf: Phase 21 Data & business catalog: table, query-builder, upload, schema-form, permission matrix, activity, approval, notifications, and status surfaces with Wave A adapters.

### Patch Changes

- Updated dependencies [ba36fbf]
    - @sometic/data-table@0.2.0
    - @sometic/upload@0.2.0
    - @sometic/notifications@0.2.0

## 1.1.0

### Minor Changes

- 179a92a: Phase 20 Option A: harden Tabs/Accordion/Breadcrumb (keyboard, lazy mount, URL sync), add Command Palette and Tree engines with React and Vue structure adapters.

## 1.0.4

### Patch Changes

- b996efd: Clean package Install sections: commands only, no meta copy about npm clipboard limits.
- Updated dependencies [b996efd]
    - @sometic/accessibility@1.0.4
    - @sometic/core@1.0.4
    - @sometic/date-core@1.0.4
    - @sometic/positioning@0.1.4
    - @sometic/styling@1.0.4

## 1.0.3

### Patch Changes

- ea4e41a: Clarify npm README install CTAs and ship docs Installation sections with always-visible Copy buttons via InstallCommands (npm cannot host clipboard UI).
- Updated dependencies [ea4e41a]
    - @sometic/accessibility@1.0.3
    - @sometic/core@1.0.3
    - @sometic/date-core@1.0.3
    - @sometic/positioning@0.1.3
    - @sometic/styling@1.0.3

## 1.0.2

### Patch Changes

- c2f3d2b: Add docs Copy links on package Install sections. npm cannot host clipboard buttons, so READMEs point at docs install controls.
- Updated dependencies [c2f3d2b]
    - @sometic/accessibility@1.0.2
    - @sometic/core@1.0.2
    - @sometic/date-core@1.0.2
    - @sometic/positioning@0.1.2
    - @sometic/styling@1.0.2

## 1.0.1

### Patch Changes

- adc1fbd: Fix npm package metadata and consumer READMEs: real GitHub repository and bugs URLs, keywords on every publishable package, and deep npm-facing documentation with install and usage examples.
- Updated dependencies [adc1fbd]
    - @sometic/accessibility@1.0.1
    - @sometic/core@1.0.1
    - @sometic/date-core@1.0.1
    - @sometic/positioning@0.1.1
    - @sometic/styling@1.0.1

## 1.0.0

### Major Changes

- 68c9d30: Rename the public package scope from `@aitistack` to `@sometic` and custom elements from `aiti-*` to `sometic-*` (Sometic product identity, ADR-0012). Update imports and element tags accordingly. No compatibility shims.

### Minor Changes

- 68c9d30: Beta Harden: Sometic-only public API and docs (`SometicError`, `sometic` defaults), professional component documentation, release workflow. Breaking for local clones that relied on `SometicError` / `aitistack` storage keys / `aiti-*` class names.
- 68c9d30: Phase 18 Option A: checkbox, radio, switch, and select engines with Wave A adapters.
- 68c9d30: Phase 19 Option A: positioning engine + Dialog/Popover/Tooltip/Toast/Alert overlay surfaces.
- 68c9d30: Phase 7 button family: shared DOM engines plus React, Vue, and Web Component adapters.
- 68c9d30: Phase 8: Field + Input family engines, date adapter boundary, Wave A adapters, playground coverage.

### Patch Changes

- 68c9d30: Phase 15: elements platform (registration, Shadow opt-in, typed events, tag maps) and CE surface parity (async-button + remaining input elements).
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
    - @sometic/core@1.0.0
    - @sometic/styling@1.0.0
    - @sometic/accessibility@1.0.0
    - @sometic/positioning@0.1.0
    - @sometic/date-core@1.0.0

## 0.0.1

- Initial Phase 7 release: button, icon-button, toggle-button, async-button, button-group.
