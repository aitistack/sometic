<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const open = ref(false);
</script>

<template>
    <DemoFrame title="Preview" hint="Hover or focus the control">
        <span
            class="sometic-demo__tip"
            @mouseenter="open = true"
            @mouseleave="open = false"
            @focusin="open = true"
            @focusout="open = false"
        >
            <button type="button" class="pg-btn">Hover / focus</button>
            <span v-if="open" class="sometic-demo__tip-bubble" role="tooltip"> Shortcut: ⌘K </span>
        </span>
    </DemoFrame>
</template>
