export type VirtualItem = {
    index: number;
    start: number;
    size: number;
    key: number;
};

export type VirtualWindow = {
    items: VirtualItem[];
    totalSize: number;
    startIndex: number;
    endIndex: number;
};

export type GetVirtualItemsOptions = {
    count: number;
    scrollTop: number;
    viewportHeight: number;
    rowHeight?: number;
    estimateSize?: (index: number) => number;
    overscan?: number;
};

function clamp(value: number, min: number, max: number): number {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}

function buildOffsets(count: number, estimateSize: (index: number) => number): number[] {
    const offsets: number[] = new Array(count + 1);
    offsets[0] = 0;
    let total = 0;
    for (let index = 0; index < count; index += 1) {
        const size = Math.max(0, estimateSize(index));
        total += size;
        offsets[index + 1] = total;
    }
    return offsets;
}

function findOffsetIndex(offsets: number[], position: number): number {
    let low = 0;
    let high = offsets.length - 2;
    while (low < high) {
        const middle = Math.floor((low + high + 1) / 2);
        const start = offsets[middle] ?? 0;
        if (start <= position) {
            low = middle;
        } else {
            high = middle - 1;
        }
    }
    return low;
}

export function getVirtualItems(options: GetVirtualItemsOptions): VirtualWindow {
    const count = Math.max(0, Math.floor(options.count));
    if (count === 0) {
        return { items: [], totalSize: 0, startIndex: 0, endIndex: -1 };
    }

    const overscan = Math.max(0, Math.floor(options.overscan ?? 0));
    const scrollTop = Math.max(0, options.scrollTop);
    const viewportHeight = Math.max(0, options.viewportHeight);

    if (options.estimateSize) {
        const offsets = buildOffsets(count, options.estimateSize);
        const totalSize = offsets[count] ?? 0;
        if (totalSize === 0) {
            return { items: [], totalSize: 0, startIndex: 0, endIndex: -1 };
        }

        const firstVisible = findOffsetIndex(offsets, Math.min(scrollTop, totalSize));
        let lastVisible = firstVisible;
        while (
            lastVisible + 1 < count &&
            (offsets[lastVisible + 1] ?? 0) < scrollTop + viewportHeight
        ) {
            lastVisible += 1;
        }

        const startIndex = clamp(firstVisible - overscan, 0, count - 1);
        const endIndex = clamp(lastVisible + overscan, startIndex, count - 1);
        const items: VirtualItem[] = [];
        for (let index = startIndex; index <= endIndex; index += 1) {
            const start = offsets[index] ?? 0;
            const end = offsets[index + 1] ?? start;
            items.push({ index, start, size: end - start, key: index });
        }
        return { items, totalSize, startIndex, endIndex };
    }

    const rowHeight = options.rowHeight ?? 0;
    if (rowHeight <= 0) {
        return { items: [], totalSize: 0, startIndex: 0, endIndex: -1 };
    }

    const totalSize = count * rowHeight;
    const firstVisible = Math.floor(scrollTop / rowHeight);
    const lastVisible =
        viewportHeight === 0
            ? firstVisible
            : Math.ceil((scrollTop + viewportHeight) / rowHeight) - 1;

    const startIndex = clamp(firstVisible - overscan, 0, count - 1);
    const endIndex = clamp(lastVisible + overscan, startIndex, count - 1);

    const items: VirtualItem[] = [];
    for (let index = startIndex; index <= endIndex; index += 1) {
        items.push({ index, start: index * rowHeight, size: rowHeight, key: index });
    }

    return { items, totalSize, startIndex, endIndex };
}
