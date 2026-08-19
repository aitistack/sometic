# Browser support

Sometic targets **modern evergreen browsers**. Support is claimed where automated tests run (Vitest with happy-dom, Playwright on evergreen channels). That is **not** a WCAG certification and not a vendor compatibility badge.

## Runtime matrix (beta)

| Runtime                                      | Claim                                                              |
| -------------------------------------------- | ------------------------------------------------------------------ |
| Chrome, Edge (current stable Chromium)       | Yes, where UI tests run                                            |
| Firefox (current stable)                     | Yes, where UI tests run                                            |
| Safari (current stable)                      | Yes, where UI tests run                                            |
| Node.js `>=20.18.0`                          | Tooling, SSR imports that avoid browser globals at evaluation time |
| Internet Explorer                            | No                                                                 |
| React Native / non-DOM hosts for UI adapters | No                                                                 |

See [Compatibility](/frameworks/compatibility) for framework packages and [Beta maturity](/releases/beta) for labels.

## Baseline expectations

| Capability                            | Requirement                                   |
| ------------------------------------- | --------------------------------------------- |
| ES modules                            | Native `import` in the browser or a bundler   |
| Custom Elements                       | Custom Elements v1 for `@sometic/elements`    |
| Web Crypto                            | Required for OIDC PKCE and related auth flows |
| `AbortController`                     | Async actions, HTTP cancellation              |
| `ResizeObserver` / `MutationObserver` | Used by some DOM helpers where applicable     |

## Not claimed

- Obsolete evergreen versions outside current stable channels
- Using `@sometic/react` through `preact/compat` without the Experimental Preact store bind path
- Every `sometic-*` tag for every engine (CE inventory is honest on [What’s included](/guide/whats-included))

## SSR and non-browser

Node (and other SSR runtimes) may import packages that avoid browser globals at evaluation time. DOM registration, focus, and storage still require a browser or injected shims. See [SSR](/guide/ssr).

## Polyfills

Sometic does not ship broad polyfills. If you must support an older engine, provide polyfills at the application boundary and verify focus, CE upgrade, and crypto yourself. That configuration is outside the beta support claim.

## Related

- [SSR](/guide/ssr)
- [Compatibility](/frameworks/compatibility)
- [Components](/components/)
- [Beta maturity](/releases/beta)
- [Troubleshooting](/guide/troubleshooting)
