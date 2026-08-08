<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const value = ref("us");
</script>

<template>
    <DemoFrame title="Preview">
        <label class="pg-control">
            <span class="pg-control-label">Country</span>
            <select v-model="value" class="pg-input pg-select" aria-label="Country">
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="gb">United Kingdom</option>
            </select>
        </label>
    </DemoFrame>
</template>
