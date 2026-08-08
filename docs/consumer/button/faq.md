# Button — FAQ

## Why not put behavior in React?

Shared engines keep Vue/Vanilla/WC in parity (ADR-0002). Adapters only bind.

## Does loading disable the control?

Yes — loading implies non-interactive (`disabled` + `aria-busy` + ignored press).

## Icon buttons without visible text?

Pass a non-empty `aria-label` (engine throws if empty).

## Async races?

`createAsyncButtonController` uses `@sometic/core` async-operation (`concurrency: latest` by default).

## Shadow DOM?

Elements default to **Light DOM** so consumer CSS can target slots/`data-*` (ADR-0004).

## Bundle size?

Prefer `@sometic/dom/button` and `@sometic/react/button` subpaths. Behavior budget ≤1.5 KB gzip; React adapter ≤2 KB.
