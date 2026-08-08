# Primitives

Foundation packages that every Sometic feature and adapter builds on. These are **not** a visual UI kit. They are small, SSR-safe, framework-independent engines for state, events, styling contracts, accessibility DOM helpers, positioning, validation, and date adapters.

<CopyPrompt surface="foundation" />

Prefer these pages when you need the behavior engine directly (Vanilla controllers, custom adapters, tests). Prefer [Components](/components/) when you want React, Vue, or `sometic-*` elements.

## Inventory

| Package                          | Role                                                                                     | Docs                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------ |
| `@sometic/core`                   | Environment, ids, disposable, errors, result, controllable state, async operation, utils | [Core](/primitives/core)                   |
| `@sometic/events`                 | Typed event emitters                                                                     | [Events](/primitives/events)               |
| `@sometic/dom`                    | Imperative controllers for buttons, fields, inputs, overlays, toast, alert               | [DOM](/primitives/dom)                     |
| `@sometic/accessibility`          | Focus, keyboard, dismiss, portal, scroll lock, announcer, observers                      | [Accessibility](/primitives/accessibility) |
| `@sometic/styling`                | Class/style resolvers, slots, state attributes, polymorphic `as`                         | [Styling](/primitives/styling)             |
| `@sometic/validation`             | Native validators, compose helpers, schema-adapter contract                              | [Validation](/primitives/validation)       |
| `@sometic/date-core` (+ adapters) | Date adapter contract and native / Day.js / date-fns implementations                     | [Date adapters](/primitives/date)          |
| `@sometic/positioning`            | First-party flip/shift placement for anchored overlays                                   | [Positioning](/primitives/positioning)     |

## When to start here

- You are wiring a Vanilla or custom-element surface without a framework adapter.
- You need SSR-safe runtime detection, disposable cleanup, or controllable state shared across engines.
- You are composing focus traps, dismiss layers, or live announcements into your own overlay.
- You want validators or a date adapter without pulling a full form UI.

## When to skip ahead

- Application UI state → [Store](/stores/store)
- Theme tokens and CSS variable generation → [Theming](/theming/)
- Auth / HTTP → [Services](/services/)
- Ready-made React / Vue / CE widgets → [Components](/components/)

## Dependency reminder

Adapters and integrations → features → foundation. Cores never import React, Vue, or other UI frameworks. See [Architecture](/concepts/architecture) and [Package index](/api/packages).

## Related

- [API packages](/api/packages)
- [Controlled state](/concepts/controlled-state)
- [Styling slots](/concepts/styling-slots)
- [Framework adapters](/concepts/framework-adapters)
- [Components](/components/)
- [Forms](/forms/)
- [Services](/services/)
- [Beta maturity](/releases/beta)
