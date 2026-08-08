# Dependency Rules

## Direction (locked)

```text
Framework adapters
        ↓
DOM / elements / framework integration
        ↓
Feature packages (theme, forms, auth, http, …)
        ↓
Foundation packages (core, events, store, styling, accessibility, date-core)
```

Imports may only point **downward** (or sideways within the same layer when explicitly allowed and non-circular).

## Allowed Examples

- `@sometic/react` → feature/foundation packages → `@sometic/core`
- `@sometic/elements` → `@sometic/dom` → `@sometic/core`
- `@sometic/auth-firebase` → `@sometic/auth` → `@sometic/core`
- `@sometic/forms` → `@sometic/validation` → `@sometic/core`
- `@sometic/theme` → `@sometic/styling` → `@sometic/store` → `@sometic/core`

## Forbidden Examples

- Any foundation package importing a framework package
- `@sometic/auth` importing Firebase/Supabase SDKs
- `@sometic/styling` depending on Tailwind or Bootstrap at runtime
- Feature packages importing `apps/*`
- Circular dependencies of any kind
- Bundling peer frameworks into published adapter bundles

## Same-Layer Rules

- Foundation packages may depend on other foundation packages only with clear ownership (`store` → `events`/`core`, not the reverse creating cycles).
- Optional adapters may depend on their feature package + peers, never the reverse.
- `angularjs` must not be imported by modern packages.

## Mandatory Non-Dependencies of Cores

React, Vue, Angular, Svelte, Solid, Preact, jQuery, Alpine, HTMX, Firebase, Supabase, Axios, Day.js, date-fns, Immer, Tailwind, Bootstrap, icon libraries, CSS-in-JS libraries, schema validation libraries.

## Dependency Addition Protocol

Before adding any dependency:

1. Prefer browser or language APIs
2. Measure size impact
3. Check maintenance, TypeScript quality, tree-shaking, ESM, license, security, transitive cost
4. Document the reason (package README or ADR when material)
5. Prefer `peerDependencies` for frameworks and large optional libs
6. Confirm it does not invert the dependency graph

## Enforcement (Phase 1+)

- `dependency-cruiser` or equivalent circular-dependency CI
- Package boundary lint / ESLint `no-restricted-imports` per package
- Bundle analyzer ensuring peers are external
- PR checklist referencing this document

## Related

- ADR-0002 Framework-independent core
- ADR-0006 Authentication provider boundaries
- ADR-0008 Date adapter strategy
- `package-map.md`
