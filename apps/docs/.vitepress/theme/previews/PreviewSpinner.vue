<script setup lang="ts">
import DemoFrame from "../components/DemoFrame.vue";
</script>

<template>
    <DemoFrame title="Preview" hint="Spinner">
        <div class="pg-spinner" role="status" aria-live="polite" aria-label="Loading" />
    </DemoFrame>
</template>

<style scoped>
.pg-spinner {
    width: 1.35rem;
    height: 1.35rem;
    border: 2px solid color-mix(in srgb, var(--sometic-brand, var(--vp-c-brand-1)) 30%, transparent);
    border-top-color: var(--sometic-brand, var(--vp-c-brand-1));
    border-radius: 50%;
    animation: pg-spin 0.7s linear infinite;
}
@keyframes pg-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
