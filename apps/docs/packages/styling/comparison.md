# Styling, Comparison

Prefer `@sometic/styling` when you need framework-neutral resolvers without locking into Tailwind, Bootstrap, or a CSS-in-JS runtime.

Choose something else when you only need a one-off `clsx` helper in an app (a tiny local util may suffice), or when you need a full theme engine (Phase 5).

Unlike embedding utility frameworks inside the library, Sometic keeps styling hooks portable across consumer CSS systems and documents a deterministic override priority for components built later.
