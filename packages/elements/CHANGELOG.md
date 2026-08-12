# Changelog

## 1.0.5

### Patch Changes

- Updated dependencies [179a92a]
    - @sometic/dom@1.1.0

## 1.0.4

### Patch Changes

- b996efd: Clean package Install sections: commands only, no meta copy about npm clipboard limits.
- Updated dependencies [b996efd]
    - @sometic/auth@1.0.4
    - @sometic/date-core@1.0.4
    - @sometic/date-native@1.0.4
    - @sometic/dom@1.0.4
    - @sometic/forms@1.0.4
    - @sometic/validation@1.0.4

## 1.0.3

### Patch Changes

- ea4e41a: Clarify npm README install CTAs and ship docs Installation sections with always-visible Copy buttons via InstallCommands (npm cannot host clipboard UI).
- Updated dependencies [ea4e41a]
    - @sometic/auth@1.0.3
    - @sometic/date-core@1.0.3
    - @sometic/date-native@1.0.3
    - @sometic/dom@1.0.3
    - @sometic/forms@1.0.3
    - @sometic/validation@1.0.3

## 1.0.2

### Patch Changes

- c2f3d2b: Add docs Copy links on package Install sections. npm cannot host clipboard buttons, so READMEs point at docs install controls.
- Updated dependencies [c2f3d2b]
    - @sometic/auth@1.0.2
    - @sometic/date-core@1.0.2
    - @sometic/date-native@1.0.2
    - @sometic/dom@1.0.2
    - @sometic/forms@1.0.2
    - @sometic/validation@1.0.2

## 1.0.1

### Patch Changes

- adc1fbd: Fix npm package metadata and consumer READMEs: real GitHub repository and bugs URLs, keywords on every publishable package, and deep npm-facing documentation with install and usage examples.
- Updated dependencies [adc1fbd]
    - @sometic/auth@1.0.1
    - @sometic/date-core@1.0.1
    - @sometic/date-native@1.0.1
    - @sometic/dom@1.0.1
    - @sometic/forms@1.0.1
    - @sometic/validation@1.0.1

## 1.0.0

### Major Changes

- 68c9d30: Rename the public package scope from `@aitistack` to `@sometic` and custom elements from `aiti-*` to `sometic-*` (Sometic product identity, ADR-0012). Update imports and element tags accordingly. No compatibility shims.

### Minor Changes

- 68c9d30: Beta Harden: Sometic-only public API and docs (`SometicError`, `sometic` defaults), professional component documentation, release workflow. Breaking for local clones that relied on `AitiStackError` / `aitistack` storage keys / `aiti-*` class names.
- 68c9d30: Phase 10: provider-independent auth orchestration with Wave A adapters, test provider, and playground `#auth`.
- 68c9d30: Phase 15: elements platform (registration, Shadow opt-in, typed events, tag maps) and CE surface parity (async-button + remaining input elements).
- 68c9d30: Phase 18 Option A: checkbox, radio, switch, and select engines with Wave A adapters.
- 68c9d30: Phase 19 Option A: positioning engine + Dialog/Popover/Tooltip/Toast/Alert overlay surfaces.
- 68c9d30: Phase 7 button family: shared DOM engines plus React, Vue, and Web Component adapters.
- 68c9d30: Phase 8: Field + Input family engines, date adapter boundary, Wave A adapters, playground coverage.
- 68c9d30: Phase 9: validation API + form engine with Wave A adapters and playground coverage.

### Patch Changes

- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
    - @sometic/dom@1.0.0
    - @sometic/validation@1.0.0
    - @sometic/forms@1.0.0
    - @sometic/auth@1.0.0
    - @sometic/date-core@1.0.0
    - @sometic/date-native@1.0.0

## 0.0.1

- Initial Phase 7 Light DOM button custom elements.
