<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { scaffolds, type ScaffoldEntry } from "../scaffolds/catalog";
import CopyPrompt from "./CopyPrompt.vue";
import ScaffoldDrawer from "./ScaffoldDrawer.vue";
import "../scaffolds.css";

const activeId = ref(scaffolds[0]?.id ?? "");
const drawerOpen = ref(false);
const drawerScaffold = ref<ScaffoldEntry | null>(null);
const sectionEls = new Map<string, HTMLElement>();

const activeTitle = computed(
    () => scaffolds.find((entry) => entry.id === activeId.value)?.title ?? "",
);

function setSectionRef(id: string, el: Element | null): void {
    if (el instanceof HTMLElement) {
        sectionEls.set(id, el);
        return;
    }
    sectionEls.delete(id);
}

function scrollToScaffold(id: string): void {
    activeId.value = id;
    const el = sectionEls.get(id) ?? document.getElementById(`scaffold-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (typeof history !== "undefined") {
        history.replaceState(null, "", `#${id}`);
    }
}

function openIncluded(entry: ScaffoldEntry): void {
    drawerScaffold.value = entry;
    drawerOpen.value = true;
}

function closeDrawer(): void {
    drawerOpen.value = false;
}

let observer: IntersectionObserver | undefined;

onMounted(() => {
    if (typeof window === "undefined") {
        return;
    }
    const hash = window.location.hash.replace(/^#/, "");
    if (hash && scaffolds.some((entry) => entry.id === hash)) {
        activeId.value = hash;
        requestAnimationFrame(() => {
            document.getElementById(`scaffold-${hash}`)?.scrollIntoView({ block: "start" });
        });
    }

    observer = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            const top = visible[0];
            if (!top) {
                return;
            }
            const id = (top.target as HTMLElement).dataset.scaffoldId;
            if (id) {
                activeId.value = id;
            }
        },
        {
            rootMargin: "-20% 0px -55% 0px",
            threshold: [0.15, 0.35, 0.6],
        },
    );

    for (const entry of scaffolds) {
        const el = document.getElementById(`scaffold-${entry.id}`);
        if (el) {
            sectionEls.set(entry.id, el);
            observer.observe(el);
        }
    }
});

onUnmounted(() => {
    observer?.disconnect();
});

watch(drawerOpen, (open) => {
    if (!open) {
        drawerScaffold.value = null;
    }
});
</script>

<template>
    <div class="sometic-scaffolds">
        <div class="sometic-scaffolds__layout">
            <nav class="sometic-scaffolds__rail" aria-label="Scaffold index">
                <p class="sometic-scaffolds__rail-label">Scaffolds</p>
                <button
                    v-for="entry in scaffolds"
                    :key="`rail-${entry.id}`"
                    type="button"
                    class="sometic-scaffolds__rail-link"
                    :aria-current="activeId === entry.id ? 'true' : undefined"
                    @click="scrollToScaffold(entry.id)"
                >
                    {{ entry.title }}
                </button>
            </nav>

            <div class="sometic-scaffolds__main">
                <div
                    class="sometic-scaffolds__chips"
                    role="navigation"
                    aria-label="Scaffold jump links"
                >
                    <button
                        v-for="entry in scaffolds"
                        :key="`chip-${entry.id}`"
                        type="button"
                        class="sometic-scaffolds__chip"
                        :aria-current="activeId === entry.id ? 'true' : undefined"
                        :title="entry.title"
                        @click="scrollToScaffold(entry.id)"
                    >
                        {{ entry.title }}
                    </button>
                </div>
                <p class="sr-only">Viewing {{ activeTitle }}</p>

                <div class="sometic-scaffolds__stack">
                    <article
                        v-for="entry in scaffolds"
                        :id="`scaffold-${entry.id}`"
                        :key="entry.id"
                        :ref="(el) => setSectionRef(entry.id, el as Element | null)"
                        class="sometic-scaffold"
                        :data-scaffold-id="entry.id"
                    >
                        <h2 class="sometic-scaffold__title">{{ entry.title }}</h2>
                        <p class="sometic-scaffold__desc">{{ entry.description }}</p>

                        <ul class="sometic-scaffold__features">
                            <li v-for="feature in entry.features" :key="feature">
                                {{ feature }}
                            </li>
                        </ul>

                        <div class="sometic-scaffold__ctas">
                            <CopyPrompt :surface="entry.surface" />
                            <button
                                type="button"
                                class="sometic-scaffold__included"
                                @click="openIncluded(entry)"
                            >
                                <svg
                                    class="sometic-scaffold__included-icon"
                                    viewBox="0 0 16 16"
                                    width="16"
                                    height="16"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <rect
                                        x="2.5"
                                        y="2.5"
                                        width="11"
                                        height="11"
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
                                        d="M5 5.75h6M5 8h6M5 10.25h4"
                                    />
                                </svg>
                                <span>What’s Included</span>
                            </button>
                        </div>

                        <section class="sometic-scaffold__section">
                            <h3>Explanations</h3>
                            <p>{{ entry.explanations }}</p>
                        </section>

                        <section class="sometic-scaffold__section">
                            <h3>Styling</h3>
                            <p>{{ entry.styling }}</p>
                        </section>

                        <section class="sometic-scaffold__section">
                            <h3>SSR notes</h3>
                            <p>{{ entry.ssr }}</p>
                        </section>

                        <section class="sometic-scaffold__section">
                            <h3>FAQ</h3>
                            <div class="sometic-scaffold__faq">
                                <details v-for="item in entry.faq" :key="item.question">
                                    <summary>{{ item.question }}</summary>
                                    <p>{{ item.answer }}</p>
                                </details>
                            </div>
                        </section>
                    </article>
                </div>
            </div>
        </div>

        <ScaffoldDrawer :open="drawerOpen" :scaffold="drawerScaffold" @close="closeDrawer" />
    </div>
</template>

<style scoped>
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

@media (max-width: 39.99rem) {
    :deep(.sometic-copy-prompt) {
        display: block;
        width: 100%;
        margin: 0;
    }

    :deep(.sometic-copy-prompt__button) {
        width: 100%;
    }
}
</style>
