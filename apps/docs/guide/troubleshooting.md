# Troubleshooting

Quick fixes for common consumer issues. For maturity and known beta limits, see [Beta maturity](/releases/beta).

## Install and resolve

### Package not found / wrong scope

Install from the `@sometic` scope only (for example `@sometic/react`). Older or alternate scopes are not published.

### Peer dependency warnings

Wave A adapters expect:

- `@sometic/react` → `react` `^18 || ^19`
- `@sometic/vue` → `vue` `^3.5`

Install the peer in the application. Adapters do not bundle React or Vue.

### Subpath export errors

Import published subpaths only (`@sometic/react/button`, not deep `dist` paths). Check [Compatibility](/frameworks/compatibility) for the map.

## Components and elements

### Custom element not upgrading

1. Import the elements subpath or call `register*Elements()` in the browser.
2. Confirm the tag uses the `sometic-*` prefix.
3. Ensure a single version of `@sometic/elements` is on the page.

### Button looks unstyled

Expected. Cores are unstyled. Add classes, theme CSS variables, or CLI-generated wrappers. See [Styling](/guide/styling).

### Dialog focus / outside click

Modal dialog traps focus and locks scroll; Escape dismisses. Outside press does not dismiss in the current beta. Pass `titleId` / `descriptionId` (or an accessible name). See [Beta maturity](/releases/beta).

### Controlled input does not move

If `value` is set, you must update it from `onValueChange` (or the framework equivalent). Passing `value` without a change handler freezes the control by design.

## Forms, auth, HTTP

### Form submit does nothing useful

`Form` expects `onValid` (and optional `onInvalid`), not a generic `onSubmit` prop. See [Form](/components/form) and framework guides.

### Auth cannot secure APIs

Client auth is UX orchestration. Enforce authorization on the server. Policies like `requirePermission` only reflect client session claims.

### HTTP 401 loops

Configure the auth refresh queue and interceptors intentionally. Dispose clients when remounting apps so queues do not stack.

## Store and adapters

### `useStore` re-renders too often

Pass a selector (and equality function on React) so you subscribe to a slice, not the whole state.

### Wave B / C “missing components”

Angular, Svelte, Solid, Preact, Alpine, jQuery, and HTMX packages are Experimental and limited to `storeBind` (plus `button` on Wave C). They are not incomplete React ports. See [Frameworks](/frameworks/).

## SSR

### `window is not defined`

A module touched browser globals at import time, or application code did. Sometic packages must not; create DOM work after mount. See [SSR](/guide/ssr).

### Hydration mismatch

Server HTML must match the client’s first paint. Avoid rendering overlay open state or CE-only attributes differently on the server.

## CLI

### `sometic.config.json` already exists

Pass `--force` to recreate (backs up under `.sometic/backup` when writing). Use `--dry-run` to preview.

### `diff` / `update` / `doctor` do nothing useful

Those commands are **not implemented** yet. They print a deferred message. Use `init`, `add`, `list`, `info`, and `config`. Details: [CLI](/guide/cli).

## Still stuck

1. Confirm package versions and Wave label ([Beta maturity](/releases/beta)).
2. Reproduce with a minimal import of one subpath.
3. File a GitHub bug with framework, versions, and steps.

## Related

- [CLI](/guide/cli)
- [Components](/components/)
- [Stores](/stores/)
- [Frameworks](/frameworks/)
- [Beta maturity](/releases/beta)
