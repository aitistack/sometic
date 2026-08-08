<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const open = ref(false);
</script>

<template>
    <DemoFrame title="Preview" hint="Menu surface" stack>
        <div class="pg-menu-anchor">
            <button
                type="button"
                class="pg-btn"
                aria-haspopup="menu"
                :aria-expanded="open"
                @click="open = !open"
            >
                {{ open ? "Close menu" : "Open menu" }}
            </button>
            <div v-if="open" class="pg-menu-panel" role="menu" data-state="open">
                <div role="menuitem" class="pg-menu-item" tabindex="0">Edit</div>
                <div role="menuitem" class="pg-menu-item" tabindex="0">Duplicate</div>
                <div role="menuitem" class="pg-menu-item" aria-disabled="true" data-disabled="">
                    Delete
                </div>
            </div>
        </div>
    </DemoFrame>
</template>

<style scoped>
.pg-menu-anchor {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
}
.pg-menu-panel {
    min-width: 10rem;
    padding: 0.35rem;
    background: var(--pg-panel-bg, var(--vp-c-bg));
    color: var(--pg-ink, var(--vp-c-text-1));
    box-shadow: inset 0 0 0 1px var(--pg-line, var(--vp-c-divider));
}
.pg-menu-item {
    padding: 0.45rem 0.65rem;
    cursor: pointer;
    user-select: none;
}
.pg-menu-item:hover,
.pg-menu-item:focus-visible {
    background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
    outline: none;
}
.pg-menu-item[aria-disabled="true"],
.pg-menu-item[data-disabled] {
    cursor: not-allowed;
    opacity: 0.5;
}
.pg-menu-item[aria-disabled="true"]:hover {
    background: transparent;
}
</style>
