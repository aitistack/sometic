<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const open = ref(false);
</script>

<template>
    <DemoFrame title="Preview" hint="Modal side panel" stack>
        <div class="pg-drawer-stage">
            <button type="button" class="pg-btn" @click="open = !open">
                {{ open ? "Close drawer" : "Open drawer" }}
            </button>
            <div v-if="open" class="pg-drawer-scrim" aria-hidden="true" @click="open = false" />
            <aside
                v-if="open"
                class="pg-drawer-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="drawer-title"
                data-side="right"
                data-state="open"
            >
                <h4 id="drawer-title">Account</h4>
                <p>Side panel: slides from the edge, not a centered dialog.</p>
                <button type="button" class="pg-btn" @click="open = false">Close</button>
            </aside>
        </div>
    </DemoFrame>
</template>

<style scoped>
.pg-drawer-stage {
    position: relative;
    min-height: 12rem;
    overflow: hidden;
    border: 1px dashed var(--vp-c-divider);
    padding: 1rem;
    background: color-mix(in srgb, var(--vp-c-bg-soft) 55%, transparent);
}
.pg-drawer-scrim {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--vp-c-black) 28%, transparent);
}
.pg-drawer-panel {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    width: min(16rem, 78%);
    padding: 1rem 1.1rem;
    background: var(--pg-panel-bg, var(--vp-c-bg));
    color: var(--pg-ink, var(--vp-c-text-1));
    box-shadow: inset 1px 0 0 var(--pg-line, var(--vp-c-divider));
    animation: pg-drawer-in 160ms ease-out;
}
.pg-drawer-panel h4 {
    margin: 0;
}
.pg-drawer-panel p {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 0.9rem;
}
@keyframes pg-drawer-in {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
}
@media (prefers-reduced-motion: reduce) {
    .pg-drawer-panel {
        animation: none;
    }
}
</style>
