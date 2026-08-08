# World-Class Quality Standard

## Non-Negotiable Bar

Every public module, component, engine, adapter, and package must be **world-class and production-grade**: complete edge coverage in code, and complete consumer answers in documentation.

**No consumer should need to ask:**

- “Why does this work this way under the hood?”
- “Why should I use this instead of X?”
- “What happens in edge case Y?”
- “Is this safe for production / SSR / a11y / my framework?”

If a reasonable professional developer would ask it, the answer must already exist in docs, FAQs, examples, or typed APIs — and the behavior must already be implemented and tested.

## Definition of World-Class

A deliverable is world-class only when **all** of the following are true:

1. **Behavior completeness** — happy path, failure path, cancellation, reentrancy, empty/null/invalid inputs, SSR, cleanup, concurrency, and framework-idiomatic usage are implemented — not stubbed.
2. **Edge coverage in code** — edges are handled in implementation and proven by tests, not deferred as “known limitations” unless truly out of scope and documented with rationale and workaround.
3. **Comparison clarity** — consumer docs answer _why this_ vs common alternatives (native HTML only, competing libs, rolling your own, other providers/styling approaches) without marketing fluff.
4. **Under-the-hood clarity** — maintainer + consumer docs explain architecture, tradeoffs, and security/perf implications so nobody must reverse-engineer intent.
5. **FAQ completeness** — every module ships an FAQ that anticipates real adoption questions (install, peers, SSR, styling, a11y, migration, size, when-not-to-use).
6. **Professional DX** — predictable APIs, excellent IntelliSense, copy-paste examples for JS and TS, framework guides for supported adapters, troubleshooting that names real failure modes.
7. **Production honesty** — maturity labels match reality; limitations are explicit; no mock-as-production; no “it mostly works.”

## Strict Rules for Agents

- Do **not** ship shallow wrappers, demo-quality components, or “MVP then polish later” for anything labeled Level 2+ or public beta.
- Do **not** leave “obvious” questions unanswered in consumer docs.
- Do **not** treat FAQ writing as optional cleanup — it is part of the phase exit criteria.
- Prefer depth on fewer modules over breadth of mediocre modules (aligns with beta scope).
- When implementing a component family, enumerate edges in the phase plan **before** coding; every listed edge must be coded, tested, and FAQ’d or explicitly deferred with justification.

## Required Consumer Doc Sections (per public module)

In addition to existing consumer docs, every public module must include:

| Section                                                 | Must answer                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `overview.md` — Why this                                | Why this module exists; when to use; when **not** to use                                                |
| `overview.md` or `comparison.md` — Why not alternatives | Honest comparison vs native-only, roll-your-own, and common libraries in the same problem space         |
| `architecture` summary for consumers                    | Enough under-the-hood to trust it (data flow, ownership, SSR, security boundary) without reading source |
| `faq.md`                                                | Anticipated questions; minimum bar below                                                                |
| `troubleshooting.md`                                    | Real failure modes and fixes                                                                            |
| `examples.md`                                           | Production-shaped examples, not toy-only snippets                                                       |

### FAQ minimum bar

Every `faq.md` must cover, where applicable:

- Install / peer dependency questions
- TypeScript vs JavaScript usage
- Controlled vs uncontrolled
- Styling mode questions (unstyled, tokens, Tailwind, Bootstrap, CSS variables)
- SSR / hydration
- Accessibility expectations and limitations
- Bundle size / tree-shaking / subpath imports
- Framework-specific gotchas for supported adapters
- Security boundaries (especially auth, HTTP, storage)
- Migration from common alternatives
- “Why under the hood did you choose X?” for every non-obvious design choice

## Edge Coverage Checklist (code + tests)

Before calling a module production-candidate (Level 2+), verify:

- [ ] Empty, null, undefined, and invalid external values
- [ ] Rapid repeated interaction (double-click, re-submit, re-entrancy)
- [ ] Cancellation / AbortSignal where async work exists
- [ ] Race conditions (latest-wins / configured strategy)
- [ ] Disabled / read-only / loading / error / success states
- [ ] Keyboard and focus paths
- [ ] SSR import safety and hydration where relevant
- [ ] Cleanup on unmount / dispose (no leaks)
- [ ] Multi-instance / multi-root page safety
- [ ] Cross-tab / persistence errors where those features exist
- [ ] Provider or adapter capability gaps (explicit, not silent failure)

## Phase Exit Gate

A phase that ships public consumer surface is incomplete unless:

1. Edge list from the plan is closed (implemented + tested or explicitly deferred with reason)
2. Comparison / why-this documentation exists
3. FAQ exists and answers under-the-hood and instead-of questions
4. No known “consumers will ask this next week” gaps remain unaddressed
5. Interactive / browser-visible surfaces are demoable in `apps/playground-vanilla` (and framework playgrounds when applicable)

## Related

- `documentation-strategy.md`
- `testing-strategy.md`
- `product-vision.md`
- Module maturity levels in `testing-strategy.md` / the project contributing guide
- project coding standards
