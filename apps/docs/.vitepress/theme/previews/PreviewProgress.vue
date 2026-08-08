<script setup lang="ts">
/* progress preview */
import DemoFrame from "../components/DemoFrame.vue";
</script>

<template>
    <DemoFrame title="Preview" hint="Progress" stack>
        <div
            class="pg-progress"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="64"
            data-state="determinate"
            aria-label="Upload 64 percent"
        >
            <div class="pg-progress__track">
                <div class="pg-progress__bar" style="width: 64%"></div>
            </div>
            <span class="pg-progress__label">64%</span>
        </div>
        <div
            class="pg-progress"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            data-state="indeterminate"
            aria-label="Loading"
        >
            <div class="pg-progress__track">
                <div class="pg-progress__bar pg-progress__bar--indeterminate"></div>
            </div>
            <span class="pg-progress__label">Indeterminate</span>
        </div>
    </DemoFrame>
</template>

<style scoped>
.pg-progress {
    display: grid;
    gap: 0.4rem;
}
.pg-progress__track {
    height: 0.5rem;
    overflow: hidden;
    background: color-mix(in srgb, var(--vp-c-divider) 80%, transparent);
    box-shadow: inset 0 0 0 1px var(--vp-c-divider);
}
.pg-progress__bar {
    height: 100%;
    background: var(--sometic-brand, var(--vp-c-brand-1));
}
.pg-progress__bar--indeterminate {
    width: 40%;
    animation: pg-progress-indeterminate 1.2s ease-in-out infinite;
}
.pg-progress__label {
    font-size: 0.75rem;
    color: var(--vp-c-text-2);
}
@keyframes pg-progress-indeterminate {
    0% {
        transform: translateX(-120%);
    }
    100% {
        transform: translateX(280%);
    }
}
@media (prefers-reduced-motion: reduce) {
    .pg-progress__bar--indeterminate {
        animation: none;
        width: 100%;
        opacity: 0.55;
    }
}
</style>
