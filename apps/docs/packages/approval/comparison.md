# Approval comparison

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| **`@sometic/approval`** | Multi-step assignees, require-all, three decision kinds, history, portable | Not BPMN; no visual stepper CE yet |
| **Workflow engines (Temporal, Camunda)** | Durable orchestration, timers, compensation | Ops weight; overkill for simple UI approvals |
| **Ad-hoc boolean flags** | Quick | Breaks on multi-approver and request-changes |
| **Ticket systems** | Human process tools | Not embeddable as app behavior |

Choose Sometic when in-product approvals must behave identically in React and Vanilla. Choose a workflow engine when approvals span days, webhooks, and compensations across services.
