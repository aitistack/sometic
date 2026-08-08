<script setup lang="ts">
import DemoFrame from "../components/DemoFrame.vue";
</script>

<template>
    <DemoFrame title="Preview" hint="Interactive demo">
        <button type="button" class="pg-btn">Save</button>
        <button type="button" class="pg-btn">Cancel</button>
        <button type="button" class="pg-btn" disabled>Disabled</button>
        <button type="button" class="pg-btn" data-loading="true">Loading…</button>
    </DemoFrame>
</template>
