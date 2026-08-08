# `@sometic/positioning`

First-party overlay positioning for Sometic anchored surfaces (flip, shift, size).

## Install

```bash
pnpm add @sometic/positioning
```

## Usage

```ts
import { computePosition, createDefaultPositioningAdapter } from "@sometic/positioning";

const { x, y, placement } = computePosition(reference, floating, {
    placement: "bottom-start",
    offset: 8,
});
```

## License

MIT
