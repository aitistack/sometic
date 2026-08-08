# Browser and Runtime Support Policy

## Browsers

| Tier              | Support                                              |
| ----------------- | ---------------------------------------------------- |
| Evergreen         | Last 2 major versions: Chrome, Edge, Firefox, Safari |
| iOS Safari        | Last 2 major versions                                |
| IE / legacy Edge  | Not supported                                        |
| Embedded WebViews | Best-effort; document quirks when discovered         |

Features requiring newer APIs (e.g. `BroadcastChannel`) must degrade or document fallbacks (as with cross-tab store storage-event fallback).

## Node.js

- Tooling, CLI, and SSR test runners: **Active LTS only**
- Exact `engines` field set in Phase 1 root `package.json`
- Do not require bleeding-edge Node features without an ADR

## Module Format

- Published packages: ESM-first
- Types: dual-friendly declaration emit as configured in Phase 1 build tooling
- CJS: only if a documented compatibility need appears (requires ADR)

## SSR / RSC

- Cores and adapters must be import-safe on server
- Browser APIs only after explicit runtime checks
- Framework RSC/'use client' boundaries documented per adapter when applicable

## Related

- `framework-support.md`
- ADR-0002
