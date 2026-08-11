<script setup lang="ts">
import { onUnmounted, ref } from "vue";

const props = withDefaults(
    defineProps<{
        packages: string;
        managers?: Array<"pnpm" | "npm" | "yarn" | "bun">;
    }>(),
    {
        managers: () => ["pnpm", "npm", "yarn", "bun"],
    },
);

const copiedKey = ref<string | null>(null);
let resetTimer: ReturnType<typeof setTimeout> | undefined;

const commandFor = (manager: string): string => {
    const pkgs = props.packages.trim();
    switch (manager) {
        case "npm":
            return `npm install ${pkgs}`;
        case "yarn":
            return `yarn add ${pkgs}`;
        case "bun":
            return `bun add ${pkgs}`;
        default:
            return `pnpm add ${pkgs}`;
    }
};

onUnmounted(() => {
    if (resetTimer !== undefined) {
        clearTimeout(resetTimer);
    }
});

async function copyCommand(manager: string): Promise<void> {
    const text = commandFor(manager);
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        copiedKey.value = manager;
        if (resetTimer !== undefined) {
            clearTimeout(resetTimer);
        }
        resetTimer = setTimeout(() => {
            copiedKey.value = null;
            resetTimer = undefined;
        }, 2000);
    } catch {
        copiedKey.value = null;
    }
}
</script>

<template>
    <div class="sometic-install-commands" role="group" aria-label="Install commands">
        <div v-for="manager in managers" :key="manager" class="sometic-install-commands__row">
            <div class="sometic-install-commands__meta">
                <span class="sometic-install-commands__manager">{{ manager }}</span>
                <button
                    type="button"
                    class="sometic-install-commands__copy"
                    :aria-label="
                        copiedKey === manager
                            ? `${manager} install command copied`
                            : `Copy ${manager} install command`
                    "
                    @click="copyCommand(manager)"
                >
                    {{ copiedKey === manager ? "Copied" : "Copy" }}
                </button>
            </div>
            <pre class="sometic-install-commands__pre"><code>{{ commandFor(manager) }}</code></pre>
        </div>
    </div>
</template>

<style scoped>
.sometic-install-commands {
    display: grid;
    gap: 0.75rem;
    margin: 1rem 0 1.25rem;
}

.sometic-install-commands__row {
    border: 1px solid var(--vp-c-divider);
    border-radius: 10px;
    background: var(--vp-c-bg-soft);
    overflow: hidden;
}

.sometic-install-commands__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.55rem 0.85rem 0.35rem;
}

.sometic-install-commands__manager {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--vp-c-text-2);
}

.sometic-install-commands__copy {
    appearance: none;
    border: 1px solid var(--sometic-brand, var(--vp-c-brand-1));
    border-radius: 999px;
    background: var(--sometic-brand, var(--vp-c-brand-1));
    color: #fff;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 700;
    line-height: 1;
    padding: 0.45rem 0.85rem;
    cursor: pointer;
}

.sometic-install-commands__copy:hover,
.sometic-install-commands__copy:focus-visible {
    background: var(--sometic-brand-hover, var(--vp-c-brand-2));
    border-color: var(--sometic-brand-hover, var(--vp-c-brand-2));
    color: #fff;
    outline: none;
}

.sometic-install-commands__pre {
    margin: 0;
    padding: 0.35rem 0.85rem 0.85rem;
    background: transparent;
    overflow-x: auto;
}

.sometic-install-commands__pre code {
    font-family: var(--sometic-font-code, var(--vp-font-family-mono));
    font-size: 0.9rem;
    color: var(--vp-c-text-1);
}
</style>
