<script setup lang="ts">
import DemoFrame from "../components/DemoFrame.vue";
</script>

<template>
    <DemoFrame title="Preview" hint="Skeleton" stack>
        <div class="pg-skel" aria-hidden="true" data-animated="" />
        <div class="pg-skel pg-skel--short" aria-hidden="true" data-animated="" />
        <div class="pg-skel pg-skel--block" aria-hidden="true" data-animated="" />
    </DemoFrame>
</template>

<style scoped>
.pg-skel {
    height: 0.85rem;
    width: 100%;
    max-width: 18rem;
    background: linear-gradient(
        90deg,
        var(--vp-c-bg-soft),
        color-mix(in srgb, var(--vp-c-bg-soft) 40%, var(--vp-c-text-3)),
        var(--vp-c-bg-soft)
    );
    background-size: 200% 100%;
    animation: pg-shimmer 1.2s linear infinite;
}
.pg-skel--short {
    max-width: 11rem;
}
.pg-skel--block {
    height: 3.5rem;
    max-width: 18rem;
}
@keyframes pg-shimmer {
    to {
        background-position: -200% 0;
    }
}
</style>
