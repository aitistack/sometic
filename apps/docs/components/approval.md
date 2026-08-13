# Approval

Multi-step approval state machine from `@sometic/approval`. Steps carry assignees and an optional "everyone must approve" rule; decisions are recorded with actor, timestamp, and note; illegal moves throw typed errors instead of silently corrupting the flow. Status is derived, never stored, so the flow cannot drift out of sync with its steps.

::: tip System standout: require-all then any
Manager steps can require every assignee; Director steps can accept any one. Preview mirrors Manager (a, b) then Director (c). Persist decisions on the server; this is not a durable workflow runtime.
:::

<PreviewApproval />

## Usage

::: code-group

```tsx [React]
// No dedicated React adapter for this surface. Use the engine from @sometic/approval (same API as Vanilla).
```

```vue [Vue]
<!-- No dedicated Vue adapter for this surface. Use the engine from @sometic/approval (same API as Vanilla). -->
```

```js [JS]
import { createApprovalController } from "@sometic/approval";

const approval = createApprovalController({
    steps: [
        { id: "manager", label: "Manager", assigneeIds: ["a", "b"], requireAll: true },
        { id: "director", label: "Director", assigneeIds: ["c"] },
    ],
    onStatusChange: (status) => console.log(status),
});

approval.approve({ actorId: "a", note: "Looks good" });
approval.approve({ actorId: "b" });

console.log(approval.getStatus());
console.log(approval.getActiveStep()?.id);
```

```html [Vanilla]
<div id="approval"></div>
<p id="approval-status" role="status" aria-live="polite"></p>

<script type="module">
    import { createApprovalController } from "@sometic/approval";

    const host = document.querySelector("#approval");
    const status = document.querySelector("#approval-status");

    const approval = createApprovalController({
        steps: [
            { id: "manager", label: "Manager", assigneeIds: ["a", "b"], requireAll: true },
            { id: "director", label: "Director", assigneeIds: ["c"] },
        ],
    });

    function render() {
        const state = approval.getState();
        host.replaceChildren();

        for (const step of state.steps) {
            const row = document.createElement("div");
            row.dataset.step = step.id;
            row.dataset.status = step.status;
            row.textContent = `${step.label} (${step.status})`;

            const active = state.steps[state.stepIndex];
            if (active && active.id === step.id && step.status === "pending" && !state.closed) {
                for (const actorId of step.assigneeIds) {
                    const approve = document.createElement("button");
                    approve.type = "button";
                    approve.textContent = `Approve as ${actorId}`;
                    approve.addEventListener("click", () => {
                        try {
                            approval.approve({ actorId, stepId: step.id });
                        } catch (error) {
                            status.textContent =
                                error instanceof Error ? error.message : "Decision rejected";
                        }
                    });
                    row.append(approve);
                }
            }
            host.append(row);
        }

        status.textContent = `Status ${state.status} at step ${String(state.stepIndex + 1)}`;
    }

    approval.subscribe(render);
    render();
</script>
```

```html [Custom Elements (Web Components)]
<!-- CE not shipped for this surface. Use React, Vue, or @sometic/dom (Vanilla) above. -->
```

```html [CDN]
<!-- CDN not available for this surface yet (no shipped custom element). Use npm adapters or Vanilla. -->
```

:::

> Custom element not shipped for data surfaces in this beta; use the engine directly.

Approval is **engine only**. There is no `Approval` component in `@sometic/react/data` or `@sometic/vue/data` and no custom element: approval UIs range from a two-button bar to a full timeline with avatars and notes. Import `@sometic/approval` from any framework and render your own steps, which is what the preview does.

## How it works

1. **Steps in order**: the flow is a list of `{ id, label?, assigneeIds, requireAll? }`. `stepIndex` points at the active step and is controllable (`stepIndex` / `defaultStepIndex` / `onStepIndexChange`).
2. **Decisions**: `decide({ decision, actorId, stepId?, note? })`, or the `approve`, `reject`, and `requestChanges` shorthands, append an `ApprovalDecisionRecord` (`id`, `stepId`, `decision`, `actorId`, `at`, `note`) to both the step and the global history.
3. **`requireAll`**: with it set, a step stays `pending` until every assignee has approved. Distinct approving actors are counted, so a duplicate approval cannot fake quorum. Without it, the first decision settles the step.
4. **Advance**: an approval that settles a step moves `stepIndex` to the next step. The final approval leaves the index on the last step and the derived status becomes `approved`.
5. **Derived status**: `rejected` if any step is rejected, otherwise `changes-requested` if any step requested changes, otherwise `approved` when every step is approved, otherwise `pending`. `closed` is true for `rejected` and `changes-requested`.
6. **Guards**: every illegal move throws a typed error rather than mutating state: unknown step, already decided, flow closed, step not active, actor not an assignee, duplicate decision by the same actor, invalid step index, empty flow, duplicate step ids, disposed controller.
7. **Reopen**: `reopen(stepId)` resets that step to `pending`, clears its decisions, and moves the active index back to it, which is how a rejected or changes-requested flow becomes workable again.

## Anatomy

| Part            | Shape                    | Notes                                                             |
| --------------- | ------------------------ | ----------------------------------------------------------------- |
| Step            | `ApprovalStep`           | `id`, `label`, `assigneeIds`, `requireAll`, `status`, `decisions` |
| Decision record | `ApprovalDecisionRecord` | `id`, `stepId`, `decision`, `actorId`, `at`, `note`               |
| State           | `ApprovalState`          | `status`, `stepIndex`, `steps`, `history`, `closed`               |
| Step status     | `ApprovalStepStatus`     | `pending`, `approved`, `rejected`, `changes-requested`            |
| Flow status     | `ApprovalStatus`         | Same four values, derived from all steps                          |

No markup ships. A useful convention is `data-step="manager"` and `data-status="pending"` per row so one stylesheet covers every framework.

## Props / attributes

### `CreateApprovalControllerOptions`

| Option              | Type                                       | Default      | Description                                |
| ------------------- | ------------------------------------------ | ------------ | ------------------------------------------ |
| `steps`             | `ApprovalStepInput[]`                      | **required** | At least one step, unique ids              |
| `stepIndex`         | `number`                                   | -            | Controlled active step                     |
| `defaultStepIndex`  | `number`                                   | `0`          | Uncontrolled initial active step           |
| `onStepIndexChange` | `(stepIndex: number) => void`              | -            | Fires when the flow advances or reopens    |
| `onDecision`        | `(record: ApprovalDecisionRecord) => void` | -            | Fires for every recorded decision          |
| `onStatusChange`    | `(status: ApprovalStatus) => void`         | -            | Fires only when the derived status changes |
| `now`               | `() => number`                             | `Date.now`   | Injectable clock for tests                 |

### `ApprovalStepInput`

| Field         | Type       | Description                                                      |
| ------------- | ---------- | ---------------------------------------------------------------- |
| `id`          | `string`   | Unique within the flow, used by `stepId` and `reopen`            |
| `label`       | `string`   | Display label, falls back to `id`                                |
| `assigneeIds` | `string[]` | Who may decide this step; anyone else is rejected with an error  |
| `requireAll`  | `boolean`  | `true` means every assignee must approve before the step settles |

### Controller API

| Member                                   | Description                                                   |
| ---------------------------------------- | ------------------------------------------------------------- |
| `getState()`                             | `{ status, stepIndex, steps, history, closed }` (deep copies) |
| `getSteps()` / `getStep(id)`             | Step snapshots                                                |
| `getActiveStep()`                        | The step at `stepIndex`, or `undefined`                       |
| `getStepIndex()` / `setStepIndex(index)` | Read or move the active step, throws when out of range        |
| `getStatus()` / `getHistory()`           | Derived status and the full decision log                      |
| `decide(input)`                          | Records a decision, returns the record                        |
| `approve` / `reject` / `requestChanges`  | Shorthands taking `{ actorId, stepId?, note? }`               |
| `reopen(stepId)`                         | Resets a settled step to `pending` and makes it active        |
| `subscribe(listener)`                    | Receives the new `ApprovalState` after every change           |
| `dispose()` / `disposed`                 | Releases listeners and blocks further decisions               |

### React and Vue

No component ships. Create the controller in a `useRef` initializer (React) or `setup` (Vue), subscribe for rerenders, wrap `decide` in try/catch to surface typed errors, and dispose on unmount. The engine API is identical in every framework.

### Custom element

**CE not shipped.** Compose the engine in your own component.

## Events / callbacks

| Surface        | Event                 | Payload                          |
| -------------- | --------------------- | -------------------------------- |
| Engine         | `onDecision`          | `ApprovalDecisionRecord`         |
| Engine         | `onStatusChange`      | `ApprovalStatus`, only on change |
| Engine         | `onStepIndexChange`   | `number`                         |
| Engine         | `subscribe(listener)` | `ApprovalState`                  |
| React / Vue    | your own props        | -                                |
| Custom element | -                     | -                                |

`subscribe` fires on every decision, `setStepIndex`, and `reopen`. `onStatusChange` fires only when the derived status actually changes, so it is safe to drive a toast or a server sync from it.

## Controlled vs uncontrolled

`stepIndex` follows the Sometic controllable contract: pass `stepIndex` plus `onStepIndexChange` when the current step lives in your store or the URL, or use `defaultStepIndex` for local state. Everything else (step statuses, decisions, history, derived status) is engine-owned, because those are the outcomes of guarded transitions rather than view state. To mirror the flow into your store, subscribe and copy the state, and treat `decide` and `reopen` as the write API.

## Accessibility

The engine emits no DOM. These are the composition rules the demos follow:

- Render steps as an ordered list (`<ol>`) so position and count are announced. Use `aria-current="step"` on the active one.
- Never rely on color for step status. Put the status word in text (`Manager (pending)`) or use an icon with an accessible name.
- Decision buttons need names that survive out of context: `Approve as manager`, not a bare check icon.
- Errors thrown by `decide` are user-facing outcomes. Render the message in a live region (`role="status"` for information, `role="alert"` for a blocked action) instead of only logging them.
- Keep focus stable after a decision. The row usually rerenders, so move focus to the next actionable control or the status region rather than letting it fall to `<body>`.
- Notes are free text: label the field, and expose it with `aria-describedby` on the decision buttons when a note is required for reject or request-changes.
- Announce the derived status change once (from `onStatusChange`), not on every subscribe tick.

## Styling

No styles ship. Mirror the state onto attributes in your own markup, for example `data-status="approved"` per step row and `data-flow-status="pending"` on the container, then style from CSS. That keeps the same stylesheet working across React, Vue, and Vanilla.

## Edge cases

- **Empty `steps`** throws `approval_empty_flow` at creation; **duplicate step ids** throw `approval_duplicate_step`.
- **Deciding a non-active step** throws `approval_step_not_active`. Pass `stepId` for clarity, but it must match the active step.
- **Deciding a settled step** throws `approval_step_already_decided`.
- **Deciding while closed** (rejected or changes-requested anywhere) throws `approval_flow_closed`. Call `reopen(stepId)` on the blocking step first.
- **Non-assignee actor** throws `approval_actor_not_assignee`, so authorization intent is explicit in the model instead of being a UI-only check.
- **Duplicate decision by the same actor** throws `approval_duplicate_decision`, which is what keeps `requireAll` quorum honest.
- **`requireAll` with one assignee** settles on the first approval, as expected.
- **Reject or request changes under `requireAll`** settles the step immediately; a single veto does not wait for the others.
- **`setStepIndex` out of range** throws `approval_invalid_step_index`; the engine never clamps silently.
- **`reopen` on a pending step** is a no-op, and reopening clears that step's decisions while leaving global `history` intact, so the audit trail keeps both attempts.
- **After `dispose`** decisions and index moves throw `approval_disposed`; reads still work on the last state.
- **SSR**: no browser globals at import time. Pass `now` for deterministic decision timestamps in tests and server rendering.

## Security

Assignee checks here are workflow modeling, not authorization. A determined client can call `approve` with any `actorId`, so the server must re-verify the actor's identity and their right to decide the step before persisting. Persist decisions server side and mirror them back; treat the client flow as an optimistic view. Pair with [Permission matrix](/components/permission-matrix) for who may act and [Activity](/components/activity) for the durable record.

## Performance notes

State is small and copied defensively on every read: `getState()` clones steps, decisions, and history, so snapshot once per render rather than calling it inside a loop. `subscribe` fans out one state object per change. There are no timers, listeners, or async work, so `dispose()` is only about releasing listeners and blocking late writes. Flows with hundreds of decisions keep the full history in memory; page long histories from the server instead.

## When to use / When not

**Use** for review and sign-off flows with ordered steps and named assignees: publishing workflows, expense or purchase approvals, change requests, and anything where "who decided what, when, with what note" matters.

**Do not use** for a single confirm ([Dialog](/components/dialog) is enough), for arbitrary graph workflows with branching, parallel steps, or timers (this is a linear list with optional quorum), or as server-side enforcement. The server owns the real decision. This is not Temporal, Camunda, or a durable workflow runtime.

## FAQ

**Can steps run in parallel?** No. Steps are ordered and one is active at a time. `requireAll` gives you parallelism inside a step (several assignees), which covers most review flows.

**How do I model "any two of five approvers"?** Not directly. `requireAll` is all-or-first. For an N-of-M rule, keep the step with `requireAll: false`, record decisions yourself, and advance with `setStepIndex` when your own count is satisfied.

**Why do errors throw instead of returning false?** Because these are business rule violations, not expected UI states. Typed errors with stable codes let you show the right message and keep tests honest. Wrap `decide` in try/catch at the call site.

**How do I resume a flow from the server?** Recreate the controller with the same steps, then replay the stored decisions in order (or hold the step index and statuses in your own view model). The engine has no serialize helper in this beta.

**What happens after a rejection?** The flow is `closed`. Nothing can be decided until you `reopen` the blocking step, which resets it to pending and makes it active again while keeping the history.

**Does it notify assignees?** No. Wire `onDecision` and `onStatusChange` to your notification path, for example [Notification center](/components/notification-center) or a server webhook.

**Are notes required?** No. `note` is optional on every decision. Enforce it in your UI when your policy needs a reason for reject or request changes.

**Can I see the whole audit trail?** `getHistory()` returns every decision across steps in order, including decisions from steps that were later reopened.

**Is there a `sometic-approval` element?** No. Custom elements are not shipped for data surfaces in this beta.

## Related links

- [Permission matrix](/components/permission-matrix)
- [Activity](/components/activity)
- [Notification center](/components/notification-center)
- [Dialog](/components/dialog)
- [Beta maturity](/releases/beta)
