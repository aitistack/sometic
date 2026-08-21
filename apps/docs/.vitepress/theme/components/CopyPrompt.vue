<script setup lang="ts">
import { computed, onUnmounted, ref, watchEffect } from "vue";

const props = defineProps<{
    surface?: string;
    prompt?: string;
}>();

const loaders = import.meta.glob("../../prompts/*.txt", {
    query: "?raw",
    import: "default",
}) as Record<string, () => Promise<string>>;

const SURFACE_PATTERN = /^[a-z0-9-]+$/i;

const resolvedPrompt = ref("");
const copied = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | undefined;
let loadToken = 0;

watchEffect((onCleanup) => {
    const token = (loadToken += 1);
    if (typeof props.prompt === "string" && props.prompt.length > 0) {
        resolvedPrompt.value = props.prompt;
        return;
    }
    const surface = props.surface?.trim() ?? "";
    if (!surface || !SURFACE_PATTERN.test(surface)) {
        resolvedPrompt.value = "";
        return;
    }
    const entry = Object.entries(loaders).find(([path]) => path.endsWith(`/${surface}.txt`));
    if (!entry) {
        resolvedPrompt.value = "";
        return;
    }
    let cancelled = false;
    onCleanup(() => {
        cancelled = true;
    });
    void entry[1]().then((text) => {
        if (!cancelled && token === loadToken) {
            resolvedPrompt.value = text;
        }
    });
});

onUnmounted(() => {
    if (resetTimer !== undefined) {
        clearTimeout(resetTimer);
    }
});

const buttonLabel = computed(() => (copied.value ? "Copied" : "Copy Prompt"));

async function copyPrompt(): Promise<void> {
    const text = resolvedPrompt.value;
    if (!text || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        copied.value = true;
        if (resetTimer !== undefined) {
            clearTimeout(resetTimer);
        }
        resetTimer = setTimeout(() => {
            copied.value = false;
            resetTimer = undefined;
        }, 2000);
    } catch {
        copied.value = false;
    }
}
</script>

<template>
    <div class="sometic-copy-prompt">
        <button
            type="button"
            class="sometic-copy-prompt__button"
            :disabled="!resolvedPrompt"
            :aria-label="copied ? 'Prompt copied' : 'Copy prompt for coding agents'"
            @click="copyPrompt"
        >
            <svg
                class="sometic-copy-prompt__icon"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                aria-hidden="true"
                focusable="false"
            >
                <rect
                    x="6"
                    y="5.25"
                    width="6.5"
                    height="7.5"
                    rx="1"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                />
                <path
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.25 10.75H3.5a1 1 0 0 1-1-1v-5.5a1 1 0 0 1 1-1h5.5a1 1 0 0 1 1 1V4.5"
                />
            </svg>
            <span class="sometic-copy-prompt__label">{{ buttonLabel }}</span>
        </button>
    </div>
</template>

<style scoped>
.sometic-copy-prompt {
    margin: 1rem 0 1.5rem;
}

.sometic-copy-prompt__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 2.25rem;
    padding: 0.4rem 0.95rem;
    font-family: var(--sometic-font-body, var(--vp-font-family-base));
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: var(--vp-c-text-1);
    background: transparent;
    border: 1.5px dashed color-mix(in srgb, var(--sometic-brand) 55%, var(--vp-c-divider));
    border-radius: 0;
    cursor: pointer;
    transition:
        color 160ms ease,
        border-color 160ms ease,
        background-color 160ms ease;
}

.sometic-copy-prompt__label {
    display: inline-block;
}

.sometic-copy-prompt__icon {
    flex: 0 0 auto;
    width: 1em;
    height: 1em;
    display: block;
}

.sometic-copy-prompt__button:hover:not(:disabled),
.sometic-copy-prompt__button:focus-visible {
    color: var(--sometic-brand);
    border-color: var(--sometic-brand);
    background: color-mix(in srgb, var(--sometic-brand) 6%, transparent);
    outline: none;
}

.sometic-copy-prompt__button:focus-visible {
    outline: 2px solid var(--sometic-brand);
    outline-offset: 2px;
}

.sometic-copy-prompt__button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
    .sometic-copy-prompt__button {
        transition: none;
    }
}
</style>
