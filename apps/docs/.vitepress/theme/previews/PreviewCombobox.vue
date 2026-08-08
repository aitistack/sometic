<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const open = ref(false);
const value = ref<string | null>(null);
</script>

<template>
    <DemoFrame title="Preview" hint="Combobox" stack>
        <div class="pg-combobox">
            <button
                type="button"
                class="pg-btn pg-combobox-trigger"
                role="combobox"
                :aria-expanded="open"
                aria-haspopup="listbox"
                :data-state="open ? 'open' : 'closed'"
                @click="open = !open"
            >
                {{ value ?? "Pick a framework" }}
            </button>
            <div v-if="open" class="pg-combobox-list" role="listbox" data-state="open">
                <div
                    v-for="option in ['React', 'Vue', 'Vanilla']"
                    :key="option"
                    role="option"
                    class="pg-option"
                    :aria-selected="value === option"
                    @click="
                        value = option;
                        open = false;
                    "
                >
                    {{ option }}
                </div>
            </div>
        </div>
    </DemoFrame>
</template>

<style scoped>
.pg-combobox {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.35rem;
    width: min(16rem, 100%);
}
.pg-combobox-trigger {
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
}
.pg-combobox-list {
    padding: 0.35rem;
    background: var(--pg-panel-bg, var(--vp-c-bg));
    color: var(--pg-ink, var(--vp-c-text-1));
    box-shadow: inset 0 0 0 1px var(--pg-line, var(--vp-c-divider));
}
.pg-option {
    padding: 0.45rem 0.65rem;
    cursor: pointer;
    user-select: none;
}
.pg-option:hover,
.pg-option[aria-selected="true"] {
    background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
}
</style>
