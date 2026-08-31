<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useData, withBase } from "vitepress";
import DefaultTheme from "vitepress/theme";
import SidebarExtras from "./components/SidebarExtras.vue";
import HomeIcon from "./components/HomeIcon.vue";
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

const managers = ["pnpm", "npm", "yarn", "bun"] as const;
type PackageManager = (typeof managers)[number];

const activeManager = ref<PackageManager>("pnpm");
const installPackages =
    "@sometic/app-shell @sometic/auth @sometic/http @sometic/query @sometic/auth-local";

const installCommand = computed(() => {
    switch (activeManager.value) {
        case "npm":
            return `npm install ${installPackages}`;
        case "yarn":
            return `yarn add ${installPackages}`;
        case "bun":
            return `bun add ${installPackages}`;
        default:
            return `pnpm add ${installPackages}`;
    }
});

const promptCopied = ref(false);
const installCopied = ref(false);
const installCopyFailed = ref(false);
let promptResetTimer: ReturnType<typeof setTimeout> | undefined;
let installResetTimer: ReturnType<typeof setTimeout> | undefined;

onUnmounted(() => {
    if (promptResetTimer !== undefined) {
        clearTimeout(promptResetTimer);
    }
    if (installResetTimer !== undefined) {
        clearTimeout(installResetTimer);
    }
});

async function writeClipboard(text: string): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        return false;
    }
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

async function copyEcosystemPrompt(): Promise<void> {
    const ok = await writeClipboard(ecosystemPrompt);
    promptCopied.value = ok;
    if (promptResetTimer !== undefined) {
        clearTimeout(promptResetTimer);
    }
    promptResetTimer = setTimeout(() => {
        promptCopied.value = false;
        promptResetTimer = undefined;
    }, 2000);
}

async function copyInstallCommand(): Promise<void> {
    const ok = await writeClipboard(installCommand.value);
    installCopied.value = ok;
    installCopyFailed.value = !ok;
    if (installResetTimer !== undefined) {
        clearTimeout(installResetTimer);
    }
    installResetTimer = setTimeout(() => {
        installCopied.value = false;
        installCopyFailed.value = false;
        installResetTimer = undefined;
    }, 2000);
}

function selectManager(manager: PackageManager): void {
    activeManager.value = manager;
    installCopied.value = false;
    installCopyFailed.value = false;
}
</script>

<template>
    <Layout>
        <template #sidebar-nav-after>
            <SidebarExtras />
        </template>
        <template #home-hero-info>
            <div class="sometic-home-hero">
                <div class="sometic-home-hero__mast">
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
                    <div class="sometic-home-actions">
                        <a
                            class="sometic-home-cta sometic-home-cta--primary"
                            :href="withBase('/guide/quick-start')"
                        >
                            <HomeIcon name="arrow" />
                            <span class="sometic-home-cta__label">Quick start</span>
                        </a>
                        <a
                            class="sometic-home-cta sometic-home-cta--secondary"
                            :href="withBase('/concepts/architecture')"
                        >
                            <HomeIcon name="architecture" />
                            <span class="sometic-home-cta__label">Architecture</span>
                        </a>
                        <a
                            class="sometic-home-cta sometic-home-cta--secondary"
                            :href="withBase('/guide/app-scaffolds')"
                        >
                            <HomeIcon name="scaffolds" />
                            <span class="sometic-home-cta__label">App scaffolds</span>
                        </a>
                        <button
                            type="button"
                            class="sometic-home-cta sometic-home-cta--prompt"
                            :aria-label="
                                promptCopied
                                    ? 'Prompt copied'
                                    : 'Copy ecosystem prompt for coding agents'
                            "
                            @click="copyEcosystemPrompt"
                        >
                            <HomeIcon :name="promptCopied ? 'check' : 'copy'" />
                            <span class="sometic-home-cta__label">{{
                                promptCopied ? "Copied" : "Copy prompt"
                            }}</span>
                        </button>
                    </div>
                </div>
                <section class="sometic-home-install-panel" aria-label="App spine and install">
                    <a class="sometic-home-spine" :href="withBase('/guide/app-shell')">
                        <HomeIcon name="spine" class="sometic-home-spine__icon" />
                        <span class="sometic-home-spine__copy">
                            <span class="sometic-home-spine__kicker">App spine</span>
                            <span class="sometic-home-spine__name">createSometicApp</span>
                            <span class="sometic-home-spine__note"
                                >Auth, HTTP, and query as one runtime. Session epoch clears query
                                and stores.</span
                            >
                        </span>
                    </a>
                    <div class="sometic-home-install">
                        <p class="sometic-home-install__label">
                            <HomeIcon name="install" />
                            Install the spine
                        </p>
                        <div
                            class="sometic-home-install__tabs"
                            role="tablist"
                            aria-label="Package manager"
                        >
                            <button
                                v-for="manager in managers"
                                :key="manager"
                                type="button"
                                role="tab"
                                class="sometic-home-install__tab"
                                :aria-selected="activeManager === manager"
                                @click="selectManager(manager)"
                            >
                                {{ manager }}
                            </button>
                        </div>
                        <div class="sometic-home-install__row">
                            <pre
                                class="sometic-home-install__pre"
                            ><code>{{ installCommand }}</code></pre>
                            <button
                                type="button"
                                class="sometic-home-install__copy"
                                :data-state="
                                    installCopyFailed
                                        ? 'error'
                                        : installCopied
                                          ? 'success'
                                          : undefined
                                "
                                :aria-label="
                                    installCopied
                                        ? 'Install command copied'
                                        : installCopyFailed
                                          ? 'Copy failed. Try again'
                                          : `Copy ${activeManager} install command`
                                "
                                @click="copyInstallCommand"
                            >
                                <HomeIcon
                                    :name="
                                        installCopyFailed
                                            ? 'retry'
                                            : installCopied
                                              ? 'check'
                                              : 'copy'
                                    "
                                />
                                {{
                                    installCopied ? "Copied" : installCopyFailed ? "Retry" : "Copy"
                                }}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </template>
    </Layout>
</template>
