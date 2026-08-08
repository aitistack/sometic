<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const open = ref(false);
</script>

<template>
    <DemoFrame title="Preview" hint="Anchored non-modal surface" stack>
        <div class="pg-popover-anchor">
            <button type="button" class="pg-btn" @click="open = !open">
                {{ open ? "Hide" : "Show" }} popover
            </button>
            <div v-if="open" class="pg-popover-panel" role="dialog" data-state="open">
                <h4>Account</h4>
                <p>Profile, billing, and sign out actions belong here.</p>
            </div>
        </div>
    </DemoFrame>
</template>

<style scoped>
.pg-popover-anchor {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
}
.pg-popover-panel {
    width: min(18rem, 100%);
    padding: 0.85rem 1rem;
    background: var(--pg-panel-bg, var(--vp-c-bg));
    color: var(--pg-ink, var(--vp-c-text-1));
    box-shadow: inset 0 0 0 1px var(--pg-line, var(--vp-c-divider));
}
.pg-popover-panel h4,
.pg-popover-panel p {
    margin: 0;
}
.pg-popover-panel p {
    margin-top: 0.35rem;
    color: var(--vp-c-text-2);
    font-size: 0.9rem;
}
</style>
