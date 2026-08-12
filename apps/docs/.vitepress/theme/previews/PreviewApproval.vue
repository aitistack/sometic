<script setup lang="ts">
import { computed, ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

type Step = {
    id: string;
    label: string;
    assigneeIds: string[];
    requireAll: boolean;
};

const steps: Step[] = [
    { id: "manager", label: "Manager", assigneeIds: ["a", "b"], requireAll: true },
    { id: "director", label: "Director", assigneeIds: ["c"], requireAll: false },
];

const decisions = ref<Record<string, string[]>>({ manager: [], director: [] });

function approvalsFor(stepId: string): string[] {
    return decisions.value[stepId] ?? [];
}

function statusFor(step: Step): "pending" | "approved" {
    const approvals = approvalsFor(step.id);
    if (step.requireAll) {
        return step.assigneeIds.every((actor) => approvals.includes(actor))
            ? "approved"
            : "pending";
    }
    return approvals.length > 0 ? "approved" : "pending";
}

const activeIndex = computed(() => {
    const index = steps.findIndex((step) => statusFor(step) === "pending");
    return index === -1 ? steps.length : index;
});

function isActive(step: Step): boolean {
    return steps[activeIndex.value]?.id === step.id;
}

function hasApproved(step: Step, actor: string): boolean {
    return approvalsFor(step.id).includes(actor);
}

function approve(step: Step, actor: string): void {
    if (!isActive(step) || hasApproved(step, actor)) {
        return;
    }
    decisions.value = {
        ...decisions.value,
        [step.id]: [...approvalsFor(step.id), actor],
    };
}
</script>

<template>
    <DemoFrame title="Preview" hint="Approval" stack>
        <div data-approval>
            <div
                v-for="step in steps"
                :key="step.id"
                class="pg-row"
                data-slot="step"
                :data-step-id="step.id"
                :data-status="statusFor(step)"
            >
                <span class="pg-approval-step">{{ step.label }} ({{ statusFor(step) }})</span>
                <template v-if="isActive(step) && statusFor(step) === 'pending'">
                    <button
                        v-for="actor in step.assigneeIds"
                        :key="actor"
                        type="button"
                        class="pg-btn"
                        :disabled="hasApproved(step, actor)"
                        @click="approve(step, actor)"
                    >
                        Approve as {{ actor }}
                    </button>
                </template>
            </div>
        </div>
        <p class="pg-status" data-approval-status>Active step index: {{ activeIndex }}</p>
    </DemoFrame>
</template>

<style scoped>
.pg-approval-step {
    min-width: 11rem;
    font-weight: 600;
}
</style>
