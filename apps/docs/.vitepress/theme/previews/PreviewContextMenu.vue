<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const open = ref(false);
const x = ref(24);
const y = ref(24);

function onContext(event: MouseEvent) {
    event.preventDefault();
    open.value = true;
    x.value = Math.min(event.offsetX, 180);
    y.value = Math.min(event.offsetY, 80);
}
</script>

<template>
    <DemoFrame title="Preview" hint="Right-click the stage" stack>
        <div class="pg-context-stage" @contextmenu="onContext" @click="open = false">
            Right-click here
            <div
                v-if="open"
                class="pg-context-panel"
                role="menu"
                data-state="open"
                :style="{ left: `${x}px`, top: `${y}px` }"
            >
                <div role="menuitem" class="pg-menu-item">Copy</div>
                <div role="menuitem" class="pg-menu-item">Paste</div>
            </div>
        </div>
    </DemoFrame>
</template>

<style scoped>
.pg-context-stage {
    position: relative;
    min-height: 7rem;
    padding: 1rem;
    border: 1px dashed var(--vp-c-divider);
    color: var(--vp-c-text-2);
    cursor: context-menu;
    user-select: none;
}
.pg-context-panel {
    position: absolute;
    z-index: 2;
    min-width: 8rem;
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
.pg-menu-item:hover {
    background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
}
</style>
