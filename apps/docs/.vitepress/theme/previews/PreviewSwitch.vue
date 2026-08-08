<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const on = ref(true);
</script>

<template>
    <DemoFrame title="Preview">
        <label class="pg-control pg-selection-row">
            <span class="pg-control-label">Notifications</span>
            <input
                v-model="on"
                class="pg-switch"
                type="checkbox"
                role="switch"
                :aria-checked="on"
            />
        </label>
    </DemoFrame>
</template>
