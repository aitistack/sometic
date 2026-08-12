<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

type ActivityEntry = { id: string; type: string; message: string };

const entries = ref<ActivityEntry[]>([]);

function append(): void {
    const next = entries.value.length + 1;
    entries.value = [
        ...entries.value,
        { id: `entry-${next}`, type: "update", message: `Event ${next}` },
    ];
}
</script>

<template>
    <DemoFrame title="Preview" hint="Activity" stack>
        <ul class="pg-activity-list" data-activity-list>
            <li v-for="entry in entries" :key="entry.id" class="pg-activity-item">
                {{ entry.type }}: {{ entry.message }}
            </li>
        </ul>
        <p v-if="entries.length === 0" class="pg-status">No activity yet.</p>
        <div class="pg-row">
            <button type="button" class="pg-btn" data-activity-add @click="append">Append</button>
        </div>
    </DemoFrame>
</template>

<style scoped>
.pg-activity-list {
    display: grid;
    gap: 0.35rem;
    list-style: none;
    margin: 0;
    padding: 0;
}

.pg-activity-item {
    padding: 0.45rem 0.6rem;
    background: color-mix(in srgb, var(--pg-ink, var(--vp-c-text-1)) 6%, transparent);
    font-size: 0.92rem;
}
</style>
