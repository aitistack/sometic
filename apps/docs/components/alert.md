# Alert

Inline status message with tone-driven live region semantics. Stateless `resolveAlert` helper: no open/close controller, no queue. Use for persistent or in-flow notices, not transient toasts.

<PreviewAlert />

## Usage

::: code-group

```tsx [React]
import { Alert } from "@sometic/react/overlay";

export function Example() {
    return <Alert tone="info">Profile saved.</Alert>;
}
```

```vue [Vue]
<script setup>
import { Alert } from "@sometic/vue/overlay";
</script>

<template>
    <Alert tone="info">Profile saved.</Alert>
</template>
```

```js [Vanilla]
import { resolveAlert } from "@sometic/dom/alert";

const el = document.querySelector("[data-alert]");
const view = resolveAlert({ tone: "info" });
for (const [key, attr] of Object.entries(view.attributes)) {
    el.setAttribute(key, attr);
}
el.className = view.className;
el.textContent = "Profile saved.";
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerOverlayElements } from "@sometic/elements/overlay";
    registerOverlayElements();
</script>

<sometic-alert tone="warning">Check your connection.</sometic-alert>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.6/dist/cdn/sometic-elements.iife.js"></script>

<sometic-alert tone="warning">Check your connection.</sometic-alert>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.6/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-alert tone="warning">Check your connection.</sometic-alert>
```

:::

## Vue

```vue
<script setup>
import { Alert } from "@sometic/vue/overlay";
</script>

<template>
    <Alert tone="success">Profile saved.</Alert>
</template>
```

## How it works

1. **Engine (`@sometic/dom/alert`)**: `resolveAlert({ tone, live, …styleable })` picks defaults (`tone` → `"info"`; `live` → `"assertive"` when tone is `"danger"`, else `"polite"`). Sets `role` (`status` vs `alert`), `aria-live`, `aria-atomic="true"`, `data-tone`, `data-slot="root"`.
2. **Adapters**: React/Vue render a `div` with resolved attributes and children / default slot. React `AlertProps` exposes `tone` plus native div attrs; styling maps from resolve when you call the engine directly with `classes` / `unstyled`.
3. **Custom element**: `sometic-alert` observes `tone`, `live`, `shadow`, applies resolved attributes onto the host, and keeps light-DOM children as the message.

No dismiss controller: compose your own close button if needed.

## Anatomy

| Part | `data-slot` | Role                     |
| ---- | ----------- | ------------------------ |
| Root | `root`      | Status/alert live region |

| Tone      | Default live | Role     |
| --------- | ------------ | -------- |
| `info`    | `polite`     | `status` |
| `success` | `polite`     | `status` |
| `warning` | `polite`     | `status` |
| `danger`  | `assertive`  | `alert`  |

## Props / attributes

### React `AlertProps`

`HTMLAttributes<HTMLDivElement>` plus:

| Prop         | Type                                           | Default  | Description                                          |
| ------------ | ---------------------------------------------- | -------- | ---------------------------------------------------- |
| `tone`       | `"info" \| "success" \| "warning" \| "danger"` | `"info"` | Visual + default live mapping                        |
| `children`   | `ReactNode`                                    | ,        | Message content                                      |
| Native attrs | div HTML attrs                                 | ,        | Forwarded (`className` / `style` merge with resolve) |

Engine-only (DOM / custom wiring): explicit `live: "polite" | "assertive"`, plus StyleableProps for slot `root` (`unstyled`, `classes`, `styles`, `cssVariables`, `defaults`, `variants`, `merge`).

### Vue

`tone` (default `"info"`). Default slot is the message. No emit surface.

### Custom element (`sometic-alert`)

Observed: `tone`, `live`, `shadow`. Children are the message. Setting `live` overrides the tone default mapping.

## Events / callbacks

None. Presentational / live-region only.

## Controlled vs uncontrolled

N/A. Mount or unmount to show/hide. Changing `tone` / `live` remaps role and `aria-live`. Keep the element mounted while the condition is true so polite announcements are not lost to a flash remount.

## Form participation

N/A. Often placed beside fields for server or form-level errors. Prefer Field error text for single-control messages when possible. For submit-wide failures, keep one assertive Alert near the form actions rather than duplicating the same message on every field.

## Accessibility

- Prefer **assertive** only for critical errors (`danger` default, or explicit `live="assertive"` on CE / `resolveAlert`).
- Do not spam remounts; each insertion may re-announce.
- Keep meaningful text; decorative icons should be `aria-hidden` when the text already explains the status.
- Not a dialog: no focus trap, no required focus move. Do not steal focus on mount unless product UX explicitly needs it.
- Keyboard: content is static; interactive children (links/buttons) participate in normal tab order.

## Styling

Unstyled by default beyond your theme. Useful selectors:

- `[data-slot="root"]`
- `[data-tone="info"|"success"|"warning"|"danger"]`
- `[role="status"]`, `[role="alert"]`

```tsx
<Alert tone="danger" className="banner banner--danger">
    Payment failed. Try another card.
</Alert>
```

## Edge cases

- **Tone change** remaps role/live; verify announcements when swapping from info → danger.
- **Forced polite danger**, call `resolveAlert({ tone: "danger", live: "polite" })` in custom DOM wiring, or set `live="polite"` on the CE.
- **Multiple alerts**, fine; avoid assertive storms on the same page update.
- **SSR**, resolve is pure; register `sometic-alert` only in the browser.
- **Dismiss**, compose a button yourself; Alert has no open state.

## Performance notes

Pure resolve, ideal for static banners and SSR-friendly markup. Prefer Alert over Toast when the message should remain visible in layout without a queue. There are no timers, portals, or announcer subscriptions on this path.

## When to use / When not

**Use** for inline or persistent notices (form banners, page status, inline success).

**Do not use** for:

- Timed ephemeral messages, [Toast](/components/toast).
- Modal confirms or blocking flows, [Dialog](/components/dialog).
- Per-field validation copy that belongs in [Field](/components/field) error slots.

## FAQ

**Toast vs Alert?** Toast is queued/ephemeral with announcer helpers. Alert is inline and stays in the document flow.

**Can I force polite danger?** Yes on CE via `live="polite"`, or `resolveAlert({ tone: "danger", live: "polite" })` in DOM wiring. React’s public prop surface is `tone` (+ HTML attrs).

**Dismiss button?** Compose yourself; Alert has no open/close API.

**Multiple alerts on one page?** Allowed. Prefer polite tones unless the failure is critical.

**Does React expose `live`?** Not as a first-class prop; use the CE `live` attribute or call `resolveAlert` directly for custom hosts.

**Shadow DOM?** `shadow` on the CE isolates styles. Light DOM is default so page CSS reaches the host.

**Role mapping?** Assertive live ⇒ `role="alert"`; polite ⇒ `role="status"`. Both set `aria-atomic="true"`.

**Children required?** Provide accessible text. Empty alerts announce nothing useful.

**Form errors?** Use Field errors for one control; use Alert for page/section summaries.

**Can I pass `className` on React?** Yes. It merges with the resolved root className from `resolveAlert`.

**Bundle tip?** Import from `@sometic/react/overlay` or `@sometic/dom/alert`.

## Related links

- [Toast](/components/toast)
- [Dialog](/components/dialog)
- [Field](/components/field)
- [Form](/components/form)
- [State attributes](/concepts/state-attributes)
- [Styling slots](/concepts/styling-slots)
