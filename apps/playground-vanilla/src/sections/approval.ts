import { createApprovalController } from "@sometic/approval";

export function mountApprovalSection(root: HTMLElement): () => void {
    const host = root.querySelector("[data-approval]");
    const status = root.querySelector("[data-approval-status]");
    if (!(host instanceof HTMLElement)) {
        return () => {};
    }
    const approval = createApprovalController({
        steps: [
            { id: "manager", label: "Manager", assigneeIds: ["a", "b"], requireAll: true },
            { id: "director", label: "Director", assigneeIds: ["c"] },
        ],
    });

    const render = (): void => {
        host.replaceChildren();
        const steps = approval.getSteps();
        const index = approval.getStepIndex();
        for (const step of steps) {
            const row = document.createElement("div");
            row.className = "pg-row";
            row.textContent = `${step.label} (${step.status})`;
            if (steps[index]?.id === step.id && step.status === "pending") {
                for (const actor of step.assigneeIds) {
                    const approve = document.createElement("button");
                    approve.type = "button";
                    approve.className = "pg-btn";
                    approve.textContent = `Approve as ${actor}`;
                    approve.addEventListener("click", () => {
                        try {
                            approval.decide({
                                stepId: step.id,
                                decision: "approve",
                                actorId: actor,
                            });
                        } catch (error) {
                            if (status instanceof HTMLElement) {
                                status.textContent =
                                    error instanceof Error ? error.message : "error";
                            }
                        }
                        render();
                    });
                    row.append(approve);
                }
            }
            host.append(row);
        }
        if (status instanceof HTMLElement) {
            status.textContent = `Active step index: ${index}`;
        }
    };
    render();
    return () => approval.dispose();
}
