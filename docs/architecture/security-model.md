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

## Supply Chain (Phase 24)

npm trusted publishing (OIDC only, no `NPM_TOKEN` fallback) · provenance · protected `npm-publish` environment · dependency review · CodeQL · OSSF Scorecard · secret scanning · lockfile integrity · publication dry runs for every public package · `docs/security/POLICY.md`

GitHub/npm UI toggles (Trusted Publisher, environment reviewers, secret scanning, private vulnerability reporting) are a maintainer gate. See `docs/security/release-runbook.md` and ADR-0024.

## Vulnerability Reporting

Report privately via GitHub Security Advisories. Root `SECURITY.md`, consumer `/legal/security`, and `/.well-known/security.txt` share that single contact. No `mailto:` until a dedicated inbox exists.

## Claims Policy

Do not claim SOC2, ISO, or WCAG certification unless independently obtained. Speak precisely: “designed for…”, “tested with…”, “follows…”.

## Related

- ADR-0006 Authentication provider boundaries
- ADR-0007 Source generation versus packages
- ADR-0024 npm trusted publishing and provenance
- `docs/security/` (POLICY, release runbook, auth/HTTP boundaries)
