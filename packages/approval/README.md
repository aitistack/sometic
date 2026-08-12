# `@sometic/approval`

Multi-step approval flow state for Sometic: ordered steps, assignees, approve, reject, and request changes decisions, parallel approvers, guarded transitions, and an append only decision history.

`createApprovalController` is a state machine, not a form. Every illegal move throws a typed error with a stable code: deciding a step that is not active, deciding a step twice as the same actor, deciding as someone who is not an assignee, or deciding while the flow is blocked by a rejection. That keeps invalid approval states out of your database instead of validating them after the fact.

Why it exists: approvals are where teams quietly reinvent a state machine per framework, usually without guards. Sharing one engine means React, Vue, and Vanilla surfaces agree on what is allowed.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) only. No browser globals at import time, so it works on the server too.

Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [https://sometic.aitistack.com](https://sometic.aitistack.com).

## Install

```bash
pnpm add @sometic/approval
```

```bash
npm install @sometic/approval
```

```bash
yarn add @sometic/approval
```

## Usage

```ts
import { createApprovalController } from "@sometic/approval";

const flow = createApprovalController({
    steps: [
        { id: "review", label: "Review", assigneeIds: ["reviewer"] },
        { id: "legal", label: "Legal", assigneeIds: ["lawyer-a", "lawyer-b"], requireAll: true },
        { id: "finance", label: "Finance", assigneeIds: ["cfo"] },
    ],
    onDecision: (record) => audit.append(record),
});

flow.approve({ actorId: "reviewer", note: "looks good" });
flow.approve({ actorId: "lawyer-a" });
flow.approve({ actorId: "lawyer-b" });

flow.getStatus();
```

Handle a blocked flow:

```ts
flow.requestChanges({ actorId: "cfo", note: "attach the receipt" });

flow.getState().closed;
flow.reopen("finance");
```

Subscribe and clean up:

```ts
const stop = flow.subscribe((state) => render(state));

stop();
flow.dispose();
```

## API

- `createApprovalController({ steps, stepIndex?, defaultStepIndex?, onStepIndexChange?, onDecision?, onStatusChange?, now? })`.
- `getState()` returns `{ status, stepIndex, steps, history, closed }` as copies.
- `getSteps()`, `getStep(id)`, `getActiveStep()`, `getStepIndex()`, `setStepIndex(index)`, `getStatus()`, `getHistory()`.
- `decide({ decision, actorId, stepId?, note? })` plus the `approve`, `reject`, and `requestChanges` shortcuts. Omit `stepId` to act on the active step.
- `reopen(stepId)` clears that step back to pending, moves the cursor to it, and leaves history intact.
- `subscribe(listener)`, `dispose()`, `disposed`.
- Steps with `requireAll` stay pending until every assignee has approved, so parallel reviewers work without extra bookkeeping.
- Error codes: `approval_empty_flow`, `approval_duplicate_step`, `approval_unknown_step`, `approval_no_active_step`, `approval_step_not_active`, `approval_step_already_decided`, `approval_actor_not_assignee`, `approval_duplicate_decision`, `approval_flow_closed`, `approval_invalid_step_index`, `approval_disposed`.

Pass `stepIndex` to keep the cursor controlled by your own store: the controller reports the requested index through `onStepIndexChange` and never overrides you.

## When not to use

Skip it for a single boolean approval toggle. Prefer a workflow engine when you need timers, escalation policies, conditional branching, or durable server side orchestration. This package models the client side of a flow whose source of truth stays on your server.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Activity log](https://www.npmjs.com/package/@sometic/activity)

## License

MIT
