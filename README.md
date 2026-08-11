# Sometic

> One behavior model for UI, forms, auth, HTTP, and document head across every JavaScript stack. Your styling system.

**Sometic** is a portable application behavior system. Shared controllers power the app; thin adapters give you React, Vue, and `sometic-*` custom elements. Styling stays yours: slots, state attributes, and tokens plug into Tailwind, Bootstrap, CSS Modules, or plain CSS.

By [AitiStack](https://portfolio.aitistack.com).

**Docs:** [https://sometic.aitistack.com](https://sometic.aitistack.com)

## Install

Pick the stack you ship. Prefer [subpath imports](https://sometic.aitistack.com/guide/installation) so you only pull what you use.

### React

```bash
pnpm add @sometic/react @sometic/core @sometic/theme
```

```bash
npm install @sometic/react @sometic/core @sometic/theme
```

```bash
yarn add @sometic/react @sometic/core @sometic/theme
```

### Vue

```bash
pnpm add @sometic/vue @sometic/core @sometic/theme
```

### Vanilla / Web Components

```bash
pnpm add @sometic/elements @sometic/theme
```

Copy-ready install blocks for every package live on the [Installation](https://sometic.aitistack.com/guide/installation) page.

## Quick start (React)

```tsx
import { Button } from "@sometic/react/button";

export function SaveAction() {
    return (
        <Button type="button" onClick={() => {}}>
            Save
        </Button>
    );
}
```

More patterns (forms, auth, HTTP, overlays, structure) are in the [Introduction](https://sometic.aitistack.com/guide/introduction) and component guides.

## What you get

| Area | Examples |
| ---- | -------- |
| UI & forms | Button family, fields, selection, overlays, tabs, accordion, progress |
| Application | Forms engine, auth orchestration, HTTP client with refresh queue, query, document head |
| Adapters | `@sometic/react`, `@sometic/vue`, `@sometic/elements` (`sometic-*`) |
| Styling | Unstyled by default; theme tokens optional via `@sometic/theme` |

Honest beta inventory: [What’s included](https://sometic.aitistack.com/guide/whats-included). Why this vs alternatives: [Comparison](https://sometic.aitistack.com/guide/comparison).

## Learn more

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Architecture](https://sometic.aitistack.com/concepts/architecture)
- [Styling contract](https://sometic.aitistack.com/guide/styling)
- [Authentication](https://sometic.aitistack.com/authentication/)
- [HTTP](https://sometic.aitistack.com/utilities/http)
- [Components](https://sometic.aitistack.com/components/)

## License

MIT. See [LICENSE](./LICENSE).

## Contributing

Want to work on the monorepo? See [CONTRIBUTING.md](./CONTRIBUTING.md) and the [Contributing guide](https://sometic.aitistack.com/guide/contributing).
