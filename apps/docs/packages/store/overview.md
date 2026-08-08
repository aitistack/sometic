# Store, Overview

`@sometic/store` is a minimal external store designed for `useSyncExternalStore`, signals, and Vanilla subscriptions.

## Modules

| Module           | Import                                 |
| ---------------- | -------------------------------------- |
| Basic store      | `@sometic/store`                       |
| Selector helper  | `@sometic/store` → `select`            |
| Persistent store | `@sometic/store/persistent`            |
| Cross-tab store  | `@sometic/store/cross-tab`             |
| Immer adapter    | `@sometic/store-immer` (optional peer) |

## When to use

Shared application or engine state that must work across frameworks.

## When not to use

- Component-local controlled props → `@sometic/core/controllable-state`
- Pub/sub events → `@sometic/events`
