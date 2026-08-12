import { describe, expect, it, vi } from "vitest";
import { createApprovalController } from "./approval.js";
import type { CreateApprovalControllerOptions } from "./approval.js";

function createFlow(overrides: Partial<CreateApprovalControllerOptions> = {}) {
    let clock = 0;
    return createApprovalController({
        steps: [
            { id: "review", label: "Review", assigneeIds: ["reviewer"] },
            {
                id: "legal",
                label: "Legal",
                assigneeIds: ["lawyer-a", "lawyer-b"],
                requireAll: true,
            },
            { id: "finance", assigneeIds: ["cfo"] },
        ],
        now: () => {
            clock += 1;
            return clock;
        },
        ...overrides,
    });
}

describe("createApprovalController", () => {
    it("rejects an empty or duplicated flow definition", () => {
        expect(() => createApprovalController({ steps: [] })).toThrow(/at least one step/);
        expect(() =>
            createApprovalController({
                steps: [
                    { id: "a", assigneeIds: [] },
                    { id: "a", assigneeIds: [] },
                ],
            }),
        ).toThrow(/Duplicate approval step/);
    });

    it("starts pending on the first step with normalized definitions", () => {
        const flow = createFlow();
        const state = flow.getState();

        expect(state.status).toBe("pending");
        expect(state.stepIndex).toBe(0);
        expect(state.closed).toBe(false);
        expect(state.steps.map((step) => step.status)).toEqual(["pending", "pending", "pending"]);
        expect(flow.getStep("finance")?.label).toBe("finance");
        expect(flow.getStep("legal")?.requireAll).toBe(true);
        expect(flow.getStep("review")?.requireAll).toBe(false);
        expect(flow.getActiveStep()?.id).toBe("review");
        expect(flow.getStep("ghost")).toBeUndefined();
        flow.dispose();
    });

    it("advances to the next step after an approval", () => {
        const onDecision = vi.fn();
        const flow = createFlow({ onDecision });

        const record = flow.approve({ actorId: "reviewer", note: "looks good" });
        expect(record).toMatchObject({ stepId: "review", decision: "approve", note: "looks good" });
        expect(flow.getStep("review")?.status).toBe("approved");
        expect(flow.getStepIndex()).toBe(1);
        expect(flow.getStatus()).toBe("pending");
        expect(onDecision).toHaveBeenCalledTimes(1);
        expect(flow.getHistory()).toHaveLength(1);
        flow.dispose();
    });

    it("waits for every assignee when a step requires all approvers", () => {
        const flow = createFlow();
        flow.approve({ actorId: "reviewer" });

        flow.approve({ actorId: "lawyer-a" });
        expect(flow.getStep("legal")?.status).toBe("pending");
        expect(flow.getStepIndex()).toBe(1);

        flow.approve({ actorId: "lawyer-b" });
        expect(flow.getStep("legal")?.status).toBe("approved");
        expect(flow.getStepIndex()).toBe(2);
        expect(flow.getStep("legal")?.decisions).toHaveLength(2);
        flow.dispose();
    });

    it("reaches approved once the final step is approved", () => {
        const onStatusChange = vi.fn();
        const flow = createFlow({ onStatusChange });

        flow.approve({ actorId: "reviewer" });
        flow.approve({ actorId: "lawyer-a" });
        flow.approve({ actorId: "lawyer-b" });
        flow.approve({ actorId: "cfo" });

        expect(flow.getStatus()).toBe("approved");
        expect(flow.getStepIndex()).toBe(2);
        expect(onStatusChange).toHaveBeenCalledWith("approved");
        expect(flow.getHistory().map((record) => record.actorId)).toEqual([
            "reviewer",
            "lawyer-a",
            "lawyer-b",
            "cfo",
        ]);
        flow.dispose();
    });

    it("closes the flow after a rejection until the step is reopened", () => {
        const flow = createFlow();
        flow.reject({ actorId: "reviewer", note: "missing data" });

        expect(flow.getStatus()).toBe("rejected");
        expect(flow.getState().closed).toBe(true);
        expect(() => flow.approve({ actorId: "reviewer" })).toThrow(/already rejected/);

        flow.reopen("review");
        expect(flow.getStep("review")?.status).toBe("pending");
        expect(flow.getStep("review")?.decisions).toEqual([]);
        expect(flow.getStatus()).toBe("pending");
        expect(flow.getHistory()).toHaveLength(1);

        flow.approve({ actorId: "reviewer" });
        expect(flow.getStepIndex()).toBe(1);
        flow.dispose();
    });

    it("pauses the flow when changes are requested", () => {
        const flow = createFlow();
        flow.approve({ actorId: "reviewer" });
        flow.requestChanges({ actorId: "lawyer-a", note: "fix clause 4" });

        expect(flow.getStatus()).toBe("changes-requested");
        expect(flow.getState().closed).toBe(true);
        expect(() => flow.approve({ actorId: "cfo", stepId: "finance" })).toThrow(/closed/);

        flow.reopen("legal");
        expect(flow.getStepIndex()).toBe(1);
        expect(flow.getStatus()).toBe("pending");
        flow.dispose();
    });

    it("guards unknown steps, inactive steps, and non assignees", () => {
        const flow = createFlow();

        expect(() => flow.approve({ actorId: "reviewer", stepId: "ghost" })).toThrow(
            /Unknown approval step/,
        );
        expect(() => flow.approve({ actorId: "cfo", stepId: "finance" })).toThrow(
            /not the active step/,
        );
        expect(() => flow.approve({ actorId: "intruder" })).toThrow(/not an assignee/);
        expect(flow.getHistory()).toEqual([]);
        flow.dispose();
    });

    it("blocks a second decision from the same actor on one step", () => {
        const flow = createFlow();
        flow.approve({ actorId: "reviewer" });
        flow.approve({ actorId: "lawyer-a" });

        expect(() => flow.approve({ actorId: "lawyer-a" })).toThrow(/already decided/);
        expect(() => flow.requestChanges({ actorId: "lawyer-a" })).toThrow(/already decided/);
        expect(flow.getStep("legal")?.decisions).toHaveLength(1);
        flow.dispose();
    });

    it("blocks decisions on an already approved step", () => {
        const flow = createFlow();
        flow.approve({ actorId: "reviewer" });

        expect(() => flow.approve({ actorId: "reviewer", stepId: "review" })).toThrow(
            /already approved/,
        );
        flow.dispose();
    });

    it("validates explicit step index moves", () => {
        const flow = createFlow();

        flow.setStepIndex(2);
        expect(flow.getActiveStep()?.id).toBe("finance");
        expect(() => flow.setStepIndex(-1)).toThrow(/out of range/);
        expect(() => flow.setStepIndex(3)).toThrow(/out of range/);
        expect(() => flow.setStepIndex(1.5)).toThrow(/out of range/);

        flow.approve({ actorId: "cfo" });
        expect(flow.getStep("finance")?.status).toBe("approved");
        expect(flow.getStatus()).toBe("pending");
        flow.dispose();
    });

    it("reports no active step when the index is out of range", () => {
        const flow = createFlow({ stepIndex: 9 });

        expect(flow.getActiveStep()).toBeUndefined();
        expect(() => flow.approve({ actorId: "reviewer" })).toThrow(/no active approval step/);
        flow.dispose();
    });

    it("keeps a controlled step index owned by the caller", () => {
        const onStepIndexChange = vi.fn();
        const flow = createFlow({ stepIndex: 0, onStepIndexChange });

        flow.approve({ actorId: "reviewer" });
        expect(onStepIndexChange).toHaveBeenCalledWith(1);
        expect(flow.getStepIndex()).toBe(0);
        expect(flow.getStep("review")?.status).toBe("approved");
        flow.dispose();
    });

    it("ignores reopen for pending steps and rejects unknown ones", () => {
        const flow = createFlow();
        flow.reopen("finance");
        expect(flow.getStepIndex()).toBe(0);
        expect(() => flow.reopen("ghost")).toThrow(/Unknown approval step/);
        flow.dispose();
    });

    it("returns copies of steps, history, and state", () => {
        const flow = createFlow();
        flow.approve({ actorId: "reviewer" });

        const steps = flow.getSteps();
        steps[0]?.assigneeIds.push("hacker");
        flow.getHistory().splice(0, 1);
        const state = flow.getState();
        state.steps.splice(0, state.steps.length);

        expect(flow.getStep("review")?.assigneeIds).toEqual(["reviewer"]);
        expect(flow.getHistory()).toHaveLength(1);
        expect(flow.getState().steps).toHaveLength(3);
        flow.dispose();
    });

    it("notifies subscribers and stops after unsubscribe and dispose", () => {
        const flow = createFlow();
        const listener = vi.fn();
        const unsubscribe = flow.subscribe(listener);

        flow.approve({ actorId: "reviewer" });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0]?.[0]?.stepIndex).toBe(1);

        unsubscribe();
        flow.setStepIndex(0);
        expect(listener).toHaveBeenCalledTimes(1);

        const second = vi.fn();
        flow.subscribe(second);
        flow.dispose();

        expect(flow.disposed).toBe(true);
        expect(second).not.toHaveBeenCalled();
        expect(() => flow.approve({ actorId: "reviewer" })).toThrow(/disposed/);
        expect(() => flow.setStepIndex(1)).toThrow(/disposed/);
        expect(() => flow.reopen("review")).toThrow(/disposed/);
        expect(flow.subscribe(vi.fn())).toBeTypeOf("function");
    });
});
