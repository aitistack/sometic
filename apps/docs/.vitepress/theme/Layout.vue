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
                <section class="sometic-home-bento" aria-label="Sometic entry points">
                    <article class="sometic-home-bento__cell sometic-home-bento__cell--spine">
                        <a :href="withBase('/guide/app-shell')">
                            <HomeIcon name="spine" />
                            <span class="sometic-home-bento__kicker">App spine</span>
                            <span class="sometic-home-bento__name">createSometicApp</span>
                            <span class="sometic-home-bento__note"
                                >Auth, HTTP, and query composed as one runtime. Session epoch clears
                                query and bound stores together.</span
                            >
                        </a>
                    </article>
                    <article class="sometic-home-bento__cell sometic-home-bento__cell--auth">
                        <a :href="withBase('/authentication/')">
                            <HomeIcon name="auth" />
                            <span class="sometic-home-bento__name">Auth</span>
                            <span class="sometic-home-bento__note">Session and refresh</span>
                        </a>
                    </article>
                    <article class="sometic-home-bento__cell sometic-home-bento__cell--http">
                        <a :href="withBase('/utilities/http')">
                            <HomeIcon name="http" />
                            <span class="sometic-home-bento__name">HTTP</span>
                            <span class="sometic-home-bento__note">Fetch and interceptors</span>
                        </a>
                    </article>
                    <article class="sometic-home-bento__cell sometic-home-bento__cell--query">
                        <a :href="withBase('/utilities/query')">
                            <HomeIcon name="query" />
                            <span class="sometic-home-bento__name">Query</span>
                            <span class="sometic-home-bento__note">Cache and epoch</span>
                        </a>
                    </article>
                    <article class="sometic-home-bento__cell sometic-home-bento__cell--store">
                        <a :href="withBase('/stores/')">
                            <HomeIcon name="store" />
                            <span class="sometic-home-bento__name">Store</span>
                            <span class="sometic-home-bento__note">State and persistence</span>
                        </a>
                    </article>
                    <article class="sometic-home-bento__cell sometic-home-bento__cell--bind">
                        <p class="sometic-home-bento__kicker">
                            <HomeIcon name="bind" />
                            Bind a view
                        </p>
                        <div class="sometic-home-bento__binds">
                            <a :href="withBase('/frameworks/react')">
                                <HomeIcon name="react" />
                                React
                            </a>
                            <a :href="withBase('/frameworks/vue')">
                                <HomeIcon name="vue" />
                                Vue
                            </a>
                            <a :href="withBase('/frameworks/vanilla')">
                                <HomeIcon name="elements" />
                                Web Components
                            </a>
                        </div>
                    </article>
                    <article class="sometic-home-bento__cell sometic-home-bento__cell--forms">
                        <a :href="withBase('/forms/')">
                            <HomeIcon name="forms" />
                            <span class="sometic-home-bento__name">Forms</span>
                            <span class="sometic-home-bento__note">Fields and validation</span>
                        </a>
                    </article>
                    <article class="sometic-home-bento__cell sometic-home-bento__cell--theme">
                        <a :href="withBase('/theming/')">
                            <HomeIcon name="theme" />
                            <span class="sometic-home-bento__name">Theme</span>
                            <span class="sometic-home-bento__note">Tokens, your CSS</span>
                        </a>
                    </article>
                    <article class="sometic-home-bento__cell sometic-home-bento__cell--install">
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
                                        installCopied
                                            ? "Copied"
                                            : installCopyFailed
                                              ? "Retry"
                                              : "Copy"
                                    }}
                                </button>
                            </div>
                        </div>
                    </article>
                </section>
            </div>
        </template>
    </Layout>
</template>
