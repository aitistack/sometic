# Changelog

This page summarizes **product identity** and **beta themes** from Changesets in the monorepo. It does not invent published npm version numbers. For maturity labels and known limitations, use [Beta maturity](/releases/beta). Historical detail also accumulates in each package `CHANGELOG.md` after version publishes.

## Identity: Sometic (`@sometic`)

Public scope, custom element prefix, and docs brand were locked to **Sometic**:

- npm scope: `@sometic/*`
- Custom elements: `sometic-*`
- Errors: `SometicError` / `isSometicError`
- Theme CSS variable prefix and storage defaults: `sometic`

This replaces the earlier product codename and element prefix. There are **no compatibility shims**. Update imports and tags when moving older local clones. Beta Harden work also removed reliance on legacy error class names, storage keys, and class prefixes. See [Releases](/releases/) and [Beta maturity](/releases/beta).

## Beta track narrative

The public beta gathers Wave A foundations through overlays into a coherent consumer surface:

| Theme | What landed (Changeset themes) |
| ----- | ------------------------------ |
| Foundation | Core environment primitives, events, controllable state |
| Store | Universal store, persistence, cross-tab, optional Immer adapter |
| Styling & theme | Class/style/slot/state resolvers; tokens, CSS variables, theme controller |
| Accessibility & DOM | Focus, keyboard, dismiss, announce, observers; DOM engines |
| Button & input | Button family, field system, specialized inputs |
| Forms & validation | Form engine, validators, framework form adapters |
| Auth & HTTP | Provider-independent auth, fetch client with refresh queue |
| Auth providers | Optional local, Firebase, Supabase, OIDC adapters |
| Adapters | React/Vue parity expansions; Wave B store-bind foundations; Wave C Alpine/jQuery/HTMX |
| Elements | Registration platform, Shadow opt-in, CE surface parity |
| CLI | Registry + `sometic` CLI (`init` / `add` / list / info / config), hybrid default |
| Selection | Checkbox, radio, switch, select engines and Wave A adapters |
| Overlay | Positioning engine; Dialog, Popover, Tooltip, Toast, Alert |
| Beta release / harden | Dialog controller wiring on React/Vue; Sometic-only public API and docs polish |

Workspace may still report `0.0.x` until the coordinated beta version publish. Treat **`0.1.0-beta`** as the intended published track name in consumer docs.

## Honesty notes (do not over-read the table)

- **Experimental:** Wave B and Wave C packages are contracts-first; prefer React, Vue, or Elements for production.
- **Deferred:** Menu, Combobox, Drawer, Tabs, and related catalogs are not shipped. Select and Popover are not those APIs.
- **Overlay limits:** React/Vue Dialog uses modal overlay controller behavior (focus trap, Escape, scroll lock); outside press does not dismiss. Popover/Tooltip on React/Vue remain thinner than DOM/CE hosts for positioning and dismiss layers. Details: [Beta maturity](/releases/beta).

## Reading package changelogs

After a Changesets version publish:

1. Open the package’s `CHANGELOG.md` for exact version sections.
2. Cross-check breaking notes against [Beta maturity](/releases/beta).
3. Prefer subpath imports when adopting new entries ([Tree shaking](/concepts/tree-shaking)).

## Related links

- [Releases](/releases/)
- [Beta maturity](/releases/beta)
- [Package index](/api/packages)
- [API reference](/api/)
- [Architecture](/concepts/architecture)
