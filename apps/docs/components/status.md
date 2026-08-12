# Status

Empty, error, offline, and conflict chrome from `@sometic/dom/status`. `resolveStatus` returns a pure view model (role, live region, `data-status`, default title) for the state a list, table, or panel is in; `resolveConflictStatus` adds local and remote version labels; `resolveStatusAction` gives the recovery button its attributes; `bindOfflineRecovery` re-runs your callback when the browser comes back online. No markup and no CSS ship: you own both.

::: tip System standout: four status kinds, one contract
Empty, error, offline, and conflict share `resolveStatus` / `resolveStatusAction` so tables, forms, and uploads can reuse the same card slots and action buttons.
:::

<PreviewStatus />

## Usage

::: code-group

```js [JS]
import { resolveStatus, resolveStatusAction } from "@sometic/dom/status";

const panel = document.querySelector("#panel");
const view = resolveStatus({ kind: "empty", hasAction: true, title: "No rows" });

panel.className = view.className;
for (const [key, value] of Object.entries(view.attributes)) {
    panel.setAttribute(key, value);
}

const heading = document.createElement("h3");
heading.textContent = view.title;

const retry = document.createElement("button");
const actionView = resolveStatusAction();
for (const [key, value] of Object.entries(actionView.attributes)) {
    retry.setAttribute(key, value);
}
retry.textContent = "Create the first row";

panel.replaceChildren(heading, retry);
```

```ts [TS]
import {
    resolveStatus,
    resolveStatusAction,
    type StatusKind,
    type StatusViewModel,
} from "@sometic/dom/status";

export function renderStatus(panel: HTMLElement, kind: StatusKind): void {
    const view: StatusViewModel = resolveStatus({ kind, hasAction: true });
    panel.className = view.className;
    for (const [key, value] of Object.entries(view.attributes)) {
        panel.setAttribute(key, value);
    }

    const heading = document.createElement("h3");
    heading.textContent = view.title ?? kind;

    const action = document.createElement("button");
    for (const [key, value] of Object.entries(resolveStatusAction().attributes)) {
        action.setAttribute(key, value);
    }
    action.textContent = "Try again";

    panel.replaceChildren(heading, action);
}
```

```html [Vanilla]
<section id="status-panel"></section>

<script type="module">
    import {
        bindOfflineRecovery,
        resolveConflictStatus,
        resolveStatus,
        resolveStatusAction,
    } from "@sometic/dom/status";

    const panel = document.querySelector("#status-panel");

    const applyAttributes = (element, attributes) => {
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
    };

    function paint(kind) {
        const view =
            kind === "conflict"
                ? resolveConflictStatus({ kind: "conflict", hasAction: true })
                : resolveStatus({ kind, hasAction: true });

        panel.className = view.className;
        applyAttributes(panel, view.attributes);

        const title = document.createElement("h3");
        title.textContent = view.title;

        const description = document.createElement("p");
        description.textContent =
            kind === "conflict"
                ? `${view.localLabel} vs ${view.remoteLabel}`
                : (view.description ?? "");

        const action = document.createElement("button");
        applyAttributes(action, resolveStatusAction().attributes);
        action.textContent = kind === "offline" ? "Retry when online" : "Try again";

        panel.replaceChildren(title, description, action);
    }

    const stopOfflineRecovery = bindOfflineRecovery({
        onOnline: () => paint("empty"),
    });

    paint("offline");
</script>
```

:::

> Custom element not shipped for status surfaces; these are resolve-only view models.

**Resolve only.** There is no React, Vue, or custom element wrapper for status surfaces, and there does not need to be: the output is a small attribute bag you spread onto your own markup in any framework. Import `@sometic/dom/status` from React, Vue, or Vanilla alike.

## How it works

1. **Kind drives semantics**: `empty` and `offline` resolve to `role="status"` with `aria-live="polite"`; `error` and `conflict` resolve to `role="alert"` with `aria-live="assertive"`. Pass `live` to override, including `live: "off"` to drop the live region entirely.
2. **Titles have defaults**: `Nothing here yet`, `Something went wrong`, `You are offline`, `Conflicting changes`. Pass `title` to replace one; `description` has no default and is returned as-is.
3. **Attributes**: `data-slot="root"`, `data-status="<kind>"`, and `data-has-action="true" | "false"` so CSS can style the four states and the with-action variant without a class system.
4. **Actions are explicit**: `hasAction` is a declaration, not an inference. `resolveStatusAction` returns `type="button"`, `data-slot="action"`, and `disabled` plus `aria-disabled` when disabled.
5. **Conflict adds labels**: `resolveConflictStatus` forces `kind: "conflict"` and adds `localLabel` and `remoteLabel`, defaulting to `Your version` and `Server version`.
6. **Offline recovery is a callback**: `bindOfflineRecovery({ onOnline })` registers an `online` listener behind an `AbortController` and returns a dispose function. It never touches `window` at import time, accepts an injected `addEventListener` for tests, and no-ops when you pass no callback.
7. **Styling contract**: every resolver accepts the shared styleable options (`unstyled`, `classes`, `styles`, `cssVariables`, `defaults`, `variants`, `merge`), so a design system can inject classes without wrappers.

## Anatomy

| Part        | `data-slot`   | Role / notes                                                        |
| ----------- | ------------- | ------------------------------------------------------------------- |
| Root        | `root`        | `role="status"` or `role="alert"`, `data-status`, `data-has-action` |
| Title       | `title`       | Your heading element; text comes from `view.title`                  |
| Description | `description` | Optional supporting text                                            |
| Actions     | `actions`     | Optional wrapper for one or more recovery controls                  |
| Action      | `action`      | Button attributes from `resolveStatusAction`                        |

`title`, `description`, and `actions` are slot names in the styling contract (`classes.title`, `styles.actions`), so you can target them even though the resolver does not render them.

## Props / attributes

### `resolveStatus(options)`

| Option                                                                           | Type                                            | Default      | Description                                 |
| -------------------------------------------------------------------------------- | ----------------------------------------------- | ------------ | ------------------------------------------- |
| `kind`                                                                           | `"empty" \| "error" \| "offline" \| "conflict"` | **required** | Drives role, live region, and default title |
| `title`                                                                          | `string`                                        | per kind     | Overrides the default title                 |
| `description`                                                                    | `string`                                        | -            | Returned as-is, never invented              |
| `hasAction`                                                                      | `boolean`                                       | `false`      | Sets `data-has-action` and `view.hasAction` |
| `live`                                                                           | `"polite" \| "assertive" \| "off"`              | per kind     | Overrides the live region                   |
| `unstyled`, `classes`, `styles`, `cssVariables`, `defaults`, `variants`, `merge` | styling contract                                | -            | Shared with every Sometic resolver          |

Returns `{ kind, title, description, hasAction, className, style, attributes }`.

### `resolveStatusAction(options?)`

| Option           | Type      | Default | Description                                |
| ---------------- | --------- | ------- | ------------------------------------------ |
| `disabled`       | `boolean` | `false` | Adds `disabled` and `aria-disabled="true"` |
| styling contract | -         | -       | Same slots as above (`root`)               |

Returns `{ disabled, className, style, attributes }`.

### `resolveConflictStatus(options)`

Everything `resolveStatus` takes (with `kind` forced to `conflict`) plus `versions: { localLabel?, remoteLabel? }`. Returns the status view model plus `localLabel` and `remoteLabel`.

### `bindOfflineRecovery(options?)`

| Option             | Type                        | Default      | Description                                 |
| ------------------ | --------------------------- | ------------ | ------------------------------------------- |
| `onOnline`         | `() => void`                | -            | Called on the `online` event; omit to no-op |
| `addEventListener` | injected listener registrar | `globalThis` | For tests and non-browser hosts             |
| `signal`           | `AbortSignal`               | -            | Ties the listener to an existing lifecycle  |

Returns a dispose function. Already-aborted signals skip registration entirely.

### React and Vue

No components ship. Call the resolvers in render and spread the result:

```tsx
import { resolveStatus } from "@sometic/dom/status";

export function EmptyRows(): JSX.Element {
    const view = resolveStatus({ kind: "empty", hasAction: true, title: "No rows" });
    return (
        <div className={view.className} style={view.style} {...view.attributes}>
            <h3 data-slot="title">{view.title}</h3>
        </div>
    );
}
```

### Custom element

**CE not shipped.** Status surfaces are resolve-only by design.

## Events / callbacks

| Surface               | Event                         | Payload |
| --------------------- | ----------------------------- | ------- |
| Resolvers             | none, they are pure functions | -       |
| `bindOfflineRecovery` | `onOnline`                    | none    |
| React / Vue           | your own props                | -       |
| Custom element        | -                             | -       |

Recovery is intentionally a callback rather than an automatic refetch: only your app knows whether coming back online should retry a mutation, revalidate a query, or do nothing.

## Controlled vs uncontrolled

There is no internal state. Which kind renders is entirely your decision, derived from your data: `rows.length === 0` gives `empty`, a rejected request gives `error`, `navigator.onLine === false` or a network error gives `offline`, and a version mismatch gives `conflict`. Because the resolvers are pure, they are safe to call on every render, on the server, and inside `useMemo` alike.

## Accessibility

- Roles are chosen for you and match severity: `status` (polite) for empty and offline, `alert` (assertive) for error and conflict. That prevents the common bug of announcing an empty list as urgently as a failure.
- Override with `live` when context demands it, for example `live: "off"` for a status that is already inside a live region, which avoids double announcements.
- Give the region a heading whose text matches `view.title`, so sighted and screen reader users get the same message.
- Recovery actions are real buttons with `type="button"`, so they never submit a surrounding form by accident.
- Disabled actions carry both `disabled` and `aria-disabled="true"`, so the state is announced rather than only visually greyed.
- Conflict labels (`Your version`, `Server version`) are provided as strings so you can localize them and label the two panes explicitly instead of relying on left and right positioning.
- Do not swap a table's content for a status region without moving focus deliberately, otherwise focus can land on `<body>` after a refetch.

## Styling

Unstyled. Target `[data-status="empty"]`, `[data-status="error"]`, `[data-status="offline"]`, `[data-status="conflict"]`, and `[data-has-action="true"]`. Slot names (`root`, `title`, `description`, `actions`) work with the shared styling contract, so `classes: { root: "card", title: "h3" }` and `cssVariables: { "--gap": "1rem" }` both flow through `resolveStyleable`. Keep one status stylesheet for the whole app: the same four kinds appear under tables, uploads, approvals, and inboxes.

## Edge cases

- **No action**: `hasAction: false` (the default) sets `data-has-action="false"`, so CSS can collapse the action area rather than leaving a gap.
- **Custom `live`**: `"off"` removes `aria-live` entirely but keeps the role, which is right when a parent already announces.
- **Missing description**: stays `undefined`. The resolver never invents copy, so your empty state cannot ship placeholder text by accident.
- **Conflict outside conflict UI**: `resolveConflictStatus` always returns `kind: "conflict"` even if you pass another kind, so the labels and the semantics stay in agreement.
- **`bindOfflineRecovery` without `onOnline`** returns a no-op dispose and registers nothing.
- **Aborted signal**: passing an already-aborted `signal` skips registration, which makes it safe in strict-mode double effects.
- **Non-browser host**: with no `globalThis.addEventListener`, registration is skipped instead of throwing, so SSR and Node tests are safe.
- **Double dispose** is harmless; the controller abort is idempotent.
- **Offline detection is a hint**: `online` fires for interface changes, not reachability. Treat recovery as "try again now", not "the network works".
- **SSR**: all four resolvers are pure and can render on the server. Only `bindOfflineRecovery` needs a browser, and it degrades quietly.

## Performance notes

The resolvers are pure functions over a small options object with no allocation beyond the returned view model, so calling them per render is fine and memoizing is usually unnecessary. `bindOfflineRecovery` adds exactly one listener per call, tied to an `AbortController`; dispose it with your component (or pass `signal`) so route changes do not accumulate listeners. The `@sometic/dom/status` subpath is tiny and tracked by its own `size-limit` entry, so importing it does not pull the rest of the DOM package.

## When to use / When not

**Use** when a list, table, panel, or upload area needs consistent empty, error, offline, and conflict chrome with correct roles and live regions, shared across React, Vue, and Vanilla.

**Do not use** for inline field validation (that is [Form](/components/form) feedback), for transient confirmations ([Toast](/components/toast)), or for a persistent inline message that is not one of the four kinds ([Alert](/components/alert)). Conflict here is dual-version chrome for optimistic merge UI, not a generic warning. Prefer a design-system Empty component when you need illustration kits; keep Sometic when the same resolve contract must work in Vanilla and adapters.

## FAQ

**Why are error and conflict assertive?** Because both block the user's intent: something failed, or their edit collides with someone else's. Empty and offline are informational, so they stay polite. Override with `live` when your context differs.

**Do I have to use the default titles?** No. They exist so a quick empty state is never blank, but real products should pass domain copy (`No invoices for this period`) and localize it.

**How do I detect offline?** However your app already does: `navigator.onLine`, a failed request, or your HTTP layer. The resolver only renders the state; `bindOfflineRecovery` tells you when the browser thinks the connection is back.

**Does it refetch when I come back online?** No, and that is deliberate. `onOnline` is your hook: revalidate with [Query](/utilities/query), retry a mutation, or just re-enable a button.

**How do I render a conflict merge UI?** Use `resolveConflictStatus` for the region and labels, then render the two versions side by side yourself with the labels as headings. The engine does not diff or merge.

**Why is there no React component?** Because there is nothing to own: no state, no effects, no lifecycle. A component would only spread the same attributes, so the resolver plus your markup is smaller and more flexible.

**Are the four state pages different components?** No. [Empty state](/components/empty-state), [Error state](/components/error-state), [Offline state](/components/offline-state), and [Conflict state](/components/conflict-state) are the same resolvers with a different `kind`.

**Can I add my own kinds?** Not through `kind`, which is a closed union so semantics stay predictable. Add your own `data-*` attribute alongside the resolved ones for product-specific variants.

**Alert or status?** [Alert](/components/alert) is a general inline message component. Status surfaces are the standard chrome for the four data-state cases and are what the data table, upload, approval, and notification demos share.

## Related links

- [Empty state](/components/empty-state)
- [Error state](/components/error-state)
- [Offline state](/components/offline-state)
- [Conflict state](/components/conflict-state)
- [Alert](/components/alert)
- [Toast](/components/toast)
- [Data table](/components/data-table)
- [Accessibility](/guide/accessibility)
- [Styling slots](/concepts/styling-slots)
