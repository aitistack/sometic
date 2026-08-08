# Styling Model

## Goal

Components expose stable styling hooks without requiring a specific CSS framework. Consumers bring their system; we provide resolution, slots, state attributes, tokens, and an optional minimal default theme.

## Supported Modes

| Mode                         | Runtime dependency on CSS framework?           |
| ---------------------------- | ---------------------------------------------- |
| Unstyled                     | No                                             |
| Minimal default CSS          | No (ship optional CSS)                         |
| Design-token / CSS variables | No                                             |
| Tailwind                     | No — class names only, consumer owns Tailwind  |
| Bootstrap                    | No — class names only, consumer owns Bootstrap |
| Plain CSS                    | No                                             |
| CSS Modules                  | No — consumer wiring                           |
| Sass                         | No — consumer wiring                           |
| Inline styles                | No                                             |
| Consumer class systems       | No                                             |

## Core Modules (owned by `@sometic/styling` + `@sometic/theme`)

### Class resolver

Root classes · slot classes · state classes · user overrides · function-based and conditional classes · framework-specific class formats · stable resolution order · optional consumer-provided merger (do not hard-depend on `tailwind-merge`).

### Style resolver

Root/slot/state styles · function-based styles · CSS custom properties · overrides · safe normalization.

### Slot system

Meaningful slots per component (e.g. Button: `root`, `prefix`, `content`, `suffix`, `loader`; Input: `root`, `field`, `label`, `control`, `nativeInput`, …).

### State attributes

Stable `data-*` attributes for consumer selectors, including (non-exhaustive):

`data-disabled`, `data-loading`, `data-invalid`, `data-readonly`, `data-focused`, `data-focus-visible`, `data-filled`, `data-empty`, `data-checked`, `data-selected`, `data-expanded`, `data-orientation`, `data-size`, `data-variant`

### Polymorphic rendering

Cross-framework concept for rendering as another element where appropriate. Syntax may follow framework conventions; conceptual behavior stays consistent.

## Override Priority (deterministic)

Documented order (highest wins last):

1. Behavior-required styles (e.g. visually hidden for a11y) — minimal and justified
2. Default theme / token-derived values
3. Component variant/size defaults
4. Consumer `classes` / `styles` / `cssVariables` props
5. Consumer CSS targeting slots and `data-*` (cascade as authored)

Exact algorithm is implemented and tested in Phase 4; this document locks the intent.

## Default Visual System

When enabled, defaults must be: clean, accessible, compact, modern, easy to override, low-specificity, CSS-variable-driven, free from unnecessary animation, compatible with `prefers-reduced-motion`.

Consumers must be able to disable defaults entirely (`unstyled`).

## Theme Engine Boundary

`@sometic/theme` owns tokens, theme store, scoped themes, persistence, system preference detection, and CSS variable generation. `@sometic/styling` resolves classes/styles/slots without knowing Tailwind/Bootstrap.

## Related

- ADR-0003 Styling modes
- ADR-0004 Light DOM and Shadow DOM
- ADR-0010 Bundle size budgets
