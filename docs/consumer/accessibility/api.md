# Accessibility — API

## Focus (`./focus`)

- `getFocusableElements(container)` / `getTabbableElements(container)`
- `createFocusTrap({ container, loop?, initialFocus?, returnFocus? })` → `activate` / `deactivate` / `dispose`

## Keyboard (`./keyboard`)

- `matchesKey(event, matcher)`
- `createKeyboardBindings(bindings, { target?, eventName? })`
- `onKey(target, binding)` convenience disposable

## Dismissable (`./dismissable`)

- `createDismissableLayer({ getElement, onDismiss, escapeDeactivates?, outsidePress? })`
- Nested layers: only the **top** active layer receives Escape / outside press

## Portal (`./portal`)

- `createPortalRoot({ id?, container?, ownerDocument? })` → `ensure()` / `dispose()`

## Scroll lock (`./scroll-lock`)

- `lockBodyScroll({ ownerDocument? })` — refcounted; restores overflow + padding

## Announcer (`./announcer`)

- `createLiveAnnouncer({ politeness? })` → `announce(message)` / `clear()` / `dispose()`

## Observers (`./observers`)

- `observeResize` / `observeIntersection` / `observeMutations` — no-op disposable when APIs missing
