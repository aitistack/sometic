# ADR-0012: Sometic Product Identity and npm Scope Migration

- **Status:** Superseded by ADR-0017
- **Date:** 2026-08-05
- **Deciders:** Phase 13 plan acceptance (1A, 2C, 3A, 4B, 5B, 6A)
- **Tags:** architecture | tooling | api

## Supersession

This ADR recorded the Phase 13 brand lock. **ADR-0017** is now authoritative for product name **Sometic**, npm scope **`@sometic`**, CE prefix **`sometic-*`**, and docs URL.

## Context (historical)

The public product identity was locked before beta. Packages had never been published to npm. Parent brand remains AitiStack.

## Decision (historical; see ADR-0017)

1. Public npm scope and product identity as then locked (later noted in ADR-0015, then fully superseded by ADR-0017).
2. Custom elements and TypeScript classes use the product prefix of record.
3. No compatibility shim packages while unpublished.
4. Consumer VitePress is product-branded; maintainer docs stay under `docs/`.
5. Product docs URL and AitiStack attribution as then stated.

## References

- ADR-0015 (superseded)
- ADR-0017 (current)
