# `@sometic/positioning`

First-party overlay positioning with flip and shift for Sometic anchored surfaces.

`@sometic/positioning` exports `computePosition`, `getElementRect`, and `createDefaultPositioningAdapter` for placing floating UI relative to a reference element or rect. You choose placement (`top`, `bottom-start`, and other side/alignment combinations), offset, padding, and whether flip/shift run. Results include final coordinates, resolved placement, and middleware flags for flipped/shifted.

Sometic overlays (menus, popovers, tooltips, combobox lists) need predictable geometry without forcing Floating UI into every consumer. This package exists as a small, SSR-tolerant first-party engine: viewport resolution falls back safely when `window` is absent, and adapters can swap implementations later without rewriting component behavior.

Standout features include rect or element inputs, absolute strategy coordinates, default flip and shift (disable via options), alignment-aware placement formatting, and a `PositioningAdapter` shape for injection. The surface is intentionally focused: compute once (or on your own schedule) rather than bundling auto-update observers, so DOM engines decide when to remeasure.

In the ecosystem, positioning works with [`@sometic/accessibility`](https://www.npmjs.com/package/@sometic/accessibility) (dismiss, focus, portal) and DOM/overlay packages. It depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) for shared foundation alignment. Product intro: [https://sometic.dev/guide/introduction](https://sometic.dev/guide/introduction).

## Install

```bash
pnpm add @sometic/positioning
```

```bash
npm install @sometic/positioning
```

```bash
yarn add @sometic/positioning
```

## Usage

Position a floating element under a reference:

```ts
import { computePosition } from "@sometic/positioning";

const reference = document.querySelector("#trigger");
const floating = document.querySelector("#popover");

if (reference instanceof Element && floating instanceof Element) {
    const result = computePosition(reference, floating, {
        placement: "bottom-start",
        offset: 8,
        padding: 8,
        flip: true,
        shift: true,
    });

    floating.style.position = "absolute";
    floating.style.left = `${result.x}px`;
    floating.style.top = `${result.y}px`;
    console.log(result.placement, result.middlewareData);
}
```

Use rects and the default adapter (handy in tests or SSR-shaped code):

```ts
import { createDefaultPositioningAdapter, type Rect } from "@sometic/positioning";

const reference: Rect = { x: 40, y: 80, width: 120, height: 32 };
const floating: Rect = { x: 0, y: 0, width: 200, height: 96 };
const adapter = createDefaultPositioningAdapter();

const result = adapter.computePosition(
    reference,
    floating,
    {
        placement: "top",
        flip: true,
    },
    { width: 1280, height: 720 },
);

console.log(result.x, result.y, result.middlewareData.flipped);
```

## CDN

Docs: [https://sometic.dev/primitives/positioning](https://sometic.dev/primitives/positioning).

### Simple script

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/positioning@0.1.5/dist/cdn/sometic-positioning.iife.js"></script>
<script>
    const result = SometicPositioning.computePosition(anchor, floating);
</script>
```

### Module script

```html
<script type="module">
    import { computePosition } from "https://cdn.jsdelivr.net/npm/@sometic/positioning@0.1.5/dist/cdn/sometic-positioning.esm.js";

    const result = computePosition(anchor, floating);
</script>
```

## Peers / when not to use

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). No framework peers. Do not use this when you need collision detection middleware ecosystems, virtual reference advanced plugins, or auto-update loops from Floating UI: bring those in at the app layer if required. Prefer this package for Sometic overlays that need a small, first-party flip/shift path.

## Docs

- Introduction: [https://sometic.dev/guide/introduction](https://sometic.dev/guide/introduction)
- Positioning primitives: [https://sometic.dev/primitives/positioning](https://sometic.dev/primitives/positioning)
- Accessibility guide: [https://sometic.dev/guide/accessibility](https://sometic.dev/guide/accessibility)
- Core on npm: [https://www.npmjs.com/package/@sometic/core](https://www.npmjs.com/package/@sometic/core)
- Positioning on npm: [https://www.npmjs.com/package/@sometic/positioning](https://www.npmjs.com/package/@sometic/positioning)

## License

MIT
