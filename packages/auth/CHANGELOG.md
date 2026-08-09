# Changelog

## 1.0.0

### Major Changes

- 68c9d30: Rename the public package scope from `@aitistack` to `@sometic` and custom elements from `aiti-*` to `sometic-*` (Sometic product identity, ADR-0012). Update imports and element tags accordingly. No compatibility shims.

### Minor Changes

- 68c9d30: Beta Harden: Sometic-only public API and docs (`SometicError`, `sometic` defaults), professional component documentation, release workflow. Breaking for local clones that relied on `AitiStackError` / `aitistack` storage keys / `aiti-*` class names.
- 68c9d30: Phase 10: provider-independent auth orchestration with Wave A adapters, test provider, and playground `#auth`.
- 68c9d30: Phase 11: fetch-first HTTP client with auth refresh queue; professional headless auth API expansions.

### Patch Changes

- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
- Updated dependencies [68c9d30]
    - @sometic/core@1.0.0

## 0.0.1

- Initial Phase 10 release: auth orchestration, refresh coordinator, authorization helpers, test provider.
