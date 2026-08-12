<script setup lang="ts">
import { computed, ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

type NotificationItem = { id: string; title: string; read: boolean; priority: string };

const items = ref<NotificationItem[]>([]);

const unreadCount = computed(() => items.value.filter((item) => !item.read).length);

function push(): void {
    const next = items.value.length + 1;
    items.value = [
        ...items.value,
        {
            id: `notification-${next}`,
            title: `Notification ${next}`,
            read: false,
            priority: "normal",
        },
    ];
}

function markRead(itemId: string): void {
    items.value = items.value.map((item) => (item.id === itemId ? { ...item, read: true } : item));
}

function dismiss(itemId: string): void {
    items.value = items.value.filter((item) => item.id !== itemId);
}
</script>

<template>
    <DemoFrame title="Preview" hint="Notifications" stack>
        <div class="pg-row">
            <button type="button" class="pg-btn" data-notifications-add @click="push">Push</button>
            <span class="pg-status">{{ unreadCount }} unread</span>
        </div>
        <div
            class="pg-notification-center"
            data-notifications
            data-slot="root"
            data-state="open"
            role="region"
            aria-label="Notifications"
        >
            <p v-if="items.length === 0" class="pg-status">No notifications.</p>
            <div
                v-for="item in items"
                :key="item.id"
                class="pg-notification-item"
                data-slot="item"
                :data-read="item.read ? 'true' : 'false'"
                :data-priority="item.priority"
            >
                <span class="pg-notification-item__title">
                    {{ item.title }}{{ item.read ? " (read)" : "" }}
                </span>
                <button
                    type="button"
                    class="pg-btn"
                    :disabled="item.read"
                    @click="markRead(item.id)"
                >
                    Mark read
                </button>
                <button type="button" class="pg-btn" @click="dismiss(item.id)">Dismiss</button>
            </div>
        </div>
    </DemoFrame>
</template>

<style scoped>
.pg-notification-center {
    display: grid;
    gap: 0.5rem;
}

.pg-notification-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
    padding: 0.6rem 0.75rem;
    background: var(--pg-panel-bg, var(--vp-c-bg));
    box-shadow: inset 0 0 0 1px var(--pg-line, var(--vp-c-divider));
}

.pg-notification-item__title {
    margin-right: auto;
    font-weight: 600;
}

.pg-notification-item[data-read="true"] .pg-notification-item__title {
    font-weight: 500;
    color: var(--pg-muted, var(--vp-c-text-3));
}
</style>
