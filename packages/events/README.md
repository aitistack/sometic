# `@sometic/events`

Typed, framework-independent event emitter for Sometic.

## Install

```bash
pnpm add @sometic/events
```

## Quick start

```ts
import { createEventEmitter } from "@sometic/events";

const emitter = createEventEmitter<{ ready: { id: string } }>();
const subscription = emitter.on("ready", ({ id }) => {
    console.log(id);
});

emitter.emit("ready", { id: "1" });
subscription.dispose();
```

## Docs

See `docs/consumer/events/` and `docs/maintainer/events/`.

## License

MIT
