# Approval

Multi-step approval flow: assignees, require-all vs any, approve / reject / request-changes, history, reopen. Engine-only: `createApprovalController` from `@sometic/approval`. No custom element in this beta.

::: tip System standout: require-all then any
Manager steps can require every assignee; Director steps can accept any one. Preview mirrors Manager (a, b) then Director (c) like the playground. Persist decisions on the server; this is not a durable workflow runtime.
:::

<PreviewApproval />

## Usage

::: code-group

```tsx [JS]
import { useEffect, useMemo, useState } from "react";
import { createApprovalController } from "@sometic/approval";

export function Example() {
    const approval = useMemo(
        () =>
            createApprovalController({
                steps: [
                    {
                        id: "manager",
                        label: "Manager",
                        assigneeIds: ["a", "b"],
                        requireAll: true,
                    },
                    { id: "director", label: "Director", assigneeIds: ["c"] },
                ],
            }),
        [],
    );
    const [state, setState] = useState(() => approval.getState());
    useEffect(() => approval.subscribe(setState), [approval]);
    const step = approval.getActiveStep();
    const actorId = step?.assigneeIds[0];

    return (
        <div>
            <p>Status: {state.status}</p>
            {step && actorId ? (
                <button
                    type="button"
                    onClick={() => approval.approve({ actorId })}
                >
                    Approve as {actorId}
                </button>
            ) : null}
        </div>
    );
}
```

```tsx [TS]
import { useEffect, useMemo, useState } from "react";
import {
    createApprovalController,
    type ApprovalState,
} from "@sometic/approval";

export function Example(): JSX.Element {
    const approval = useMemo(
        () =>
            createApprovalController({
                steps: [
                    {
                        id: "manager",
                        label: "Manager",
                        assigneeIds: ["a", "b"],
                        requireAll: true,
                    },
                    { id: "director", label: "Director", assigneeIds: ["c"] },
                ],
            }),
        [],
    );
    const [state, setState] = useState<ApprovalState>(() => approval.getState());
    useEffect(() => approval.subscribe(setState), [approval]);
    const step = approval.getActiveStep();
    const actorId = step?.assigneeIds[0];

    return (
        <div>
            <p>Status: {state.status}</p>
            {step && actorId ? (
                <button
                    type="button"
                    onClick={() => approval.approve({ actorId })}
                >
                    Approve as {actorId}
                </button>
            ) : null}
        </div>
    );
}
```
```js [Vanilla]
import { createApprovalController } from "@sometic/approval";

const approval = createApprovalController({
    steps: [
        { id: "manager", label: "Manager", assigneeIds: ["a", "b"], requireAll: true },
        { id: "director", label: "Director", assigneeIds: ["c"] },
    ],
    onStatusChange: (status) => {
        document.querySelector("#status").textContent = status;
    },
});

document.querySelector("#approve-a").addEventListener("click", () => {
    approval.approve({ actorId: "a" });
});
```

:::

> Custom element **not shipped**. Preview mirrors Manager (require all) then Director (any).

## How it works

1. **Steps**: ordered list with `assigneeIds` and `requireAll`.
2. **Decisions**: `approve` / `reject` / `requestChanges` (or `decide`) record actor, time, optional note.
3. **Advancement**: require-all waits for every assignee; otherwise one approve advances.
4. **Terminal**: reject or request-changes can close; `reopen(stepId)` resumes.
5. **Controllable step index** for inspection/testing via `stepIndex` / `onStepIndexChange`.

## Anatomy

| Part | Role |
| ---- | ---- |
| Flow | Ordered steps + overall status |
| Step | Assignees, requireAll, local status |
| Decision record | id, stepId, decision, actorId, at, note |
| History | Flattened decision list |

## Props / attributes

No component props. `CreateApprovalControllerOptions`:

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `steps` | `ApprovalStepInput[]` | required | At least one |
| `stepIndex` / `defaultStepIndex` | `number` | `0` | Active step |
| `onStepIndexChange` | `(index) => void` | `-` | Step moves |
| `onDecision` | `(record) => void` | `-` | Each decision |
| `onStatusChange` | `(status) => void` | `-` | Flow status |
| `now` | `() => number` | `Date.now` | Clock |

## Events / callbacks

| Surface | Event | Payload |
| ------- | ----- | ------- |
| Controller | `onDecision` | `ApprovalDecisionRecord` |
| Controller | `onStatusChange` | `ApprovalStatus` |
| Controller | `subscribe` | `ApprovalState` |

## Controlled vs uncontrolled

Step index can be controlled. Decision history is always engine-owned (append-only until reopen).

## Accessibility

You own step UI. Expose current step and status to AT, disable actions for non-assignees, and confirm destructive reject paths.

## Styling

Own the stepper chrome. Preview uses simple step rows with Approve as `{actor}` buttons.

## Edge cases

- **Empty steps / duplicate ids**, throws at create.
- **Wrong actor**, decide rejects unauthorized assignees.
- **Closed flow**, further decides fail until `reopen`.
- **requireAll**, partial approvals keep step `pending`.

## Performance notes

Flows are small (few steps). Subscribe once per view. Persist history on the server; the client engine is UX orchestration.

## When to use / When not

**Use** for product approval checklists that must behave the same in React and Vanilla.

**Do not use** as the only audit log, or for BPMN-style branching workflows.

## FAQ

**Reject vs request-changes?** Both are first-class decisions with distinct statuses.

**Notes?** Pass `note` on decide/approve/reject/requestChanges.

**React adapter?** Not yet; use the engine.

**CE?** Not shipped.

**More?** [Data FAQ](/components/data-faq) · [Data comparison](/components/data-comparison).

## Related links

- [Activity](/components/activity)
- [Dialog](/components/dialog)
- [Data FAQ](/components/data-faq)
- [Data comparison](/components/data-comparison)
