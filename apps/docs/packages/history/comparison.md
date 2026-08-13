# History comparison

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| **`@sometic/history`** | Portable undo/redo, depth cap, exclusive chain | Local stack only; not multiplayer |
| **`@sometic/activity`** | Append-only audit feed | Not reversible |
| **Editor / CRDT stacks** | Concurrent merge | Heavy; different sync model |
| **Browser History API** | Navigation URLs | Not document edit undo |

Choose Sometic history for canvases, documents, and settings that need undo next to `@sometic/commands`. Prefer OT/CRDT when many users edit the same document concurrently.
