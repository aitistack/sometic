# Status surfaces

Empty, error, offline, and conflict view models from `@sometic/dom/status`. Shared by data table, upload, approval, and notification demos. Unstyled resolve only; you own the markup.

## When to use

Use these resolvers when a list, table, or panel needs a consistent empty/error/offline/conflict chrome with roles and live regions.

## When not to use

Do not use for inline field validation (forms feedback) or transient toasts (toast queue). Conflict dual-version labels are for optimistic merge UI, not generic alerts.

## Usage

::: code-group

```js [JS]
import { resolveStatus, resolveStatusAction } from "@sometic/dom/status";

const empty = resolveStatus({ kind: "empty", hasAction: true });
const action = resolveStatusAction();

const root = document.createElement("div");
Object.assign(root, { className: empty.className });
for (const [key, value] of Object.entries(empty.attributes)) {
    root.setAttribute(key, value);
}
root.innerHTML = `<h3>${empty.title}</h3>`;
```

```ts [TS]
import {
    resolveStatus,
    resolveStatusAction,
    type StatusViewModel,
} from "@sometic/dom/status";

const empty: StatusViewModel = resolveStatus({
    kind: "empty",
    hasAction: true,
    title: "No rows",
});
const action = resolveStatusAction();
```

```html [Vanilla]
<script type="module">
    import {
        resolveStatus,
        resolveConflictStatus,
        bindOfflineRecovery,
    } from "@sometic/dom/status";

    const view = resolveStatus({ kind: "offline", hasAction: true });
    const panel = document.querySelector("#status-panel");
    panel.dataset.status = view.kind;
    panel.setAttribute("role", view.attributes.role);
    bindOfflineRecovery({
        onOnline: () => panel.replaceChildren(document.createTextNode("Back online")),
    });
</script>
```

:::

## How it works

`resolveStatus` returns class/style/attributes for a status region. Errors and conflicts use `role="alert"` and assertive live regions by default. `resolveConflictStatus` adds local/remote labels. `bindOfflineRecovery` registers an `online` listener without touching `window` at import time.

## API

| Export | Role |
| ------ | ---- |
| `resolveStatus` | empty / error / offline / conflict root view model |
| `resolveStatusAction` | action button attributes |
| `resolveConflictStatus` | conflict + version labels |
| `bindOfflineRecovery` | dispose-able online callback |

## Edges

Missing action is explicit via `hasAction: false`. Dual conflict versions default to "Your version" / "Server version". Offline recovery is callback-only; you decide refetch.

## Playground

Vanilla playground section `#status` exercises all four kinds.

## Related

- [Alert](/components/alert)
- [Toast](/components/toast)
