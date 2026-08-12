# Conflict state

Optimistic-merge conflict chrome via [`resolveConflictStatus`](/components/status) (local/remote labels). Prefer the shared Status page for full API detail.

<PreviewStatus />

## Usage

::: code-group

```tsx [JS]
import { resolveConflictStatus, resolveStatusAction } from "@sometic/dom/status";

const view = resolveConflictStatus({
    kind: "conflict",
    hasAction: true,
    title: "Conflicting changes",
    description: "Your edits and the server copy of this person differ.",
    versions: {
        localLabel: "Your version",
        remoteLabel: "Server version",
    },
});
const action = resolveStatusAction();
```

```tsx [TS]
import {
    resolveConflictStatus,
    resolveStatusAction,
    type ConflictStatusViewModel,
} from "@sometic/dom/status";

const view: ConflictStatusViewModel = resolveConflictStatus({
    kind: "conflict",
    hasAction: true,
    title: "Conflicting changes",
    description: "Your edits and the server copy of this person differ.",
    versions: {
        localLabel: "Your version",
        remoteLabel: "Server version",
    },
});
const action = resolveStatusAction();
```

```js [Vanilla]
import { resolveConflictStatus, resolveStatusAction } from "@sometic/dom/status";

const view = resolveConflictStatus({
    kind: "conflict",
    hasAction: true,
    versions: { localLabel: "Your version", remoteLabel: "Server version" },
});
const root = document.querySelector("#conflict");
for (const [key, value] of Object.entries(view.attributes)) {
    root.setAttribute(key, value);
}
root.dataset.local = view.localLabel;
root.dataset.remote = view.remoteLabel;
const action = resolveStatusAction();
```

:::

Custom element **not shipped**. Full spine: [Status](/components/status).

## Related links

- [Status](/components/status)
- [Empty state](/components/empty-state)
- [Error state](/components/error-state)
