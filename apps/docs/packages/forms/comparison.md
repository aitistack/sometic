# Forms comparison

| Library              | Notes                                                       |
| -------------------- | ----------------------------------------------------------- |
| `@sometic/forms`      | Headless, framework-independent; Wave A thin adapters       |
| React Hook Form      | React-first; excellent DX but not shared Vanilla/Vue engine |
| Formik               | React-centric; heavier historical API                       |
| Native FormData only | No field meta, async races, or server-error mapping         |

Choose Sometic when one behavior model must span Vanilla, React, Vue, and Elements.
