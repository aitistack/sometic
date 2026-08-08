<script setup lang="ts">
import { ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

const loading = ref(false);

async function run(): Promise<void> {
    if (loading.value) {
        return;
    }
    loading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 900));
    loading.value = false;
}
</script>

<template>
    <DemoFrame title="Preview" hint="Runs an async action">
        <button
            type="button"
            class="pg-btn"
            :data-loading="loading ? 'true' : undefined"
            @click="run"
        >
            {{ loading ? "Working…" : "Run action" }}
        </button>
    </DemoFrame>
</template>
