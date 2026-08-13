# Conflict comparison

| Option                        | Strengths                                   | Tradeoffs                                   |
| ----------------------------- | ------------------------------------------- | ------------------------------------------- |
| **`@sometic/conflict`**       | Records + strategies, subscribe, disposable | Does not detect conflicts for you           |
| **Server always wins reload** | Simple                                      | Drops local work without a record           |
| **CRDT / OT**                 | Character-level concurrent merge            | Heavy for discrete document conflicts       |
| **Status UI only**            | Shows a badge                               | Still needs an engine for resolution values |

Choose Sometic conflict when offline flush or multi-tab edits produce discrete local/remote pairs. Prefer CRDT when concurrent editors must merge continuous text.
