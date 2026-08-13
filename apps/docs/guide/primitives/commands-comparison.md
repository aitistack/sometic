# Commands comparison

| Option                               | Strengths                                            | Tradeoffs                                  |
| ------------------------------------ | ---------------------------------------------------- | ------------------------------------------ |
| **`@sometic/commands`**              | Shared execute path, canExecute, disposable registry | No UI, no search ranking                   |
| **Command palette (`@sometic/dom`)** | Filterable list, keyboard UX                         | Presentation only unless you wire handlers |
| **Ad-hoc onClick handlers**          | Fast for one button                                  | Diverges across menu, hotkey, and tests    |
| **Workflow / saga engines**          | Durable steps, retries                               | Heavy for simple app actions               |

Choose the registry when the same action must run from multiple surfaces with one availability rule. Choose the palette for searchable chrome. Prefer a workflow engine for durable server-driven sagas.
