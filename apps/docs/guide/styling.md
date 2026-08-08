# Styling

Sometic cores and adapters are **unstyled by default**. You bring Tailwind, Bootstrap, plain CSS, or design tokens. The behavior engines stay free of a mandatory CSS framework runtime.

## Brand typography (docs and playgrounds)

Sometic docs and playgrounds use a locked surface triad: **Chakra Petch** (display), **Urbanist** (UI/body), and **JetBrains Mono** (code). Those fonts are self-hosted for marketing and demo chrome only.

Publishable `@sometic/*` packages do **not** ship fonts and do not set a mandatory `font-family`. Components inherit the consumer application's type system.

## Hooks you can rely on

| Hook                                 | Where                                                        |
| ------------------------------------ | ------------------------------------------------------------ |
| `class` / `className`                | Host props on framework components                           |
| `classes` / `styles`                 | Slot-oriented class and style maps where supported           |
| `cssVariables` / theme CSS variables | [`@sometic/theme`](/theming/)                                 |
| `data-slot`, `data-*` state attrs    | Styling helpers and DOM engines                              |
| `unstyled`                           | Skip default structural classes when a component offers them |

See [Styling slots](/concepts/styling-slots) and [State attributes](/concepts/state-attributes) for the shared contract.

## Theme engine

Use `@sometic/theme` for tokens, mode switching, and CSS variable emission. Defaults use the `sometic` prefix for variables and storage keys. Guide: [Theming](/theming/).

## Light DOM vs Shadow DOM

Custom elements default to **Light DOM** so page CSS can target documented parts. Opt into `shadow` when you need embed isolation. Theme variables inherit into open shadow roots; element selectors in the document do not pierce shadow trees. See [Vanilla](/frameworks/vanilla).

## Framework tips

- React: prefer `className` and `classes` maps; avoid styling through fragile child index selectors.
- Vue: same idea with `class` bindings.
- Do not hardcode one utility framework inside shared packages. Keep utility classes in app or CLI-generated wrappers.

## What not to do

- Do not expect a visual theme to ship inside `@sometic/react` / `@sometic/vue` / `@sometic/elements` by default.
- Do not style away focus rings without a visible replacement ([Accessibility](/guide/accessibility)).
- Do not depend on undocumented internal DOM depth between Light and Shadow mounts.

## Related

- [Theming](/theming/)
- [Components](/components/)
- [Stores](/stores/) (theme preference store)
- [Beta maturity](/releases/beta)
- [CLI](/guide/cli)
