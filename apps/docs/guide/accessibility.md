# Accessibility

Sometic prefers **native HTML semantics** first: real `<button>`, form controls, labels, focus order, and keyboard behavior. Shared helpers live in `@sometic/accessibility` and DOM engines; adapters should not reinvent focus traps or announcers per framework.

## Principles

- Use native elements whenever they match the control. ARIA fills gaps; it does not replace a button with a `div`.
- Preserve label association (`label` / `htmlFor` / wrapping), `disabled`, `readonly`, `required`, and validation messaging.
- Keyboard and focus behavior are part of the component contract. See each [component](/components/) page for roles, keys, and focus notes.
- Respect `prefers-reduced-motion` and high-contrast needs when you add motion or color in your theme layer.

## Package roles

| Package                                                 | Role                                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `@sometic/accessibility`                                | Focus scopes, keyboard utilities, dismissable layers, live-region announcements, observers |
| `@sometic/dom`                                          | Control engines that apply `aria-*`, `data-*`, and focus wiring                            |
| `@sometic/react` / `@sometic/vue` / `@sometic/elements` | Thin hosts that expose the engines                                                         |

## Overlays

Dialog (React / Vue) uses the modal overlay controller: focus trap, body scroll lock, Escape dismiss. Outside press does not dismiss in the current beta. Pass `titleId` / `descriptionId` or an accessible name. Popover / Tooltip remain thinner shells in framework adapters; richer positioning and dismiss live on DOM controllers and elements. Details: [Beta maturity](/releases/beta).

## Forms and inputs

- Keep `name` and native constraint validation when you rely on browser messages.
- Wire error text with stable ids and `aria-describedby` / `aria-invalid` as documented on Field and Input pages.
- Do not remove focus outlines without providing a visible replacement in your theme.

## Testing expectations

Accessibility claims should be backed by automated checks where the repo gates them (`test:accessibility` when configured) plus keyboard passes on interactive demos. Component docs list edge cases (disabled, loading, RTL, reduced motion) that themes must not break.

## FAQ

### Do I need a separate a11y library?

Not for Sometic-owned focus, dismiss, and announce primitives. You may still use axe or similar in CI.

### Can I restyle away semantics?

You can restyle. You cannot drop native roles without replacing the accessibility contract. Prefer `unstyled` + classes over swapping the underlying tag incorrectly.

### Where is the full keyboard matrix?

On each component page under [Components](/components/), not as a single global table.

## Related

- [Components](/components/)
- [Styling](/guide/styling)
- [SSR](/guide/ssr)
- [Beta maturity](/releases/beta)
- [Troubleshooting](/guide/troubleshooting)
