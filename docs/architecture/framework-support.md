# Framework Support

## Policy

Claim support only when automated tests cover the documented version range. Maintain a public compatibility matrix (created with first adapters; updated every release).

## Rollout Order (locked)

### Wave A — initial primary targets

1. React
2. Vue
3. Vanilla DOM controllers
4. Web Components (`@sometic/elements`)

### Wave B — after contracts stabilize

5. Modern Angular (standalone components, Signals where appropriate, `ControlValueAccessor`)
6. Svelte
7. SolidJS
8. Preact

### Wave C — HTML-first / legacy

9. Alpine.js
10. jQuery
11. HTMX
12. AngularJS — **isolated legacy package only**; must never shape modern APIs

## Per-Framework Test Requirements

For each supported framework version range:

| Check                             | Required |
| --------------------------------- | -------- |
| Minimum supported version         | Yes      |
| Current supported version         | Yes      |
| SSR (where applicable)            | Yes      |
| Development build                 | Yes      |
| Production build                  | Yes      |
| Type declarations                 | Yes      |
| Tree-shaking smoke                | Yes      |
| Unmount / cleanup                 | Yes      |
| Contract tests vs shared behavior | Yes      |

## Conceptual Mapping

Adapters must map these concepts consistently even when syntax differs:

Props · state · events · refs · slots · children · controlled/uncontrolled values · lifecycle · context · SSR · errors · styling · accessibility

## Store Bindings

| Framework | Preferred binding          |
| --------- | -------------------------- |
| React     | `useSyncExternalStore`     |
| Vue       | refs / reactive bindings   |
| Angular   | Signals                    |
| Svelte    | stores                     |
| Solid     | signals                    |
| Preact    | external store integration |
| Vanilla   | subscribe API              |

## Version Floors (initial policy — refine with CI matrices in Phase 13)

| Runtime                   | Policy                                                                    |
| ------------------------- | ------------------------------------------------------------------------- |
| Node.js (tooling/CLI/SSR) | Active LTS only; exact floor set in Phase 1 `engines`                     |
| TypeScript (consumers)    | Support current and previous major while feasible; publish modern `.d.ts` |
| Browsers                  | Last 2 versions of Chrome, Firefox, Safari, Edge; no IE                   |
| React                     | 18+ (confirm with Wave A tests)                                           |
| Vue                       | 3.4+                                                                      |
| Angular                   | Modern versions only for `@sometic/angular` (not AngularJS)                |

Exact semver ranges are published in each adapter README and the compatibility matrix — not claimed earlier than tests exist.

## Related

- ADR-0009 Framework adapter contract
- architecture context
- `beta-scope` architecture companion in `versioning-and-releases.md`
