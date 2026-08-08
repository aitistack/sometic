# Security Model

## Boundaries

| Layer                                                           | Trust                                                    |
| --------------------------------------------------------------- | -------------------------------------------------------- |
| Browser UI, route guards, hidden buttons, client `can`/`cannot` | UX only — not enforcement                                |
| `@sometic/auth` session/refresh orchestration                   | Client coordinator; follows provider + app backend rules |
| Backend APIs and resource servers                               | **Authoritative** authorization and session validity     |
| Provider SDKs                                                   | Live only in optional adapter packages as peers          |

## Non-Negotiables

- No provider SDKs inside `@sometic/auth` core
- Do not copy security-sensitive OAuth/refresh internals into CLI-generated consumer source
- Tokens and secrets must not appear in logs, errors thrown to UI, or analytics by default
- Document storage tradeoffs: `localStorage` / `sessionStorage` are not universally secure
- Redirect URIs, OAuth `state`, PKCE, and nonce handling must be validated; open redirects forbidden
- SSR: never assume browser session APIs at import time; hydrate explicitly

## Auth Refresh Security

- Deduplicate refresh; queue dependents; prevent infinite retry loops
- Support refresh-token rotation where providers offer it
- Multi-tab logout and refresh coordination without refresh storms
- Clock-skew tolerance and offline/visibility-aware behavior
- Session invalidation and disposal must be testable

## HTTP

- Prefer explicit auth interceptors with exclude lists
- Normalize errors without leaking upstream secrets
- AbortSignal support everywhere network I/O exists

## Supply Chain (Phase 23 hardening; prepare from Phase 1)

npm trusted publishing · provenance · protected release environments · dependency review · secret scanning · lockfile integrity · publication dry runs · vulnerability reporting process (`docs/security/` POLICY during Phase 23, draft earlier as needed)

## Vulnerability Reporting

Until a public SECURITY.md exists, treat security issues as private maintainer disclosure. Phase 23 publishes responsible disclosure process.

## Claims Policy

Do not claim SOC2, ISO, or WCAG certification unless independently obtained. Speak precisely: “designed for…”, “tested with…”, “follows…”.

## Related

- ADR-0006 Authentication provider boundaries
- ADR-0007 Source generation versus packages
- `docs/security/` (populated as reviews complete)
