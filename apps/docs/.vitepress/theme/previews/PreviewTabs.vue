<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const value = ref("overview");
</script>

<template>
    <DemoFrame title="Preview" hint="Tabs" stack>
        <div role="tablist" aria-orientation="horizontal" class="pg-tabs">
            <button
                type="button"
                class="pg-tab"
                role="tab"
                :aria-selected="value === 'overview'"
                :data-state="value === 'overview' ? 'active' : 'inactive'"
                @click="value = 'overview'"
            >
                Overview
            </button>
            <button
                type="button"
                class="pg-tab"
                role="tab"
                :aria-selected="value === 'api'"
                :data-state="value === 'api' ? 'active' : 'inactive'"
                @click="value = 'api'"
            >
                API
            </button>
            <button
                type="button"
                class="pg-tab"
                role="tab"
                :aria-selected="value === 'a11y'"
                :data-state="value === 'a11y' ? 'active' : 'inactive'"
                @click="value = 'a11y'"
            >
                A11y
            </button>
        </div>
        <div v-if="value === 'overview'" role="tabpanel" class="pg-tabpanel" data-state="active">
            Shared controllers keep selection portable across adapters.
        </div>
        <div v-else-if="value === 'api'" role="tabpanel" class="pg-tabpanel" data-state="active">
            Resolve helpers emit ARIA and data-state for your styles.
        </div>
        <div v-else role="tabpanel" class="pg-tabpanel" data-state="active">
            Selected tabs expose aria-selected and data-state for CSS.
        </div>
    </DemoFrame>
</template>

<style scoped>
.pg-tabs {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.2rem;
    padding: 0.2rem;
    width: fit-content;
    max-width: 100%;
    background: color-mix(in srgb, var(--vp-c-bg-soft) 90%, transparent);
    box-shadow: inset 0 0 0 1px var(--vp-c-divider);
}
.pg-tab {
    appearance: none;
    border: 0;
    margin: 0;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    background: transparent;
    color: var(--vp-c-text-2);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
}
.pg-tab:hover {
    color: var(--vp-c-text-1);
}
.pg-tab[data-state="active"],
.pg-tab[aria-selected="true"] {
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    box-shadow: inset 0 0 0 1px var(--vp-c-divider);
}
.pg-tabpanel {
    margin-top: 0.15rem;
    color: var(--vp-c-text-2);
    font-size: 0.92rem;
    line-height: 1.45;
}
</style>
