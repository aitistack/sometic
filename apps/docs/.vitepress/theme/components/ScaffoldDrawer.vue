<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { ScaffoldEntry } from "../scaffolds/catalog";

const props = defineProps<{
    scaffold: ScaffoldEntry | null;
    open: boolean;
}>();

const emit = defineEmits<{
    close: [];
}>();

const loaders = import.meta.glob("../../prompts/*.txt", {
    query: "?raw",
    import: "default",
}) as Record<string, () => Promise<string>>;

const promptText = ref("");
const copied = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const closeBtnRef = ref<HTMLButtonElement | null>(null);
let resetTimer: ReturnType<typeof setTimeout> | undefined;
let restoreFocus: HTMLElement | null = null;
let lockedScrollY = 0;
let previousHtmlOverflow = "";
let previousBodyOverflow = "";
let previousBodyPosition = "";
let previousBodyTop = "";
let previousBodyWidth = "";
let previousBodyPaddingRight = "";

const titleId = computed(() =>
    props.scaffold ? `scaffold-drawer-title-${props.scaffold.id}` : "scaffold-drawer-title",
);

async function loadPrompt(surface: string): Promise<void> {
    const entry = Object.entries(loaders).find(([path]) => path.endsWith(`/${surface}.txt`));
    if (!entry) {
        promptText.value = "";
        return;
    }
    promptText.value = await entry[1]();
}

function lockPageScroll(): void {
    if (typeof document === "undefined" || typeof window === "undefined") {
        return;
    }
    const html = document.documentElement;
    const body = document.body;
    lockedScrollY = window.scrollY;
    previousHtmlOverflow = html.style.overflow;
    previousBodyOverflow = body.style.overflow;
    previousBodyPosition = body.style.position;
    previousBodyTop = body.style.top;
    previousBodyWidth = body.style.width;
    previousBodyPaddingRight = body.style.paddingRight;
    const scrollbarGap = Math.max(0, window.innerWidth - html.clientWidth);
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${lockedScrollY}px`;
    body.style.width = "100%";
    if (scrollbarGap > 0) {
        body.style.paddingRight = `${scrollbarGap}px`;
    }
}

function unlockPageScroll(): void {
    if (typeof document === "undefined" || typeof window === "undefined") {
        return;
    }
    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = previousHtmlOverflow;
    body.style.overflow = previousBodyOverflow;
    body.style.position = previousBodyPosition;
    body.style.top = previousBodyTop;
    body.style.width = previousBodyWidth;
    body.style.paddingRight = previousBodyPaddingRight;
    window.scrollTo(0, lockedScrollY);
}

watch(
    () => [props.open, props.scaffold?.surface] as const,
    async ([isOpen, surface]) => {
        if (!isOpen || !surface) {
            return;
        }
        await loadPrompt(surface);
        await nextTick();
        closeBtnRef.value?.focus();
    },
);

watch(
    () => props.open,
    (isOpen) => {
        if (typeof document === "undefined") {
            return;
        }
        if (isOpen) {
            restoreFocus =
                document.activeElement instanceof HTMLElement ? document.activeElement : null;
            lockPageScroll();
            return;
        }
        unlockPageScroll();
        restoreFocus?.focus();
        restoreFocus = null;
        copied.value = false;
    },
);

function onKeydown(event: KeyboardEvent): void {
    if (!props.open) {
        return;
    }
    if (event.key === "Escape") {
        event.preventDefault();
        emit("close");
        return;
    }
    if (event.key !== "Tab" || !panelRef.value) {
        return;
    }
    const focusable = panelRef.value.querySelectorAll<HTMLElement>(
        'button, [href], textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) {
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
        return;
    }
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function onWheelTrap(event: WheelEvent): void {
    if (!props.open || !panelRef.value) {
        return;
    }
    if (panelRef.value.contains(event.target as Node)) {
        return;
    }
    event.preventDefault();
}

function onTouchMoveTrap(event: TouchEvent): void {
    if (!props.open || !panelRef.value) {
        return;
    }
    if (panelRef.value.contains(event.target as Node)) {
        return;
    }
    event.preventDefault();
}

onMounted(() => {
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("wheel", onWheelTrap, { passive: false });
    document.addEventListener("touchmove", onTouchMoveTrap, { passive: false });
});

onUnmounted(() => {
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("wheel", onWheelTrap);
    document.removeEventListener("touchmove", onTouchMoveTrap);
    if (props.open) {
        unlockPageScroll();
    }
    if (resetTimer !== undefined) {
        clearTimeout(resetTimer);
    }
});

async function copyPrompt(): Promise<void> {
    const text = promptText.value;
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
    <Teleport to="body">
        <div v-if="open && scaffold" class="sometic-scaffold-drawer-root">
            <button
                type="button"
                class="sometic-scaffold-drawer__scrim"
                aria-label="Close what’s included"
                @click="emit('close')"
            />
            <aside
                ref="panelRef"
                class="sometic-scaffold-drawer__panel"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
            >
                <div class="sometic-scaffold-drawer__header">
                    <h2 :id="titleId">{{ scaffold.title }}</h2>
                    <button
                        ref="closeBtnRef"
                        type="button"
                        class="sometic-scaffold-drawer__close"
                        aria-label="Close"
                        @click="emit('close')"
                    >
                        Close
                    </button>
                </div>
                <div class="sometic-scaffold-drawer__body">
                    <section>
                        <h3>What’s included</h3>
                        <ul class="sometic-scaffold-drawer__packages">
                            <li v-for="pkg in scaffold.packages" :key="pkg">
                                {{ pkg }}
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h3>Docs</h3>
                        <div class="sometic-scaffold-drawer__docs">
                            <a
                                v-for="doc in scaffold.docs"
                                :key="doc.href"
                                class="sometic-scaffold-drawer__doc"
                                :href="doc.href"
                                target="_blank"
                                rel="noopener noreferrer"
                                >{{ doc.label }}</a
                            >
                        </div>
                    </section>
                    <section>
                        <h3>Prompt</h3>
                        <div class="sometic-scaffold-drawer__actions">
                            <button
                                type="button"
                                class="sometic-scaffold-drawer__copy"
                                :disabled="!promptText"
                                @click="copyPrompt"
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
                                <span>{{ copied ? "Copied" : "Copy Prompt" }}</span>
                            </button>
                        </div>
                        <pre class="sometic-scaffold-drawer__prompt">{{ promptText }}</pre>
                    </section>
                </div>
            </aside>
        </div>
    </Teleport>
</template>
