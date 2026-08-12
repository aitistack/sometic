# Status

Shared empty, error, offline, and conflict view models from `@sometic/dom/status`. Pure resolve helpers (plus offline recovery bind). No React shell and no custom element: apply attributes to your markup. Short pages for each kind link here.

::: tip System standout: four status kinds, one contract
Empty, error, offline, and conflict share `resolveStatus` / `resolveStatusAction` so tables, forms, and uploads can reuse the same card slots and action buttons.
:::

<PreviewStatus />

## Usage

::: code-group

```tsx [JS]
import { resolveStatus, resolveStatusAction } from "@sometic/dom/status";

export function EmptyPeople() {
    const view = resolveStatus({
        kind: "empty",
        hasAction: true,
        title: "No people",
        description: "No rows match the name and role filters.",
    });
    const action = resolveStatusAction();

    return (
        <div className={view.className} style={view.style} {...view.attributes}>
            <h3>{view.title}</h3>
            <p>{view.description}</p>
            <button type="button" {...action.attributes}>
                Clear filters
            </button>
        </div>
    );
}
```

```tsx [TS]
import {
    resolveStatus,
    resolveStatusAction,
    type StatusViewModel,
} from "@sometic/dom/status";

export function EmptyPeople(): JSX.Element {
    const view: StatusViewModel = resolveStatus({
        kind: "empty",
        hasAction: true,
        title: "No people",
        description: "No rows match the name and role filters.",
    });
    const action = resolveStatusAction();

    return (
        <div className={view.className} style={view.style} {...view.attributes}>
            <h3>{view.title}</h3>
            <p>{view.description}</p>
            <button type="button" {...action.attributes}>
                Clear filters
            </button>
        </div>
    );
}
```

```js [Vanilla]
import {
    resolveStatus,
    resolveConflictStatus,
    resolveStatusAction,
    bindOfflineRecovery,
} from "@sometic/dom/status";

const panel = document.querySelector("#status");
const view = resolveStatus({ kind: "offline", hasAction: true });
panel.className = view.className;
for (const [key, value] of Object.entries(view.attributes)) {
    panel.setAttribute(key, value);
}
panel.querySelector("h3").textContent = view.title;

const action = resolveStatusAction();
const button = panel.querySelector("[data-slot='action']");
for (const [key, value] of Object.entries(action.attributes)) {
    button.setAttribute(key, value);
}

const stop = bindOfflineRecovery({
    onOnline: () => {
        panel.textContent = "Back online";
    },
});
```

:::

> Custom element **not shipped**. Kind-specific docs: [Empty](/components/empty-state), [Error](/components/error-state), [Offline](/components/offline-state), [Conflict](/components/conflict-state).

## How it works

1. **`resolveStatus({ kind })`**: returns class/style/attributes. Defaults titles per kind. `role="alert"` + assertive live for error/conflict; `role="status"` + polite for empty/offline.
2. **`resolveStatusAction`**: button attributes (`data-slot="action"`, disabled wiring).
3. **`resolveConflictStatus`**: conflict root plus `localLabel` / `remoteLabel` (defaults "Your version" / "Server version").
4. **`bindOfflineRecovery`**: registers `online` without reading `window` at import time; returns a disposer.

## Anatomy

| Part | Role |
| ---- | ---- |
| Root | `status` or `alert` + `data-status` |
| Title / description | App-owned text nodes |
| Actions | Optional `resolveStatusAction` button |
| Conflict labels | Local / remote version captions |

## Props / attributes

### `ResolveStatusOptions`

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `kind` | `empty` \| `error` \| `offline` \| `conflict` | required | Surface kind |
| `title` | `string` | per-kind default | Heading |
| `description` | `string` | `-` | Supporting copy |
| `hasAction` | `boolean` | `false` | `data-has-action` |
| `live` | `polite` \| `assertive` \| `off` | kind default | `aria-live` |
| Styling | `unstyled`, `classes`, `styles`, `cssVariables` | `-` | Styleable root |

### Conflict

`resolveConflictStatus` accepts the same options plus `versions: { localLabel?, remoteLabel? }`.

### Offline recovery

| Option | Type | Description |
| ------ | ---- | ----------- |
| `onOnline` | `() => void` | Callback when back online |
| `addEventListener` | injectable | Test seam |
| `signal` | `AbortSignal` | Auto-dispose |

## Events / callbacks

Resolve helpers are pure (no events). `bindOfflineRecovery` invokes `onOnline` when the environment fires `online`.

## Controlled vs uncontrolled

Status is a view model, not a controller. Your app decides which `kind` to show from load/error/offline/conflict state.

## Accessibility

- Match role/live defaults unless you have a reason to override with `live: "off"`.
- Keep a clear title; prefer description for recovery hints.
- Action buttons should be real `<button type="button">` with the resolve attributes.
- Do not use conflict dual labels for generic alerts.

## Styling

Target `[data-status]`, `[data-slot="root"|"action"]`, `[data-has-action]`, `[role="status"|"alert"]`. Compose with your empty/error illustrations; helpers stay unstyled.

## Edge cases

- **Missing action**, omit the button and leave `hasAction: false`.
- **Conflict without versions**, defaults to Your version / Server version.
- **Offline bind without `onOnline`**, disposer no-ops.
- **SSR**, call resolve anytime (pure); only bind recovery in the browser.

## Performance notes

Resolve is cheap and pure. Avoid rebinding offline recovery every render; keep one disposer per page.

## When to use / When not

**Use** for consistent empty/error/offline/conflict chrome on tables, uploads, and panels.

**Do not use** for field validation ([Form](/components/form) feedback), transient toasts ([Toast](/components/toast)), or blocking modals ([Dialog](/components/dialog)).

## FAQ

**Why four kinds?** Shared roles and live defaults so Product, Data table, and Upload demos stay consistent.

**React package?** Use `@sometic/dom/status` from React as shown; no dedicated component.

**Assertive vs polite?** Errors and conflicts assert; empty/offline stay polite unless overridden.

**CE?** Not shipped.

**Playground?** Vanilla `#status` gallery exercises all four kinds.

## Related links

- [Empty state](/components/empty-state)
- [Error state](/components/error-state)
- [Offline state](/components/offline-state)
- [Conflict state](/components/conflict-state)
- [Alert](/components/alert)
- [Toast](/components/toast)
- [Data table](/components/data-table)
