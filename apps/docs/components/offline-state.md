# Offline state

Connectivity chrome from `resolveStatus({ kind: "offline" })` in `@sometic/dom/status`, plus `bindOfflineRecovery` for the moment the browser reports it is back. Polite live region, `role="status"`, `data-status="offline"`, and the default title `You are offline`. Same resolver as [Empty state](/components/empty-state), [Error state](/components/error-state), and [Conflict state](/components/conflict-state), with a different `kind`.

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
import { bindOfflineRecovery, resolveStatus, resolveStatusAction } from "@sometic/dom/status";

const panel = document.querySelector("#offline");
const view = resolveStatus({ kind: "offline", hasAction: true });

panel.className = view.className;
for (const [key, value] of Object.entries(view.attributes)) {
    panel.setAttribute(key, value);
}

const action = document.createElement("button");
for (const [key, value] of Object.entries(resolveStatusAction().attributes)) {
    action.setAttribute(key, value);
}
action.textContent = "Retry when online";
panel.append(action);

const stopRecovery = bindOfflineRecovery({
    onOnline: () => {
        panel.replaceChildren(document.createTextNode("Back online"));
    },
});
```

```html [Vanilla]
<section id="offline"></section>

<script type="module">
    import { bindOfflineRecovery, resolveStatus } from "@sometic/dom/status";

    const panel = document.querySelector("#offline");
    const view = resolveStatus({ kind: "offline", hasAction: true });

    panel.className = view.className;
    for (const [key, value] of Object.entries(view.attributes)) {
        panel.setAttribute(key, value);
    }

    const title = document.createElement("h3");
    title.dataset.slot = "title";
    title.textContent = view.title;

    const description = document.createElement("p");
    description.dataset.slot = "description";
    description.textContent = "Changes will be sent when the connection returns.";

    panel.replaceChildren(title, description);

    const stopRecovery = bindOfflineRecovery({
        onOnline: () => {
            description.textContent = "Back online, retrying";
        },
    });

    window.addEventListener("pagehide", stopRecovery, { once: true });
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

- Offline is **polite**, because it is a condition rather than a failed action.
- `bindOfflineRecovery` returns a dispose function and never touches `window` at import time. Call it on unmount, or pass a `signal` tied to your component lifecycle.
- The `online` event means the interface came back, not that your API is reachable. Treat recovery as "retry now", then handle a real failure as [Error state](/components/error-state).
- Recovery is a callback on purpose: only your app knows whether to revalidate a query, resend a mutation, or just re-enable a button.
- In tests, pass `addEventListener` to `bindOfflineRecovery` instead of faking globals.

Full API, accessibility, styling, edge cases, and FAQ: [Status surfaces](/components/status).

## Related links

- [Status surfaces](/components/status)
- [Empty state](/components/empty-state)
- [Error state](/components/error-state)
- [Conflict state](/components/conflict-state)
- [Query](/utilities/query)
