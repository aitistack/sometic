# Empty state

Empty-collection chrome from `resolveStatus({ kind: "empty" })` in `@sometic/dom/status`. Polite live region, `role="status"`, `data-status="empty"`, and the default title `Nothing here yet`. It is the same resolver as [Error state](/components/error-state), [Offline state](/components/offline-state), and [Conflict state](/components/conflict-state), with a different `kind`.

<PreviewStatus />

## Usage

::: code-group

```js [JS]
import { resolveStatus, resolveStatusAction } from "@sometic/dom/status";

const panel = document.querySelector("#no-rows");
const view = resolveStatus({
    kind: "empty",
    title: "No invoices yet",
    description: "Invoices appear here once a customer is billed.",
    hasAction: true,
});

panel.className = view.className;
for (const [key, value] of Object.entries(view.attributes)) {
    panel.setAttribute(key, value);
}

const action = document.createElement("button");
for (const [key, value] of Object.entries(resolveStatusAction().attributes)) {
    action.setAttribute(key, value);
}
action.textContent = "Create invoice";
panel.append(action);
```

```ts [TS]
import { resolveStatus, type StatusViewModel } from "@sometic/dom/status";

export function emptyInvoices(): StatusViewModel {
    return resolveStatus({
        kind: "empty",
        title: "No invoices yet",
        description: "Invoices appear here once a customer is billed.",
        hasAction: true,
    });
}
```

```html [Vanilla]
<section id="no-rows"></section>

<script type="module">
    import { resolveStatus, resolveStatusAction } from "@sometic/dom/status";

    const panel = document.querySelector("#no-rows");
    const view = resolveStatus({ kind: "empty", hasAction: true });

    panel.className = view.className;
    for (const [key, value] of Object.entries(view.attributes)) {
        panel.setAttribute(key, value);
    }

    const title = document.createElement("h3");
    title.dataset.slot = "title";
    title.textContent = view.title;

    const action = document.createElement("button");
    for (const [key, value] of Object.entries(resolveStatusAction().attributes)) {
        action.setAttribute(key, value);
    }
    action.textContent = "Create the first row";

    panel.replaceChildren(title, action);
</script>
```

:::

## Notes

- Empty is **polite**, not assertive: an empty list is information, not a failure.
- Pass domain copy through `title` and `description`. The defaults exist so nothing renders blank, not as final product text.
- Set `hasAction: true` only when you actually render a recovery or creation control; it drives `data-has-action` for CSS.
- Distinguish "empty because nothing exists" from "empty because filters match nothing". The second usually wants a Clear filters action instead of a Create one.

Full API, accessibility, styling, edge cases, and FAQ: [Status surfaces](/components/status).

## Related links

- [Status surfaces](/components/status)
- [Error state](/components/error-state)
- [Offline state](/components/offline-state)
- [Conflict state](/components/conflict-state)
- [Data table](/components/data-table)
