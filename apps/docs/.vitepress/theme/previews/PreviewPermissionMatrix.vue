<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

type ResourceId = "posts" | "users";
type ActionId = "read" | "write";
type CellState = "allowed" | "denied";

const resources: Array<{ id: ResourceId; label: string }> = [
    { id: "posts", label: "Posts" },
    { id: "users", label: "Users" },
];

const actions: Array<{ id: ActionId; label: string }> = [
    { id: "read", label: "Read" },
    { id: "write", label: "Write" },
];

const overrides = ref<Record<string, boolean>>({});

function cellKey(resourceId: ResourceId, actionId: ActionId): string {
    return `${resourceId}:${actionId}`;
}

function baseCan(resourceId: ResourceId, actionId: ActionId): boolean {
    return actionId === "read" && (resourceId === "posts" || resourceId === "users");
}

function cellState(resourceId: ResourceId, actionId: ActionId): CellState {
    const override = overrides.value[cellKey(resourceId, actionId)];
    const allowed = override ?? baseCan(resourceId, actionId);
    return allowed ? "allowed" : "denied";
}

function toggleCell(resourceId: ResourceId, actionId: ActionId): void {
    const key = cellKey(resourceId, actionId);
    overrides.value = {
        ...overrides.value,
        [key]: cellState(resourceId, actionId) !== "allowed",
    };
}
</script>

<template>
    <DemoFrame title="Preview" hint="Permission matrix" stack>
        <div
            data-permission-matrix
            data-slot="root"
            :data-resource-count="resources.length"
            :data-action-count="actions.length"
        >
            <div v-for="resource in resources" :key="resource.id" class="pg-row">
                <span class="pg-label">{{ resource.label }}</span>
                <button
                    v-for="action in actions"
                    :key="action.id"
                    type="button"
                    class="pg-btn"
                    data-slot="cell"
                    :data-resource-id="resource.id"
                    :data-action-id="action.id"
                    :data-state="cellState(resource.id, action.id)"
                    :aria-pressed="cellState(resource.id, action.id) === 'allowed'"
                    :aria-label="`${action.label} ${resource.label}`"
                    @click="toggleCell(resource.id, action.id)"
                >
                    {{ action.id }}:{{ cellState(resource.id, action.id) }}
                </button>
            </div>
        </div>
        <p class="pg-status">Toggle a cell to override the default policy.</p>
    </DemoFrame>
</template>
