# Beta maturity

Sometic `@sometic` packages are a **public beta**. Beta is a **maturity label**, not a single npm version. Each package versions independently via Changesets. A `1.x` number is not a promise of Level 3 stable APIs.

## Stability labels

| Label            | Meaning                                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Beta**         | Usable and tested Wave A engines and adapters. Breaking changes may land in minors; they are called out in Changesets and [Upgrade](/releases/upgrade).           |
| **Experimental** | Wave B adapters (Angular, Svelte, Solid, Preact) and Wave C (Alpine, jQuery, HTMX). Contracts and thin binds only. Prefer React, Vue, or Elements for production. |
| **Deferred**     | Surfaces that are **not** in this beta. Engines that already ship stay **Beta**; missing custom elements for those engines are deferred, not the engines.         |

Inventory source of truth: [What’s included](/guide/whats-included). Catalog with labels: [Package index](/api/packages).

## How to read npm versions

- Do not expect every package to share one version (there is no coordinated `0.1.0-beta` line).
- Pin the versions you install. Read that package’s `CHANGELOG.md` when you bump.
- Pre-1.0 packages may break more often than `1.x` packages; both can still be **Beta** maturity.

## Supported runtimes (beta)

Claimed only where automated tests exist (Vitest, Playwright). Not a WCAG or browser-vendor certification.

- TypeScript / JavaScript
- React 18 or 19
- Vue 3.5+
- Vanilla DOM / Web Components (`sometic-*` where listed as shipped)
- Node.js `>=20.18.0` for tooling and SSR imports that avoid browser globals at evaluation time
- Evergreen Chrome, Firefox, Safari, and Edge (see [Browser support](/guide/browser-support))

## Package set (beta)

Foundation: `core`, `events`, `store`, `store-immer`, `styling`, `theme`, `accessibility`, `positioning`, `dom`, `validation`, `validation-zod`, `validation-yup`, `date-*`

Application: `forms`, `auth`, `auth-local`, `auth-firebase`, `auth-supabase`, `auth-oidc`, `http`, `query`, `query-builder`, `data-table`, `upload`, `activity`, `approval`, `notifications`, `head`, `app-shell`, `feature-flags`, `drafts`, `commands`, `history`, `conflict`, `offline-queue`, plus `createPermissionController` on `@sometic/auth`

Adapters and tooling: `react`, `vue`, `elements`, `cli`, `registry`

Experimental (not the production path): `angular`, `svelte`, `solid`, `preact`, `alpine`, `jquery`, `htmx`

## Known limitations

- **Dialog (React / Vue)** uses modal overlay behavior (focus trap, body scroll lock, Escape). Outside press does not dismiss. Pass `titleId` / `descriptionId` (or `aria-label`) for an accessible name.
- **Popover / Tooltip (React / Vue)** remain resolve-only open shells; full positioning, delay timers, and dismiss layers live on DOM controllers and shipped `sometic-*` elements.
- **Custom elements** do not cover every Wave A engine. Menu, Context menu, Drawer, Tabs, Accordion, Breadcrumb, Command palette, Tree, Combobox, and data/app-primitive CEs are not shipped. Use React, Vue, or `@sometic/dom` for those. See [What’s included](/guide/whats-included).
- Theme CSS variable prefix and storage keys default to `sometic`.
- Errors are `SometicError` (`isSometicError`).
- First-party positioning only; a Floating UI adapter is deferred.
- Richer selection polish (multi-select, tags, sliders), date/time **picker UI**, and remaining nav chrome (pagination, stepper, timeline, split panes) remain deferred.

## Telemetry

`@sometic/*` packages do **not** send usage or analytics data to Sometic. There is no phone-home, crash reporter, or optional telemetry SDK in the libraries. The documentation site’s practices are described in [Privacy](/legal/privacy).

## Feedback

Use the GitHub issue templates (**Bug report** / **Feature request**) on the [packages repository](https://github.com/aitistack/sometic/issues). Include reproduction steps, **package names and versions**, and framework. Security issues go to [GitHub Security Advisories](https://github.com/aitistack/sometic/security/advisories/new), not public issues.

Want to send a fix or docs PR? See [Contributing](/guide/contributing). Breaking-change habits: [Upgrade](/releases/upgrade).
