<script setup lang="ts">
import { computed, ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

type PaletteCommand = {
    id: string;
    label: string;
    keywords?: string[];
    disabled?: boolean;
    group?: string;
};

const commands: PaletteCommand[] = [
    {
        id: "docs",
        label: "Open docs",
        keywords: ["guide", "documentation"],
        group: "Navigation",
    },
    {
        id: "status",
        label: "Focus status log",
        keywords: ["log"],
        group: "Navigation",
    },
    {
        id: "theme",
        label: "Toggle theme",
        keywords: ["dark", "light"],
        group: "Theme",
    },
    { id: "tokens", label: "Reset tokens", disabled: true, group: "Theme" },
    { id: "faq", label: "Search FAQ", keywords: ["help"], group: "Docs" },
    { id: "compare", label: "Open comparison", keywords: ["vs"], group: "Docs" },
];

const open = ref(true);
const filter = ref("");
const activeId = ref("docs");
const status = ref("");
const filterEl = ref<HTMLInputElement | null>(null);

const filtered = computed(() => {
    const query = filter.value.trim().toLowerCase();
    if (!query) {
        return commands;
    }
    return commands.filter((command) => {
        if (command.label.toLowerCase().includes(query)) {
            return true;
        }
        return (command.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(query));
    });
});

const enabledIds = computed(() =>
    filtered.value.filter((command) => command.disabled !== true).map((command) => command.id),
);

function ensureActive(): void {
    const ids = enabledIds.value;
    if (ids.length === 0) {
        activeId.value = "";
        return;
    }
    if (!ids.includes(activeId.value)) {
        activeId.value = ids[0] ?? "";
    }
}

function openPalette(): void {
    open.value = true;
    ensureActive();
    queueMicrotask(() => {
        filterEl.value?.focus();
    });
}

function onFilter(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
        return;
    }
    filter.value = target.value;
    ensureActive();
}

function moveActive(delta: number): void {
    const ids = enabledIds.value;
    if (ids.length === 0) {
        return;
    }
    const current = ids.indexOf(activeId.value);
    const start = current >= 0 ? current : 0;
    const next = (((start + delta) % ids.length) + ids.length) % ids.length;
    activeId.value = ids[next] ?? "";
}

function select(command: PaletteCommand): void {
    if (command.disabled === true) {
        return;
    }
    activeId.value = command.id;
    status.value = `command select=${command.id}`;
    open.value = false;
}

function onKeydown(event: KeyboardEvent): void {
    if (!open.value || event.isComposing) {
        return;
    }
    if (event.key === "Escape") {
        event.preventDefault();
        open.value = false;
        return;
    }
    if (event.key === "ArrowDown") {
        event.preventDefault();
        moveActive(1);
        return;
    }
    if (event.key === "ArrowUp") {
        event.preventDefault();
        moveActive(-1);
        return;
    }
    if (event.key === "Enter") {
        event.preventDefault();
        const active = filtered.value.find((command) => command.id === activeId.value);
        if (active) {
            select(active);
        }
    }
}

function showGroup(index: number, group: string | undefined): boolean {
    if (!group) {
        return false;
    }
    const previous = filtered.value[index - 1];
    return previous?.group !== group;
}
</script>

<template>
    <DemoFrame title="Preview" hint="Command palette" stack>
        <button type="button" class="pg-btn" @click="openPalette">Open command palette</button>
        <div
            v-show="open"
            class="pg-command-palette"
            role="dialog"
            aria-modal="true"
            data-state="open"
            @keydown="onKeydown"
        >
            <input
                ref="filterEl"
                class="pg-input"
                :value="filter"
                placeholder="Filter commands"
                autocomplete="off"
                @input="onFilter"
            />
            <div class="pg-command-list" role="listbox">
                <p v-if="filtered.length === 0" class="pg-command-empty">No commands found</p>
                <template v-for="(entry, index) in filtered" :key="entry.id">
                    <div v-if="showGroup(index, entry.group)" class="pg-command-group">
                        {{ entry.group }}
                    </div>
                    <button
                        type="button"
                        class="pg-command-item"
                        role="option"
                        :aria-selected="activeId === entry.id"
                        :data-state="activeId === entry.id ? 'active' : 'inactive'"
                        :aria-disabled="entry.disabled === true ? 'true' : undefined"
                        :disabled="entry.disabled === true"
                        @click="select(entry)"
                    >
                        {{ entry.label }}
                    </button>
                </template>
            </div>
        </div>
        <p v-if="status" class="pg-status">{{ status }}</p>
    </DemoFrame>
</template>
