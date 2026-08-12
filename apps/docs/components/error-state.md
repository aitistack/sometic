# Error state

Error panel chrome built on [`resolveStatus({ kind: "error" })`](/components/status) (`role="alert"`, assertive live by default). Prefer the shared Status page for full API detail.

<PreviewStatus />

## Usage

::: code-group

```tsx [JS]
import { resolveStatus, resolveStatusAction } from "@sometic/dom/status";

const view = resolveStatus({
    kind: "error",
    hasAction: true,
    title: "Could not load people",
    description: "The Admin and Editor roster failed to load.",
});
const action = resolveStatusAction();
```

```tsx [TS]
import {
    resolveStatus,
    resolveStatusAction,
    type StatusViewModel,
} from "@sometic/dom/status";

const view: StatusViewModel = resolveStatus({
    kind: "error",
    hasAction: true,
    title: "Could not load people",
    description: "The Admin and Editor roster failed to load.",
});
const action = resolveStatusAction();
```

```js [Vanilla]
import { resolveStatus, resolveStatusAction } from "@sometic/dom/status";

const view = resolveStatus({
    kind: "error",
    hasAction: true,
    title: "Could not load people",
});
const root = document.querySelector("#error");
for (const [key, value] of Object.entries(view.attributes)) {
    root.setAttribute(key, value);
}
const action = resolveStatusAction();
```

:::

Custom element **not shipped**. Full spine: [Status](/components/status).

## Related links

- [Status](/components/status)
- [Alert](/components/alert)
- [Offline state](/components/offline-state)
