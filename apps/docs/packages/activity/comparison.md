# Activity comparison

| Option                      | Strengths                                                     | Tradeoffs                                          |
| --------------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| **`@sometic/activity`**     | Portable append/filter/page API, disposable, injectable clock | In-memory; no UI shell; not a compliance store     |
| **Custom Redux/store list** | Fits existing app state                                       | Reimplement pagination cursors and filters per app |
| **Full audit platforms**    | Durability, search, retention policies                        | Heavy; server-centric                              |
| **Notification center**     | Read/unread inbox UX                                          | Different product job (alerts vs timeline)         |

Choose Sometic activity for a shared client timeline model next to notifications and approval. Use a dedicated audit service when regulators need durable, queryable history.
