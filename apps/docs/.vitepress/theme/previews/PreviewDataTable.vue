<script setup lang="ts">
import { computed, ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

type ColumnId = "name" | "role";
type Row = { id: string; name: string; role: string };
type SortDirection = "ascending" | "descending";

const columns: Array<{ id: ColumnId; header: string }> = [
    { id: "name", header: "Name" },
    { id: "role", header: "Role" },
];

const rows: Row[] = Array.from({ length: 8 }, (_, index) => ({
    id: String(index + 1),
    name: `Person ${index + 1}`,
    role: index % 2 === 0 ? "Admin" : "Editor",
}));

const pageSize = 4;
const pageIndex = ref(0);
const sortColumn = ref<ColumnId | null>(null);
const sortDirection = ref<SortDirection>("ascending");
const selectedIds = ref<string[]>([]);

const sortedRows = computed<Row[]>(() => {
    const column = sortColumn.value;
    if (column === null) {
        return rows;
    }
    const factor = sortDirection.value === "ascending" ? 1 : -1;
    return [...rows].sort(
        (left, right) =>
            left[column].localeCompare(right[column], undefined, { numeric: true }) * factor,
    );
});

const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / pageSize)));

const pageRows = computed<Row[]>(() => {
    const start = pageIndex.value * pageSize;
    return sortedRows.value.slice(start, start + pageSize);
});

const pageSelection = computed<"none" | "some" | "all">(() => {
    const onPage = pageRows.value.filter((row) => selectedIds.value.includes(row.id)).length;
    if (onPage === 0) {
        return "none";
    }
    return onPage === pageRows.value.length ? "all" : "some";
});

function sortStateFor(columnId: ColumnId): "ascending" | "descending" | "none" {
    if (sortColumn.value !== columnId) {
        return "none";
    }
    return sortDirection.value;
}

function sortGlyphFor(columnId: ColumnId): string {
    const state = sortStateFor(columnId);
    if (state === "ascending") {
        return "\u2191";
    }
    if (state === "descending") {
        return "\u2193";
    }
    return "\u2195";
}

function toggleSort(columnId: ColumnId): void {
    if (sortColumn.value !== columnId) {
        sortColumn.value = columnId;
        sortDirection.value = "ascending";
        return;
    }
    if (sortDirection.value === "ascending") {
        sortDirection.value = "descending";
        return;
    }
    sortColumn.value = null;
    sortDirection.value = "ascending";
}

function isRowSelected(rowId: string): boolean {
    return selectedIds.value.includes(rowId);
}

function toggleRowSelected(rowId: string): void {
    selectedIds.value = isRowSelected(rowId)
        ? selectedIds.value.filter((id) => id !== rowId)
        : [...selectedIds.value, rowId];
}

function selectAllPage(): void {
    const pageIds = pageRows.value.map((row) => row.id);
    if (pageSelection.value === "all") {
        selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id));
        return;
    }
    const merged = new Set([...selectedIds.value, ...pageIds]);
    selectedIds.value = [...merged];
}

function goToPreviousPage(): void {
    pageIndex.value = Math.max(0, pageIndex.value - 1);
}

function goToNextPage(): void {
    pageIndex.value = Math.min(pageCount.value - 1, pageIndex.value + 1);
}
</script>

<template>
    <DemoFrame title="Preview" hint="Data table" stack>
        <div data-slot="root" data-mode="client" :data-row-count="pageRows.length">
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
                            v-for="column in columns"
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
                        <td data-column-id="name">{{ row.name }}</td>
                        <td data-column-id="role">{{ row.role }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="pg-row">
            <button
                type="button"
                class="pg-btn"
                :disabled="pageIndex === 0"
                @click="goToPreviousPage"
            >
                Prev
            </button>
            <button
                type="button"
                class="pg-btn"
                :disabled="pageIndex >= pageCount - 1"
                @click="goToNextPage"
            >
                Next
            </button>
        </div>
        <p class="pg-status">
            page {{ pageIndex + 1 }} of {{ pageCount }} · selected {{ selectedIds.length }} · total
            {{ rows.length }}
        </p>
    </DemoFrame>
</template>

<style scoped>
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
