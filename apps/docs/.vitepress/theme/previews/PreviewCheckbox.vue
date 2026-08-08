<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const checked = ref(true);
</script>

<template>
    <DemoFrame title="Preview">
        <label class="pg-control pg-selection-row">
            <span class="pg-control-label">Terms</span>
            <input v-model="checked" class="pg-check" type="checkbox" />
        </label>
    </DemoFrame>
</template>
