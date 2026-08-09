# Changelog

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

- 68c9d30: Beta Harden: Sometic-only public API and docs (`SometicError`, `sometic` defaults), professional component documentation, release workflow. Breaking for local clones that relied on `AitiStackError` / `aitistack` storage keys / `aiti-*` class names.
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
