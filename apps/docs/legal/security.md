# Security

**Last updated:** 14 August 2026

Sometic is open-source software. We take security reports seriously and prefer coordinated disclosure.

## Reporting a vulnerability

**Do not** open a public GitHub issue for unfixed, exploitable vulnerabilities.

Use **GitHub Security Advisories** (private vulnerability report) on the Sometic packages repository:

https://github.com/aitistack/sometic/security/advisories/new

Do not email npm org profile addresses. There is no public security mailbox yet.

Include:

- Affected package name and version
- Environment (browser, Node, SSR framework)
- Reproduction steps or a minimal proof of concept
- Impact assessment (confidentiality, integrity, availability)
- Whether you plan to disclose publicly and on what timeline

## What to expect

- Acknowledgement when the team is available
- An initial severity assessment
- A fix, mitigation, or explanation if the report is out of scope
- Credit in release notes when you want to be named

We may take longer during beta while the API surface is still settling. Critical issues affecting published packages are prioritized.

## Scope

**In scope (examples):**

- XSS sinks introduced by Sometic adapters when used as documented
- Auth/session helper flaws that leak tokens through documented APIs
- Prototype pollution or unsafe merges in shared utilities
- SSR leakage of secrets through documented store/auth APIs

**Out of scope (examples):**

- Vulnerabilities only present when documented security guidance is ignored (for example logging tokens, storing long-lived secrets in `localStorage` against advice)
- Issues solely in third-party providers (Firebase, Supabase, IdPs) unrelated to Sometic’s adapter glue
- Denial of service via unbounded consumer data with no practical package-level fix
- Social engineering, physical attacks, or stolen contributor credentials (report account issues to GitHub)

## Machine-readable contact

A brief contact file is also published at [/.well-known/security.txt](/.well-known/security.txt).

## Related consumer docs

- [Authentication](/authentication/) — session and token guidance
- [Privacy policy](/legal/privacy) — documentation Site data practices
- [Terms of use](/legal/terms)
