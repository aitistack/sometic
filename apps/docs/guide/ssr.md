# SSR

Sometic packages are designed so **importing a module does not touch browser globals**. Controllers, stores, and adapters stay SSR-safe until you opt into DOM APIs.

## Rules

1. Never read `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `matchMedia`, `customElements`, or `HTMLElement` at **module evaluation** time.
2. Create DOM-bound controllers inside `useEffect` / `onMounted` / after `DOMContentLoaded`, or behind an injected environment.
3. Register custom elements only when `customElements` exists.
4. Prefer framework components (`@sometic/react`, `@sometic/vue`) for SSR markup. Upgrade `sometic-*` tags on the client.

## Framework notes

### React

- Import `@sometic/react/*` in Server Components files only if those modules stay free of client hooks. Interactive controls belong in Client Components.
- Pass `auth` / `http` instances created with storage that works on the server, or construct them in the browser.
- Open overlays after mount so focus trap and scroll lock do not run during SSR render.

### Vue / Nuxt

- Universal imports are fine for adapters.
- Use client-only plugins for Element registration and browser storage.
- Prefer `ClientOnly` (or equivalent) around overlays that require layout measurement.

### Vanilla / Elements

```ts
import { registerButtonElements } from "@sometic/elements";

if (typeof customElements !== "undefined") {
    registerButtonElements();
}
```

SSR HTML can include `<sometic-button>` tags as unknown elements; they upgrade when registration runs in the browser.

## Storage and theme

Persistent stores and theme preference APIs accept injectable storage. During SSR, pass a memory storage or skip persistence until hydrate. Defaults that assume `localStorage` must not run at import time.

## Auth and HTTP

- `createAuth` / `createHttp` should not access cookies or `window` unless you inject adapters.
- Refresh queues and OAuth redirects are browser flows. Gate them behind client entry points.
- Server authorization remains mandatory. Client session state is UX, not a security boundary.

## Common failures

| Symptom                               | Likely cause                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `window is not defined` during import | Browser global at module top level (forbidden; file a bug if a published package does this) |
| Custom element not upgrading          | Registration never ran on the client                                                        |
| Hydration mismatch                    | Server rendered different attributes than the client first paint                            |
| Overlay breaks SSR HTML               | Focus/scroll side effects during render                                                     |

## Document head

Use `@sometic/head` to collect title/meta on the server (`serializeHead(controller.get())`) and inject into HTML. Call `applyHead` only in the browser after hydration, or rely on React/Vue adapters inside `HeadProvider` / `provideHead`. See [Head / SEO](/utilities/head).

## Related

- [React](/frameworks/react)
- [Vue](/frameworks/vue)
- [Vanilla](/frameworks/vanilla)
- [Stores](/stores/)
- [Head / SEO](/utilities/head)
- [Beta maturity](/releases/beta)
- [Troubleshooting](/guide/troubleshooting)
