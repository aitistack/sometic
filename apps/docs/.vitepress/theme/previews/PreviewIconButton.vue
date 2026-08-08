<script setup lang="ts">
import DemoFrame from "../components/DemoFrame.vue";
</script>

<template>
    <DemoFrame title="Preview">
        <button type="button" class="pg-btn" aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" />
            </svg>
        </button>
        <button type="button" class="pg-btn" aria-label="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                    d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                    stroke="currentColor"
                    stroke-width="2"
                />
                <path
                    d="M19.4 13a7.8 7.8 0 0 0 .1-2l2-1.2-2-3.4-2.3.6a7.7 7.7 0 0 0-1.7-1L15 4h-4l-.5 2a7.7 7.7 0 0 0-1.7 1l-2.3-.6-2 3.4 2 1.2a7.8 7.8 0 0 0 0 2l-2 1.2 2 3.4 2.3-.6a7.7 7.7 0 0 0 1.7 1l.5 2h4l.5-2a7.7 7.7 0 0 0 1.7-1l2.3.6 2-3.4-2-1.2Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                />
            </svg>
        </button>
    </DemoFrame>
</template>
