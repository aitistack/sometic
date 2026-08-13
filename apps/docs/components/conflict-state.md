# Conflict state

Two-version chrome from `resolveConflictStatus` in `@sometic/dom/status`. Everything `resolveStatus({ kind: "conflict" })` returns, plus resolved `localLabel` and `remoteLabel` for the side-by-side comparison. Assertive live region, `role="alert"`, `data-status="conflict"`, and the default title `Conflicting changes`. Same resolver family as [Empty state](/components/empty-state), [Error state](/components/error-state), and [Offline state](/components/offline-state).

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
import { resolveConflictStatus, resolveStatusAction } from "@sometic/dom/status";

const panel = document.querySelector("#conflict");
const view = resolveConflictStatus({
    title: "This record changed while you were editing",
    description: "Choose which version to keep.",
    hasAction: true,
    versions: { localLabel: "Your draft", remoteLabel: "Saved on server" },
});

panel.className = view.className;
for (const [key, value] of Object.entries(view.attributes)) {
    panel.setAttribute(key, value);
}

for (const label of [view.localLabel, view.remoteLabel]) {
    const choice = document.createElement("button");
    for (const [key, value] of Object.entries(resolveStatusAction().attributes)) {
        choice.setAttribute(key, value);
    }
    choice.textContent = `Keep ${label}`;
    panel.append(choice);
}
```

```html [Vanilla]
<section id="conflict"></section>

<script type="module">
    import { resolveConflictStatus, resolveStatusAction } from "@sometic/dom/status";

    const panel = document.querySelector("#conflict");
    const view = resolveConflictStatus({ hasAction: true });

    panel.className = view.className;
    for (const [key, value] of Object.entries(view.attributes)) {
        panel.setAttribute(key, value);
    }

    const title = document.createElement("h3");
    title.dataset.slot = "title";
    title.textContent = view.title;

    const actions = document.createElement("div");
    actions.dataset.slot = "actions";

    for (const label of [view.localLabel, view.remoteLabel]) {
        const choice = document.createElement("button");
        for (const [key, value] of Object.entries(resolveStatusAction().attributes)) {
            choice.setAttribute(key, value);
        }
        choice.textContent = `Keep ${label}`;
        actions.append(choice);
    }

    panel.replaceChildren(title, actions);
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

- `resolveConflictStatus` always resolves `kind` to `conflict`, so passing another `kind` has no effect. TypeScript still requires `kind` because the options extend `ResolveStatusOptions`.
- Labels default to `Your version` and `Server version`. Override them with `versions` so the copy names the real thing (draft, revision, invoice) instead of a generic version.
- Conflict is **assertive** like error, because unsaved work is at stake. Announce it, then keep both versions reachable.
- Never auto-resolve silently. Render both choices, and make the destructive one explicit ("Discard your draft").
- Keep an unmodified copy of the remote payload while the conflict is on screen. If the user picks the server version you need it, and refetching may have moved on again.

Full API, accessibility, styling, edge cases, and FAQ: [Status surfaces](/components/status).

## Related links

- [Status surfaces](/components/status)
- [Empty state](/components/empty-state)
- [Error state](/components/error-state)
- [Offline state](/components/offline-state)
- [Dialog](/components/dialog)
