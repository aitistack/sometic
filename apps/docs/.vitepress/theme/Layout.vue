<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useData, withBase } from "vitepress";
import DefaultTheme from "vitepress/theme";
import SidebarExtras from "./components/SidebarExtras.vue";
import ecosystemPrompt from "../prompts/ecosystem.txt?raw";

const { Layout } = DefaultTheme;
const { frontmatter, isDark } = useData();

const hero = computed(() => {
    const value = frontmatter.value.hero as { text?: string; tagline?: string } | undefined;
    return {
        text: value?.text ?? "",
        tagline: value?.tagline ?? "",
    };
});

const heroLogoSrc = computed(() => withBase(isDark.value ? "/logo-dark.png" : "/logo.png"));

const promptCopied = ref(false);
let promptResetTimer: ReturnType<typeof setTimeout> | undefined;

onUnmounted(() => {
    if (promptResetTimer !== undefined) {
        clearTimeout(promptResetTimer);
    }
});

async function copyEcosystemPrompt(): Promise<void> {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        return;
    }
    try {
        await navigator.clipboard.writeText(ecosystemPrompt);
        promptCopied.value = true;
        if (promptResetTimer !== undefined) {
            clearTimeout(promptResetTimer);
        }
        promptResetTimer = setTimeout(() => {
            promptCopied.value = false;
            promptResetTimer = undefined;
        }, 2000);
    } catch {
        promptCopied.value = false;
    }
}
</script>

<template>
    <Layout>
        <template #sidebar-nav-after>
            <SidebarExtras />
        </template>
        <template #home-hero-info>
            <h1 class="heading sometic-hero-heading">
                <img
                    class="sometic-hero-logo"
                    :src="heroLogoSrc"
                    alt="Sometic"
                    width="200"
                    height="70"
                    decoding="async"
                    fetchpriority="high"
                />
                <span v-if="hero.text" class="text">{{ hero.text }}</span>
            </h1>
            <p v-if="hero.tagline" class="tagline">{{ hero.tagline }}</p>
        </template>
        <template #home-hero-info-after>
            <div class="sometic-home-actions sometic-pg-kit">
                <a
                    class="pg-btn sometic-home-cta sometic-home-cta--secondary"
                    :href="withBase('/guide/quick-start')"
                >
                    <span class="sometic-home-cta__label">Quick start</span>
                    <svg
                        class="sometic-home-cta__icon"
                        viewBox="0 0 16 16"
                        width="16"
                        height="16"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.75"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.5 8h9M8.5 4l4 4-4 4"
                        />
                    </svg>
                </a>
                <a
                    class="pg-btn sometic-home-cta sometic-home-cta--primary"
                    :href="withBase('/concepts/architecture')"
                >
                    <span class="sometic-home-cta__label">See the architecture</span>
                    <svg
                        class="sometic-home-cta__icon"
                        viewBox="0 0 16 16"
                        width="16"
                        height="16"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.75"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.5 8h9M8.5 4l4 4-4 4"
                        />
                    </svg>
                </a>
                <button
                    type="button"
                    class="pg-btn sometic-home-cta sometic-home-cta--prompt"
                    :aria-label="
                        promptCopied ? 'Prompt copied' : 'Copy ecosystem prompt for coding agents'
                    "
                    @click="copyEcosystemPrompt"
                >
                    <span class="sometic-home-cta__label">{{
                        promptCopied ? "Copied" : "Copy Prompt"
                    }}</span>
                    <svg
                        class="sometic-home-cta__icon"
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
                </button>
            </div>
        </template>
    </Layout>
</template>
