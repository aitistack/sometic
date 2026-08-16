# Security policy (maintainer)

Public reporting instructions live in root `SECURITY.md`, [sometic.dev/legal/security](https://sometic.dev/legal/security), and `/.well-known/security.txt`. This file is the maintainer policy those surfaces must match.

## Contact (single channel)

- **GitHub Security Advisories:** https://github.com/aitistack/sometic/security/advisories/new
- No public GitHub issues for unfixed, exploitable vulnerabilities.
- No `mailto:` until a dedicated security inbox exists and is monitored.

## Scope

**In scope:** XSS sinks in documented adapter usage; auth/session helper flaws that leak tokens through documented APIs; unsafe merges in shared utilities; SSR leakage of secrets through documented store/auth APIs; supply-chain issues in this repository’s release path.

**Out of scope:** Ignoring documented storage/logging guidance; issues solely in third-party IdPs or provider SDKs; unbounded consumer data with no practical package-level fix; stolen contributor credentials (report to GitHub).

## What we will not claim

- SOC2, ISO, WCAG, or SLSA 3+ certification
- “Sometic secures your APIs”
- Client `can()` / route guards / HTTP policy interceptors as an API trust boundary
- In-browser verification of OIDC `id_token` / nonce
- Bit-identical minified CDN bundles

Client auth is a **coordinator**. Backends and resource servers remain authoritative.

## Disclosure and beta SLA language

This project is in public beta. We aim to:

- Acknowledge private reports when a maintainer is available
- Prioritize critical issues that affect already published `@sometic` packages
- Credit reporters in release notes when they want to be named

We do **not** promise a fixed first-response clock (for example “24 hours”) while the API surface is still settling. Critical published-package issues are still treated as the highest priority.

Please allow reasonable time before public disclosure after we acknowledge a valid report.

## Supply chain

Trusted publishing, provenance, and the protected `npm-publish` environment are described in `docs/security/release-runbook.md` and ADR-0024. GitHub/npm UI toggles are a maintainer gate.

## Related

- `docs/security/auth-client-boundary.md`
- `docs/security/http-client-boundary.md`
- `docs/security/auth-providers.md`
- ADR-0006, ADR-0024
