<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

type UploadStatus = "queued" | "uploading" | "success" | "canceled";
type UploadItem = { id: string; name: string; status: UploadStatus; progress: number };

const initialItems: UploadItem[] = [
    { id: "file-1", name: "people.csv", status: "queued", progress: 0 },
    { id: "file-2", name: "roles.json", status: "queued", progress: 0 },
];

const items = ref<UploadItem[]>(initialItems.map((item) => ({ ...item })));
const timers = new Map<string, ReturnType<typeof setInterval>>();

const running = computed(() => items.value.some((item) => item.status === "uploading"));

function clearTimer(itemId: string): void {
    const timer = timers.get(itemId);
    if (timer !== undefined) {
        clearInterval(timer);
        timers.delete(itemId);
    }
}

function clearAllTimers(): void {
    for (const itemId of [...timers.keys()]) {
        clearTimer(itemId);
    }
}

function startItem(itemId: string): void {
    clearTimer(itemId);
    const item = items.value.find((entry) => entry.id === itemId);
    if (!item) {
        return;
    }
    item.status = "uploading";
    item.progress = 0;
    const timer = setInterval(() => {
        const current = items.value.find((entry) => entry.id === itemId);
        if (!current || current.status !== "uploading") {
            clearTimer(itemId);
            return;
        }
        current.progress = Math.min(1, Number((current.progress + 0.2).toFixed(2)));
        if (current.progress >= 1) {
            current.status = "success";
            clearTimer(itemId);
        }
    }, 320);
    timers.set(itemId, timer);
}

function startMockUpload(): void {
    for (const item of items.value) {
        startItem(item.id);
    }
}

function cancel(itemId: string): void {
    clearTimer(itemId);
    const item = items.value.find((entry) => entry.id === itemId);
    if (!item) {
        return;
    }
    item.status = "canceled";
}

function reset(): void {
    clearAllTimers();
    items.value = initialItems.map((item) => ({ ...item }));
}

function onDropzoneKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter" && event.key !== " ") {
        return;
    }
    event.preventDefault();
    startMockUpload();
}

function percent(item: UploadItem): number {
    return Math.round(item.progress * 100);
}

onBeforeUnmount(() => {
    clearAllTimers();
});
</script>

<template>
    <DemoFrame title="Preview" hint="Upload" stack>
        <div
            class="pg-upload-drop"
            role="button"
            tabindex="0"
            data-slot="dropzone"
            :data-state="running ? 'busy' : 'idle'"
            @click="startMockUpload"
            @keydown="onDropzoneKeydown"
            @dragover.prevent
            @drop.prevent="startMockUpload"
        >
            Drop files here or click to choose
        </div>
        <div class="pg-row">
            <button type="button" class="pg-btn" @click="startMockUpload">Start mock upload</button>
            <button type="button" class="pg-btn" @click="reset">Reset</button>
        </div>
        <ul class="pg-upload-list" data-slot="list">
            <li
                v-for="item in items"
                :key="item.id"
                class="pg-upload-item"
                data-slot="item"
                :data-status="item.status"
            >
                <div class="pg-upload-item__head">
                    <span class="pg-upload-item__name">{{ item.name }}</span>
                    <span class="pg-status">{{ item.status }} · {{ percent(item) }}%</span>
                    <button
                        type="button"
                        class="pg-btn"
                        :disabled="item.status !== 'uploading'"
                        @click="cancel(item.id)"
                    >
                        Cancel
                    </button>
                </div>
                <div
                    class="pg-upload-progress"
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    :aria-valuenow="percent(item)"
                    :aria-label="`Upload progress for ${item.name}`"
                >
                    <div class="pg-upload-progress__bar" :style="{ width: `${percent(item)}%` }" />
                </div>
            </li>
        </ul>
    </DemoFrame>
</template>

<style scoped>
.pg-upload-list {
    display: grid;
    gap: 0.75rem;
    list-style: none;
    margin: 0;
    padding: 0;
}

.pg-upload-item {
    display: grid;
    gap: 0.4rem;
}

.pg-upload-item__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
}

.pg-upload-item__name {
    font-weight: 600;
}

.pg-upload-item__head .pg-status {
    margin-right: auto;
}

.pg-upload-progress {
    height: 0.5rem;
    overflow: hidden;
    background: color-mix(in srgb, var(--vp-c-divider) 80%, transparent);
    box-shadow: inset 0 0 0 1px var(--pg-line, var(--vp-c-divider));
}

.pg-upload-progress__bar {
    height: 100%;
    background: var(--pg-accent, var(--vp-c-brand-1));
    transition: width 180ms ease;
}

@media (prefers-reduced-motion: reduce) {
    .pg-upload-progress__bar {
        transition: none;
    }
}
</style>
