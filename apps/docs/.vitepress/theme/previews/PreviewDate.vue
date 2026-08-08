<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const value = ref("2026-08-05");
</script>

<template>
    <DemoFrame title="Preview">
        <label class="pg-control">
            <span class="pg-control-label">Date</span>
            <input v-model="value" class="pg-input" type="date" />
        </label>
    </DemoFrame>
</template>
