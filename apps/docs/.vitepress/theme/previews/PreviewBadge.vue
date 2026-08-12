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
