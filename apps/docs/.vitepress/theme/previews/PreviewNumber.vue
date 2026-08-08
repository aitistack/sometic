<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const value = ref("42");
</script>

<template>
    <DemoFrame title="Preview">
        <label class="pg-control">
            <span class="pg-control-label">Number</span>
            <input v-model="value" class="pg-input" type="number" inputmode="decimal" />
        </label>
    </DemoFrame>
</template>
