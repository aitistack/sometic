# Positioning

`@sometic/positioning` is Sometic’s first-party placement engine for anchored overlays. It computes flip / shift coordinates for surfaces such as Popover and Tooltip without requiring Floating UI at runtime.

A Floating UI adapter remains a future opt-in (see [Package index](/api/packages) deferred notes). Today’s shipped path is this package.

## Overview

| Export                            | Role                                               |
| --------------------------------- | -------------------------------------------------- |
| `computePosition`                 | Place a floating rect relative to a reference      |
| `getElementRect`                  | Read an element’s viewport rect                    |
| `createDefaultPositioningAdapter` | Adapter object `{ computePosition }` for injection |

### When to use

- You are building or extending an anchored overlay that needs flip / shift
- You inject positioning into `@sometic/dom` popover / tooltip controllers
- You need deterministic placement in tests with plain `Rect` objects (no DOM)

### When not to use

- Unanchored modals / dialogs that center in the viewport (dialog controllers handle their own layout)
- Full collision / size middleware suites from Floating UI (not bundled; future adapter)
- Theme or styling concerns (use styling / theme packages)

## Installation

<InstallCommands packages="@sometic/positioning" />


## Usage

::: code-group

```ts [TS]
import {
    computePosition,
    createDefaultPositioningAdapter,
    getElementRect,
} from "@sometic/positioning";

const reference = document.querySelector("#trigger");
const floating = document.querySelector("#panel");

if (reference && floating) {
    const result = computePosition(reference, floating, {
        placement: "bottom-start",
        offset: 8,
        padding: 8,
        flip: true,
        shift: true,
        strategy: "absolute",
    });

    floating.style.position = "absolute";
    floating.style.left = `${result.x}px`;
    floating.style.top = `${result.y}px`;

    result.placement;
    result.middlewareData.flipped;
    result.middlewareData.shifted;
}

const adapter = createDefaultPositioningAdapter();
adapter.computePosition(
    { x: 0, y: 0, width: 40, height: 20 },
    { x: 0, y: 0, width: 120, height: 80 },
    { placement: "top", offset: 4 },
    { width: 800, height: 600 },
);

getElementRect(document.body);
```

```js [JS]
import { computePosition } from "@sometic/positioning";

const result = computePosition(reference, floating, {
    placement: "bottom",
    offset: 8,
    flip: true,
    shift: true,
});

floating.style.left = `${result.x}px`;
floating.style.top = `${result.y}px`;
```

:::

Used by `@sometic/dom/popover` and `@sometic/dom/tooltip`. Prefer component docs ([Popover](/components/popover), [Tooltip](/components/tooltip)) unless you are writing a custom adapter.

## Key APIs

```ts
type Placement =
    | "top" | "bottom" | "left" | "right"
    | "top-start" | "top-center" | "top-end"
    | "bottom-start" | "bottom-center" | "bottom-end"
    | "left-start" | "left-center" | "left-end"
    | "right-start" | "right-center" | "right-end";

type ComputePositionOptions = {
    placement?: Placement;
    offset?: number;
    padding?: number;
    flip?: boolean;
    shift?: boolean;
    strategy?: "absolute";
};

computePosition(
    reference: Element | Rect,
    floating: Element | Rect,
    options?: ComputePositionOptions,
    viewport?: ViewportSize,
): ComputePositionResult
```

| Result field             | Meaning                              |
| ------------------------ | ------------------------------------ |
| `x` / `y`                | Coordinates for `position: absolute` |
| `placement`              | Final placement after flip           |
| `middlewareData.flipped` | Whether flip ran                     |
| `middlewareData.shifted` | Whether shift ran                    |

## How it works

`computePosition` accepts either DOM elements or plain `{ x, y, width, height }` rects. When elements are passed, rects are read via `getElementRect`. An optional `viewport` argument makes placement deterministic in Node / happy-dom tests without reading `window`.

Flip chooses an opposite side when the preferred placement overflows. Shift nudges along the alignment axis to keep padding inside the viewport. Strategy is currently `"absolute"` only.

## Edge cases

| Edge                           | Behavior                                           |
| ------------------------------ | -------------------------------------------------- |
| Missing viewport in browser    | Uses current viewport metrics when available       |
| Rect-only inputs               | Fully SSR / Node friendly for unit tests           |
| `flip: false` / `shift: false` | Honors preferred placement even if clipped         |
| Zero-size reference            | Still returns coordinates; callers should guard UX |

## FAQ

### Why first-party instead of Floating UI only?

Sometic needs a zero-peer default for Wave A overlays with a stable adapter contract. Floating UI can arrive later as an opt-in implementation of the same `PositioningAdapter` shape.

### Does this handle arrow / size middleware?

Not in the first-party core. Keep overlays simple or layer your own measurements on top of `x` / `y`.

### Can I use this without `@sometic/dom`?

Yes. `computePosition` is a pure placement helper. DOM controllers are the higher-level adapters.

### Is Menu / Combobox covered?

Use [Menu](/components/menu) and [Combobox](/components/combobox) for those patterns. Do not treat Select / Popover as stand-ins.

## Related

- [DOM engines](/primitives/dom)
- [Accessibility](/primitives/accessibility)
- [Popover](/components/popover)
- [Tooltip](/components/tooltip)
- [Package index](/api/packages)
- [Beta maturity](/releases/beta)
