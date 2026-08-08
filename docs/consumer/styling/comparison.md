# Styling — Comparison

## vs hard-coding Tailwind in the library

|                                   | `@sometic/styling` | Tailwind-in-package           |
| --------------------------------- | ------------------ | ----------------------------- |
| Consumer CSS freedom              | Full               | Locked to utility conventions |
| Runtime deps                      | None               | Tailwind (or peer pressure)   |
| Fits Bootstrap / CSS Modules apps | Yes                | Poor                          |

## vs CSS-in-JS runtime (Emotion/Styled-components)

|                       | Sometic styling    | CSS-in-JS runtime        |
| --------------------- | ------------------ | ------------------------ |
| SSR complexity        | None for resolvers | Runtime + cache concerns |
| Bundle                | Tiny pure helpers  | Runtime + often Babel    |
| “Your styling system” | Yes                | Forces a runtime         |

## vs copying `clsx` / `classnames` only

`resolveClasses` covers that job. Sometic also adds **deterministic multi-layer** `resolveStyleable`, **slots**, **state attrs**, and **polymorphic `as`** aligned with upcoming components.

## vs Radix / Ark UI styling props

Similar intent (unstyled + class hooks). Difference: Sometic keeps resolvers **framework-independent** in foundation; adapters bind later. Theme tokens are a separate package (Phase 5).

## When not to choose this package alone

If you need a full theme switcher, token scales, or contrast helpers — wait for `@sometic/theme`. If you need rendered Button/Input — later component phases build on these helpers.
