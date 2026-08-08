<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const open = ref("a");

function toggle(id: string) {
    open.value = open.value === id ? "" : id;
}
</script>

<template>
    <DemoFrame title="Preview" hint="Accordion" stack>
        <div class="pg-accordion" data-slot="root" data-type="single">
            <div
                data-slot="item"
                class="pg-accordion-item"
                :data-state="open === 'a' ? 'open' : 'closed'"
            >
                <button
                    type="button"
                    class="pg-accordion-trigger"
                    data-slot="trigger"
                    :aria-expanded="open === 'a'"
                    @click="toggle('a')"
                >
                    <span>Accessibility</span>
                    <span class="pg-accordion-chevron" aria-hidden="true" />
                </button>
                <div v-if="open === 'a'" data-slot="content" class="pg-accordion-content">
                    Focus, dismiss, and ARIA live in the core engines.
                </div>
            </div>
            <div
                data-slot="item"
                class="pg-accordion-item"
                :data-state="open === 'b' ? 'open' : 'closed'"
            >
                <button
                    type="button"
                    class="pg-accordion-trigger"
                    data-slot="trigger"
                    :aria-expanded="open === 'b'"
                    @click="toggle('b')"
                >
                    <span>Styling</span>
                    <span class="pg-accordion-chevron" aria-hidden="true" />
                </button>
                <div v-if="open === 'b'" data-slot="content" class="pg-accordion-content">
                    Unstyled by default. Own tokens and layout.
                </div>
            </div>
        </div>
    </DemoFrame>
</template>

<style scoped>
.pg-accordion {
    display: grid;
    gap: 0;
    border-top: 1px solid var(--vp-c-divider);
}
.pg-accordion-item {
    border-bottom: 1px solid var(--vp-c-divider);
}
.pg-accordion-trigger {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.8rem 0.15rem;
    border: 0;
    background: transparent;
    color: var(--vp-c-text-1);
    font: inherit;
    font-weight: 650;
    text-align: left;
    cursor: pointer;
}
.pg-accordion-trigger:hover {
    color: var(--vp-c-brand-1);
}
.pg-accordion-chevron {
    width: 0.45rem;
    height: 0.45rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg);
    transition: transform 140ms ease;
    flex: 0 0 auto;
}
.pg-accordion-item[data-state="open"] .pg-accordion-chevron {
    transform: rotate(225deg);
}
.pg-accordion-content {
    padding: 0 0.15rem 0.85rem;
    color: var(--vp-c-text-2);
    font-size: 0.92rem;
    line-height: 1.45;
}
</style>
