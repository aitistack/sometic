# Beta maturity

Sometic `@sometic` packages are published as a **public beta**.

## Stability labels

| Label            | Meaning                                                                                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Beta**         | APIs are usable and tested; breaking changes may land in `0.x` minors with changelog notes                                                                                                                     |
| **Experimental** | Wave B adapters (Angular, Svelte, Solid, Preact) and Wave C (Alpine, jQuery, HTMX), contracts only; prefer React / Vue / Elements for production apps                                                          |
| **Deferred**     | Richer selection polish (multi-select, tags, sliders), date/time **picker UI**, command palette, **data tables**, feature flags / offline queue — not `@sometic/query` (server-state cache ships in this beta) |

## Supported runtimes (beta)

- TypeScript / JavaScript
- React
- Vue
- Vanilla DOM / Web Components (`sometic-*`)

## Package set (beta)

Foundation: `core`, `events`, `store`, `store-immer`, `styling`, `theme`, `accessibility`, `positioning`, `dom`, `validation`, `date-*`

Application: `forms`, `auth`, `auth-local`, `auth-firebase`, `auth-supabase`, `auth-oidc`, `http`, `query`, `head`

Adapters: `react`, `vue`, `elements`, `cli`, `registry`

## Known limitations

- **Dialog (React / Vue)** uses `createDialogController` → modal `createOverlayController` (focus trap, body scroll lock, Escape dismiss). Outside press does not dismiss. Pass `titleId` / `descriptionId` (or `aria-label`) for an accessible name; optional `getTrigger` is available on the DOM controller for return-focus wiring.
- **Popover / Tooltip (React / Vue)** remain resolve-only open shells; full positioning, delay timers, and dismiss layers live on DOM controllers and `sometic-*` custom elements.
- Theme CSS variable prefix and storage keys default to `sometic` (not configurable legacy names).
- Errors are `SometicError` (`isSometicError`).
- First-party positioning only; Floating UI adapter is a future opt-in.
- Menu, Drawer, Context menu, Combobox, Tabs, Accordion, and feedback surfaces (Progress, Spinner, Skeleton, Badge) ship in this beta. **`@sometic/query` ships** for server-state caching; **data table UI engines** and rich query-builder catalogs remain deferred. Autocomplete polish, multi-select, and date/time picker UI remain deferred — do not treat Popover/Select as stand-ins for those.

## Feedback

Use the GitHub issue templates (**Bug report** / **Feature request**) on this repository. Include reproduction steps, package versions, and framework.

Want to send a fix or docs PR? See [Contributing](/guide/contributing).
