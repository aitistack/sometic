# Offline queue comparison

| Option                                       | Strengths                                           | Tradeoffs                      |
| -------------------------------------------- | --------------------------------------------------- | ------------------------------ |
| **`@sometic/offline-queue`**                 | Durable outbox, epoch hooks, optional conflict open | You supply transport + storage |
| **`createSessionMutationQueue` (App Shell)** | Tiny, drops on epoch, no persistence                | Dies with the tab              |
| **Full sync engines**                        | Pull/push, cursors, server merge                    | Heavy; different product job   |
| **Retry inside HTTP only**                   | Simple for one request                              | No durable multi-job outbox    |

Choose the durable queue when offline writes must survive reload and share epoch policy with auth. Keep the session queue for ephemeral retries. Prefer a sync product for bidirectional replication.
