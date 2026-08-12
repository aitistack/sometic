# Offline state

Offline panel chrome built on [`resolveStatus({ kind: "offline" })`](/components/status), optionally paired with `bindOfflineRecovery`. Prefer the shared Status page for full API detail.

<PreviewStatus />

## Usage

::: code-group

```tsx [JS]
import { resolveStatus, bindOfflineRecovery } from "@sometic/dom/status";

const view = resolveStatus({
    kind: "offline",
    hasAction: true,
    title: "You are offline",
    description: "Reconnect to refresh Person rows and roles.",
});

const stop = bindOfflineRecovery({
    onOnline: () => console.log("retry fetch"),
});
```

```tsx [TS]
import {
    resolveStatus,
    bindOfflineRecovery,
    type StatusViewModel,
} from "@sometic/dom/status";

const view: StatusViewModel = resolveStatus({
    kind: "offline",
    hasAction: true,
    title: "You are offline",
    description: "Reconnect to refresh Person rows and roles.",
});

const stop = bindOfflineRecovery({
    onOnline: () => {
        console.log("retry fetch");
    },
});
```

```js [Vanilla]
import { resolveStatus, bindOfflineRecovery } from "@sometic/dom/status";

const view = resolveStatus({ kind: "offline", hasAction: true });
const root = document.querySelector("#offline");
for (const [key, value] of Object.entries(view.attributes)) {
    root.setAttribute(key, value);
}

const stop = bindOfflineRecovery({
    onOnline: () => root.replaceChildren(document.createTextNode("Back online")),
});
```

:::

Custom element **not shipped**. Full spine: [Status](/components/status).

## Related links

- [Status](/components/status)
- [Error state](/components/error-state)
- [Conflict state](/components/conflict-state)
