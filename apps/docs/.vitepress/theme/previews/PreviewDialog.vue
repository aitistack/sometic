<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const open = ref(false);
</script>

<template>
    <DemoFrame title="Preview" hint="Modal dialog surface" stack>
        <div class="pg-row">
            <button type="button" class="pg-btn" @click="open = !open">
                {{ open ? "Close dialog" : "Open dialog" }}
            </button>
        </div>
        <div v-if="open" class="pg-dialog-stage">
            <div class="pg-dialog-scrim" aria-hidden="true" @click="open = false" />
            <div
                class="pg-dialog-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="dlg-title"
                data-state="open"
            >
                <h4 id="dlg-title">Confirm</h4>
                <p>Nested Escape and focus restore are wired in the DOM controller.</p>
                <button type="button" class="pg-btn" @click="open = false">Close</button>
            </div>
        </div>
    </DemoFrame>
</template>

<style scoped>
.pg-dialog-stage {
    position: relative;
    min-height: 10rem;
    border: 1px dashed var(--vp-c-divider);
    background: color-mix(in srgb, var(--vp-c-bg-soft) 55%, transparent);
}
.pg-dialog-scrim {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--vp-c-black) 22%, transparent);
}
.pg-dialog-panel {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 2;
    transform: translate(-50%, -50%);
    width: min(20rem, calc(100% - 2rem));
    padding: 1rem 1.1rem;
    display: grid;
    gap: 0.65rem;
    background: var(--pg-panel-bg, var(--vp-c-bg));
    color: var(--pg-ink, var(--vp-c-text-1));
    box-shadow: inset 0 0 0 1px var(--pg-line, var(--vp-c-divider));
}
.pg-dialog-panel h4,
.pg-dialog-panel p {
    margin: 0;
}
.pg-dialog-panel p {
    color: var(--vp-c-text-2);
    font-size: 0.9rem;
}
</style>
