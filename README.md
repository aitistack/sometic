# Sometic

> One behavior model for UI, forms, auth, HTTP, and document head across every JavaScript stack. Your styling system.

**Sometic** is a portable application behavior system. Shared controllers power the app; thin adapters give you React, Vue, and `sometic-*` custom elements. Styling stays yours: slots, state attributes, and tokens plug into Tailwind, Bootstrap, CSS Modules, or plain CSS.

**Docs:** [https://sometic.dev](https://sometic.dev)

## Install

Pick the stack you ship. Prefer [subpath imports](https://sometic.dev/guide/installation) so you only pull what you use.

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

Copy-ready install blocks for every package live on the [Installation](https://sometic.dev/guide/installation) page.

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

More patterns (forms, auth, HTTP, overlays, structure) are in the [Introduction](https://sometic.dev/guide/introduction) and component guides.

## What you get

| Area        | Examples                                                                               |
| ----------- | -------------------------------------------------------------------------------------- |
| UI & forms  | Button family, fields, selection, overlays, tabs, accordion, progress                  |
| Application | Forms engine, auth orchestration, HTTP client with refresh queue, query, document head |
| Adapters    | `@sometic/react`, `@sometic/vue`, `@sometic/elements` (`sometic-*`)                    |
| Styling     | Unstyled by default; theme tokens optional via `@sometic/theme`                        |

Honest beta inventory: [What’s included](https://sometic.dev/guide/whats-included). Maturity labels: [Beta maturity](https://sometic.dev/releases/beta). Why this vs alternatives: [Comparison](https://sometic.dev/guide/comparison).

## Learn more

- [Introduction](https://sometic.dev/guide/introduction)
- [Beta maturity](https://sometic.dev/releases/beta)
- [Architecture](https://sometic.dev/concepts/architecture)
- [Styling contract](https://sometic.dev/guide/styling)
- [Authentication](https://sometic.dev/authentication/)
- [HTTP](https://sometic.dev/utilities/http)
- [Components](https://sometic.dev/components/)

## License

MIT, copyright Sometic contributors. See [LICENSE](./LICENSE).

## Contributing

Want to work on the monorepo? See [CONTRIBUTING.md](./CONTRIBUTING.md) and the [Contributing guide](https://sometic.dev/guide/contributing).
