<script setup lang="ts">
import DemoFrame from "../components/DemoFrame.vue";
</script>

<template>
    <DemoFrame title="Preview">
        <div class="pg-row" role="group" aria-label="Export actions">
            <button type="button" class="pg-btn">Cut</button>
            <button type="button" class="pg-btn">Copy</button>
            <button type="button" class="pg-btn" data-active="true">Paste</button>
        </div>
    </DemoFrame>
</template>
