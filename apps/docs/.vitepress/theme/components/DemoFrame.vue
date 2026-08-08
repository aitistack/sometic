<script setup lang="ts">
withDefaults(
    defineProps<{
        title?: string;
        hint?: string;
        stack?: boolean;
    }>(),
    {
        stack: false,
    },
);
</script>

<template>
    <div class="sometic-demo">
        <div class="sometic-demo__bar">
            <span class="sometic-demo__title">{{ title ?? "Preview" }}</span>
            <span v-if="hint" class="sometic-demo__hint">{{ hint }}</span>
        </div>
        <div
            class="sometic-demo__stage sometic-pg-kit"
            :class="{ 'sometic-demo__stage--stack': stack }"
        >
            <slot />
        </div>
    </div>
</template>
