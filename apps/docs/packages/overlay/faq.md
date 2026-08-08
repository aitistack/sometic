# Overlay FAQ

## Do React/Vue Dialogs trap focus and handle Escape?

Yes. Both adapters call `createDialogController`, which uses modal `createOverlayController` (focus trap, body scroll lock, Escape dismiss). Outside press does not dismiss dialogs.

## Do React/Vue Popovers and Tooltips use controllers too?

Not in this beta. Popover/Tooltip React and Vue adapters are resolve-only shells driven by an `open` prop. Use `createPopoverController` / `createTooltipController` or `sometic-popover` / `sometic-tooltip` for positioning, delays, and dismiss layers.

## Modal vs non-modal?

Dialog → `modal: true` (trap + scroll lock, no outside dismiss). Popover → non-modal (outside press dismisses). Tooltip → label overlay with delay timers on the controller path.

## Is Menu or Drawer included?

Yes. See [Menu](/components/menu), [Drawer](/components/drawer), and [Context menu](/components/context-menu). Combobox lives under selection — see [Combobox](/components/combobox).

## Portal behavior?

Overlay controllers ensure a portal root (optional `portalId`). Custom elements mount panel content into their mount root (light DOM by default; `shadow` optional).

## How should I label a dialog?

Pass `titleId` / `descriptionId` into Dialog resolve/adapters, or set `aria-label` on the panel.

## SSR?

Never touch `customElements` / controllers at import time on the server. Register elements and create controllers in the browser.

## Toast vs Alert?

Toast is a timed queue with optional live announcer. Alert is an inline resolve-only status/alert region.
