# Core, FAQ

## Can I import everything from the root?

Yes (`@sometic/core`). Prefer subpaths for optimal tree-shaking and clearer ownership.

## How does controlled state get external updates?

Mutate the options object’s `value` (framework adapters will sync props each render). Uncontrolled mode keeps internal state.

## Does `concurrency: "parallel"` track multiple statuses?

Each `execute` call still updates the shared `state` to the latest settled transition. Prefer `latest` for UI actions; use `parallel` only when overlapping work is intentional and you mainly care about abort/timeout plumbing.

## Are timers cleaned up?

`debounce`/`throttle` expose `cancel`. Async timeouts clear in `finally`. Always `dispose` subscriptions and stacks.

## SSR safe?

Yes, detection APIs read globals only when called. Do not touch DOM during module evaluation.

## Bundle size?

Subpath budgets are enforced (`environment`/`utils` ≤1.5KB gzip goals). Prefer subpath imports.
