<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const value = ref("Sometic");
</script>

<template>
    <DemoFrame title="Preview">
        <label class="pg-control">
            <span class="pg-control-label">Text</span>
            <input v-model="value" class="pg-input" type="text" placeholder="Type here" />
        </label>
    </DemoFrame>
</template>
