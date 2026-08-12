# Approval FAQ

## How do I install it?

```bash
pnpm add @sometic/approval
```

Peer: `@sometic/core`. Engine-only in this beta (`createApprovalController`).

## What decisions exist?

`approve`, `reject`, and `request-changes` (via `approve` / `reject` / `requestChanges` or `decide`).

## requireAll vs any?

`requireAll: true` needs every `assigneeId` to approve before the step advances. Otherwise one approve is enough. Reject / request-changes follow the engine’s closing rules for the active step.

## Can I reopen?

Yes. `reopen(stepId)` after a closed flow (subject to engine rules). Use it for “send back to manager” product flows.

## Notes and history?

Pass `note` on decision inputs. `getHistory()` / state `history` lists decision records with actor and timestamp.

## Controlled step index?

`stepIndex` + `onStepIndexChange` for tests or deep links. Prefer letting decisions advance the index in normal UIs.

## Empty or duplicate steps?

Create throws `approval_empty_flow` or `approval_duplicate_step`.

## SSR?

Pure engine aside from your UI. Create per flow instance; dispose when the dialog unmounts.

## Security?

Never trust client “approved” flags. Persist decisions server-side and verify `actorId` against the session.

## Related?

[Comparison](./comparison) · [Component](/components/approval) · [Activity](/packages/activity/faq).
