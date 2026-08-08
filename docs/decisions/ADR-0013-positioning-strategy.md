# ADR-0013: Positioning Strategy

- **Status:** Accepted
- **Date:** 2026-08-05
- **Deciders:** Phase 19 Option A
- **Tags:** architecture | api | overlay

## Context

Overlays (Popover, Tooltip, Menu, Combobox) need placement relative to anchors with collision handling. Floating UI is the industry default but must not become a mandatory core dependency.

## Decision

- Ship `@sometic/positioning` as a **first-party**, zero-runtime-dependency geometry engine (`computePosition` with flip/shift).
- Expose a `PositioningAdapter` contract so a Floating UI (or other) adapter can be introduced later without rewriting overlay engines.
- Overlay/DOM engines depend on `@sometic/positioning` (or an injected adapter), never on a third-party positioning library directly.
- Strategy for Phase 19 Option A: `absolute` coordinates only; `fixed` / auto-update observers can layer later.

## Alternatives Considered

1. Bundle `@floating-ui/dom` in core — size + preference lock-in
2. Defer all positioning to consumers — breaks universal Popover/Tooltip promise
3. CSS-only anchors — insufficient collision/SSR control for shared engines

## Reasons

Matches date/auth adapter patterns; keeps foundation dependency-light; meets roadmap “isolate positioning library behind an adapter.”

## Consequences

- First-party engine must cover flip/shift well enough for beta overlays
- Advanced middleware (arrow, hide, size constraints) may arrive later or via adapter
- Docs must explain why first-party vs Floating UI

## Risks

- Edge cases (transformed ancestors, iframes, RTL) — document limitations; harden when Combobox ships
- Adapter drift — mitigate with shared contract tests

## Migration Impact

None (greenfield). Future Floating UI adapter is additive.

## Enforcement

Phase 19 exit; dependency rules (`dom` → `positioning` → `core`); no Floating UI in foundation packages.

## References

- release history
- `docs/architecture/package-map.md`
- ADR-0008 (date adapter pattern)
