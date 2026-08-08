# `@sometic/elements`

Web Components for Sometic. Light DOM by default; opt into Shadow DOM with the `shadow` attribute.

```bash
pnpm add @sometic/elements
```

```ts
import "@sometic/elements/button";
import { registerInputElements } from "@sometic/elements/input";

registerInputElements();
```

```html
<sometic-button>Save</sometic-button> <sometic-button shadow>Isolated</sometic-button>
```

## License

MIT
