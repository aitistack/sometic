# Events, Overview

`@sometic/events` provides a tiny typed event emitter for framework-independent orchestration.

## When to use

- Cross-module notifications inside engines
- One-off lifecycle signals with `once`
- Abortable subscriptions via `AbortSignal`

## When not to use

- Application UI state (use store in Phase 3)
- DOM native events (preserve native listeners)
- Cross-tab messaging (dedicated store/auth channels later)

## Install

```bash
pnpm add @sometic/events
```
