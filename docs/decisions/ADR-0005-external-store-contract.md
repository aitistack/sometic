# ADR-0005: External Store Contract

- **Status:** Accepted
- **Date:** 2026-08-04
- **Deciders:** Phase 0 architecture lock
- **Tags:** architecture | api

## Context

Frameworks need a shared state primitive that maps cleanly to `useSyncExternalStore`, signals, Vue refs, and Vanilla subscriptions without pulling any framework into core.

## Decision

Ship a minimal external store contract in `@sometic/store`:

```ts
export interface Store<TState> {
    get(): TState;
    set(nextState: TState): void;
    update(updater: (currentState: TState) => TState): void;
    subscribe(listener: StoreListener<TState>): StoreUnsubscribe;
}
```

The final surface may grow slightly (disposal, batched notify, selectors) but must remain minimal and framework-agnostic. Persistence, cross-tab, and Immer integration are layered modules/adapters — Immer is never part of core.

## Alternatives Considered

1. Adopt Redux/Zustand as core — extra opinions and dependency weight
2. Framework stores only — duplicates persistence/cross-tab logic
3. Large reactive system in core — risks size and SSR complexity

## Reasons

A tiny external store is the interoperability sweet spot for our adapter strategy and size budgets.

## Consequences

- Framework bindings stay thin
- Advanced features are opt-in modules
- Contract tests define expected notify/equality behavior

## Risks

- Pressure to grow the core store — mitigate with explicit module splits and size budgets
- Equality/batching subtle bugs — mitigate with thorough unit tests

## Migration Impact

Pre-1.0 contract may evolve with changelogs; after stable, changes follow SemVer.

## Enforcement

Phase 3 tests + ADR review for any core store expansion; bundle budget for store core ≤ 1.5 KB gzip goal.

## References

- Phase 3 roadmap
- ADR-0009
- `performance-budgets.md`
