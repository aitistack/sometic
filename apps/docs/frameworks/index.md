# Frameworks

Sometic keeps one behavior model and ships framework-native adapters on top. Prefer **Wave A** for production UI. Wave B and Wave C are **Experimental** contract surfaces, not full component kits.

## Wave A (full adapters)

Production beta surface for interactive UI, forms, overlays, store binding, auth, and HTTP helpers.

| Guide                                           | Package                                | Role                                        |
| ----------------------------------------------- | -------------------------------------- | ------------------------------------------- |
| [Vanilla / Web Components](/frameworks/vanilla) | `@sometic/elements` (+ `@sometic/dom`) | `sometic-*` custom elements and DOM engines |
| [React](/frameworks/react)                      | `@sometic/react`                       | Native React components and hooks           |
| [Vue](/frameworks/vue)                          | `@sometic/vue`                         | Native Vue components and composables       |

## Wave B (Experimental)

Store-bind foundations only. No button / input / form / overlay kits in these packages yet.

| Guide                          | Package            | Capabilities |
| ------------------------------ | ------------------ | ------------ |
| [Angular](/frameworks/angular) | `@sometic/angular` | `storeBind`  |
| [Svelte](/frameworks/svelte)   | `@sometic/svelte`  | `storeBind`  |
| [Solid](/frameworks/solid)     | `@sometic/solid`   | `storeBind`  |
| [Preact](/frameworks/preact)   | `@sometic/preact`  | `storeBind`  |

## Wave C (Experimental)

HTML-first / legacy hosts. Claimed surface is **storeBind** plus lifecycle-safe **button** bind.

| Guide                           | Package           | Capabilities          |
| ------------------------------- | ----------------- | --------------------- |
| [Alpine.js](/frameworks/alpine) | `@sometic/alpine` | `storeBind`, `button` |
| [jQuery](/frameworks/jquery)    | `@sometic/jquery` | `storeBind`, `button` |
| [HTMX](/frameworks/htmx)        | `@sometic/htmx`   | `storeBind`, `button` |

## How to choose

- Need React or Vue UI today → Wave A package + [components](/components/).
- Need custom elements or no framework → [Vanilla](/frameworks/vanilla).
- Need store semantics in Angular / Svelte / Solid / Preact → Wave B `create*StoreBind`, compose with your own UI or Elements.
- Need Alpine / jQuery / HTMX button behavior without a SPA kit → Wave C.

Maturity labels live in [Beta maturity](/releases/beta). Capability matrix: [Compatibility](/frameworks/compatibility).

## Related

- [Components](/components/)
- [Stores](/stores/)
- [Beta maturity](/releases/beta)
- [Installation](/guide/installation)
