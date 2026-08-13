# API reference

This section is a **navigation hub**, not a generated per-symbol reference. Hand-written guides under Components, Forms, Stores, Theming, Authentication, Primitives, and Services explain usage. Package `.d.ts` files remain the source of truth for exact TypeScript signatures.

## How to use these docs

1. Find the package and maturity label in the [Package index](/api/packages).
2. Open the linked live guide for that domain.
3. Confirm prop and function details against the installed package types in your editor.

**Do not expect** auto-generated pages for every export. Prefer deep guides with examples, edge cases, and FAQs.

## Start by domain

| Domain         | Live docs                                           | Typical packages                                              |
| -------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| Stores         | [Stores](/stores/), [Store](/stores/store)          | `@sometic/store`, `@sometic/store-immer`                      |
| Theming        | [Theming](/theming/)                                | `@sometic/theme`                                              |
| Authentication | [Authentication](/authentication/)                  | `@sometic/auth`, `@sometic/auth-*`                            |
| HTTP           | [HTTP](/utilities/http), [Services](/services/)     | `@sometic/http`                                               |
| Components     | [Components](/components/)                          | `@sometic/react/*`, `@sometic/vue/*`, `@sometic/elements/*`   |
| Forms          | [Forms](/forms/)                                    | `@sometic/forms`, `@sometic/validation`                       |
| Primitives     | [Primitives](/primitives/)                          | `core`, `events`, `styling`, `accessibility`, `dom`, `date-*` |
| Frameworks     | [Frameworks](/frameworks/)                          | adapter packages                                              |
| Concepts       | [Architecture](/concepts/architecture) and siblings | cross-cutting                                                 |

## Stability labels

| Label            | Meaning                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------- |
| **Beta**         | Usable and tested; breaking changes may land in `0.x` with changelog notes               |
| **Experimental** | Wave B/C adapters and incomplete contracts; prefer React / Vue / Elements for production |
| **Deferred**     | Later-phase catalogs (for example multi-select polish, date picker UI, data tables)      |

Full wording: [Beta maturity](/releases/beta).

## Shared prop conventions

Where a surface exposes value or style hooks, prefer these names:

`value`, `defaultValue`, `onValueChange`, `disabled`, `readonly`, `required`, `invalid`, `loading`, `unstyled`, `classes`, `styles`, `cssVariables`, `size`, `variant`

Controlled detection and ownership rules: [Controlled state](/concepts/controlled-state), [Uncontrolled state](/concepts/uncontrolled-state).

## Errors

Public failures use typed `SometicError` with stable codes (`isSometicError` helpers). Do not rely on legacy error class names from earlier product identity. See [Beta maturity](/releases/beta) and [Changelog](/releases/changelog).

## What is not documented as shipped

The following are **Deferred** for this beta and must not be treated as public catalog APIs:

- Menu
- Combobox
- Drawer
- Tabs / Accordion / Command Palette / Tree catalogs

Select, Popover, Dialog, and Toast are not substitutes for Menu or Combobox.

App primitives (feature flags, drafts, commands, history, conflict, offline queue, permissions) ship as engines. See [App primitives](/guide/app-primitives).

## Related links

- [Package index](/api/packages)
- [Releases](/releases/)
- [Changelog](/releases/changelog)
- [Architecture](/concepts/architecture)
- [Tree shaking](/concepts/tree-shaking)
