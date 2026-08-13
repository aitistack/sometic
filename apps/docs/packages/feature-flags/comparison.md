# Feature flags comparison

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| **`@sometic/feature-flags`** | Portable evaluate/override API, disposable, framework-free | No hosted targeting, rollouts, or analytics |
| **LaunchDarkly / Flagsmith / Unleash SDKs** | Targeting, percentage rollouts, dashboards | Vendor SDK in every surface; heavier default graph |
| **Hardcoded env booleans** | Tiny | No runtime override, no shared snapshot across adapters |
| **Custom store map** | Fits existing state | Reimplement precedence, subscribe, and dispose per app |

Choose Sometic when every adapter must share one evaluation model and you already own flag delivery. Prefer a hosted platform when targeting rules and experiment attribution are product requirements.
