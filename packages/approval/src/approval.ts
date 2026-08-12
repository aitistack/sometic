import { createControllableState } from "@sometic/core/controllable-state";
import { createDisposable } from "@sometic/core/disposable";
import { createError } from "@sometic/core/error";
import { createPrefixedId } from "@sometic/core/id";

export type ApprovalDecision = "approve" | "reject" | "request-changes";

export type ApprovalStepStatus = "pending" | "approved" | "rejected" | "changes-requested";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "changes-requested";

export type ApprovalDecisionRecord = {
    id: string;
    stepId: string;
    decision: ApprovalDecision;
    actorId: string;
    at: number;
    note: string | null;
};

export type ApprovalStepInput = {
    id: string;
    label?: string;
    assigneeIds: string[];
    requireAll?: boolean;
};

export type ApprovalStep = {
    id: string;
    label: string;
    assigneeIds: string[];
    requireAll: boolean;
    status: ApprovalStepStatus;
    decisions: ApprovalDecisionRecord[];
};

export type ApprovalDecisionInput = {
    decision: ApprovalDecision;
    actorId: string;
    stepId?: string;
    note?: string;
};

export type ApprovalActionInput = {
    actorId: string;
    stepId?: string;
    note?: string;
};

export type ApprovalState = {
    status: ApprovalStatus;
    stepIndex: number;
    steps: ApprovalStep[];
    history: ApprovalDecisionRecord[];
    closed: boolean;
};

export type CreateApprovalControllerOptions = {
    steps: ApprovalStepInput[];
    stepIndex?: number;
    defaultStepIndex?: number;
    onStepIndexChange?: (stepIndex: number) => void;
    onDecision?: (record: ApprovalDecisionRecord) => void;
    onStatusChange?: (status: ApprovalStatus) => void;
    now?: () => number;
};

export type ApprovalController = {
    getState(): ApprovalState;
    getSteps(): ApprovalStep[];
    getStep(stepId: string): ApprovalStep | undefined;
    getActiveStep(): ApprovalStep | undefined;
    getStepIndex(): number;
    setStepIndex(stepIndex: number): void;
    getStatus(): ApprovalStatus;
    getHistory(): ApprovalDecisionRecord[];
    decide(input: ApprovalDecisionInput): ApprovalDecisionRecord;
    approve(input: ApprovalActionInput): ApprovalDecisionRecord;
    reject(input: ApprovalActionInput): ApprovalDecisionRecord;
    requestChanges(input: ApprovalActionInput): ApprovalDecisionRecord;
    reopen(stepId: string): void;
    subscribe(listener: (state: ApprovalState) => void): () => void;
    readonly disposed: boolean;
    dispose(): void;
};

type StepRecord = {
    id: string;
    label: string;
    assigneeIds: string[];
    requireAll: boolean;
    status: ApprovalStepStatus;
    decisions: ApprovalDecisionRecord[];
};

function statusForDecision(decision: ApprovalDecision): ApprovalStepStatus {
    if (decision === "approve") {
        return "approved";
    }
    if (decision === "reject") {
        return "rejected";
    }
    return "changes-requested";
}

function toStep(record: StepRecord): ApprovalStep {
    return {
        id: record.id,
        label: record.label,
        assigneeIds: record.assigneeIds.slice(),
        requireAll: record.requireAll,
        status: record.status,
        decisions: record.decisions.map((decision) => ({ ...decision })),
    };
}

export function createApprovalController(
    options: CreateApprovalControllerOptions,
): ApprovalController {
    if (options.steps.length === 0) {
        throw createError({
            code: "approval_empty_flow",
            message: "createApprovalController requires at least one step",
        });
    }

    const seenStepIds = new Set<string>();
    const steps: StepRecord[] = options.steps.map((step) => {
        if (seenStepIds.has(step.id)) {
            throw createError({
                code: "approval_duplicate_step",
                message: `Duplicate approval step id ${step.id}`,
                details: { stepId: step.id },
            });
        }
        seenStepIds.add(step.id);

        return {
            id: step.id,
            label: step.label ?? step.id,
            assigneeIds: step.assigneeIds.slice(),
            requireAll: step.requireAll === true,
            status: "pending",
            decisions: [],
        };
    });

    const now = options.now ?? (() => Date.now());
    const history: ApprovalDecisionRecord[] = [];
    const listeners = new Set<(state: ApprovalState) => void>();

    const disposable = createDisposable(() => {
        listeners.clear();
    });

    const stepIndexState = createControllableState<number>({
        defaultValue: options.defaultStepIndex ?? 0,
        ...(options.stepIndex === undefined ? {} : { value: options.stepIndex }),
        ...(options.onStepIndexChange === undefined ? {} : { onChange: options.onStepIndexChange }),
    });

    let lastStatus: ApprovalStatus = "pending";

    const computeStatus = (): ApprovalStatus => {
        if (steps.some((step) => step.status === "rejected")) {
            return "rejected";
        }
        if (steps.some((step) => step.status === "changes-requested")) {
            return "changes-requested";
        }
        if (steps.every((step) => step.status === "approved")) {
            return "approved";
        }
        return "pending";
    };

    const isClosed = (): boolean => {
        const status = computeStatus();
        return status === "rejected" || status === "changes-requested";
    };

    const getState = (): ApprovalState => ({
        status: computeStatus(),
        stepIndex: stepIndexState.get(),
        steps: steps.map(toStep),
        history: history.map((record) => ({ ...record })),
        closed: isClosed(),
    });

    const notify = (): void => {
        const state = getState();
        for (const listener of Array.from(listeners)) {
            listener(state);
        }
        if (state.status !== lastStatus) {
            lastStatus = state.status;
            if (options.onStatusChange) {
                options.onStatusChange(state.status);
            }
        }
    };

    const assertActive = (): void => {
        if (disposable.disposed) {
            throw createError({
                code: "approval_disposed",
                message: "This approval controller has been disposed",
            });
        }
    };

    const activeIndex = (): number => {
        const index = stepIndexState.get();
        return index >= 0 && index < steps.length ? index : -1;
    };

    const decide = (input: ApprovalDecisionInput): ApprovalDecisionRecord => {
        assertActive();

        const index = activeIndex();
        const active = index === -1 ? undefined : steps[index];
        const stepId = input.stepId ?? active?.id;
        if (stepId === undefined) {
            throw createError({
                code: "approval_no_active_step",
                message: "There is no active approval step",
            });
        }

        const step = steps.find((entry) => entry.id === stepId);
        if (!step) {
            throw createError({
                code: "approval_unknown_step",
                message: `Unknown approval step ${stepId}`,
                details: { stepId },
            });
        }

        if (step.status !== "pending") {
            throw createError({
                code: "approval_step_already_decided",
                message: `Approval step ${stepId} is already ${step.status}`,
                details: { stepId, status: step.status },
            });
        }

        if (isClosed()) {
            throw createError({
                code: "approval_flow_closed",
                message: "This approval flow is closed. Reopen the blocking step first.",
                details: { stepId },
            });
        }

        if (!active || step.id !== active.id) {
            throw createError({
                code: "approval_step_not_active",
                message: `Approval step ${stepId} is not the active step`,
                details: { stepId, activeStepId: active?.id ?? null },
            });
        }

        if (!step.assigneeIds.includes(input.actorId)) {
            throw createError({
                code: "approval_actor_not_assignee",
                message: `${input.actorId} is not an assignee of step ${stepId}`,
                details: { stepId, actorId: input.actorId },
            });
        }

        if (step.decisions.some((record) => record.actorId === input.actorId)) {
            throw createError({
                code: "approval_duplicate_decision",
                message: `${input.actorId} already decided step ${stepId}`,
                details: { stepId, actorId: input.actorId },
            });
        }

        const record: ApprovalDecisionRecord = {
            id: createPrefixedId("decision"),
            stepId: step.id,
            decision: input.decision,
            actorId: input.actorId,
            at: now(),
            note: input.note ?? null,
        };

        step.decisions.push(record);
        history.push(record);

        const approvals = new Set(
            step.decisions
                .filter((entry) => entry.decision === "approve")
                .map((entry) => entry.actorId),
        );
        const needsMoreApprovals =
            input.decision === "approve" &&
            step.requireAll &&
            approvals.size < step.assigneeIds.length;

        if (!needsMoreApprovals) {
            step.status = statusForDecision(input.decision);
            if (input.decision === "approve" && index < steps.length - 1) {
                stepIndexState.set(index + 1);
            }
        }

        if (options.onDecision) {
            options.onDecision({ ...record });
        }
        notify();
        return { ...record };
    };

    return {
        get disposed() {
            return disposable.disposed;
        },
        getState,
        getSteps() {
            return steps.map(toStep);
        },
        getStep(stepId) {
            const step = steps.find((entry) => entry.id === stepId);
            return step ? toStep(step) : undefined;
        },
        getActiveStep() {
            const index = activeIndex();
            const step = index === -1 ? undefined : steps[index];
            return step ? toStep(step) : undefined;
        },
        getStepIndex() {
            return stepIndexState.get();
        },
        setStepIndex(stepIndex) {
            assertActive();
            if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= steps.length) {
                throw createError({
                    code: "approval_invalid_step_index",
                    message: `Approval step index ${String(stepIndex)} is out of range`,
                    details: { stepIndex, stepCount: steps.length },
                });
            }
            stepIndexState.set(stepIndex);
            notify();
        },
        getStatus: computeStatus,
        getHistory() {
            return history.map((record) => ({ ...record }));
        },
        decide,
        approve(input) {
            return decide({ ...input, decision: "approve" });
        },
        reject(input) {
            return decide({ ...input, decision: "reject" });
        },
        requestChanges(input) {
            return decide({ ...input, decision: "request-changes" });
        },
        reopen(stepId) {
            assertActive();
            const index = steps.findIndex((entry) => entry.id === stepId);
            const step = index === -1 ? undefined : steps[index];
            if (!step) {
                throw createError({
                    code: "approval_unknown_step",
                    message: `Unknown approval step ${stepId}`,
                    details: { stepId },
                });
            }
            if (step.status === "pending") {
                return;
            }

            step.status = "pending";
            step.decisions.splice(0, step.decisions.length);
            stepIndexState.set(index);
            notify();
        },
        subscribe(listener) {
            if (disposable.disposed) {
                return () => {};
            }
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose() {
            disposable.dispose();
        },
    };
}
