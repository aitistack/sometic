# Vanilla / Web Components

Wave A path for apps without React or Vue: DOM engines in `@sometic/dom` plus `sometic-*` custom elements in `@sometic/elements`.

## Overview

### When to use

- Vanilla JS/TS, multi-framework hosts, or HTML-first pages that want shared Sometic behavior.
- Progressive enhancement with Light DOM (default) or opt-in Shadow DOM for embeds.

### When not to use

- You already use React or Vue for the same controls → prefer `@sometic/react` / `@sometic/vue` to avoid double wiring.
- You need Angular / Svelte component kits → those Wave B packages are store-bind only today; Elements can still host UI.

## Installation

<InstallCommands packages="@sometic/elements" />

Optional companions: `@sometic/theme`, `@sometic/store`, `@sometic/http`, `@sometic/auth`. Engines also live in `@sometic/dom` if you bind plain HTML without custom elements.

## Import map

| Import                        | Role                       |
| ----------------------------- | -------------------------- |
| `@sometic/elements`           | Root barrel + registrars   |
| `@sometic/elements/button`    | Button family tags         |
| `@sometic/elements/input`     | Field / input tags         |
| `@sometic/elements/form`      | Form tag                   |
| `@sometic/elements/selection` | Selection tags             |
| `@sometic/elements/overlay`   | Overlay tags               |
| `@sometic/elements/auth`      | Auth status tag            |
| `@sometic/elements/events`    | Shared typed event helpers |

No `/store` or `/http` element subpaths. Import those packages directly.

## Registration

Importing an elements subpath registers tags eagerly when `customElements` exists (browser). Registration is **idempotent** and accepts an optional registry:

```ts
import {
    registerButtonElements,
    registerInputElements,
    registerFormElements,
    registerAuthElements,
} from "@sometic/elements";

registerButtonElements();
registerInputElements(customElements);
```

SSR-safe: auto-register is skipped when `customElements` is undefined. Call `register*Elements()` only after the DOM APIs exist.

Duplicate versions of the package in one page can fight over the same tag name. Keep a single elements version, or register into an isolated registry when the host supports it.

## Light DOM (default) vs Shadow DOM

| Mode            | How                | Styling                                                                                |
| --------------- | ------------------ | -------------------------------------------------------------------------------------- |
| Light (default) | Omit `shadow`      | Page CSS targets internal parts (`sometic-button button`, slots, `data-*`)             |
| Shadow (opt-in) | `shadow` attribute | Isolation for embeds; inject styles into `shadowRoot` or use CSS variables on the host |

```html
<sometic-button>Save</sometic-button> <sometic-button shadow>Embed-safe</sometic-button>
```

Theme CSS variables inherit into open shadow roots. Element selectors in the document do **not** pierce Shadow DOM.

## Typed events

Elements dispatch bubbling, composed `CustomEvent`s. Detail types are exported from `@sometic/elements` / `@sometic/elements/events`.

| Event                                          | Typical host             |
| ---------------------------------------------- | ------------------------ |
| `pressed-change`                               | `sometic-toggle-button`  |
| `value-change`                                 | inputs                   |
| `revealed-change`                              | `sometic-password-input` |
| `async-complete` / `async-error`               | `sometic-async-button`   |
| `form-submit` / `form-invalid` / `form-change` | `sometic-form`           |

## Element surface

Buttons: `sometic-button`, `sometic-icon-button`, `sometic-toggle-button`, `sometic-button-group`, `sometic-async-button`

Inputs: `sometic-field`, `sometic-input`, `sometic-password-input`, `sometic-otp-input`, `sometic-number-input`, `sometic-file-input`, `sometic-masked-input`, `sometic-currency-input`, `sometic-date-input`

Forms / auth: `sometic-form`, `sometic-auth-status`

Selection and overlay families ship on their subpaths. Engines live in `@sometic/dom`, `@sometic/forms`, and `@sometic/auth`; elements are thin wrappers.

## Async button

```ts
import "@sometic/elements/button";

const button = document.querySelector("sometic-async-button");
if (button) {
    button.action = async (signal) => {
        const response = await fetch("/api/save", { signal });
        return response.json();
    };
    button.addEventListener("async-complete", (event) => {
        console.log(event.detail.data);
    });
}
```

```html
<sometic-async-button>Save</sometic-async-button>
```

## Store and HTTP (Vanilla)

```ts
import { createStore } from "@sometic/store";
import { createHttp } from "@sometic/http";

const store = createStore({ count: 0 });
const http = createHttp({ baseUrl: "/api" });

store.subscribe((state) => {
    console.log(state.count);
});

await http.get("/me");
```

## Styling hooks

Prefer stable attributes from the DOM engines (`data-slot`, `data-loading`, `aria-*`, invalid state). Avoid relying on deep tag trees that change between Light and Shadow mounts. Style the host plus documented parts. See [Styling](/guide/styling) and [Theming](/theming/).

## SSR notes

- Do not call `customElements.define` during SSR.
- Import packages freely; registration no-ops without `customElements`.
- Serialize markup as plain HTML tags; upgrade on the client after hydrate.

## FAQ

### Do elements replace React / Vue adapters?

No. Same engines, different host. Pick one host per control to avoid duplicate state.

### Why Light DOM by default?

Native forms, autofill, and page CSS work without piercing shadow trees. Shadow is opt-in for embeds.

### Can I use only `@sometic/dom`?

Yes. Bind plain `<button>` / inputs with DOM controllers when you do not want custom elements.

### Are Menu / Combobox elements available?

Deferred. See [Beta maturity](/releases/beta).

### How do I avoid double registration?

Import one version of `@sometic/elements` and rely on idempotent registrars.

## Related

- [Components](/components/)
- [Stores](/stores/)
- [Beta maturity](/releases/beta)
- [Compatibility](/frameworks/compatibility)
- [SSR](/guide/ssr)
