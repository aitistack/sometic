# Performance and Bundle Size Budgets

## Product Goal

Minimal size and strong runtime performance are major product goals — not afterthoughts.

## Initial Gzip Targets (locked goals)

| Feature                             | Gzip target                         |
| ----------------------------------- | ----------------------------------- |
| Core utilities                      | ≤ 1.5 KB                            |
| Event system                        | ≤ 1 KB                              |
| Store core                          | ≤ 1.5 KB                            |
| Styling resolver                    | ≤ 2 KB                              |
| Button behavior                     | ≤ 1.5 KB                            |
| React Button adapter                | ≤ 2 KB                              |
| Basic Input behavior                | ≤ 3 KB                              |
| Theme engine                        | ≤ 3 KB                              |
| Auth core                           | ≤ 8 KB                              |
| HTTP client                         | ≤ 6 KB                              |
| Auth provider adapter (excl. peers) | ≤ 4–5 KB                            |
| Validation root                     | ≤ 3 KB                              |
| Forms root                          | ≤ 6.5 KB                            |
| Forms schema-form (subpath)         | ≤ 5.5 KB                            |
| Provider adapters                   | Adapter logic only (peers external) |

Measure published/entry exports consumers actually import. Prefer subpath imports for optional features.

## When a Target Cannot Be Met

1. Measure accurately (document tool + commit SHA)
2. Identify cause
3. Remove unnecessary code
4. Split optional functionality / subpath exports
5. Lazy-load advanced behavior
6. Document final size in phase report and package docs
7. Update ADR-0010 or a follow-up ADR — never hide growth

## Runtime Performance Themes

Track and regress where practical:

- Cold import time
- Component create/update
- Store subscription cost
- Theme switching (avoid full-app rerenders)
- Input typing and large forms
- Auth refresh coordination overhead
- DOM listener counts and memory retention
- Large table/virtualization paths (Phase 20)

## Tooling

Phase 1 introduces Size Limit (or equivalent) + bundle analysis in CI for packages with budgets. Phase 24 hardens benchmarks and writes `docs/performance/` reports.

## Comparison Policy

Do not publish misleading competitive comparisons. Methodology, environment, and versions must accompany any public numbers.

## Related

- ADR-0010 Bundle size budgets
- `testing-strategy.md`
