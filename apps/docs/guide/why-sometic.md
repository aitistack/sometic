# Why Sometic

Sometic (`@sometic` on npm) is a **portable application behavior system**: shared controllers for UI, forms, auth, and HTTP, with thin framework adapters and **your** styling system.

It is **not** another pre-styled React component kit, and it is **not** related to sociogram tools or brands with similar names. If the first thing you need is buttons that look like a brand out of the box, use a visual library. If you need **one behavior model that survives a framework change**, keep reading.

## The problem

Teams rebuild the same application behavior for every stack (forms, auth refresh, theme switching, accessible overlays), while visual libraries lock you into one look, one framework, or both. Behavior that should be portable becomes duplicated and hard to keep consistent, accessible, and secure.

## What Sometic gives you out of the box

1. **One behavior model**: Controllers and resolve APIs in `@sometic/dom`, `@sometic/forms`, `@sometic/auth`, and related packages own state and interaction. React, Vue, and `sometic-*` custom elements stay thin.
2. **Your styling system**: Engines are unstyled by default. Use slots, `data-state` / `data-slot` attributes, CSS variables from `@sometic/theme`, Tailwind, Bootstrap, CSS Modules, Sass, or plain CSS. No mandatory CSS framework.
3. **Native HTML first**: Real `<button>`, `<input>`, and form participation so autofill, keyboard, and assistive tech work as users expect.
4. **Accessibility as core**: Focus trap, dismissable layers, portals, scroll lock, and live regions live in `@sometic/accessibility` and compose into overlays, not bolted on later.
5. **Auth without SDK lock-in**: `@sometic/auth` orchestrates session and refresh; Firebase, Supabase, OIDC, and local REST are optional peer adapters.
6. **Fetch-first HTTP**: `@sometic/http` with interceptors and auth refresh queue. You are not forced onto Axios.
7. **SSR-safe cores**: No `window` / `document` at import time; environment guards and disposable controllers.

## When to use Sometic

- You need the **same behavior** across Vanilla, React, Vue, and Web Components
- You want **unstyled, accessible** engines with your own design system
- You need **auth orchestration and HTTP refresh** without baking one backend SDK into core
- You care about **tree-shakable subpath exports** and explicit bundle budgets

## When not to use Sometic

- You only want a **pre-styled React** kit (use a visual library)
- You want a **full Firebase/Supabase product wrapper** (use their SDKs; Sometic adapters are optional seams)
- You need **data grids, command palettes, or other deferred app primitives** today — see [What’s included](/guide/whats-included)

## Why this approach (under the hood)

| Choice                            | Why                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Controllers + resolve view models | One testable behavior surface; adapters only map to framework DX                            |
| Controllable state                | Same controlled/uncontrolled pattern across components                                      |
| First-party positioning           | Overlay placement without a hard Floating UI dependency (adapter contract exists for later) |
| Custom elements as first-class    | Vanilla and multi-framework embedding without React-only APIs                               |

## Related

- [Architecture](/concepts/architecture)
- [What’s included in beta](/guide/whats-included)
- [Comparison](/guide/comparison)
- [Installation](/guide/installation)
- [Beta maturity](/releases/beta)
