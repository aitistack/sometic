# Public API Policy

## What Is Public

Only exports reachable through package `exports` maps are public. Deep imports into `dist/internal/**` or undeclared paths are unsupported and may break at any time.

## API Design Rules

### Predictability

Shared conventions across modules:

`value` · `defaultValue` · `onValueChange` · `disabled` · `readonly` · `required` · `invalid` · `loading` · `unstyled` · `classes` · `styles` · `cssVariables` · `size` · `variant`

### Controlled and Uncontrolled

Interactive components support both where appropriate.

- Controlled values are not silently overridden
- Uncontrolled state initializes from `defaultValue` / defaults
- Changing `defaultValue` after init does not behave like controlling `value`

### Events

Preserve native events. Add high-level events only for high-level behavior (e.g. action success/error), never as wholesale replacements for `click`/`input`/`change`.

### Errors

Typed errors with:

- Stable machine-readable codes
- Preserved `cause` chains
- Safe-to-log messages (no secrets)
- Documentation and tests

### TypeScript / JavaScript

- Strict types; no `any` on public surfaces
- Generics and narrow unions for IntelliSense
- JSDoc on public declaration surfaces
- JavaScript consumers supported via emitted `.d.ts`

### Tree-shaking and Subpaths

Support:

```ts
import { Button } from "@sometic/react";
import { Button } from "@sometic/react/button";
```

Do not force full-package imports for single components.

## Change Control

Before changing public APIs:

1. Search all usages
2. Review API documentation and tests
3. Classify breaking vs non-breaking
4. Update migration docs when needed
5. Add a Changeset

## Internal APIs

- Prefix or folder-convention for internals (`internal`, `@sometic/*/internal` not exported)
- Never re-export internals from root entry accidentally
- Phase 1 tooling should validate export surfaces

## Source Generation Boundaries

| May generate into consumer repos | Must remain package-based                          |
| -------------------------------- | -------------------------------------------------- |
| Wrappers, compositions, styles   | Auth refresh / session / OAuth security flows      |
| Theme/config facades             | Cross-tab session coordination                     |
| Framework facade files           | Core events, store internals, validation internals |
| Consumer-owned variants          | Critical a11y behavior, provider adapters          |

Hybrid mode (package logic + source-owned visuals/integration) is the recommended default install mode. See ADR-0007.

## Related

- ADR-0005 External store contract
- ADR-0007 Source generation versus packages
- ADR-0009 Framework adapter contract
- `versioning-and-releases.md`
