<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const pressed = ref(false);
</script>

<template>
    <DemoFrame title="Preview" hint="Click to toggle">
        <button
            type="button"
            class="pg-btn"
            :aria-pressed="pressed ? 'true' : 'false'"
            :data-active="pressed ? 'true' : undefined"
            @click="pressed = !pressed"
        >
            {{ pressed ? "On" : "Off" }}
        </button>
    </DemoFrame>
</template>
