# Input overview

Shared Input behavior lives in `@sometic/dom` (`./input` and specialized subpaths). React/Vue/Elements adapters stay thin.

## Install

```bash
pnpm add @sometic/dom
# adapters
pnpm add @sometic/react   # or @sometic/vue / @sometic/elements
```

Prefer subpaths: `@sometic/dom/input`, `@sometic/react/input`.

## Quick start (Vanilla)

```ts
import { bindInput } from "@sometic/dom/input";

const el = document.querySelector("input")!;
let value = "";
bindInput(el, () => ({
    value,
    onValueChange: (next) => {
        value = next;
    },
}));
```

## Specialized controllers

Password · OTP · Number · File · Masked · Currency · Date (via `@sometic/date-core` adapter).

## Related

- [API](./api.md)
- [FAQ](./faq.md)
- [Comparison](./comparison.md)
- Field composition: `docs/consumer/field/`
- Date adapters: `docs/consumer/date/`
