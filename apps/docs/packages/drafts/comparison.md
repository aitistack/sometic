# Drafts comparison

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| **`@sometic/drafts`** | Entity drafts, migrate/omit/sanitize, injectable storage | One keyed record; not multi-device sync |
| **`@sometic/forms` drafts** | Tied to form controllers and field paths | Wrong layer for free-form documents |
| **Raw localStorage** | Zero deps | No version migrate, debounce, or dispose |
| **CRDT / sync backends** | Cross-device merge | Heavy; different product job |

Choose `@sometic/drafts` for portable entity restore next to App Shell. Keep `@sometic/forms` drafts for form field restore. Use a sync product when drafts must merge across devices.
