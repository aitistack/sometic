# ADR-0015: npm Scope `@sometic` (Superseded)

- **Status:** Superseded by ADR-0017
- **Date:** 2026-08-07
- **Deciders:** Launch shift plan acceptance
- **Tags:** architecture | tooling | api

## Supersession

This ADR adjusted the npm scope lock after ADR-0012. **ADR-0017** now owns the full identity: product **Sometic**, scope **`@sometic`**, CE **`sometic-*`**, docs URL, and npm org **`sometic`**.

## Context (historical)

A hard cut before first publish was required so day-one packages ship under one owned scope. The npm organization **`sometic`** is the publish home.

## Decision (historical; see ADR-0017)

1. Public npm scope is **`@sometic`**.
2. No dual-scope shims while unpublished.
3. Own the npm organization matching the scope before first publish.

## References

- ADR-0012 (superseded)
- ADR-0017 (current)
