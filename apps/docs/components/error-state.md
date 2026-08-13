# Error state

Failure chrome from `resolveStatus({ kind: "error" })` in `@sometic/dom/status`. Assertive live region, `role="alert"`, `data-status="error"`, and the default title `Something went wrong`. Same resolver as [Empty state](/components/empty-state), [Offline state](/components/offline-state), and [Conflict state](/components/conflict-state), with a different `kind`.

<PreviewStatus />

## Usage

::: code-group

```tsx [React]
// No dedicated React adapter for this surface. Use the engine from @sometic/dom/status (same API as Vanilla).
```

```vue [Vue]
<!-- No dedicated Vue adapter for this surface. Use the engine from @sometic/dom/status (same API as Vanilla). -->
```

```js [JS]
import { resolveStatus, resolveStatusAction } from "@sometic/dom/status";

const panel = document.querySelector("#rows-error");

function showError(error, retry) {
    const view = resolveStatus({
        kind: "error",
        title: "We could not load these rows",
        description: error.message,
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
    action.textContent = "Try again";
    action.addEventListener("click", retry);

    panel.replaceChildren(action);
}
```

```html [Vanilla]
<section id="rows-error"></section>

<script type="module">
    import { resolveStatus, resolveStatusAction } from "@sometic/dom/status";

    const panel = document.querySelector("#rows-error");
    const view = resolveStatus({ kind: "error", hasAction: true });

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
    action.textContent = "Try again";

    panel.replaceChildren(title, action);
</script>
```

```html [Custom Elements (Web Components)]
<!-- CE not shipped for this surface. Use React, Vue, or @sometic/dom (Vanilla) above. -->
```

```html [CDN]
<!-- CDN not available for this surface yet (no shipped custom element). Use npm adapters or Vanilla. -->
```

:::

## Notes

- Error is **assertive** by default (`role="alert"`), because a failed load blocks the user. Pass `live: "polite"` when the region already sits inside another live region.
- Show a message a user can act on. Put the raw technical detail behind a details toggle or in logs, not in the title.
- Pair the action with a real retry path. In a data table that usually means calling `load()` again; with [Query](/utilities/query) it means revalidating.
- A failed request caused by connectivity is usually better rendered as [Offline state](/components/offline-state), which comes with a recovery hook.
- Never leave focus stranded: if the error replaces a focused table, move focus to the region or the retry button.

Full API, accessibility, styling, edge cases, and FAQ: [Status surfaces](/components/status).

## Related links

- [Status surfaces](/components/status)
- [Empty state](/components/empty-state)
- [Offline state](/components/offline-state)
- [Conflict state](/components/conflict-state)
- [Alert](/components/alert)
