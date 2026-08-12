# Notifications comparison

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| **`@sometic/notifications` + center** | Portable inbox model, group/read/dismiss, DOM/React center | Not push-provider SDKs; no CE |
| **Firebase / OneSignal inboxes** | Delivery infrastructure | Provider lock-in; still need UI state |
| **Toast-only** | Simple feedback | No history or unread count |
| **Email** | Durable out-of-band | Not in-app UX |

Choose Sometic for in-app inbox behavior shared across stacks. Keep provider SDKs at the delivery edge and map payloads into `push` / `pushMany`.
