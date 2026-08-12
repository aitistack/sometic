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
                    Accessibility
                </button>
                <div v-if="open === 'a'" data-slot="content" class="pg-accordion-panel">
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
                    Styling
                </button>
                <div v-if="open === 'b'" data-slot="content" class="pg-accordion-panel">
                    Unstyled by default. Own tokens and layout.
                </div>
            </div>
        </div>
    </DemoFrame>
</template>
