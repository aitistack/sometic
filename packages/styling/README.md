# `@sometic/styling`

Framework-neutral class/style resolvers, slots, state attributes, and polymorphic `as` helpers.

## Install

```bash
pnpm add @sometic/styling
```

## Quick start

```ts
import { resolveClasses, resolveStyleable, resolveStateAttributes } from "@sometic/styling";
import { createSlotAttributes } from "@sometic/styling/slots";

const className = resolveClasses("btn", { "btn-disabled": true });
const { style } = resolveStyleable({
    defaults: { className: "btn" },
    user: { className: "my-btn" },
    cssVariables: { "btn-bg": "navy" },
});
const attrs = {
    ...createSlotAttributes("root"),
    ...resolveStateAttributes({ disabled: true, size: "md" }),
};
```

## License

MIT
