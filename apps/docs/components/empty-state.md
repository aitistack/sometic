# Empty state

Empty list/table chrome built on [`resolveStatus({ kind: "empty" })`](/components/status). Prefer the shared Status page for full API detail.

<PreviewStatus />

## Usage

::: code-group

```tsx [JS]
import { resolveStatus, resolveStatusAction } from "@sometic/dom/status";

const view = resolveStatus({
    kind: "empty",
    hasAction: true,
    title: "No people",
    description: "No Person rows match the name and role filters.",
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
    kind: "empty",
    hasAction: true,
    title: "No people",
    description: "No Person rows match the name and role filters.",
});
const action = resolveStatusAction();
```

```js [Vanilla]
import { resolveStatus, resolveStatusAction } from "@sometic/dom/status";

const view = resolveStatus({
    kind: "empty",
    hasAction: true,
    title: "No people",
});
const root = document.querySelector("#empty");
for (const [key, value] of Object.entries(view.attributes)) {
    root.setAttribute(key, value);
}
const action = resolveStatusAction();
```

:::

Custom element **not shipped**. Full spine: [Status](/components/status).

## Related links

- [Status](/components/status)
- [Data table](/components/data-table)
- [Error state](/components/error-state)
