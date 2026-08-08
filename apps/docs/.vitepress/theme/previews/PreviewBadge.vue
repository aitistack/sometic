<script setup lang="ts">
import DemoFrame from "../components/DemoFrame.vue";
</script>

<template>
    <DemoFrame title="Preview" hint="Badge">
        <span class="pg-badge" data-tone="neutral">Neutral</span>
        <span class="pg-badge" data-tone="info">Info</span>
        <span class="pg-badge" data-tone="success">Success</span>
        <span class="pg-badge" data-tone="warning">Warning</span>
        <span class="pg-badge" data-tone="danger">Danger</span>
    </DemoFrame>
</template>

<style scoped>
.pg-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 650;
    letter-spacing: 0.02em;
    border: 1px solid var(--vp-c-divider);
}
.pg-badge[data-tone="info"] {
    color: var(--sometic-brand, var(--vp-c-brand-1));
    border-color: color-mix(in srgb, var(--sometic-brand, var(--vp-c-brand-1)) 45%, transparent);
}
.pg-badge[data-tone="success"] {
    color: #1f8a5b;
}
.pg-badge[data-tone="warning"] {
    color: #b45309;
}
.pg-badge[data-tone="danger"] {
    color: #dc2626;
}
</style>
