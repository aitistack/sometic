# Core, Overview

`@sometic/core` is the foundation package for Sometic. Phase 2 ships production-grade primitives used by every later package.

## Modules

| Module             | Subpath                           | Purpose                                   |
| ------------------ | --------------------------------- | ----------------------------------------- |
| Environment        | `@sometic/core/environment`        | SSR-safe runtime detection                |
| Id                 | `@sometic/core/id`                 | Stable unique ids                         |
| Disposable         | `@sometic/core/disposable`         | Cleanup contracts + stack                 |
| Error              | `@sometic/core/error`              | Typed errors with stable codes            |
| Result             | `@sometic/core/result`             | Explicit success/failure values           |
| Contracts          | `@sometic/core/contracts`          | Plugin/adapter/lifecycle types            |
| Controllable state | `@sometic/core/controllable-state` | Controlled/uncontrolled state             |
| Async operation    | `@sometic/core/async-operation`    | Pending/success/error/abort orchestration |
| Utils              | `@sometic/core/utils`              | Debounce, throttle, abort helpers, etc.   |

## When to use

Shared, framework-independent behavior that must stay small, SSR-safe, and dependency-light.

## When not to use

- Do not use core as a UI kit
- Prefer `@sometic/events` for typed pub/sub (not reinvented emitters)
- Prefer `@sometic/store` (Phase 3) for application state stores
