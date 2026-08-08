# Auth comparison

| Library / approach           | Notes                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `@sometic/auth`              | Provider-agnostic orchestration + Wave A adapters; providers are separate packages |
| Auth.js / NextAuth           | Full-stack, framework-opinionated; not a shared Vanilla/Vue engine                 |
| Firebase Auth SDK alone      | Provider-locked; couples UI to Firebase                                            |
| Custom `fetch` + JWT helpers | Easy to miss refresh races, multi-tab logout, and capability gates                 |

Choose Sometic when one auth behavior model must span Vanilla, React, Vue, and Elements, with providers swappable later.
