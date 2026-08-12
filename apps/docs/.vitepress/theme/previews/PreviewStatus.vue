<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

type StatusKind = "empty" | "error" | "offline" | "conflict";
type StatusCard = {
    kind: StatusKind;
    title: string;
    description: string;
    action: string;
    role: "status" | "alert";
    live: "polite" | "assertive";
};

const cards: StatusCard[] = [
    {
        kind: "empty",
        title: "Nothing here yet",
        description: "Demo empty surface",
        action: "Primary action",
        role: "status",
        live: "polite",
    },
    {
        kind: "error",
        title: "Something went wrong",
        description: "Demo error surface",
        action: "Primary action",
        role: "alert",
        live: "assertive",
    },
    {
        kind: "offline",
        title: "You are offline",
        description: "Demo offline surface",
        action: "Retry when online",
        role: "status",
        live: "polite",
    },
    {
        kind: "conflict",
        title: "Conflicting changes",
        description: "Your version vs Server version",
        action: "Primary action",
        role: "alert",
        live: "assertive",
    },
];

const lastAction = ref("");

function runAction(card: StatusCard): void {
    if (card.kind === "offline") {
        lastAction.value = "Back online (recovery fired)";
        return;
    }
    lastAction.value = `status action kind=${card.kind}`;
}
</script>

<template>
    <DemoFrame title="Preview" hint="Status" stack>
        <div class="pg-status-gallery" data-status-gallery>
            <div
                v-for="card in cards"
                :key="card.kind"
                class="pg-status-card"
                data-slot="root"
                data-has-action="true"
                :data-status="card.kind"
                :role="card.role"
                :aria-live="card.live"
            >
                <h3>{{ card.title }}</h3>
                <p>{{ card.description }}</p>
                <button type="button" class="pg-btn" data-slot="action" @click="runAction(card)">
                    {{ card.action }}
                </button>
            </div>
        </div>
        <p v-if="lastAction" class="pg-status">{{ lastAction }}</p>
    </DemoFrame>
</template>
