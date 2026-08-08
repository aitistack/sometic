<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const value = ref("(555) 123-4567");
</script>

<template>
    <DemoFrame title="Preview" hint="Masked display">
        <label class="pg-control">
            <span class="pg-control-label">Phone</span>
            <input v-model="value" class="pg-input" type="text" inputmode="tel" />
        </label>
    </DemoFrame>
</template>
