# Theme — Overview

`@sometic/theme` owns design tokens, CSS variable generation, system preference detection, contrast helpers, and a framework-neutral theme controller.

## Modules

| Module             | Import                         |
| ------------------ | ------------------------------ |
| Theme controller   | `@sometic/theme`               |
| Tokens             | `@sometic/theme/tokens`        |
| CSS variables      | `@sometic/theme/css-variables` |
| Contrast           | `@sometic/theme/contrast`      |
| System prefs       | `@sometic/theme/system`        |
| Light/dark presets | `@sometic/theme/presets`       |

## When to use

Runtime theme switching, token → CSS variable pipelines, scoped theme application, WCAG contrast checks.

## When not to use

- Class/style slot resolution only → `@sometic/styling`
- Framework hooks (`useTheme`) → later adapters
- Shipping a full visual CSS kit as the product → optional defaults + consumer CSS

## Boundary

`@sometic/styling` never owns tokens. Theme depends on styling’s `resolveCssVariables` and on `@sometic/store` for subscriptions/persistence.
