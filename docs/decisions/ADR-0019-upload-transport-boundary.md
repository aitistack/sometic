# ADR-0019: Upload transport boundary

- **Status:** Accepted
- **Date:** 2026-08-12
- **Deciders:** Sometic maintainers
- **Tags:** architecture | api | security

## Context

File picking already exists in `@sometic/dom/input-file`. Upload/download needs progress, cancel, retry, concurrency, and network transport. Baking Fetch/XHR or cloud SDKs into a core would lock backends and violate provider-independence norms used by auth/http.

## Decision

Publish `@sometic/upload` with an `UploadTransport` interface (`upload(file, { signal, onProgress })`). Queue state (items, progress, pause/cancel/retry, concurrency) lives in the package. Optional helpers may peer `@sometic/http`; provider SDKs (S3, Firebase Storage, etc.) stay consumer-owned or future optional adapters. `@sometic/dom/upload` owns dropzone/list resolve and composes file input; adapters stay thin.

## Alternatives Considered

1. Extend `input-file` only: rejected (no network lifecycle).
2. Hard-require `@sometic/http` inside upload core: rejected (forces HTTP peer for non-HTTP transports).
3. Embed cloud SDKs: rejected (auth-style provider boundary violation).

## Reasons

- Matches auth provider and HTTP adapter boundaries.
- Keeps core dependency-light and SSR-safe (no browser globals at import time).
- Lets consumers plug XHR, fetch, or signed-URL uploads without forks.

## Consequences

- Consumers must supply a transport (or use a documented HTTP helper when peers are installed).
- Download progress remains best-effort depending on environment APIs.

## Risks

- Incomplete transports causing silent no-ops. Mitigate with typed errors and playground mock transport.
- Progress event inconsistencies across browsers. Document and normalize in helpers.

## Migration Impact

Additive. Existing `input-file` consumers unchanged; adopt upload when network queue is needed.

## Enforcement

- No cloud SDKs in `@sometic/upload` dependencies
- PeerOptional `@sometic/http` only
- Tests against mock transports + AbortSignal
- Consumer FAQ / comparison

## References

- Related ADRs: ADR-0002, ADR-0006, ADR-0018
- Related phases: Phase 21
