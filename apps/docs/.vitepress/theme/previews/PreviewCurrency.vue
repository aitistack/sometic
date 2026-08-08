<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const value = ref("$1,250.00");
</script>

<template>
    <DemoFrame title="Preview">
        <label class="pg-control">
            <span class="pg-control-label">Currency</span>
            <input v-model="value" class="pg-input" type="text" inputmode="decimal" />
        </label>
    </DemoFrame>
</template>
