<script setup lang="ts">
import { computed, ref, watch } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

type ColumnId = "name" | "role" | "team";
type Row = { id: string; name: string; role: string; team: string };
type SortDirection = "asc" | "desc";
type SortEntry = { id: ColumnId; direction: SortDirection };
type PageSelection = "none" | "some" | "all";

const columns: Array<{ id: ColumnId; header: string }> = [
    { id: "name", header: "Name" },
    { id: "role", header: "Role" },
    { id: "team", header: "Team" },
];

const rows: Row[] = Array.from({ length: 48 }, (_, index) => ({
    id: String(index + 1),
    name: `Person ${index + 1}`,
    role: index % 2 === 0 ? "Admin" : "Editor",
    team: index % 3 === 0 ? "Platform" : index % 3 === 1 ? "Growth" : "Support",
}));

const pageSizeOptions = [5, 8, 10, 25] as const;

const nameFilter = ref("");
const roleFilter = ref<"" | "Admin" | "Editor">("");
const teamHidden = ref(false);
const pageIndex = ref(0);
const pageSize = ref(8);
const sorting = ref<SortEntry[]>([]);
const selectedIds = ref<string[]>([]);
const allFiltered = ref(false);
const excludedIds = ref<string[]>([]);

const visibleColumns = computed(() =>
    teamHidden.value ? columns.filter((column) => column.id !== "team") : columns,
);

const filteredRows = computed<Row[]>(() => {
    let next = rows;
    const nameQuery = nameFilter.value.trim().toLowerCase();
    if (nameQuery !== "") {
        next = next.filter((row) => row.name.toLowerCase().includes(nameQuery));
    }
    if (roleFilter.value !== "") {
        next = next.filter((row) => row.role === roleFilter.value);
    }
    return next;
});

const sortedRows = computed<Row[]>(() => {
    if (sorting.value.length === 0) {
        return filteredRows.value;
    }
    return [...filteredRows.value].sort((left, right) => {
        for (const entry of sorting.value) {
            const factor = entry.direction === "asc" ? 1 : -1;
            const comparison = left[entry.id].localeCompare(right[entry.id], undefined, {
                numeric: true,
            });
            if (comparison !== 0) {
                return comparison * factor;
            }
        }
        return 0;
    });
});

const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / pageSize.value)));

const pageRows = computed<Row[]>(() => {
    const start = pageIndex.value * pageSize.value;
    return sortedRows.value.slice(start, start + pageSize.value);
});

const selectedCount = computed(() => {
    if (allFiltered.value) {
        return Math.max(0, filteredRows.value.length - excludedIds.value.length);
    }
    return selectedIds.value.length;
});

const pageSelection = computed<PageSelection>(() => {
    if (pageRows.value.length === 0) {
        return "none";
    }
    const onPage = pageRows.value.filter((row) => isRowSelected(row.id)).length;
    if (onPage === 0) {
        return "none";
    }
    return onPage === pageRows.value.length ? "all" : "some";
});

const sortLabel = computed(() => {
    if (sorting.value.length === 0) {
        return "none";
    }
    return sorting.value.map((entry) => `${entry.id}:${entry.direction}`).join(", ");
});

const teamToggleLabel = computed(() => (teamHidden.value ? "Show team" : "Hide team"));

watch([nameFilter, roleFilter, pageSize], () => {
    pageIndex.value = 0;
});

watch(pageCount, (nextCount) => {
    if (pageIndex.value > nextCount - 1) {
        pageIndex.value = Math.max(0, nextCount - 1);
    }
});

function sortStateFor(columnId: ColumnId): "ascending" | "descending" | "none" {
    const entry = sorting.value.find((item) => item.id === columnId);
    if (entry === undefined) {
        return "none";
    }
    return entry.direction === "asc" ? "ascending" : "descending";
}

function sortGlyphFor(columnId: ColumnId): string {
    const entry = sorting.value.find((item) => item.id === columnId);
    if (entry === undefined) {
        return "\u2195";
    }
    return entry.direction === "asc" ? "\u2191" : "\u2193";
}

function toggleSort(columnId: ColumnId): void {
    const index = sorting.value.findIndex((entry) => entry.id === columnId);
    if (index === -1) {
        sorting.value = [...sorting.value, { id: columnId, direction: "asc" }];
        return;
    }
    const current = sorting.value[index];
    if (current === undefined) {
        return;
    }
    if (current.direction === "asc") {
        sorting.value = sorting.value.map((entry, entryIndex) =>
            entryIndex === index ? { ...entry, direction: "desc" } : entry,
        );
        return;
    }
    sorting.value = sorting.value.filter((entry) => entry.id !== columnId);
}

function isRowSelected(rowId: string): boolean {
    if (allFiltered.value) {
        return !excludedIds.value.includes(rowId);
    }
    return selectedIds.value.includes(rowId);
}

function toggleRowSelected(rowId: string): void {
    if (allFiltered.value) {
        excludedIds.value = excludedIds.value.includes(rowId)
            ? excludedIds.value.filter((id) => id !== rowId)
            : [...excludedIds.value, rowId];
        return;
    }
    selectedIds.value = isRowSelected(rowId)
        ? selectedIds.value.filter((id) => id !== rowId)
        : [...selectedIds.value, rowId];
}

function selectAllPage(): void {
    const pageIds = pageRows.value.map((row) => row.id);
    if (pageSelection.value === "all") {
        if (allFiltered.value) {
            const merged = new Set([...excludedIds.value, ...pageIds]);
            excludedIds.value = [...merged];
            return;
        }
        selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id));
        return;
    }
    if (allFiltered.value) {
        excludedIds.value = excludedIds.value.filter((id) => !pageIds.includes(id));
        return;
    }
    const merged = new Set([...selectedIds.value, ...pageIds]);
    selectedIds.value = [...merged];
}

function selectAllFilteredRows(): void {
    allFiltered.value = true;
    selectedIds.value = [];
    excludedIds.value = [];
}

function clearSelection(): void {
    allFiltered.value = false;
    selectedIds.value = [];
    excludedIds.value = [];
}

function toggleTeamColumn(): void {
    teamHidden.value = !teamHidden.value;
}

function goToFirstPage(): void {
    pageIndex.value = 0;
}

function goToPreviousPage(): void {
    pageIndex.value = Math.max(0, pageIndex.value - 1);
}

function goToNextPage(): void {
    pageIndex.value = Math.min(pageCount.value - 1, pageIndex.value + 1);
}

function goToLastPage(): void {
    pageIndex.value = pageCount.value - 1;
}
</script>

<template>
    <DemoFrame title="Preview" hint="Data table" stack>
        <div class="pg-table-toolbar pg-row">
            <label class="pg-table-filter">
                <span class="pg-label">Name</span>
                <input
                    v-model="nameFilter"
                    class="pg-input"
                    type="search"
                    placeholder="contains"
                    aria-label="Filter name contains"
                />
            </label>
            <label class="pg-table-filter">
                <span class="pg-label">Role</span>
                <select
                    v-model="roleFilter"
                    class="pg-input pg-select"
                    aria-label="Filter role equals"
                >
                    <option value="">All</option>
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                </select>
            </label>
            <button type="button" class="pg-btn" @click="toggleTeamColumn">
                {{ teamToggleLabel }}
            </button>
            <button type="button" class="pg-btn" @click="selectAllFilteredRows">
                Select all filtered
            </button>
            <button type="button" class="pg-btn" @click="clearSelection">Clear selection</button>
        </div>

        <div
            class="pg-data-table"
            data-slot="root"
            data-mode="client"
            :data-row-count="pageRows.length"
        >
            <table>
                <thead>
                    <tr>
                        <th scope="col">
                            <input
                                type="checkbox"
                                class="pg-check"
                                aria-label="Select all rows on this page"
                                :checked="pageSelection === 'all'"
                                :indeterminate="pageSelection === 'some'"
                                @change="selectAllPage"
                            />
                        </th>
                        <th
                            v-for="column in visibleColumns"
                            :key="column.id"
                            scope="col"
                            :aria-sort="sortStateFor(column.id)"
                            :data-column-id="column.id"
                        >
                            <button
                                type="button"
                                class="pg-table-sort"
                                :data-sort="sortStateFor(column.id)"
                                @click="toggleSort(column.id)"
                            >
                                {{ column.header }}
                                <span aria-hidden="true">{{ sortGlyphFor(column.id) }}</span>
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <template v-if="pageRows.length === 0">
                        <tr data-slot="empty">
                            <td :colspan="visibleColumns.length + 1">
                                No rows match the current filters.
                            </td>
                        </tr>
                    </template>
                    <template v-else>
                        <tr
                            v-for="row in pageRows"
                            :key="row.id"
                            :data-row-id="row.id"
                            :data-selected="isRowSelected(row.id) ? 'true' : 'false'"
                        >
                            <td>
                                <input
                                    type="checkbox"
                                    class="pg-check"
                                    :aria-label="`Select ${row.name}`"
                                    :checked="isRowSelected(row.id)"
                                    @change="toggleRowSelected(row.id)"
                                />
                            </td>
                            <td
                                v-for="column in visibleColumns"
                                :key="column.id"
                                :data-column-id="column.id"
                            >
                                {{ row[column.id] }}
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <div class="pg-row pg-table-pager" data-slot="pagination">
            <button
                type="button"
                class="pg-btn"
                data-slot="first-page"
                :disabled="pageIndex === 0"
                @click="goToFirstPage"
            >
                First
            </button>
            <button
                type="button"
                class="pg-btn"
                data-slot="previous-page"
                :disabled="pageIndex === 0"
                @click="goToPreviousPage"
            >
                Prev
            </button>
            <span class="pg-status" data-slot="page-status">
                Page {{ pageIndex + 1 }} of {{ pageCount }}
            </span>
            <button
                type="button"
                class="pg-btn"
                data-slot="next-page"
                :disabled="pageIndex >= pageCount - 1"
                @click="goToNextPage"
            >
                Next
            </button>
            <button
                type="button"
                class="pg-btn"
                data-slot="last-page"
                :disabled="pageIndex >= pageCount - 1"
                @click="goToLastPage"
            >
                Last
            </button>
            <label class="pg-table-page-size">
                <span class="pg-label">Rows</span>
                <select
                    v-model.number="pageSize"
                    class="pg-input pg-select"
                    data-slot="page-size"
                    aria-label="Page size"
                >
                    <option v-for="size in pageSizeOptions" :key="size" :value="size">
                        {{ size }}
                    </option>
                </select>
            </label>
        </div>

        <p class="pg-status">
            page {{ pageIndex + 1 }}/{{ pageCount }} · size {{ pageSize }} · selected
            {{ selectedCount }} · filtered {{ filteredRows.length }} · sort {{ sortLabel }}
        </p>
    </DemoFrame>
</template>

<style scoped>
.pg-table-toolbar {
    flex-wrap: wrap;
    align-items: flex-end;
}

.pg-table-filter,
.pg-table-page-size {
    display: inline-flex;
    flex-direction: column;
    gap: 0.2rem;
}

.pg-table-filter .pg-input,
.pg-table-page-size .pg-select {
    width: auto;
    min-width: 7.5rem;
}

.pg-table-pager {
    flex-wrap: wrap;
    align-items: center;
}

.pg-table-sort {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    appearance: none;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 650;
    padding: 0;
    cursor: pointer;
}

.pg-table-sort:hover,
.pg-table-sort:focus-visible {
    color: var(--pg-accent, var(--vp-c-brand-1));
}

.pg-table-sort span {
    font-size: 0.75rem;
    opacity: 0.7;
}
</style>
