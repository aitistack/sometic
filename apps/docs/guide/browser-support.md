# Browser support

Sometic targets **modern evergreen browsers** (current stable Chrome, Firefox, Safari, Edge). Support is claimed where automated tests run; see [Compatibility](/frameworks/compatibility) and [Beta maturity](/releases/beta).

## Baseline expectations

| Capability                            | Requirement                                   |
| ------------------------------------- | --------------------------------------------- |
| ES modules                            | Native `import` in the browser or a bundler   |
| Custom Elements                       | Custom Elements v1 for `@sometic/elements`     |
| Web Crypto                            | Required for OIDC PKCE and related auth flows |
| `AbortController`                     | Async actions, HTTP cancellation              |
| `ResizeObserver` / `MutationObserver` | Used by some DOM helpers where applicable     |

## Not claimed

- Internet Explorer
- Obsolete evergreen versions outside current stable channels
- React Native / non-DOM hosts for UI adapters
- Using `@sometic/react` through `preact/compat` without the Experimental Preact store bind path

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
